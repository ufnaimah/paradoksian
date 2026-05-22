"use client";

import { useEffect, useState } from 'react';
import { FileText, Save, Loader2, Search, ChevronDown, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DosenKelolaNilaiPage() {
  const [classSessions, setClassSessions] = useState([]);
  const [selectedSessionStr, setSelectedSessionStr] = useState('');
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [gradesInput, setGradesInput] = useState({});

  const currentDosenId = 'D001';

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionStr) {
      const [cId, tKelas] = selectedSessionStr.split('|');
      loadClassData(cId, tKelas);
    }
  }, [selectedSessionStr]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data: coursesData } = await supabase.from('courses').select('course_id, nama_matkul, jenis_matkul').eq('dosen_id', currentDosenId).neq('status', 'dihapus');
      if(!coursesData || coursesData.length === 0) return setLoading(false);
      
      const courseIds = coursesData.map(c => c.course_id);
      const { data: dkData } = await supabase.from('dosen_kelas').select('course_id, target_kelas').in('course_id', courseIds);

      const combined = dkData?.map(dk => {
        const course = coursesData.find(c => c.course_id === dk.course_id);
        return { ...dk, nama_matkul: course.nama_matkul, jenis_matkul: course.jenis_matkul };
      }).sort((a,b) => a.nama_matkul.localeCompare(b.nama_matkul)) || [];

      setClassSessions(combined);
      if (combined.length > 0) setSelectedSessionStr(`${combined[0].course_id}|${combined[0].target_kelas}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassData = async (courseId, targetKelas) => {
    setLoading(true);
    try {
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select(`
          enrollment_id,
          mahasiswa!inner (user_id, nama, nim, kelas),
          grades (nilai_tugas, nilai_praktikum, nilai_uts, nilai_uas)
        `)
        .eq('course_id', courseId)
        .eq('mahasiswa.kelas', targetKelas)
        .eq('status', 'aktif');

      const formatted = enrollData?.map(e => ({
        ...e.mahasiswa,
        enrollment_id: e.enrollment_id,
        grades: e.grades?.[0] || { nilai_tugas: 0, nilai_praktikum: 0, nilai_uts: 0, nilai_uas: 0 }
      })).sort((a, b) => a.nama.localeCompare(b.nama)) || [];

      setStudents(formatted);
      
      const initialGrades = {};
      formatted.forEach(s => {
        initialGrades[s.enrollment_id] = { ...s.grades };
      });
      setGradesInput(initialGrades);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (enrollmentId, field, value) => {
    setGradesInput(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value === '' ? 0 : parseFloat(value)
      }
    }));
  };

  const handleSaveAllGrades = async () => {
    setIsSaving(true);
    try {
      const updates = Object.keys(gradesInput).map(enrollmentId => ({
        enrollment_id: enrollmentId,
        ...gradesInput[enrollmentId]
      }));

      // INI KUNCI UTAMANYA: Tambahkan { onConflict: 'enrollment_id' } agar database mau menimpa nilai lamanya!
      const { error } = await supabase.from('grades').upsert(updates, { onConflict: 'enrollment_id' });
      if (error) throw error;

      // Sinkronkan ulang tampilan
      const [cId, tKelas] = selectedSessionStr.split('|');
      await loadClassData(cId, tKelas); 

      alert("Berhasil! Data nilai telah ditimpa secara permanen ke database.");
    } catch (err) {
      alert("Gagal menyimpan nilai: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading && classSessions.length === 0) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--navy)]" /></div>;

  const selectedSessionInfo = classSessions.find(cs => `${cs.course_id}|${cs.target_kelas}` === selectedSessionStr);
  const isPraktikum = selectedSessionInfo?.jenis_matkul === 'Praktikum';

  const filteredStudents = students.filter(s => 
    s.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || s.nim?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Kelola Penilaian Akademik</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Input matriks nilai mahasiswa yang akan diumpankan ke mesin prediksi Monte Carlo</p>
        </div>

        {classSessions.length > 0 && (
          <div className="relative w-96">
            <select value={selectedSessionStr} onChange={(e) => { setSelectedSessionStr(e.target.value); setSearchQuery(''); }} className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--navy)] shadow-sm cursor-pointer">
              {classSessions.map(cs => <option key={`${cs.course_id}|${cs.target_kelas}`} value={`${cs.course_id}|${cs.target_kelas}`}>{cs.nama_matkul} - Kelas {cs.target_kelas}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--navy)] rounded-lg text-white"><FileText className="w-4 h-4"/></div>
            <div>
              <h2 className="text-[14px] font-bold text-gray-800">Buku Nilai Kelas {selectedSessionInfo?.target_kelas}</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">{selectedSessionInfo?.nama_matkul} ({selectedSessionInfo?.jenis_matkul})</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder="Cari mahasiswa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[var(--navy)] w-48" />
            </div>
            <button onClick={handleSaveAllGrades} disabled={isSaving || filteredStudents.length === 0} className="px-5 py-2 bg-[var(--navy)] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[var(--navy-light)] disabled:opacity-50 flex items-center gap-1.5 transition-all">
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Save className="w-3.5 h-3.5"/>} Simpan Semua Nilai
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--gray-bg)] border-b border-gray-200 text-[11px] font-bold uppercase text-gray-500">
                  <th className="px-5 py-3 w-16 text-center">No</th>
                  <th className="px-5 py-3">Data Mahasiswa</th>
                  <th className="px-5 py-3 text-center border-l border-gray-200">Tugas</th>
                  {isPraktikum && <th className="px-5 py-3 text-center">Praktikum</th>}
                  <th className="px-5 py-3 text-center">UTS</th>
                  <th className="px-5 py-3 text-center">UAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">Tidak ada mahasiswa yang ditemukan</td></tr>
                ) : (
                  filteredStudents.map((s, idx) => (
                    <tr key={s.enrollment_id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 text-center text-xs font-bold text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-bold text-[var(--text-primary)]">{s.nama}</p>
                        <p className="text-[11px] font-mono text-gray-500 mt-0.5">{s.nim}</p>
                      </td>
                      <td className="px-5 py-3 border-l border-gray-100">
                        <input type="number" min="0" max="100" value={gradesInput[s.enrollment_id]?.nilai_tugas ?? 0} onChange={(e) => handleGradeChange(s.enrollment_id, 'nilai_tugas', e.target.value)} className="w-full px-2 py-1.5 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" />
                      </td>
                      {isPraktikum && (
                        <td className="px-5 py-3">
                          <input type="number" min="0" max="100" value={gradesInput[s.enrollment_id]?.nilai_praktikum ?? 0} onChange={(e) => handleGradeChange(s.enrollment_id, 'nilai_praktikum', e.target.value)} className="w-full px-2 py-1.5 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" />
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <input type="number" min="0" max="100" value={gradesInput[s.enrollment_id]?.nilai_uts ?? 0} onChange={(e) => handleGradeChange(s.enrollment_id, 'nilai_uts', e.target.value)} className="w-full px-2 py-1.5 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" min="0" max="100" value={gradesInput[s.enrollment_id]?.nilai_uas ?? 0} onChange={(e) => handleGradeChange(s.enrollment_id, 'nilai_uas', e.target.value)} className="w-full px-2 py-1.5 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}