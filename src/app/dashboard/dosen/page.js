"use client";

import { useState } from 'react';
import { AlertTriangle, Users, TrendingDown, Target, Eye } from 'lucide-react';

const students = [
  { name: 'Ahmad Rizal', nim: '221810081', nilai: 45.2, ekspres: 'Zona Merah', zone: 'red', aksi: 'Lihat Detail' },
  { name: 'Budi Santoso', nim: '221810023', nilai: 68.7, ekspres: 'Zona Kuning', zone: 'yellow', aksi: 'Lihat Detail' },
  { name: 'Citra Dewi', nim: '221810045', nilai: 88.3, ekspres: 'Zona Hijau', zone: 'green', aksi: 'Lihat Detail' },
  { name: 'Dika Pratama', nim: '221810067', nilai: 52.1, ekspres: 'Zona Merah', zone: 'red', aksi: 'Lihat Detail' },
  { name: 'Eka Putri', nim: '221810089', nilai: 75.4, ekspres: 'Zona Hijau', zone: 'green', aksi: 'Lihat Detail' },
  { name: 'Farid Akbar', nim: '221810102', nilai: 58.9, ekspres: 'Zona Merah', zone: 'red', aksi: 'Lihat Detail' }
];

export default function DashboardDosenPage() {
  const [selectedClass, setSelectedClass] = useState('stat-math-2');

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Dashboard Dosen</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Semester 4 • Ganjil 2025/2026</p>
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-white border border-[var(--border)] rounded-[10px] text-[13px] font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] shadow-sm"
          >
            <option value="stat-math-2">Statistika Matematika II</option>
            <option value="stat-dasar">Statistika Dasar</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">
            Total Mahasiswa
          </div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--navy)] leading-none">32</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)] mt-2">2 kelas diampu</div>
        </div>

        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">
            Zona Merah
          </div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--danger)] leading-none">11</div>
          <div className="text-[11.5px] font-medium text-[var(--danger)] mt-2 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Perlu intervensi
          </div>
        </div>

        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">
            Rata-rata Kelas
          </div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--warning)] leading-none">63.4</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)] mt-2">Di bawah target</div>
        </div>

        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">
            Perlu Assist
          </div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--success)] leading-none">14</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)] mt-2">Mahasiswa aktif</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[var(--warning-bg)] to-[#fffbeb] border-l-4 border-[var(--warning)] rounded-[14px] px-5 py-4 mb-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-bold text-[#92400e] mb-1">
            34% mahasiswa di zona merah.
          </div>
          <div className="text-[12.5px] text-[#78350f] leading-relaxed">
            Sistem merekomendasikan kampanye prioritas untuk pengadaan latihan soal berdampak terhadap nilai lulus.
            Pertimbangkan penyesuaian kuota UAS atau latihan review tambahan.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-1 h-4 bg-[var(--navy)] rounded-sm"></div>
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Distribusi Nilai Kelas</h2>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-3 mb-4" style={{ height: '160px' }}>
            <div className="flex-1 flex flex-col justify-end">
              <div className="bg-gradient-to-t from-[#ef4444] to-[#dc2626] rounded-t-xl flex items-center justify-center text-white text-sm font-bold transition-all" style={{ height: '50%' }}>5</div>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="bg-gradient-to-t from-[#f87171] to-[#ef4444] rounded-t-xl flex items-center justify-center text-white text-sm font-bold transition-all" style={{ height: '80%' }}>8</div>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="bg-gradient-to-t from-[#f59e0b] to-[#d97706] rounded-t-xl flex items-center justify-center text-white text-sm font-bold transition-all" style={{ height: '100%' }}>10</div>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="bg-gradient-to-t from-[#22c55e] to-[#16a34a] rounded-t-xl flex items-center justify-center text-white text-sm font-bold transition-all" style={{ height: '60%' }}>6</div>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="bg-gradient-to-t from-[#059669] to-[#047857] rounded-t-xl flex items-center justify-center text-white text-sm font-bold transition-all" style={{ height: '30%' }}>3</div>
            </div>
          </div>
          <div className="flex gap-3 text-[11px] text-center text-[var(--text-muted)]">
            <div className="flex-1">E (0-40)</div>
            <div className="flex-1">D (41-55)</div>
            <div className="flex-1">C (56-70)</div>
            <div className="flex-1">B (71-85)</div>
            <div className="flex-1">A (86-100)</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-1 h-4 bg-[var(--navy)] rounded-sm"></div>
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Daftar Mahasiswa</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--gray-bg)]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nama</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">NIM</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nilai</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Ekspres</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={idx} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--gray-bg)] transition-colors">
                  <td className="px-5 py-3.5"><div className="text-[13px] font-semibold text-[var(--text-primary)]">{student.name}</div></td>
                  <td className="px-5 py-3.5"><div className="font-['JetBrains_Mono'] text-[12.5px] text-[var(--text-secondary)]">{student.nim}</div></td>
                  <td className="px-5 py-3.5 text-center"><div className={`font-['JetBrains_Mono'] text-[15px] font-bold ${student.zone === 'red' ? 'text-[var(--danger)]' : student.zone === 'yellow' ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>{student.nilai}</div></td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${student.zone === 'red' ? 'bg-[rgba(239,68,68,0.1)] text-[#dc2626]' : student.zone === 'yellow' ? 'bg-[rgba(245,158,11,0.1)] text-[#b45309]' : 'bg-[rgba(34,197,94,0.1)] text-[#15803d]'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${student.zone === 'red' ? 'bg-[var(--danger)] animate-pulse' : student.zone === 'yellow' ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`}></span>
                      {student.ekspres}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button className="text-[var(--navy-light)] hover:text-[var(--navy)] text-[12px] font-semibold flex items-center gap-1.5 mx-auto transition-colors">
                      <Eye className="w-3.5 h-3.5" /> {student.aksi}
                    </button>
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