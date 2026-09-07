import React from 'react';
import { ShieldCheck, Activity, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { PoldaSatker, BidangAudit, JenjangPengguna } from '../types';

interface ExecutiveBottomTickerProps {
  poldaList: PoldaSatker[];
  activeBidang: BidangAudit;
  activeJenjang: JenjangPengguna;
}

export const ExecutiveBottomTicker: React.FC<ExecutiveBottomTickerProps> = ({
  poldaList,
  activeBidang,
  activeJenjang
}) => {
  const totalPolda = poldaList.length;
  const totalTemuan = poldaList.reduce((acc, curr) => acc + curr.temuanTerbuka, 0);
  const totalTemuanSelesai = poldaList.reduce((acc, curr) => acc + curr.temuanSelesai, 0);
  const totalAll = totalTemuan + totalTemuanSelesai;
  const tlhpRate = totalAll > 0 ? ((totalTemuanSelesai / totalAll) * 100).toFixed(1) : '59.4';
  const auditBerjalanCount = poldaList.filter(p => p.auditBerjalan).length;
  const siagaCount = poldaList.filter(p => p.status === 'kritis').length;

  return (
<></>
  );
};
