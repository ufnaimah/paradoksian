"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Konversi nilai ke bobot (grade point)
function nilaiToBobot(nilai) {
  if (nilai >= 85) return 4.00;
  if (nilai >= 80) return 3.70;
  if (nilai >= 75) return 3.50;
  if (nilai >= 70) return 3.00;
  if (nilai >= 65) return 2.70;
  if (nilai >= 60) return 2.50;
  if (nilai >= 55) return 2.00;
  if (nilai >= 50) return 1.70;
  if (nilai >= 40) return 1.00;
  return 0.00;
}

// Konversi nilai ke huruf
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

export default function IPKTrackerPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ipkData, setIpkData] = useState([]);
  const [currentSemesterCourses, setCurrentSemesterCourses] = useState([]);
  const [ipkKumulatif, setIpkKumulatif] = useState(0);
  const [ipSemester, setIpSemester] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    async function fetchIPKData() {
      if (!user?.user_id) return;
      if (!supabase) {
        console.warn('[v0] Supabase client not available');
        setLoading(false);
        return;
      }

      try {
        // Fetch enrollments dengan grades dan course info
        const { data: enrollments, error } = await supabase
          .from('enrollments')
          .select(`
            enrollment_id,
            status,
            courses (
              course_id,
              nama_matkul,
              sks,
              semester,
              jenis_matkul
            ),
            grades (
              nilai_tugas,
              nilai_praktikum,
              nilai_uts,
              nilai_uas
            ),
            analytics_cache (
              prediksi_akhir
            )
          `)
          .eq('user_id', user.user_id);

        if (error) {
          console.error('[v0] Error fetching enrollments:', error);
          return;
        }

        // Fetch global config untuk bobot default
        const { data: globalConfig } = await supabase
          .from('global_config')
          .select('*')
          .eq('id', 1)
          .single();

        // Fetch syllabus config untuk bobot khusus per matkul
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

        // Process courses dan hitung nilai akhir
        const processedEnrollments = enrollments?.map(e => {
          const course = e.courses;
          const grades = e.grades?.[0] || {};
          const analytics = e.analytics_cache?.[0] || {};
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

          return {
            enrollment_id: e.enrollment_id,
            nama_matkul: course?.nama_matkul || 'Unknown',
            sks: course?.sks || 0,
            semester: course?.semester || 1,
            nilaiAkhir: nilaiAkhir || 0,
            huruf: nilaiToHuruf(nilaiAkhir || 0),
            bobot: nilaiToBobot(nilaiAkhir || 0),
            poinSks: (course?.sks || 0) * nilaiToBobot(nilaiAkhir || 0)
          };
        }) || [];

        // Group by semester untuk grafik
        const semesterGroups = {};
        processedEnrollments.forEach(e => {
          const sem = e.semester;
          if (!semesterGroups[sem]) {
            semesterGroups[sem] = { totalPoin: 0, totalSks: 0 };
          }
          semesterGroups[sem].totalPoin += e.poinSks;
          semesterGroups[sem].totalSks += e.sks;
        });

        // Hitung IP per semester dan IPK kumulatif progressif
        const semesters = Object.keys(semesterGroups).sort((a, b) => Number(a) - Number(b));
        let kumulatifPoin = 0;
        let kumulatifSks = 0;
        
        const ipkTrend = semesters.map(sem => {
          const semData = semesterGroups[sem];
          const ipSem = semData.totalSks > 0 ? semData.totalPoin / semData.totalSks : 0;
          
          kumulatifPoin += semData.totalPoin;
          kumulatifSks += semData.totalSks;
          const ipkKum = kumulatifSks > 0 ? kumulatifPoin / kumulatifSks : 0;
          
          return {
            sem: `Sem ${sem}`,
            semester: Number(sem),
            ip: Number(ipSem.toFixed(2)),
            ipk: Number(ipkKum.toFixed(2))
          };
        });

        // Semester saat ini (tingkat mahasiswa)
        const currentSem = user?.tingkat ? Math.min(user.tingkat * 2, 8) : semesters[semesters.length - 1] || 1;
        const currentCourses = processedEnrollments.filter(e => e.semester === currentSem || e.semester === currentSem - 1);
        
        // Hitung IP semester berjalan
        const currentSemData = currentCourses.reduce((acc, c) => {
          acc.totalPoin += c.poinSks;
          acc.totalSks += c.sks;
          return acc;
        }, { totalPoin: 0, totalSks: 0 });
        
        const currentIP = currentSemData.totalSks > 0 ? currentSemData.totalPoin / currentSemData.totalSks : 0;

        setIpkData(ipkTrend);
        setCurrentSemesterCourses(currentCourses);
        setIpkKumulatif(kumulatifSks > 0 ? kumulatifPoin / kumulatifSks : user?.ipk_baseline || 0);
        setIpSemester(currentIP);
        
      } catch (err) {
        console.error('[v0] Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchIPKData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--navy)] mb-4" />
        <p className="text-[var(--text-secondary)] font-semibold animate-pulse">Memuat Data IPK...</p>
      </div>
    );
  }

  // Jika tidak ada data, tampilkan IPK baseline dari profil
  const displayIpkData = ipkData.length > 0 ? ipkData : [
    { sem: 'Sem 1', ipk: user?.ipk_baseline || 3.5 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">IPK Tracker</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Monitor perkembangan IPK dari semester ke semester</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2">IPK Kumulatif</div>
          <div className="font-['JetBrains_Mono'] text-[28px] font-bold text-[var(--navy)] leading-none">
            {ipkKumulatif.toFixed(2)}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1.5">Target: 3.50</div>
        </div>
        
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2">IP Semester Ini</div>
          <div className="font-['JetBrains_Mono'] text-[28px] font-bold text-[var(--success)] leading-none">
            {ipSemester.toFixed(2)}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1.5">In Progress</div>
        </div>
        
        <div className="bg-white rounded-[14px] px-5 py-4 border border-[var(--border)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2">Total SKS</div>
          <div className="font-['JetBrains_Mono'] text-[28px] font-bold text-[var(--navy-light)] leading-none">
            {currentSemesterCourses.reduce((sum, c) => sum + c.sks, 0)}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1.5">Semester ini</div>
        </div>
      </div>

      {/* Grafik Tren IPK */}
      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-1 h-4 bg-[var(--navy)] rounded-sm"></div>
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Tren IPK Kumulatif</h2>
        </div>

        <div className="p-6">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={displayIpkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="sem" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} stroke="var(--border)" />
              <YAxis domain={[3.0, 4.0]} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} stroke="var(--border)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px', 
                  fontSize: '12px' 
                }} 
                formatter={(value) => [value.toFixed(2), 'IPK']}
              />
              <Line 
                type="monotone" 
                dataKey="ipk" 
                stroke="var(--navy)" 
                strokeWidth={3} 
                dot={{ fill: 'var(--navy)', r: 5 }} 
                activeDot={{ r: 7 }}
              />
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
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Poin SKS</th>
              </tr>
            </thead>
            <tbody>
              {currentSemesterCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[var(--text-muted)]">
                    Belum ada mata kuliah yang terdaftar
                  </td>
                </tr>
              ) : (
                currentSemesterCourses.map((course) => (
                  <tr key={course.enrollment_id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--gray-bg)] transition-colors">
                    <td className="px-5 py-3 text-center font-['JetBrains_Mono'] text-[13px] font-semibold">{course.sks}</td>
                    <td className="px-5 py-3 text-[13px] font-semibold text-[var(--text-primary)]">{course.nama_matkul}</td>
                    <td className={`px-5 py-3 text-center font-['JetBrains_Mono'] text-[14px] font-bold ${
                      course.nilaiAkhir >= 70 ? 'text-[var(--text-primary)]' : 
                      course.nilaiAkhir >= 55 ? 'text-[var(--warning)]' : 
                      'text-[var(--danger)]'
                    }`}>
                      {course.nilaiAkhir.toFixed(1)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-[12px] font-bold ${
                        course.huruf.startsWith('A') ? 'bg-[var(--success-bg)] text-[var(--success)]' :
                        course.huruf.startsWith('B') ? 'bg-[var(--warning-bg)] text-[#b45309]' : 
                        'bg-[var(--danger-bg)] text-[var(--danger)]'
                      }`}>
                        {course.huruf}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-['JetBrains_Mono'] text-[13px] text-[var(--text-secondary)]">
                      {course.bobot.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-[var(--navy)]">
                      {course.poinSks.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {currentSemesterCourses.length > 0 && (
          <div className="px-5 py-4 bg-[var(--sky)] border-t border-[var(--border)] flex items-center justify-end gap-4">
            <div className="text-xs font-bold text-[var(--navy)]">IP Proyeksi Semester Ini:</div>
            <div className="font-['JetBrains_Mono'] text-[24px] font-bold text-[var(--navy)]">{ipSemester.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
