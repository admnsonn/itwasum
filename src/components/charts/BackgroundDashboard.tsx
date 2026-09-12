/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Reimplementasi ringan `organisms/BackgroundDashboard` (branch ITWAS-231): hero section dengan
 * gradient dan grid statistik, dipakai sebagai header modul tertentu. Lihat Plan 2 bagian 2.3.
 */
import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface HeroStat {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface BackgroundDashboardProps {
  title: string;
  subtitle: string;
  stats: HeroStat[];
}

export const BackgroundDashboard: React.FC<BackgroundDashboardProps> = ({ title, subtitle, stats }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B2B5C] via-[#0B4A8A] to-[#143E78] p-5 text-white shadow-lg">
    <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
    <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-amber-400/20" />
    <div className="relative z-10">
      <h2 className="text-lg font-black">{title}</h2>
      <p className="text-xs text-blue-100 mt-1 max-w-lg">{subtitle}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
              <Icon className="w-4 h-4 text-amber-400 mb-1" />
              <div className="text-base font-black">{s.value}</div>
              <div className="text-[9px] text-blue-200 truncate">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
