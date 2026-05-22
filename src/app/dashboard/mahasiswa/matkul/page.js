"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { ChevronDown, Loader2 } from 'lucide-react';

// Fungsi untuk konversi nilai ke huruf
function nilaiToHuruf(nilai) {
  if (nilai >= 85) return 'A';
  if (nilai >= 80) return 'A-';
  if (nilai >= 75) return 'B+';
  if (nilai >= 70) return 'B';
  if (nilai >= 65) return 'B-';
  if (nilai >= 60) return 'C+';
  if (nilai >= 55) return 'C';
  if (nilai >= 50) return 'C-';
  if (nilai >= 40) return 'D';
  return 'E';
}

// Fungsi untuk menentukan zona berdasarkan nilai
function getZona(nilai) {
  if (nilai >= 70) return { zone: 'green', label: 'Zona Hijau' };
  if (nilai >= 55) return { zone: 'yellow', label: 'Zona Kuning' };
  return { zone: 'red', label: 'Zona Merah' };
}

export default function MatkulPage() {
  const [mataKuliah, setMataKuliah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    async function fetchMataKuliah() {
      if (!user?.user_id) return;
      if (!supabase) {
        console.warn('[v0] Supabase client not available');
        setLoading(false);
        return;
      }

      try {
        // Ambil enrollments dengan relasi ke courses, dosen, grades, dan analytics_cache
        const { data: enrollments, error } = await supabase
          .from('enrollments')
          .select(`
            enrollment_id,
            status,
            courses (
              course_id,
              kode_matkul,
              nama_matkul,
              sks,
              semester,
              jenis_matkul,
              dosen:dosen_id (
                nama
              )
            ),
            grades (
              nilai_tugas,
              nilai_praktikum,
              nilai_uts,
              nilai_uas
            ),
            analytics_cache (
              prediksi_akhir,
              zona_status
            )
          `)
          .eq('user_id', user.user_id);

        if (error) {
          console.error('[v0] Error fetching enrollments:', error);
          return;
        }

        // Ambil juga syllabus_config untuk bobot nilai
        const courseIds = enrollments?.map(e => e.courses?.course_id).filter(Boolean) || [];
        
        let syllabusMap = {};
        if (courseIds.length > 0) {
          const { data: syllabusData } = await supabase
            .from('syllabus_config')
            .select('*')
            .in('course_id', courseIds);
          
          syllabusData?.forEach(s => {
            syllabusMap[s.course_id] = s;
          });
        }

        // Ambil global_config untuk default bobot
        const { data: globalConfig } = await supabase
          .from('global_config')
          .select('*')
          .eq('id', 1)
          .single();

        // Process data
        const processedData = enrollments?.map(enrollment => {
          const course = enrollment.courses;
          const grades = enrollment.grades?.[0] || {};
          const analytics = enrollment.analytics_cache?.[0] || {};
          const syllabus = syllabusMap[course?.course_id];
          
          // Hitung nilai akhir
          let nilaiAkhir = analytics.prediksi_akhir;
          
          if (!nilaiAkhir && grades) {
            const isPraktikum = course?.jenis_matkul === 'Praktikum';
            let bobot;
            
            if (syllabus) {
              bobot = {
                tugas: syllabus.bobot_tugas || 0,
                praktikum: syllabus.bobot_praktikum || 0,
                uts: syllabus.bobot_uts || 0,
                uas: syllabus.bobot_uas || 0
              };
            } else if (isPraktikum) {
              bobot = {
                tugas: globalConfig?.prak_tugas || 0.2,
                praktikum: globalConfig?.prak_prak || 0.3,
                uts: globalConfig?.prak_uts || 0.2,
                uas: globalConfig?.prak_uas || 0.3
              };
            } else {
              bobot = {
                tugas: globalConfig?.teori_tugas || 0.3,
                praktikum: 0,
                uts: globalConfig?.teori_uts || 0.3,
                uas: globalConfig?.teori_uas || 0.4
              };
            }
            
            nilaiAkhir = (
              (grades.nilai_tugas || 0) * bobot.tugas +
              (grades.nilai_praktikum || 0) * bobot.praktikum +
              (grades.nilai_uts || 0) * bobot.uts +
              (grades.nilai_uas || 0) * bobot.uas
            );
          }

          const zona = analytics.zona_status ? 
            { 
              zone: analytics.zona_status === 'Bahaya DO' ? 'red' : analytics.zona_status === 'Waspada' ? 'yellow' : 'green',
              label: analytics.zona_status === 'Bahaya DO' ? 'Zona Merah' : analytics.zona_status === 'Waspada' ? 'Zona Kuning' : 'Zona Hijau'
            } : 
            getZona(nilaiAkhir || 0);

          return {
            enrollment_id: enrollment.enrollment_id,
            nama_matkul: course?.nama_matkul || 'Unknown',
            kode_matkul: course?.kode_matkul,
            dosen: course?.dosen?.nama || '-',
            sks: course?.sks || 0,
            semester: course?.semester,
            nilaiAkhir: nilaiAkhir ? Number(nilaiAkhir.toFixed(1)) : null,
            huruf: nilaiAkhir ? nilaiToHuruf(nilaiAkhir) : '-',
            zona,
            grades
          };
        }) || [];

        setMataKuliah(processedData);
      } catch (err) {
        console.error('[v0] Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMataKuliah();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--navy)] mb-4" />
        <p className="text-[var(--text-secondary)] font-semibold animate-pulse">Memuat Data Mata Kuliah...</p>
      </div>
    );
  }

  // Hitung statistik
  const totalSKS = mataKuliah.reduce((sum, mk) => sum + (mk.sks || 0), 0);
  const redCount = mataKuliah.filter(mk => mk.zona.zone === 'red').length;
  const yellowCount = mataKuliah.filter(mk => mk.zona.zone === 'yellow').length;
  const greenCount = mataKuliah.filter(mk => mk.zona.zone === 'green').length;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Mata Kuliah</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">
          Semester {user?.tingkat ? Math.min(user.tingkat * 2, 8) : '-'} · Tahun Akademik 2025/2026
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Total SKS</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--navy)] leading-none">{totalSKS}</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)] mt-2">Semester ini</div>
        </div>

        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Zona Merah</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--danger)] leading-none">{redCount}</div>
          <div className="text-[11.5px] font-medium text-[var(--danger)] mt-2 flex items-center gap-1">
            {redCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse"></span>}
            Perlu prioritas
          </div>
        </div>
        
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Zona Kuning</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--warning)] leading-none">{yellowCount}</div>
          <div className="text-[11.5px] font-medium text-[var(--warning)] mt-2">Perlu perhatian</div>
        </div>

        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Zona Hijau</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--success)] leading-none">{greenCount}</div>
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
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nama Mata Kuliah</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Dosen</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">SKS</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nilai Akhir</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Huruf</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Status</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Detail</th>
              </tr>
            </thead>
            <tbody>
              {mataKuliah.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[var(--text-muted)]">
                    Belum ada mata kuliah yang terdaftar
                  </td>
                </tr>
              ) : (
                mataKuliah.map((course) => (
                  <tr key={course.enrollment_id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--gray-bg)] transition-colors">
                    <td className="px-5 py-4 text-[13px] font-semibold text-[var(--text-primary)]">{course.nama_matkul}</td>
                    <td className="px-5 py-4 text-[12.5px] text-[var(--text-secondary)]">{course.dosen}</td>
                    <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[13px] font-semibold">{course.sks}</td>
                    <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[14px] font-bold">
                      {course.nilaiAkhir !== null ? course.nilaiAkhir : '-'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-[12px] font-bold ${
                        course.zona.zone === 'red' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' :
                        course.zona.zone === 'yellow' ? 'bg-[var(--warning-bg)] text-[#b45309]' :
                        'bg-[var(--success-bg)] text-[var(--success)]'
                      }`}>
                        {course.huruf}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        course.zona.zone === 'red' ? 'bg-[rgba(239,68,68,0.1)] text-[#dc2626]' :
                        course.zona.zone === 'yellow' ? 'bg-[rgba(245,158,11,0.1)] text-[#b45309]' :
                        'bg-[rgba(34,197,94,0.1)] text-[#15803d]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          course.zona.zone === 'red' ? 'bg-[var(--danger)] animate-pulse' : 
                          course.zona.zone === 'yellow' ? 'bg-[var(--warning)]' : 
                          'bg-[var(--success)]'
                        }`}></span>
                        {course.zona.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => setExpandedCourse(expandedCourse === course.enrollment_id ? null : course.enrollment_id)}
                        className="text-[var(--navy)] hover:text-[var(--navy-light)] text-[12px] font-medium flex items-center gap-1 justify-center mx-auto"
                      >
                        Detail
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedCourse === course.enrollment_id ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
