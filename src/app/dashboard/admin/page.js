"use client";

import { useState } from 'react';
import { TrendingUp, Users, Award, Activity } from 'lucide-react';

const dataByAngkatan = {
  'all': {
    totalMahasiswa: 1247,
    zonaPercentage: 15,
    zonaCount: 187,
    prediksiCL: 89,
    avgIPK: '3.12',
    ipkDistribution: [
      { range: '<2.0', count: 23, percentage: 1.8, color: 'from-[#f87171] to-[#ef4444]' },
      { range: '2.0-2.5', count: 89, percentage: 7.1, color: 'from-[#fb923c] to-[#f97316]' },
      { range: '2.5-3.0', count: 356, percentage: 28.5, color: 'from-[#60a5fa] to-[#3b82f6]' },
      { range: '3.0-3.5', count: 512, percentage: 41.1, color: 'from-[#1e40af] to-[#1e3a8a]' },
      { range: '3.5-4.0', count: 267, percentage: 21.4, color: 'from-[#4ade80] to-[#22c55e]' }
    ]
  },
  '2025': {
    totalMahasiswa: 312, zonaPercentage: 22, zonaCount: 69, prediksiCL: 12, avgIPK: '2.89',
    ipkDistribution: [
      { range: '<2.0', count: 15, percentage: 4.8, color: 'from-[#f87171] to-[#ef4444]' },
      { range: '2.0-2.5', count: 54, percentage: 17.3, color: 'from-[#fb923c] to-[#f97316]' },
      { range: '2.5-3.0', count: 156, percentage: 50.0, color: 'from-[#60a5fa] to-[#3b82f6]' },
      { range: '3.0-3.5', count: 75, percentage: 24.0, color: 'from-[#1e40af] to-[#1e3a8a]' },
      { range: '3.5-4.0', count: 12, percentage: 3.8, color: 'from-[#4ade80] to-[#22c55e]' }
    ]
  }
};

const anomalies = [
  { matkul: 'Statistika Matematika II', dosen: 'Dr. Budi Santoso', kelas: 'A', zonaPercentage: '34%', avgNilai: 63.4, status: 'Waspada' },
  { matkul: 'Kalkulus Perubah Banyak', dosen: 'Prof. Andi Rahman', kelas: 'B', zonaPercentage: '61%', avgNilai: 54.2, status: '🔺 Anomali' }
];

export default function DashboardGlobalPage() {
  const [selectedAngkatan, setSelectedAngkatan] = useState('all');
  const currentData = dataByAngkatan[selectedAngkatan] || dataByAngkatan['all'];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Dashboard Global</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Ringkasan akademik seluruh angkatan</p>
        </div>
        <div>
          <select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            className="px-4 py-2 bg-white border border-[var(--border)] rounded-[10px] text-[13px] font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] shadow-sm"
          >
            <option value="all">Semua Angkatan</option>
            <option value="2025">Angkatan 2025</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Total Mahasiswa</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--navy)] leading-none mb-2">{currentData.totalMahasiswa.toLocaleString()}</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)]">{selectedAngkatan === 'all' ? 'Aktif semester ini' : `Angkatan ${selectedAngkatan}`}</div>
        </div>
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Zona Merah</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--danger)] leading-none mb-2">{currentData.zonaCount}</div>
          <div className="text-[11.5px] font-medium text-[var(--danger)] flex items-center gap-1">{currentData.zonaPercentage}% populasi</div>
        </div>
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Prediksi Cum Laude</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--success)] leading-none mb-2">{currentData.prediksiCL}</div>
          <div className="text-[11.5px] font-medium text-[var(--success)] flex items-center gap-1"><TrendingUp className="w-3 h-3" />Mahasiswa</div>
        </div>
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">AVG IPK</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--navy)] leading-none mb-2">{currentData.avgIPK}</div>
          <div className="text-[11.5px] font-medium text-[var(--success)] flex items-center gap-1"><TrendingUp className="w-3 h-3" />Tren positif</div>
        </div>
      </div>

      {/* Distribusi IPK */}
      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-1 h-4 bg-[var(--navy)] rounded-sm"></div>
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Distribusi IPK</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-1 mb-4">
            {currentData.ipkDistribution.map((item, idx) => {
              const maxCount = Math.max(...currentData.ipkDistribution.map(d => d.count));
              const width = item.count > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={idx} className={`h-20 bg-gradient-to-t ${item.color} rounded-lg flex flex-col items-center justify-center text-white transition-all`} style={{ flex: width > 0 ? width : 0.1, minWidth: item.count > 0 ? '80px' : '40px', opacity: item.count === 0 ? 0.3 : 1 }}>
                  {item.count > 0 && <span className="text-sm font-bold">{item.count}</span>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            {currentData.ipkDistribution.map((item, idx) => {
              const maxCount = Math.max(...currentData.ipkDistribution.map(d => d.count));
              const width = item.count > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={idx} className="text-center" style={{ flex: width > 0 ? width : 0.1, minWidth: item.count > 0 ? '80px' : '40px' }}>
                  <div className="text-[11px] text-[var(--text-muted)] mb-1">{item.range}</div>
                  <div className={`text-xs font-bold ${item.range.includes('3.5') ? 'text-[var(--success)]' : item.range.includes('3.0-3.5') ? 'text-[#1e40af]' : item.range.includes('2.5') ? 'text-[#3b82f6]' : item.range.includes('2.0-2.5') ? 'text-[#f97316]' : 'text-[var(--danger)]'}`}>{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabel Anomali Matkul */}
      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-1 h-4 bg-[var(--navy)] rounded-sm"></div>
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Anomali Matkul — 40%+ Mahasiswa Zona Merah</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--gray-bg)]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Mata Kuliah</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Dosen</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Kelas</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">% Zona Merah</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">AVG Nilai</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((anomaly, idx) => (
                <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--gray-bg)] transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-[var(--text-primary)]">{anomaly.matkul}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[var(--text-secondary)]">{anomaly.dosen}</td>
                  <td className="px-5 py-3.5 text-center text-[13px] font-semibold text-[var(--text-primary)]">{anomaly.kelas}</td>
                  <td className="px-5 py-3.5 text-center font-['JetBrains_Mono'] text-[14px] font-bold text-[var(--danger)]">{anomaly.zonaPercentage}</td>
                  <td className="px-5 py-3.5 text-center font-['JetBrains_Mono'] text-[14px] font-bold text-[var(--text-primary)]">{anomaly.avgNilai}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${anomaly.status.includes('Anomali') ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--warning-bg)] text-[#b45309]'}`}>{anomaly.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}