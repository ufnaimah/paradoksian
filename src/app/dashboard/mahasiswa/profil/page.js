"use client";

import { User, Mail, Hash, Calendar, GraduationCap } from 'lucide-react';

export default function ProfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Profil Saya</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Informasi akun dan data akademik resmi STIS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Kartu Biodata Utama */}
        <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="px-6 py-6 bg-gradient-to-r from-[var(--navy)] to-[var(--navy-light)] text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--cream)] to-[var(--sky)] flex items-center justify-center text-xl font-bold text-[var(--navy)] shadow-md">
                RA
              </div>
              <div>
                <h2 className="text-xl font-bold">Rizky Aditya</h2>
                <p className="text-sm text-white/70 mt-0.5">NIM: 22810234 • Mahasiswa Aktif</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] block mb-1.5">Nama Lengkap</label>
                <div className="px-4 py-2.5 bg-[var(--gray-bg)] rounded-lg text-[13px] text-[var(--text-primary)] font-medium border border-[var(--border)]">Rizky Aditya</div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] block mb-1.5">NIM / ID User</label>
                <div className="px-4 py-2.5 bg-[var(--gray-bg)] rounded-lg text-[13px] font-['JetBrains_Mono'] font-semibold text-[var(--text-primary)] border border-[var(--border)]">22810234</div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] block mb-1.5 font-sans">Email Institusi</label>
              <div className="px-4 py-2.5 bg-[var(--gray-bg)] rounded-lg text-[13px] text-[var(--text-primary)] flex items-center gap-2 border border-[var(--border)]">
                <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                <span>22810234@stis.ac.id</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] block mb-1.5">Program Studi</label>
                <div className="px-4 py-2.5 bg-[var(--gray-bg)] rounded-lg text-[13px] text-[var(--text-primary)] font-medium border border-[var(--border)]">D4 Komputasi Statistik</div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] block mb-1.5">Semester & Tingkat</label>
                <div className="px-4 py-2.5 bg-[var(--gray-bg)] rounded-lg text-[13px] font-semibold text-[var(--text-primary)] border border-[var(--border)]">Semester 4 (Tingkat 2)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Kanan Statistik */}
        <div className="space-y-4">
          <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border)]">
              <GraduationCap className="w-4 h-4 text-[var(--navy)]" />
              <h3 className="text-xs font-bold uppercase tracking-[0.5px] text-[var(--text-primary)]">Ringkasan Akademik</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--text-secondary)]">IPK Terakhir</span>
                <span className="font-['JetBrains_Mono'] text-[15px] font-bold text-[var(--navy)]">3.68</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--text-secondary)]">SKS Akumulatif</span>
                <span className="font-['JetBrains_Mono'] text-[15px] font-bold text-[var(--navy)]">72 SKS</span>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                <span className="text-[12px] text-[var(--text-secondary)]">Status Jalur</span>
                <span className="px-2.5 py-1 bg-[var(--cream)] text-[var(--navy-dark)] text-[10px] font-bold rounded-full border border-[var(--cream)] shadow-sm">🎓 CUMLAUDE TRACK</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[var(--sky)] to-[#c7e2ff] rounded-[14px] border border-[var(--sky-mid)] p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--navy)] mb-2">Info Sistem ATLAS</h3>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              Akun Anda terintegrasi otomatis dengan sistem SIAKAD STIS dan Google Classroom API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}