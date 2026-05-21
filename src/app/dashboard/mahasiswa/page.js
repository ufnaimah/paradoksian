"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { ChevronDown, Loader2 } from 'lucide-react';

export default function MahasiswaDashboard() {
  const [profil, setProfil] = useState(null);
  const [mataKuliah, setMataKuliah] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const userId = 'U0001'; // Dummy mahasiswa untuk MVP

      // Ambil Profil
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Ambil KRS Relasional (Matkul + Hasil Monte Carlo & MVE)
      const { data: krsData } = await supabase
        .from('enrollments')
        .select(`
          enrollment_id,
          courses ( nama_matkul, sks, nama_dosen ),
          analytics_cache ( prediksi_akhir, prob_aman_do, target_mve, zona_status )
        `)
        .eq('user_id', userId);

      setProfil(userData);
      setMataKuliah(krsData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--navy)] mb-4" />
        <p className="text-[var(--text-secondary)] font-semibold animate-pulse">Menarik Data Analytics...</p>
      </div>
    );
  }

  // Hitung jumlah zona (Dari data K-Means Database)
  const totalSKS = mataKuliah.reduce((sum, mk) => sum + (mk.courses?.sks || 0), 0);
  const dangerCount = mataKuliah.filter(mk => mk.analytics_cache[0]?.zona_status === 'Bahaya DO').length;
  const safeCount = mataKuliah.filter(mk => mk.analytics_cache[0]?.zona_status === 'Aman').length;

  return (
    <div>
      <div className="mb-5 flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Dashboard Akademik</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">
            {profil?.nama} | {profil?.prodi}
          </p>
        </div>
        <div className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm font-bold shadow-md">
          IPK Baseline: {profil?.ipk_baseline}
        </div>
      </div>

      {/* Stats Cards (UI dari Figma kamu) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Total SKS</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--navy)] leading-none">{totalSKS}</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)] mt-2">Semester Berjalan</div>
        </div>

        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Peringatan Kritis</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--danger)] leading-none">{dangerCount}</div>
          <div className="text-[11.5px] font-medium text-[var(--danger)] mt-2 flex items-center gap-1">
            {dangerCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse"></span>}
            Matkul Rawan DO
          </div>
        </div>

        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Zona Aman</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--success)] leading-none">{safeCount}</div>
          <div className="text-[11.5px] font-medium text-[var(--success)] mt-2">Matkul Kondisi Baik</div>
        </div>
      </div>

      {/* Course Table Integrasi Database */}
      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--navy)]">
          <h2 className="text-[15px] font-bold text-white">Daftar Mata Kuliah & Proyeksi MVE</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--gray-bg)] border-b border-[var(--border)]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Mata Kuliah</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">SKS</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Prediksi Akhir (Monte Carlo)</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Target Min. UAS (MVE)</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Status Zona</th>
              </tr>
            </thead>
            <tbody>
              {mataKuliah.map((mk) => {
                const course = mk.courses;
                const analytics = mk.analytics_cache[0] || {};
                const isRed = analytics.zona_status === 'Bahaya DO';
                
                return (
                  <tr key={mk.enrollment_id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--gray-bg)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-semibold text-[var(--text-primary)]">{course?.nama_matkul}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{course?.nama_dosen}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="text-[13px] font-semibold text-[var(--text-primary)]">{course?.sks}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="font-['JetBrains_Mono'] text-[14px] font-bold text-[var(--navy)]">{analytics.prediksi_akhir}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-[12px] font-bold ${isRed ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--warning-bg)] text-[#b45309]'}`}>
                        {analytics.target_mve}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        isRed ? 'bg-[rgba(239,68,68,0.1)] text-[#dc2626]' : 'bg-[rgba(34,197,94,0.1)] text-[#15803d]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isRed ? 'bg-[var(--danger)] animate-pulse' : 'bg-[var(--success)]'}`}></span>
                        {analytics.zona_status || 'Aman'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}