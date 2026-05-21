"use client";

import { ChevronDown } from 'lucide-react';

const courses = [
  { name: 'Statistika Matematika II', lecturer: 'Dr. Budi Santoso', sks: 4, nilaiAkhir: 61.5, huruf: 'C', zone: 'red', zoneLabel: 'Zona Merah' },
  { name: 'Kalkulus Lanjut', lecturer: 'Prof. Sari Dewi', sks: 4, nilaiAkhir: 74.2, huruf: 'B', zone: 'yellow', zoneLabel: 'Zona Kuning' },
  { name: 'Basis Data', lecturer: 'Ir. Hendra Pratama', sks: 3, nilaiAkhir: 86.8, huruf: 'A', zone: 'green', zoneLabel: 'Zona Hijau' },
  { name: 'Algoritma & Pemrograman', lecturer: 'M. Farhan, M.Kom', sks: 3, nilaiAkhir: 79.5, huruf: 'B+', zone: 'green', zoneLabel: 'Zona Hijau' },
  { name: 'Bahasa Inggris Akademik', lecturer: 'Dr. Nina Kusuma', sks: 2, nilaiAkhir: 87.3, huruf: 'A', zone: 'green', zoneLabel: 'Zona Hijau' }
];

export default function MatkulPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Mata Kuliah</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Semester 4 · Tahun Akademik 2025/2026</p>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Total SKS</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--navy)] leading-none">16</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)] mt-2">Semester ini</div>
        </div>

        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Zona Merah</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--danger)] leading-none">2</div>
          <div className="text-[11.5px] font-medium text-[var(--danger)] mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse"></span>
            Perlu prioritas
          </div>
        </div>
        
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Zona Kuning</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--warning)] leading-none">1</div>
          <div className="text-[11.5px] font-medium text-[var(--warning)] mt-2">Perlu perhatian</div>
        </div>

        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Zona Hijau</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--success)] leading-none">3</div>
          <div className="text-[11.5px] font-medium text-[var(--success)] mt-2">Aman</div>
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[var(--navy)] rounded-sm"></div>
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Daftar Mata Kuliah</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--gray-bg)]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Mata Kuliah</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Dosen</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">SKS</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nilai</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Huruf</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, idx) => (
                <tr key={idx} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--gray-bg)] transition-colors">
                  <td className="px-5 py-4 text-[13px] font-semibold">{course.name}</td>
                  <td className="px-5 py-4 text-[12.5px] text-[var(--text-secondary)]">{course.lecturer}</td>
                  <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[13px] font-semibold">{course.sks}</td>
                  <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[14px] font-bold">{course.nilaiAkhir}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-md text-[12px] font-bold ${
                      course.zone === 'red' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' :
                      course.zone === 'yellow' ? 'bg-[var(--warning-bg)] text-[#b45309]' :
                      'bg-[var(--success-bg)] text-[var(--success)]'
                    }`}>
                      {course.huruf}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      course.zone === 'red' ? 'bg-[rgba(239,68,68,0.1)] text-[#dc2626]' :
                      course.zone === 'yellow' ? 'bg-[rgba(245,158,11,0.1)] text-[#b45309]' :
                      'bg-[rgba(34,197,94,0.1)] text-[#15803d]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${course.zone === 'red' ? 'bg-[var(--danger)] animate-pulse' : course.zone === 'yellow' ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`}></span>
                      {course.zoneLabel}
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