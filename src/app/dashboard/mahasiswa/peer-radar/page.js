"use client";

import { UserPlus, Shield, TrendingUp } from 'lucide-react';

const peers = [
  {
    id: '1',
    name: 'Mahasiswa Anonim #1',
    initial: 'A',
    similarity: 91,
    matchCourses: ['42% identik', 'Basis Data (Lulus dg A)', 'Algoritma (B+)', '6 dari 8 matkul sama'],
    status: 'pending'
  },
  {
    id: '2',
    name: 'Mahasiswa Anonim #2',
    initial: 'T',
    similarity: 86,
    matchCourses: ['Basis Data', 'Statistika Matematika II', 'Kalkulus Lanjut'],
    status: 'pending'
  }
];

export default function PeerRadarPage() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Peer Radar</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">
            Temukan mahasiswa dengan latar belakang akademik serupa untuk kolaborasi belajar
          </p>
        </div>
        <button className="px-4 py-2 bg-[var(--navy)] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[var(--navy-light)] transition-colors flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          +2 Match Tersedia
        </button>
      </div>

      <div className="bg-gradient-to-br from-[var(--sky)] to-[#c7e2ff] border border-[var(--sky-mid)] rounded-[14px] px-5 py-4 mb-5 flex items-start gap-3.5">
        <div className="w-10 h-10 bg-[var(--navy)] rounded-[10px] flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-[var(--navy)] mb-1">Privasi Terjaga</div>
          <div className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
            Semua data mahasiswa dianonimkan. Identitas hanya terlihat setelah kedua pihak menyetujui koneksi.
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {peers.map((peer) => (
          <div key={peer.id} className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {peer.initial}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{peer.name}</h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--success-bg)] text-[var(--success)] rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[11px] font-bold">{peer.similarity}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-3">
                  {peer.matchCourses.map((course, idx) => (
                    <div key={idx} className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[var(--navy)]"></div>
                      {course}
                    </div>
                  ))}
                </div>

                <button className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-[12px] font-semibold hover:bg-[var(--navy-light)] transition-colors">
                  Kirim Request Anonim
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}