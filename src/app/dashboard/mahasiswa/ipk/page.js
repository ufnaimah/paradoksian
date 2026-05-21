"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ipkData = [
  { sem: 'Sem 1', ipk: 3.45 },
  { sem: 'Sem 2', ipk: 3.52 },
  { sem: 'Sem 3', ipk: 3.61 },
  { sem: 'Sem 4 (Est)', ipk: 3.68 }
];

const coursesBreakdown = [
  { name: 'Statistika Matematika II', sks: 4, nilaiAkhir: 61.5, huruf: 'C' },
  { name: 'Kalkulus Lanjut', sks: 4, nilaiAkhir: 74.2, huruf: 'B' },
  { name: 'Basis Data', sks: 3, nilaiAkhir: 86.8, huruf: 'A' },
  { name: 'Algoritma & Pemrograman', sks: 3, nilaiAkhir: 79.5, huruf: 'B+' },
  { name: 'Bahasa Inggris Akademik', sks: 2, nilaiAkhir: 87.3, huruf: 'A' }
];

export default function IPKTrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">IPK Tracker</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Monitor perkembangan IPK dari semester ke semester</p>
      </div>

      {/* Grafik Tren IPK */}
      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-1 h-4 bg-[var(--navy)] rounded-sm"></div>
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Tren IPK Kumulatif</h2>
        </div>

        <div className="p-6">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ipkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="sem" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} stroke="var(--border)" />
              <YAxis domain={[3.0, 4.0]} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} stroke="var(--border)" />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="ipk" stroke="var(--navy)" strokeWidth={3} dot={{ fill: 'var(--navy)', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Rincian Semester Berjalan */}
      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-1 h-4 bg-[var(--navy)] rounded-sm"></div>
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]">IP Semester (In Progress)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--gray-bg)] border-b border-[var(--border)]">
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">SKS</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Mata Kuliah</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nilai Akhir</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Huruf</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Bobot</th>
              </tr>
            </thead>
            <tbody>
              {coursesBreakdown.map((course, idx) => (
                <tr key={idx} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--gray-bg)] transition-colors">
                  <td className="px-5 py-3 text-center font-['JetBrains_Mono'] text-[13px] font-semibold">{course.sks}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold">{course.name}</td>
                  <td className="px-5 py-3 text-center font-['JetBrains_Mono'] text-[14px] font-bold text-[var(--text-primary)]">{course.nilaiAkhir}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-md text-[12px] font-bold ${
                      course.huruf.startsWith('A') ? 'bg-[var(--success-bg)] text-[var(--success)]' :
                      course.huruf.startsWith('B') ? 'bg-[var(--warning-bg)] text-[#b45309]' : 'bg-[var(--danger-bg)] text-[var(--danger)]'
                    }`}>{course.huruf}</span>
                  </td>
                  <td className="px-5 py-3 text-center font-['JetBrains_Mono'] text-[13px] text-[var(--text-secondary)]">
                    {course.huruf === 'A' ? '4.00' : course.huruf === 'B+' ? '3.50' : course.huruf === 'B' ? '3.00' : '2.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 bg-[var(--sky)] border-t border-[var(--border)] flex items-center justify-end gap-4">
          <div className="text-xs font-bold text-[var(--navy)]">IP Proyeksi Semester Ini:</div>
          <div className="font-['JetBrains_Mono'] text-[24px] font-bold text-[var(--navy)]">3.68</div>
        </div>
      </div>
    </div>
  );
}