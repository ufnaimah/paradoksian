"use client";

import { useState } from 'react';
import { Plus, Save } from 'lucide-react';

const initialStudents = [
  { nama: 'Ahmad Rizal', nim: '221810081', uts: 48, kuis: 55, tugas: 60, uas: '—', total: 45.2, zona: 'Merah' },
  { nama: 'Budi Santoso', nim: '221810023', uts: 65, kuis: 72, tugas: 70, uas: '—', total: 68.7, zona: 'Kuning' },
  { nama: 'Citra Dewi', nim: '221810045', uts: 92, kuis: 88, tugas: 85, uas: '—', total: 88.3, zona: 'Hijau' }
];

export default function KelolaKelasPage() {
  const [students, setStudents] = useState(initialStudents);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Kelola Kelas</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Input & kelola nilai mahasiswa</p>
        </div>
        <button className="px-4 py-2 bg-[var(--navy)] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[var(--navy-light)] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Input Nilai
        </button>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm p-5 mb-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] block mb-2">Mata Kuliah</label>
            <select className="w-full px-4 py-2.5 bg-[var(--gray-bg)] border border-[var(--border)] rounded-lg text-[13px] text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--navy)]">
              <option>Statistika Matematika II</option>
              <option>Statistika Dasar</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] block mb-2">Semester</label>
            <select className="w-full px-4 py-2.5 bg-[var(--gray-bg)] border border-[var(--border)] rounded-lg text-[13px] text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--navy)]">
              <option>Ganjil 2024/2025</option>
              <option>Genap 2023/2024</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] block mb-2">Kelas</label>
            <select className="w-full px-4 py-2.5 bg-[var(--gray-bg)] border border-[var(--border)] rounded-lg text-[13px] text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--navy)]">
              <option>STAT4A-2.4</option>
              <option>STAT4B-2.4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[var(--navy)] rounded-sm"></div>
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Statistika Matematika II — Input Nilai Komponen</h2>
          </div>
          <button className="px-4 py-2 bg-[var(--success)] text-white rounded-lg text-[12px] font-semibold hover:bg-[var(--success)]/90 transition-colors flex items-center gap-2">
            <Save className="w-3.5 h-3.5" /> Simpan Semua
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--gray-bg)]">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nama</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">NIM</th>
                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">UTS (10%)</th>
                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Kuis (10%)</th>
                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Tugas (15%)</th>
                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">UAS (40%)</th>
                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Total</th>
                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Zona</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--gray-bg)] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-semibold text-[var(--text-primary)]">{student.nama}</td>
                  <td className="px-4 py-3 font-['JetBrains_Mono'] text-[12px] text-[var(--text-secondary)]">{student.nim}</td>
                  <td className="px-4 py-3"><input type="number" defaultValue={student.uts} className="w-20 px-2 py-1.5 bg-white border border-[var(--border)] rounded-md text-center font-['JetBrains_Mono'] text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--navy)]" /></td>
                  <td className="px-4 py-3"><input type="number" defaultValue={student.kuis} className="w-20 px-2 py-1.5 bg-white border border-[var(--border)] rounded-md text-center font-['JetBrains_Mono'] text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--navy)]" /></td>
                  <td className="px-4 py-3"><input type="number" defaultValue={student.tugas} className="w-20 px-2 py-1.5 bg-white border border-[var(--border)] rounded-md text-center font-['JetBrains_Mono'] text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--navy)]" /></td>
                  <td className="px-4 py-3"><input type="text" defaultValue={student.uas} placeholder="—" className="w-20 px-2 py-1.5 bg-white border border-[var(--border)] rounded-md text-center font-['JetBrains_Mono'] text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--navy)]" /></td>
                  <td className="px-4 py-3 text-center"><div className={`font-['JetBrains_Mono'] text-[15px] font-bold ${student.zona === 'Merah' ? 'text-[var(--danger)]' : student.zona === 'Kuning' ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>{student.total}</div></td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${student.zona === 'Merah' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : student.zona === 'Kuning' ? 'bg-[var(--warning-bg)] text-[#b45309]' : 'bg-[var(--success-bg)] text-[var(--success)]'}`}>
                      {student.zona}
                    </span>
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