"use client";

import { useEffect, useState } from 'react';
import { Users, AlertTriangle, Loader2, Target, BarChart3, CheckCircle2, Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardDosenPage() {
  const [courses, setCourses] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [classSessions, setClassSessions] = useState([]); 
  const [minLulus, setMinLulus] = useState(65);
  
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [chartFilter, setChartFilter] = useState('All'); // Filter baru khusus untuk Grafik Stacked Bar
  const [zoneFilter, setZoneFilter] = useState('All'); 
  const [sessionFilter, setSessionFilter] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState('');

  const currentDosenId = 'D001';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: config } = await supabase.from('global_config').select('nilai_min_lulus').eq('id', 1).single();
      const minScore = config ? config.nilai_min_lulus : 65;
      setMinLulus(minScore);

      const { data: coursesData } = await supabase.from('courses').select('*').eq('dosen_id', currentDosenId).neq('status', 'dihapus');
      if (!coursesData || coursesData.length === 0) {
        setLoading(false);
        return;
      }
      setCourses(coursesData);
      const courseIds = coursesData.map(c => c.course_id);

      const { data: dkData } = await supabase.from('dosen_kelas').select('course_id, target_kelas').in('course_id', courseIds);
      const validSessions = {};
      const sessionsDropdown = [];
      
      dkData?.forEach(dk => {
        if (!validSessions[dk.course_id]) validSessions[dk.course_id] = [];
        validSessions[dk.course_id].push(dk.target_kelas);
        
        const cName = coursesData.find(c => c.course_id === dk.course_id)?.nama_matkul;
        sessionsDropdown.push({
          id: `${dk.course_id}|${dk.target_kelas}`,
          label: `${cName} (Kelas ${dk.target_kelas})`
        });
      });
      
      setClassSessions(sessionsDropdown.sort((a,b) => a.label.localeCompare(b.label)));

      const { data: syllabusData } = await supabase.from('syllabus_config').select('*').in('course_id', courseIds);
      const syllabusMap = {};
      syllabusData?.forEach(s => { syllabusMap[s.course_id] = s; });

      const { data: enrolls } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          mahasiswa!inner (user_id, nama, nim, kelas),
          grades (nilai_tugas, nilai_praktikum, nilai_uts, nilai_uas)
        `)
        .in('course_id', courseIds)
        .eq('status', 'aktif');

      const processedStudents = [];
      const statsObj = {};

      coursesData.forEach(c => {
        const targetClasses = validSessions[c.course_id] || [];
        if (targetClasses.length > 0) {
            const label = `${c.nama_matkul} (${targetClasses.join(', ')})`;
            // Tambahkan course_id di dalam statsObj agar bisa difilter nantinya
            statsObj[c.course_id] = { course_id: c.course_id, name: label, hijau: 0, kuning: 0, merah: 0, total: 0 };
        }
      });

      enrolls?.forEach(e => {
        const mhs = e.mahasiswa;
        
        if (!validSessions[e.course_id] || !validSessions[e.course_id].includes(mhs.kelas)) {
          return; 
        }

        const g = e.grades?.[0] || { nilai_tugas: 0, nilai_praktikum: 0, nilai_uts: 0, nilai_uas: 0 };
        const syllabus = syllabusMap[e.course_id];
        const cName = coursesData.find(c => c.course_id === e.course_id)?.nama_matkul;
        
        let score = 0;
        if (syllabus) {
          score = (g.nilai_tugas * (syllabus.bobot_tugas / 100)) +
                  (g.nilai_praktikum * (syllabus.bobot_praktikum / 100)) +
                  (g.nilai_uts * (syllabus.bobot_uts / 100)) +
                  (g.nilai_uas * (syllabus.bobot_uas / 100));
        }

        let zone = 'Hijau';
        if (score < minScore) zone = 'Merah';
        else if (score < minScore + 5) zone = 'Kuning';

        processedStudents.push({
          id: `${e.course_id}-${mhs.user_id}`,
          sessionId: `${e.course_id}|${mhs.kelas}`,
          nim: mhs.nim,
          nama: mhs.nama,
          kelas: mhs.kelas,
          matkul: cName,
          score: parseFloat(score.toFixed(1)),
          zone: zone
        });

        if (statsObj[e.course_id]) {
          if (zone === 'Hijau') statsObj[e.course_id].hijau++;
          if (zone === 'Kuning') statsObj[e.course_id].kuning++;
          if (zone === 'Merah') statsObj[e.course_id].merah++;
          statsObj[e.course_id].total++;
        }
      });

      processedStudents.sort((a, b) => a.score - b.score);
      setStudentData(processedStudents);
      setCourseStats(Object.values(statsObj).filter(s => s.total > 0).sort((a, b) => b.total - a.total));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--navy)]" /></div>;

  const totalStudents = studentData.length;
  const totalMerah = studentData.filter(s => s.zone === 'Merah').length;
  const totalHijau = studentData.filter(s => s.zone === 'Hijau').length;

  // Filter Data Khusus Untuk Chart Stacked Bar
  const filteredChartStats = chartFilter === 'All' ? courseStats : courseStats.filter(s => s.course_id === chartFilter);
  const maxTotal = Math.max(...filteredChartStats.map(s => s.total), 1);

  // Filter Data Khusus Untuk Tabel
  const filteredStudents = studentData.filter(s => {
    const matchZone = zoneFilter === 'All' || s.zone === zoneFilter;
    const matchSession = sessionFilter === 'All' || s.sessionId === sessionFilter;
    const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nim.includes(searchQuery);
    return matchZone && matchSession && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Dashboard Pengajar</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Analisis performa mahasiswa di kelas pengampuan Anda</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-gray-200 text-gray-400 font-medium">Anda belum mengampu mata kuliah. Silakan atur di menu Konfigurasi Silabus.</div>
      ) : (
        <>
          {/* KARTU RINGKASAN GLOBAL */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-[14px] px-5 py-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-1">Total Pendaftaran Aktif</div>
                <div className="font-['JetBrains_Mono'] text-3xl font-bold text-[var(--navy)]">{totalStudents}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Users className="w-6 h-6"/></div>
            </div>
            <div className="bg-white rounded-[14px] px-5 py-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-1">Total Zona Aman</div>
                <div className="font-['JetBrains_Mono'] text-3xl font-bold text-emerald-600">{totalHijau}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-6 h-6"/></div>
            </div>
            <div className="bg-white rounded-[14px] px-5 py-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-1">Total Rawan Gagal</div>
                <div className="font-['JetBrains_Mono'] text-3xl font-bold text-red-600">{totalMerah}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600"><AlertTriangle className="w-6 h-6"/></div>
            </div>
          </div>

          {/* HORIZONTAL STACKED BAR CHART DENGAN FILTER MATKUL */}
          <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--navy)]" />
                <h2 className="text-[14px] font-bold text-[var(--text-primary)]">Distribusi Zona Akademik</h2>
              </div>
              
              <div className="flex items-center gap-4">
                {/* FILTER DROPDOWN KHUSUS GRAFIK BAR */}
                <select 
                  value={chartFilter} 
                  onChange={(e) => setChartFilter(e.target.value)} 
                  className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 outline-none cursor-pointer"
                >
                  <option value="All">Semua Mata Kuliah</option>
                  {courses.map(c => (
                    <option key={c.course_id} value={c.course_id}>{c.nama_matkul}</option>
                  ))}
                </select>

                <div className="flex gap-4 text-xs font-bold text-gray-600 border-l border-gray-300 pl-4">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Hijau (Aman)</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Kuning (Waspada)</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> Merah (Kritis)</div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredChartStats.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  Belum ada kelas atau mahasiswa yang terdaftar di pilihan ini.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredChartStats.map((stat, idx) => {
                    const wH = (stat.hijau / maxTotal) * 100;
                    const wK = (stat.kuning / maxTotal) * 100;
                    const wM = (stat.merah / maxTotal) * 100;

                    return (
                      <div key={idx} className="flex items-center gap-4 group">
                        <div className="w-56 text-[12px] font-bold text-gray-700 text-right truncate" title={stat.name}>{stat.name}</div>
                        
                        <div className="flex-1 h-8 flex bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-inner">
                          {stat.hijau > 0 && <div style={{ width: `${wH}%` }} className="bg-emerald-500 flex items-center justify-center hover:brightness-110 transition-all border-r border-white/50 last:border-r-0"><span className="text-[11px] font-bold text-white px-1 truncate">{stat.hijau}</span></div>}
                          {stat.kuning > 0 && <div style={{ width: `${wK}%` }} className="bg-yellow-400 flex items-center justify-center hover:brightness-110 transition-all border-r border-white/50 last:border-r-0"><span className="text-[11px] font-bold text-yellow-900 px-1 truncate">{stat.kuning}</span></div>}
                          {stat.merah > 0 && <div style={{ width: `${wM}%` }} className="bg-red-500 flex items-center justify-center hover:brightness-110 transition-all"><span className="text-[11px] font-bold text-white px-1 truncate">{stat.merah}</span></div>}
                        </div>

                        <div className="w-12 text-[12px] font-bold text-gray-800 shrink-0">{stat.total} org</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* TABEL MAHASISWA DENGAN MULTI FILTER */}
          <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-[14px] font-bold text-[var(--text-primary)] flex items-center gap-2"><Target className="w-4 h-4 text-[var(--navy)]" /> Detail Performa Mahasiswa</h2>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input type="text" placeholder="Cari mahasiswa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-[var(--navy)] w-48 shadow-sm" />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <select value={sessionFilter} onChange={(e) => setSessionFilter(e.target.value)} className="pl-7 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 bg-white outline-none cursor-pointer max-w-[200px] truncate shadow-sm">
                    <option value="All">Semua Kelas</option>
                    {classSessions.map(cs => (
                      <option key={cs.id} value={cs.id}>{cs.label}</option>
                    ))}
                  </select>
                </div>

                <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 bg-white outline-none cursor-pointer shadow-sm">
                  <option value="All">Semua Zona</option>
                  <option value="Hijau">Hanya Hijau</option>
                  <option value="Kuning">Hanya Kuning</option>
                  <option value="Merah">Hanya Merah</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[var(--gray-bg)] border-b border-gray-200 shadow-sm z-10">
                  <tr className="text-[11px] font-bold uppercase text-gray-500">
                    <th className="px-5 py-3">Nama Mahasiswa</th>
                    <th className="px-5 py-3">Mata Kuliah (Kelas)</th>
                    <th className="px-5 py-3 text-center">Proyeksi Nilai Akhir</th>
                    <th className="px-5 py-3 text-center">Status Zona</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-10 text-sm text-gray-400">Tidak ada mahasiswa yang sesuai dengan filter pencarian.</td></tr>
                  ) : (
                    filteredStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-[13px] font-bold text-[var(--text-primary)]">{s.nama}</p>
                          <p className="text-[11px] font-mono text-gray-500 mt-0.5">{s.nim}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-[12px] font-bold text-indigo-700">{s.matkul}</p>
                          <p className="text-[11px] text-gray-500">Sesi Kelas: {s.kelas}</p>
                        </td>
                        <td className="px-5 py-3 text-center font-['JetBrains_Mono'] text-[14px] font-bold text-gray-800">{s.score}</td>
                        <td className="px-5 py-3 text-center">
                          {s.zone === 'Hijau' && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 inline-block w-max">Zona Hijau</span>}
                          {s.zone === 'Kuning' && <span className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200 inline-block w-max">Zona Kuning</span>}
                          {s.zone === 'Merah' && <span className="text-[10px] font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 flex items-center justify-center gap-1 w-max mx-auto"><AlertTriangle className="w-3 h-3"/> Zona Merah</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}