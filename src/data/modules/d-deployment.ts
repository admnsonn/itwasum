/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * >>> BERKAS HASIL GENERATE OTOMATIS - JANGAN DIEDIT MANUAL <<<
 * Dihasilkan oleh `scripts/gen-deployment-data.ts` pada 2026-09-12T06:33:29.546Z
 * dari pembacaan READ-ONLY terhadap:
 *   - evidence/infra-repoconfig-itwasum (14 commit, 2026-08-10 s/d 2026-08-10)
 *   - evidence/helm-repoconfig-itwasum  (232 commit, 2026-07-20 s/d 2026-08-21)
 *
 * Jalankan ulang dengan: npx tsx scripts/gen-deployment-data.ts
 * Modul terkait: D.1 (Implementasi Sistem di Environment DC DIVTIK) & D.2 (Staging dan Konfigurasi
 * DC DIVTIK). Nilai di berkas ini adalah satu-satunya data NYATA (bukan mock) di seluruh aplikasi -
 * lihat catatan status `'nyata'` pada MODULE_REGISTRY.
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

export const DEPLOYMENT_GENERATED_AT = "2026-09-12T06:33:29.546Z";

export const DEPLOYMENT_SOURCE_META = {
  infraRepo: 'evidence/infra-repoconfig-itwasum',
  infraTotalCommits: 14,
  infraDateRange: {"first":"2026-08-10","last":"2026-08-10"},
  helmRepo: 'evidence/helm-repoconfig-itwasum',
  helmTotalCommits: 232,
  helmDateRange: {"first":"2026-07-20","last":"2026-08-21"},
};

export const DEPLOYMENT_ENVIRONMENTS: DeploymentEnvironment[] = [
  {
    id: 'dev',
    label: 'Development',
    namespace: "itwasum-dev",
    statusLabel: 'Berjalan (cloud penyedia)',
    isRealDcDivtik: false,
    host: "dev-itwasum.development-pure.cloud",
    ingressClass: "kong",
    stripPath: true,
    hasTls: false,
  },
  {
    id: 'sit',
    label: 'SIT (System Integration Test)',
    namespace: "itwasum-sit",
    statusLabel: 'Berjalan (cloud penyedia)',
    isRealDcDivtik: false,
    host: "sit-itwasum.development-pure.cloud",
    ingressClass: "kong",
    stripPath: true,
    hasTls: false,
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
    componentId: 'frontend', componentLabel: 'Frontend (Next.js)', chartName: "satu-data-itwasum-frontend",
    chartVersion: "0.1.0", appVersion: "1.0.0", envId: 'dev',
    nameOverride: "dev-itwasum-frontend", imageRepository: "registry.gitlab.com/purecloud.di/satu-data-itwasum-frontend/dev",
    imageTag: "dev-1.0.f00c3309-129", serviceType: "ClusterIP",
    servicePort: "3000", nodePort: "",
  },
  {
    componentId: 'frontend', componentLabel: 'Frontend (Next.js)', chartName: "satu-data-itwasum-frontend",
    chartVersion: "0.1.0", appVersion: "1.0.0", envId: 'sit',
    nameOverride: "sit-itwasum-frontend", imageRepository: "registry.gitlab.com/purecloud.di/satu-data-itwasum-frontend/sit",
    imageTag: "sit-1.0.c64bad45-8", serviceType: "ClusterIP",
    servicePort: "3000", nodePort: "",
  },
  {
    componentId: 'backend-core', componentLabel: 'Backend Core', chartName: "satu-data-itwasum-backend-core",
    chartVersion: "0.1.0", appVersion: "1.0.0", envId: 'dev',
    nameOverride: "dev-itwasum-backend-core", imageRepository: "registry.gitlab.com/purecloud.di/satu-data-itwasum-backend-core/dev",
    imageTag: "dev-1.0.a11f2f0b-134", serviceType: "ClusterIP",
    servicePort: "8080", nodePort: "",
  },
  {
    componentId: 'backend-core', componentLabel: 'Backend Core', chartName: "satu-data-itwasum-backend-core",
    chartVersion: "0.1.0", appVersion: "1.0.0", envId: 'sit',
    nameOverride: "sit-itwasum-backend-core", imageRepository: "registry.gitlab.com/purecloud.di/satu-data-itwasum-backend-core/sit",
    imageTag: "sit-1.0.1b072789-5", serviceType: "ClusterIP",
    servicePort: "8080", nodePort: "",
  },
  {
    componentId: 'iam-keycloak', componentLabel: 'IAM / Keycloak', chartName: "iam-config-itwasum",
    chartVersion: "0.1.0", appVersion: "26.7.0", envId: 'dev',
    nameOverride: "dev-iam-config-itwasum", imageRepository: "registry.gitlab.com/purecloud.di/iam-config-itwasum/dev",
    imageTag: "dev-1.0.43ff3fb4-25", serviceType: "NodePort",
    servicePort: "8080", nodePort: "30008",
  },
  {
    componentId: 'iam-keycloak', componentLabel: 'IAM / Keycloak', chartName: "iam-config-itwasum",
    chartVersion: "0.1.0", appVersion: "26.7.0", envId: 'sit',
    nameOverride: "sit-iam-config-itwasum", imageRepository: "registry.gitlab.com/purecloud.di/iam-config-itwasum/sit",
    imageTag: "latest", serviceType: "NodePort",
    servicePort: "8080", nodePort: "30008",
  },
];

export const VAULT_SECRET_BINDINGS: VaultSecretBinding[] = [
  {
    envId: "dev", componentLabel: "Backend Core", namespace: "itwasum-dev",
    serviceAccount: "dev-itwasum-vso-auth", vaultAuthName: "dev-itwasum-vault-auth",
    vaultRole: "dev-itwasum-vso", mount: "dev-itwasum", path: "backend",
    refreshAfter: "30s", hmacSecretData: true,
    overwriteFalse: true, destinationSecretName: "dev-itwasum-be-vso",
  },
  {
    envId: "dev", componentLabel: "Frontend", namespace: "itwasum-dev",
    serviceAccount: "dev-itwasum-vso-auth", vaultAuthName: "dev-itwasum-vault-auth",
    vaultRole: "dev-itwasum-vso", mount: "dev-itwasum", path: "frontend",
    refreshAfter: "30s", hmacSecretData: false,
    overwriteFalse: false, destinationSecretName: "dev-itwasum-fe-vso",
  },
  {
    envId: "dev", componentLabel: "IAM / Keycloak", namespace: "keycloak-itwasum-dev",
    serviceAccount: "dev-keycloak-vso-auth", vaultAuthName: "dev-keycloak-vault-auth",
    vaultRole: "dev-keycloak-vso", mount: "dev-itwasum", path: "keycloak",
    refreshAfter: "30s", hmacSecretData: true,
    overwriteFalse: true, destinationSecretName: "dev-keycloak-vso",
  },
  {
    envId: "sit", componentLabel: "Backend Core", namespace: "itwasum-sit",
    serviceAccount: "sit-itwasum-vso-auth", vaultAuthName: "sit-itwasum-vault-auth",
    vaultRole: "sit-itwasum-vso", mount: "sit-itwasum", path: "backend",
    refreshAfter: "30s", hmacSecretData: true,
    overwriteFalse: true, destinationSecretName: "sit-itwasum-be-vso",
  },
  {
    envId: "sit", componentLabel: "Frontend", namespace: "itwasum-sit",
    serviceAccount: "sit-itwasum-vso-auth", vaultAuthName: "sit-itwasum-vault-auth",
    vaultRole: "sit-itwasum-vso", mount: "sit-itwasum", path: "frontend",
    refreshAfter: "30s", hmacSecretData: false,
    overwriteFalse: false, destinationSecretName: "sit-itwasum-fe-vso",
  }
];

export const RELEASE_HISTORY: ReleaseHistoryEntry[] = [
  { component: 'Frontend', env: 'dev', commitCount: 70 },
  { component: 'Frontend', env: 'sit', commitCount: 7 },
  { component: 'Backend Core', env: 'dev', commitCount: 63 },
  { component: 'Backend Core', env: 'sit', commitCount: 4 },
  { component: 'IAM / Keycloak', env: 'dev', commitCount: 23 },
  { component: 'IAM / Keycloak', env: 'sit', commitCount: 0 },
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
