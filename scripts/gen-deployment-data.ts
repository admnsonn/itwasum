/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generator DATA NYATA untuk modul D (Status Deployment & Environment).
 *
 * Membaca READ-ONLY dua repo GitOps referensi:
 *   - evidence/infra-repoconfig-itwasum   (Kong Ingress + Vault Secrets Operator manifests)
 *   - evidence/helm-repoconfig-itwasum    (3 Helm chart + riwayat commit bump image tag CI)
 *
 * PENTING (lihat batasan Plan 2 bagian 2.0): skrip ini HANYA membaca berkas (fs.readFileSync)
 * dan menjalankan `git log`/`git rev-list` (read-only) pada kedua repo tersebut. Skrip ini TIDAK
 * PERNAH menulis, checkout, fetch, atau commit apa pun ke dalam kedua repo tersebut - satu-satunya
 * berkas yang ditulis adalah `src/data/modules/d-deployment.ts` di dalam evidence/itwasum/ sendiri.
 *
 * Jalankan ulang dengan: `npx tsx scripts/gen-deployment-data.ts` (dari evidence/itwasum/).
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVIDENCE_ROOT = resolve(__dirname, '..', '..');
const INFRA_REPO = resolve(EVIDENCE_ROOT, 'infra-repoconfig-itwasum');
const HELM_REPO = resolve(EVIDENCE_ROOT, 'helm-repoconfig-itwasum');
const OUTPUT_FILE = resolve(__dirname, '..', 'src', 'data', 'modules', 'd-deployment.ts');

function readIfExists(path: string): string | null {
  return existsSync(path) ? readFileSync(path, 'utf-8') : null;
}

function extract(source: string, regex: RegExp, fallback = ''): string {
  const match = source.match(regex);
  return match ? match[1].trim() : fallback;
}

function gitLogCommitCount(repoPath: string, grepPattern?: string): number {
  try {
    const grep = grepPattern ? ` --grep="${grepPattern}"` : '';
    const out = execSync(`git log --oneline${grep}`, { cwd: repoPath, encoding: 'utf-8' });
    return out.trim() ? out.trim().split('\n').length : 0;
  } catch {
    return 0;
  }
}

function gitTotalCommits(repoPath: string): number {
  try {
    return parseInt(execSync('git rev-list --count HEAD', { cwd: repoPath, encoding: 'utf-8' }).trim(), 10) || 0;
  } catch {
    return 0;
  }
}

function gitDateRange(repoPath: string): { first: string; last: string } {
  try {
    const dates = execSync("git log --format=%ad --date=short", { cwd: repoPath, encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean)
      .sort();
    return { first: dates[0] || '', last: dates[dates.length - 1] || '' };
  } catch {
    return { first: '', last: '' };
  }
}

// ---------------------------------------------------------------------------
// 1. Infra repo: Ingress + Vault Secrets Operator
// ---------------------------------------------------------------------------

interface IngressInfo {
  namespace: string;
  host: string;
  ingressClass: string;
  stripPath: boolean;
  hasTls: boolean;
}

function parseIngress(env: 'itwasum-dev' | 'itwasum-sit'): IngressInfo | null {
  const raw = readIfExists(resolve(INFRA_REPO, 'infra', env, 'ingress.yaml'));
  if (!raw) return null;
  return {
    namespace: extract(raw, /namespace:\s*(\S+)/),
    host: extract(raw, /host:\s*(\S+)/),
    ingressClass: extract(raw, /ingressClassName:\s*(\S+)/),
    stripPath: /strip-path:\s*"true"/.test(raw),
    hasTls: /^\s*tls:/m.test(raw),
  };
}

interface VaultSecretInfo {
  namespace: string;
  serviceAccount: string;
  vaultAuthName: string;
  vaultRole: string;
  mount: string;
  path: string;
  refreshAfter: string;
  hmacSecretData: boolean;
  overwriteFalse: boolean;
  destinationSecretName: string;
}

function parseVaultSecret(dir: string, staticFile: string): VaultSecretInfo | null {
  const staticRaw = readIfExists(resolve(INFRA_REPO, 'vso-secret', dir, staticFile));
  const authFiles = ['vaultauth-itwasum-dev.yaml', 'vaultauth-itwasum-sit.yaml', 'vaultauth-keycloak-dev.yaml'];
  let authRaw: string | null = null;
  for (const f of authFiles) {
    const candidate = readIfExists(resolve(INFRA_REPO, 'vso-secret', dir, f));
    if (candidate) {
      authRaw = candidate;
      break;
    }
  }
  const saFiles = ['serviceaccount-itwasum-dev.yaml', 'serviceaccount-itwasum-sit.yaml', 'serviceaccount-keycloak-dev.yaml'];
  let saName = '';
  for (const f of saFiles) {
    const candidate = readIfExists(resolve(INFRA_REPO, 'vso-secret', dir, f));
    if (candidate) {
      saName = extract(candidate, /name:\s*(\S+)/);
      break;
    }
  }
  if (!staticRaw) return null;
  return {
    namespace: extract(staticRaw, /namespace:\s*(\S+)/),
    serviceAccount: saName,
    vaultAuthName: authRaw ? extract(authRaw, /^\s*name:\s*(\S+)/m) : '',
    vaultRole: authRaw ? extract(authRaw, /role:\s*(\S+)/) : '',
    mount: extract(staticRaw, /mount:\s*(\S+)/),
    path: extract(staticRaw, /path:\s*(\S+)/),
    refreshAfter: extract(staticRaw, /refreshAfter:\s*(\S+)/, '30s'),
    hmacSecretData: /hmacSecretData:\s*true/.test(staticRaw),
    overwriteFalse: /overwrite:\s*false/.test(staticRaw) && !/#.*overwrite:\s*false/.test(staticRaw),
    destinationSecretName: extract(staticRaw, /destination:[\s\S]*?name:\s*(\S+)/),
  };
}

// ---------------------------------------------------------------------------
// 2. Helm repo: Chart.yaml + values-{dev,sit}.yaml per komponen
// ---------------------------------------------------------------------------

interface ComponentEnvConfig {
  nameOverride: string;
  imageRepository: string;
  imageTag: string;
  serviceType: string;
  servicePort: string;
  nodePort: string;
}

function parseChartValues(chartDir: string, envFile: string): ComponentEnvConfig | null {
  const raw = readIfExists(resolve(HELM_REPO, 'charts', chartDir, envFile));
  if (!raw) return null;
  return {
    nameOverride: extract(raw, /nameOverride:\s*(\S+)/),
    imageRepository: extract(raw, /repository:\s*(\S+)/),
    imageTag: extract(raw, /tag:\s*(\S+?)(?:\s|#|$)/m),
    serviceType: extract(raw, /type:\s*(ClusterIP|NodePort|LoadBalancer)/),
    servicePort: extract(raw, /port:\s*(\d+)/),
    nodePort: extract(raw, /nodePort:\s*(\d+)/),
  };
}

interface ChartMeta {
  name: string;
  version: string;
  appVersion: string;
  description: string;
}

function parseChartYaml(chartDir: string): ChartMeta | null {
  const raw = readIfExists(resolve(HELM_REPO, 'charts', chartDir, 'Chart.yaml'));
  if (!raw) return null;
  return {
    name: extract(raw, /^name:\s*(\S+)/m),
    version: extract(raw, /^version:\s*(\S+)/m),
    appVersion: extract(raw, /appVersion:\s*"?([\w.]+)"?/),
    description: extract(raw, /description:\s*(.+)/),
  };
}

// ---------------------------------------------------------------------------
// 3. Kumpulkan & tulis keluaran
// ---------------------------------------------------------------------------

function countReleaseCommits(component: string, env: 'dev' | 'sit'): number {
  return gitLogCommitCount(HELM_REPO, `${component}-${env}`);
}

function main() {
  const infraAvailable = existsSync(INFRA_REPO);
  const helmAvailable = existsSync(HELM_REPO);

  const ingressDev = parseIngress('itwasum-dev');
  const ingressSit = parseIngress('itwasum-sit');

  const vsoDevBe = parseVaultSecret('itwasum-dev', 'vaultstaticsecret-dev-itwasum-be.yaml');
  const vsoDevFe = parseVaultSecret('itwasum-dev', 'vaultstaticsecret-dev-itwasum-fe.yaml');
  const vsoDevKc = parseVaultSecret('keycloak-itwasum-dev', 'vaultstaticsecret-keycloak-dev.yaml');
  const vsoSitBe = parseVaultSecret('itwasum-sit', 'vaultstaticsecret-sit-itwasum-be.yaml');
  const vsoSitFe = parseVaultSecret('itwasum-sit', 'vaultstaticsecret-sit-itwasum-fe.yaml');

  const feChart = parseChartYaml('satu-data-itwasum-frontend');
  const beChart = parseChartYaml('satu-data-itwasum-backend-core');
  const iamChart = parseChartYaml('iam-config-itwasum');

  const feDev = parseChartValues('satu-data-itwasum-frontend', 'values-dev.yaml');
  const feSit = parseChartValues('satu-data-itwasum-frontend', 'values-sit.yaml');
  const beDev = parseChartValues('satu-data-itwasum-backend-core', 'values-dev.yaml');
  const beSit = parseChartValues('satu-data-itwasum-backend-core', 'values-sit.yaml');
  const iamDev = parseChartValues('iam-config-itwasum', 'values-dev.yaml');
  const iamSit = parseChartValues('iam-config-itwasum', 'values-sit.yaml');

  const releaseCounts = {
    frontendDev: countReleaseCommits('frontend', 'dev'),
    frontendSit: countReleaseCommits('frontend', 'sit'),
    backendDev: countReleaseCommits('backend-core', 'dev'),
    backendSit: countReleaseCommits('backend-core', 'sit'),
    keycloakDev: countReleaseCommits('keycloak', 'dev'),
    keycloakSit: countReleaseCommits('keycloak', 'sit'),
  };
  const totalHelmCommits = helmAvailable ? gitTotalCommits(HELM_REPO) : 0;
  const helmDateRange = helmAvailable ? gitDateRange(HELM_REPO) : { first: '', last: '' };
  const totalInfraCommits = infraAvailable ? gitTotalCommits(INFRA_REPO) : 0;
  const infraDateRange = infraAvailable ? gitDateRange(INFRA_REPO) : { first: '', last: '' };

  const generatedAt = new Date().toISOString();

  const fileContent = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * >>> BERKAS HASIL GENERATE OTOMATIS - JANGAN DIEDIT MANUAL <<<
 * Dihasilkan oleh \`scripts/gen-deployment-data.ts\` pada ${generatedAt}
 * dari pembacaan READ-ONLY terhadap:
 *   - evidence/infra-repoconfig-itwasum (${totalInfraCommits} commit, ${infraDateRange.first} s/d ${infraDateRange.last})
 *   - evidence/helm-repoconfig-itwasum  (${totalHelmCommits} commit, ${helmDateRange.first} s/d ${helmDateRange.last})
 *
 * Jalankan ulang dengan: npx tsx scripts/gen-deployment-data.ts
 * Modul terkait: D.1 (Implementasi Sistem di Environment DC DIVTIK) & D.2 (Staging dan Konfigurasi
 * DC DIVTIK). Nilai di berkas ini adalah satu-satunya data NYATA (bukan mock) di seluruh aplikasi -
 * lihat catatan status \`'nyata'\` pada MODULE_REGISTRY.
 *
 * TIDAK ADA NILAI RAHASIA di berkas ini: hanya nama mount/path Vault dan nama Kubernetes Secret
 * tujuan yang disalin; skrip generator tidak pernah membaca isi/nilai secret.
 */

export interface DeploymentEnvironment {
  id: string;
  label: string;
  namespace: string;
  statusLabel: string;
  isRealDcDivtik: boolean;
  host: string;
  ingressClass: string;
  stripPath: boolean;
  hasTls: boolean;
}

export interface DeploymentComponent {
  componentId: string;
  componentLabel: string;
  chartName: string;
  chartVersion: string;
  appVersion: string;
  envId: string;
  nameOverride: string;
  imageRepository: string;
  imageTag: string;
  serviceType: string;
  servicePort: string;
  nodePort: string;
}

export interface VaultSecretBinding {
  envId: string;
  componentLabel: string;
  namespace: string;
  serviceAccount: string;
  vaultAuthName: string;
  vaultRole: string;
  mount: string;
  path: string;
  refreshAfter: string;
  hmacSecretData: boolean;
  overwriteFalse: boolean;
  destinationSecretName: string;
}

export interface ReleaseHistoryEntry {
  component: string;
  env: 'dev' | 'sit';
  commitCount: number;
}

export const DEPLOYMENT_GENERATED_AT = ${JSON.stringify(generatedAt)};

export const DEPLOYMENT_SOURCE_META = {
  infraRepo: 'evidence/infra-repoconfig-itwasum',
  infraTotalCommits: ${totalInfraCommits},
  infraDateRange: ${JSON.stringify(infraDateRange)},
  helmRepo: 'evidence/helm-repoconfig-itwasum',
  helmTotalCommits: ${totalHelmCommits},
  helmDateRange: ${JSON.stringify(helmDateRange)},
};

export const DEPLOYMENT_ENVIRONMENTS: DeploymentEnvironment[] = [
  {
    id: 'dev',
    label: 'Development',
    namespace: ${JSON.stringify(ingressDev?.namespace || 'itwasum-dev')},
    statusLabel: 'Berjalan (cloud penyedia)',
    isRealDcDivtik: false,
    host: ${JSON.stringify(ingressDev?.host || '')},
    ingressClass: ${JSON.stringify(ingressDev?.ingressClass || '')},
    stripPath: ${ingressDev?.stripPath ?? false},
    hasTls: ${ingressDev?.hasTls ?? false},
  },
  {
    id: 'sit',
    label: 'SIT (System Integration Test)',
    namespace: ${JSON.stringify(ingressSit?.namespace || 'itwasum-sit')},
    statusLabel: 'Berjalan (cloud penyedia)',
    isRealDcDivtik: false,
    host: ${JSON.stringify(ingressSit?.host || '')},
    ingressClass: ${JSON.stringify(ingressSit?.ingressClass || '')},
    stripPath: ${ingressSit?.stripPath ?? false},
    hasTls: ${ingressSit?.hasTls ?? false},
  },
  {
    id: 'dc-divtik',
    label: 'DC DIVTIK (Produksi)',
    namespace: '-',
    statusLabel: 'Belum Dimigrasi',
    isRealDcDivtik: true,
    host: '-',
    ingressClass: '-',
    stripPath: false,
    hasTls: false,
  },
];

export const DEPLOYMENT_COMPONENTS: DeploymentComponent[] = [
  {
    componentId: 'frontend', componentLabel: 'Frontend (Next.js)', chartName: ${JSON.stringify(feChart?.name || '')},
    chartVersion: ${JSON.stringify(feChart?.version || '')}, appVersion: ${JSON.stringify(feChart?.appVersion || '')}, envId: 'dev',
    nameOverride: ${JSON.stringify(feDev?.nameOverride || '')}, imageRepository: ${JSON.stringify(feDev?.imageRepository || '')},
    imageTag: ${JSON.stringify(feDev?.imageTag || '')}, serviceType: ${JSON.stringify(feDev?.serviceType || 'ClusterIP')},
    servicePort: ${JSON.stringify(feDev?.servicePort || '3000')}, nodePort: ${JSON.stringify(feDev?.nodePort || '')},
  },
  {
    componentId: 'frontend', componentLabel: 'Frontend (Next.js)', chartName: ${JSON.stringify(feChart?.name || '')},
    chartVersion: ${JSON.stringify(feChart?.version || '')}, appVersion: ${JSON.stringify(feChart?.appVersion || '')}, envId: 'sit',
    nameOverride: ${JSON.stringify(feSit?.nameOverride || '')}, imageRepository: ${JSON.stringify(feSit?.imageRepository || '')},
    imageTag: ${JSON.stringify(feSit?.imageTag || '')}, serviceType: ${JSON.stringify(feSit?.serviceType || 'ClusterIP')},
    servicePort: ${JSON.stringify(feSit?.servicePort || '3000')}, nodePort: ${JSON.stringify(feSit?.nodePort || '')},
  },
  {
    componentId: 'backend-core', componentLabel: 'Backend Core', chartName: ${JSON.stringify(beChart?.name || '')},
    chartVersion: ${JSON.stringify(beChart?.version || '')}, appVersion: ${JSON.stringify(beChart?.appVersion || '')}, envId: 'dev',
    nameOverride: ${JSON.stringify(beDev?.nameOverride || '')}, imageRepository: ${JSON.stringify(beDev?.imageRepository || '')},
    imageTag: ${JSON.stringify(beDev?.imageTag || '')}, serviceType: ${JSON.stringify(beDev?.serviceType || 'ClusterIP')},
    servicePort: ${JSON.stringify(beDev?.servicePort || '8080')}, nodePort: ${JSON.stringify(beDev?.nodePort || '')},
  },
  {
    componentId: 'backend-core', componentLabel: 'Backend Core', chartName: ${JSON.stringify(beChart?.name || '')},
    chartVersion: ${JSON.stringify(beChart?.version || '')}, appVersion: ${JSON.stringify(beChart?.appVersion || '')}, envId: 'sit',
    nameOverride: ${JSON.stringify(beSit?.nameOverride || '')}, imageRepository: ${JSON.stringify(beSit?.imageRepository || '')},
    imageTag: ${JSON.stringify(beSit?.imageTag || '')}, serviceType: ${JSON.stringify(beSit?.serviceType || 'ClusterIP')},
    servicePort: ${JSON.stringify(beSit?.servicePort || '8080')}, nodePort: ${JSON.stringify(beSit?.nodePort || '')},
  },
  {
    componentId: 'iam-keycloak', componentLabel: 'IAM / Keycloak', chartName: ${JSON.stringify(iamChart?.name || '')},
    chartVersion: ${JSON.stringify(iamChart?.version || '')}, appVersion: ${JSON.stringify(iamChart?.appVersion || '')}, envId: 'dev',
    nameOverride: ${JSON.stringify(iamDev?.nameOverride || '')}, imageRepository: ${JSON.stringify(iamDev?.imageRepository || '')},
    imageTag: ${JSON.stringify(iamDev?.imageTag || '')}, serviceType: ${JSON.stringify(iamDev?.serviceType || 'NodePort')},
    servicePort: ${JSON.stringify(iamDev?.servicePort || '8080')}, nodePort: ${JSON.stringify(iamDev?.nodePort || '30008')},
  },
  {
    componentId: 'iam-keycloak', componentLabel: 'IAM / Keycloak', chartName: ${JSON.stringify(iamChart?.name || '')},
    chartVersion: ${JSON.stringify(iamChart?.version || '')}, appVersion: ${JSON.stringify(iamChart?.appVersion || '')}, envId: 'sit',
    nameOverride: ${JSON.stringify(iamSit?.nameOverride || '')}, imageRepository: ${JSON.stringify(iamSit?.imageRepository || '')},
    imageTag: ${JSON.stringify(iamSit?.imageTag || '')}, serviceType: ${JSON.stringify(iamSit?.serviceType || 'NodePort')},
    servicePort: ${JSON.stringify(iamSit?.servicePort || '8080')}, nodePort: ${JSON.stringify(iamSit?.nodePort || '30008')},
  },
];

export const VAULT_SECRET_BINDINGS: VaultSecretBinding[] = [
  ${[
    { env: 'dev', label: 'Backend Core', v: vsoDevBe },
    { env: 'dev', label: 'Frontend', v: vsoDevFe },
    { env: 'dev', label: 'IAM / Keycloak', v: vsoDevKc },
    { env: 'sit', label: 'Backend Core', v: vsoSitBe },
    { env: 'sit', label: 'Frontend', v: vsoSitFe },
  ]
    .map(
      ({ env, label, v }) => `{
    envId: ${JSON.stringify(env)}, componentLabel: ${JSON.stringify(label)}, namespace: ${JSON.stringify(v?.namespace || '')},
    serviceAccount: ${JSON.stringify(v?.serviceAccount || '')}, vaultAuthName: ${JSON.stringify(v?.vaultAuthName || '')},
    vaultRole: ${JSON.stringify(v?.vaultRole || '')}, mount: ${JSON.stringify(v?.mount || '')}, path: ${JSON.stringify(v?.path || '')},
    refreshAfter: ${JSON.stringify(v?.refreshAfter || '30s')}, hmacSecretData: ${v?.hmacSecretData ?? false},
    overwriteFalse: ${v?.overwriteFalse ?? false}, destinationSecretName: ${JSON.stringify(v?.destinationSecretName || '')},
  }`
    )
    .join(',\n  ')}
];

export const RELEASE_HISTORY: ReleaseHistoryEntry[] = [
  { component: 'Frontend', env: 'dev', commitCount: ${releaseCounts.frontendDev} },
  { component: 'Frontend', env: 'sit', commitCount: ${releaseCounts.frontendSit} },
  { component: 'Backend Core', env: 'dev', commitCount: ${releaseCounts.backendDev} },
  { component: 'Backend Core', env: 'sit', commitCount: ${releaseCounts.backendSit} },
  { component: 'IAM / Keycloak', env: 'dev', commitCount: ${releaseCounts.keycloakDev} },
  { component: 'IAM / Keycloak', env: 'sit', commitCount: ${releaseCounts.keycloakSit} },
];

export const DEPLOYMENT_GAPS: string[] = [
  'Ingress belum memiliki blok spec.tls maupun issuer cert-manager; TLS diasumsikan diterminasi di Kong/load balancer di luar repo. Wajib eksplisit untuk DC DIVTIK.',
  'Belum ada NetworkPolicy, RBAC Role/RoleBinding, maupun Pod Security Standards pada repo infra.',
  'Overlay values-sit.yaml chart iam-config-itwasum belum memiliki blok secretEnv, image tag masih "latest", dan nol commit bump CI - Keycloak SIT belum terkonfigurasi penuh.',
  'Tidak ada manifest VSO Keycloak untuk environment SIT pada infra-repoconfig-itwasum.',
  'KC_HOSTNAME dev dan SIT bernilai sama (keycloak-itwasum.development-pure.cloud), berpotensi tabrakan konfigurasi antar environment.',
  'hmacSecretData: true dan overwrite: false hanya aktif pada secret backend dan keycloak, tidak pada frontend.',
  'Kedua README.md (infra & helm repo) masih template default GitLab tanpa dokumentasi proyek.',
  'Belum ada manifest ArgoCD/Flux di kedua repo; identitas GitOps controller perlu didokumentasikan dari sumber lain.',
  'Branch feat-devsecops/adjusting-externalsecret (migrasi ke External Secrets Operator) belum termerge dan sudah tertinggal dari main; statusnya rencana, bukan realisasi.',
];
`;

  writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
  console.log(`[gen-deployment-data] Ditulis ke ${OUTPUT_FILE}`);
  console.log(`[gen-deployment-data] Infra: ${infraAvailable ? 'ditemukan' : 'TIDAK DITEMUKAN'} | Helm: ${helmAvailable ? 'ditemukan' : 'TIDAK DITEMUKAN'}`);
}

main();
