"use client";

import { Award } from 'lucide-react';

const watchlist = [
  {
    course: 'Statistika Matematika II',
    lecturer: 'Dr. Budi S.',
    lecturerInitial: 'BS',
    avatarColor: 'bg-purple-500',
    currentGrade: 61.5,
    targetGrade: 85,
    progress: 'Progres grade: 2.0 DO → Butuh naik ke min A',
    status: 'critical'
  },
  {
    course: 'Kalkulus Lanjut',
    lecturer: 'Prof. Sari D.',
    lecturerInitial: 'SD',
    avatarColor: 'bg-orange-500',
    currentGrade: 74.2,
    targetGrade: 85,
    progress: 'Progres grade: 3.0 OOC → Butuh naik ke 3.5 atau A',
    status: 'warning'
  }
];

export default function CumlaudePage() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Cum Laude Tracker</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">
            Pantau progres menuju predikat Cumlaude (IPK ≥ 3.50)
          </p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-[var(--navy)] to-[var(--navy-light)] text-white rounded-[10px] text-[13px] font-semibold flex items-center gap-2">
          <Award className="w-4 h-4" />
          Status: AKTIF
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">IPK Saat Ini</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--navy)] leading-none">2.87</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)] mt-2">Target: 3.50</div>
        </div>
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Target CL</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--warning)] leading-none">≥ 3.50</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)] mt-2">Masih butuh +0.63</div>
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]">
            Grade Watchlist — Matkul Butuh Intervensi
          </h2>
        </div>

        <div className="p-5 space-y-3">
          {watchlist.map((item, idx) => (
            <div key={idx} className={`rounded-xl p-4 border-2 ${
                item.status === 'critical' ? 'bg-[var(--danger-bg)] border-[var(--danger)]/20' :
                'bg-[var(--warning-bg)] border-[var(--warning)]/20'
              }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${item.avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-bold text-white">{item.lecturerInitial}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-bold mb-1">{item.course}</h3>
                  <div className="text-[11px] text-[var(--text-muted)] mb-2">{item.lecturer}</div>
                  <p className="text-[12px] text-[var(--text-secondary)] mb-3">{item.progress}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}