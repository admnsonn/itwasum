/**
 * Beranda SF-012 — matriks Itwil × objek audit (Polda dalam yurisdiksi).
 */
import React from 'react';
import { ITWIL_IDS, ITWIL_POLDA_MAP, getItwilNama } from '../data/domain/itwilMap';
import { POLDA_DATA } from '../data/mockData';
import { Card, Typography } from './ui';
import type { MainNavId } from '../types';

interface ItwilAuditMatrixProps {
  onOpenPolda?: (poldaId: string) => void;
  onNavigateToModule?: (module: MainNavId, targetPoldaId?: string) => void;
}

export const ItwilAuditMatrix: React.FC<ItwilAuditMatrixProps> = ({ onOpenPolda, onNavigateToModule }) => {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Typography variant="label-bold" className="text-slate-700">Matriks Itwil × Objek Audit (SF-012)</Typography>
          <p className="text-[11px] text-slate-500 mt-0.5">34 Polda menurut yurisdiksi Inspektorat Wilayah. Klik sel untuk membuka detail IKU Polda (B.7).</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-slate-400 font-bold uppercase tracking-wide">
              <th className="py-2 pr-3">Itwil</th>
              <th className="py-2">Objek audit (Polda)</th>
              <th className="py-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {ITWIL_IDS.map((itwilId) => {
              const ids = ITWIL_POLDA_MAP[itwilId] ?? [];
              const poldas = ids.map((id) => POLDA_DATA.find((p) => p.id === id)).filter(Boolean);
              return (
                <tr key={itwilId} className="border-t border-slate-100 align-top">
                  <td className="py-2 pr-3 font-bold text-slate-800 whitespace-nowrap">{getItwilNama(itwilId)}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {poldas.map((p) => (
                        <button
                          key={p!.id}
                          type="button"
                          onClick={() => {
                            onOpenPolda?.(p!.id);
                            onNavigateToModule?.('b7', p!.id);
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 hover:border-[var(--brand-700)] hover:text-[var(--brand-700)]"
                        >
                          {p!.singkatan}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-right font-extrabold text-slate-800">{ids.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
