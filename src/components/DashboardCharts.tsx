/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SPJBundle, Rekening } from '../types';
import { formatRupiah } from '../lib/utils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Coins, Percent } from 'lucide-react';

interface DashboardChartsProps {
  spjList: SPJBundle[];
  archivedList: SPJBundle[];
  rekeningList: Rekening[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  spjList,
  archivedList,
  rekeningList
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'ringkasan' | 'rekening' | 'tren'>('ringkasan');

  // Combined active and archived lists for comprehensive stats
  const allSpjs = [...spjList, ...archivedList];

  // 1. Calculations for Pie/Donut Chart (Ringkasan Realisasi)
  const totalAnggaran = rekeningList.reduce((sum, r) => sum + r.anggaran, 0);
  const totalRealisasi = allSpjs.reduce((sum, s) => sum + s.nilaiKontrak, 0);
  const sisaSaldo = Math.max(0, totalAnggaran - totalRealisasi);
  const persenRealisasi = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  const summaryPieData = [
    { name: 'Terrealisasi', value: totalRealisasi, color: '#4f46e5' }, // Indigo-600
    { name: 'Sisa Saldo', value: sisaSaldo, color: '#e2e8f0' } // Slate-200
  ];

  // 2. Calculations for Account Serapan (Realisasi per Kode Rekening)
  const accountBarData = rekeningList.map(rek => {
    const activeSpent = spjList.filter(s => s.kodeRekening === rek.kode).reduce((sum, s) => sum + s.nilaiKontrak, 0);
    const archivedSpent = archivedList.filter(s => s.kodeRekening === rek.kode).reduce((sum, s) => sum + s.nilaiKontrak, 0);
    const totalSpent = activeSpent + archivedSpent;
    const remaining = Math.max(0, rek.anggaran - totalSpent);
    
    return {
      name: rek.kode,
      shortName: rek.kode.split('.').pop() || rek.kode,
      uraian: rek.uraian,
      Pagu: rek.anggaran,
      Realisasi: totalSpent,
      Sisa: remaining,
      'Serapan (%)': rek.anggaran > 0 ? Math.round((totalSpent / rek.anggaran) * 100) : 0
    };
  });

  // 3. Monthly Trend (Tren Realisasi SPJ)
  const indonesianMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const monthlyData = indonesianMonths.map((monthName, idx) => {
    // Check contracts in this month (1-based index)
    const monthNum = idx + 1;
    const monthlySpjs = allSpjs.filter(s => {
      if (!s.tanggalSpj) return false;
      const d = new Date(s.tanggalSpj);
      return d.getMonth() + 1 === monthNum;
    });

    const totalInMonth = monthlySpjs.reduce((sum, s) => sum + s.nilaiKontrak, 0);
    const countInMonth = monthlySpjs.length;

    return {
      month: monthName,
      'Realisasi (Rp)': totalInMonth,
      'Berkas SPJ': countInMonth
    };
  });

  const CustomTooltipRupiah = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-[11px] font-sans">
          <p className="font-bold border-b border-slate-700/50 pb-1 mb-1.5">{payload[0].name || payload[0].payload.month || payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex items-center gap-2 justify-between py-0.5">
              <span className="opacity-80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || '#4f46e5' }}></span>
                {entry.name}:
              </span>
              <span className="font-mono font-black text-indigo-200">
                {typeof entry.value === 'number' && entry.name !== 'Berkas SPJ' && entry.name !== 'Serapan (%)'
                  ? formatRupiah(entry.value, true, false)
                  : entry.value}
                {entry.name === 'Serapan (%)' ? '%' : ''}
                {entry.name === 'Berkas SPJ' ? ' Dokumen' : ''}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col p-6 space-y-6">
      
      {/* Chart Panel Header & Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <h2 className="font-bold text-slate-800 text-sm tracking-tight font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Visualisasi Grafik & Serapan Anggaran DPA
          </h2>
          <p className="text-[11px] text-slate-500">
            Pemantauan realisasi fisik anggaran belanja sub kegiatan secara real-time.
          </p>
        </div>

        {/* View Mode Selectors */}
        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-center">
          <button
            onClick={() => setActiveChartTab('ringkasan')}
            className={`px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 cursor-pointer ${
              activeChartTab === 'ringkasan'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Ringkasan Pagu
          </button>
          <button
            onClick={() => setActiveChartTab('rekening')}
            className={`px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 cursor-pointer ${
              activeChartTab === 'rekening'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Detail Serapan Rekening
          </button>
          <button
            onClick={() => setActiveChartTab('tren')}
            className={`px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 cursor-pointer ${
              activeChartTab === 'tren'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Tren Bulanan
          </button>
        </div>
      </div>

      {/* Dynamic Tab Contents */}
      {activeChartTab === 'ringkasan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Chart visual representation */}
          <div className="lg:col-span-5 h-[230px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {summaryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipRupiah />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner text inside donut hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none mt-2">
              <span className="text-2xl font-black text-slate-800 tracking-tight">{persenRealisasi.toFixed(1)}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Terrealisasi</span>
            </div>
          </div>

          {/* Legend and key statistics */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                Anggaran Terrealisasi
              </div>
              <div className="mt-3">
                <span className="text-lg font-black text-slate-900 leading-none">{formatRupiah(totalRealisasi, true, false)}</span>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Berdasarkan {allSpjs.length} berkas SPJ DPA</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                Sisa Saldo Pagu Belanja
              </div>
              <div className="mt-3">
                <span className="text-lg font-black text-slate-900 leading-none">{formatRupiah(sisaSaldo, true, false)}</span>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Sisa saldo anggaran aman di Google Sheets</p>
              </div>
            </div>

            <div className="sm:col-span-2 p-4 border border-dashed border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 bg-slate-50/20">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Rasio Penyerapan Pagu Belanja Sub Kegiatan</span>
              </div>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{persenRealisasi.toFixed(2)}% Terpakai</span>
            </div>
          </div>
        </div>
      )}

      {activeChartTab === 'rekening' && (
        <div className="space-y-4">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={accountBarData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="shortName" 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tickFormatter={(val) => `Rp ${val >= 1000000 ? (val / 1000000).toFixed(0) + 'M' : val}`}
                />
                <Tooltip content={<CustomTooltipRupiah />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', fill: '#475569' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="Pagu" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Pagu Belanja DPA" />
                <Bar dataKey="Realisasi" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Realisasi SPJ" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Progress Bars for each account */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {accountBarData.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/40 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1.5">
                  <span className="font-mono text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md">{item.name}</span>
                  <span className="text-indigo-600 font-mono">{item['Serapan (%)']}% Serapan</span>
                </div>
                <div className="text-slate-500 text-[10px] truncate mb-2">{item.uraian}</div>
                
                {/* Visual Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, item['Serapan (%)'])}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-medium">
                  <span>Realisasi: {formatRupiah(item.Realisasi, true, false)}</span>
                  <span>Pagu: {formatRupiah(item.Pagu, true, false)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeChartTab === 'tren' && (
        <div className="space-y-4">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorRealisasi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tickFormatter={(val) => `Rp ${val >= 1000000 ? (val / 1000000).toFixed(0) + 'M' : val}`}
                />
                <Tooltip content={<CustomTooltipRupiah />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', fill: '#475569' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Realisasi (Rp)" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRealisasi)" 
                  name="Realisasi SPJ Bulanan"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-2 p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl text-[11px] text-slate-600">
            <Coins className="w-4 h-4 text-indigo-500" />
            <span>Grafik ini menghitung seluruh aktivitas anggaran dari berkas aktif dan berkas terarsip di Google Sheets untuk menjamin akurasi laporan kas bulanan.</span>
          </div>
        </div>
      )}

    </div>
  );
};
