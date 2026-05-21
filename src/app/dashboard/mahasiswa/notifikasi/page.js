"use client";

import { AlertTriangle, Info, Users } from 'lucide-react';

const notifications = [
  {
    id: '1',
    type: 'danger',
    icon: 'alert',
    title: 'UAS Statmat II — 2 Minggu Lagi',
    message: 'Nilai kamu saat ini 61.5. Butuh minimal 74 di UAS untuk lulus. Buka strategi MVE sekarang!',
    time: '2 jam lalu'
  },
  {
    id: '2',
    type: 'warning',
    icon: 'alert',
    title: 'Kalkulus Lanjut — Zona Kuning',
    message: 'Matkul ini perlu perhatian. Prioritaskan belajar topik Week 6-8.',
    time: '5 jam lalu'
  },
  {
    id: '3',
    type: 'info',
    icon: 'users',
    title: 'Peer Radar — 2 Match Baru',
    message: 'Ada 2 mahasiswa yang cocok untuk berkolaborasi di mata kuliah Basis Data.',
    time: '1 hari lalu'
  }
];

export default function NotifikasiPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Notifikasi</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">3 notifikasi belum dibaca</p>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-[14px] p-5 border-2 transition-all hover:shadow-md ${
              notif.type === 'danger'
                ? 'bg-[var(--danger-bg)] border-[var(--danger)]/20'
                : notif.type === 'warning'
                  ? 'bg-[var(--warning-bg)] border-[var(--warning)]/20'
                  : 'bg-[var(--sky)] border-[var(--navy)]/10'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.type === 'danger'
                    ? 'bg-[var(--danger)]'
                    : notif.type === 'warning'
                      ? 'bg-[var(--warning)]'
                      : 'bg-[var(--navy)]'
                }`}
              >
                {notif.icon === 'alert' && <AlertTriangle className="w-6 h-6 text-white" />}
                {notif.icon === 'info' && <Info className="w-6 h-6 text-white" />}
                {notif.icon === 'users' && <Users className="w-6 h-6 text-white" />}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3
                    className={`text-[15px] font-bold ${
                      notif.type === 'danger'
                        ? 'text-[var(--danger)]'
                        : notif.type === 'warning'
                          ? 'text-[#92400e]'
                          : 'text-[var(--navy)]'
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">{notif.time}</span>
                </div>

                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{notif.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}