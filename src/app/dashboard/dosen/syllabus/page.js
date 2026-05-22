"use client";

import { useEffect, useState } from 'react';
import { BookOpen, FlaskConical, RefreshCw, Check, Loader2, Info, Users, Plus, X, Edit, Trash2, Archive, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DosenSyllabusPage() {
  const [courses, setCourses] = useState([]);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dosenKelas, setDosenKelas] = useState([]);
  const [filterView, setFilterView] = useState('aktif'); 

  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [formCourse, setFormCourse] = useState({
    nama_matkul: '', kode_matkul: '', prodi_target: 'D4 Statistika', peminatan: 'Umum', 
    sks: 3, jenis_matkul: 'Teori', target_kelas: '', join_code: ''
  });

  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [isSavingClass, setIsSavingClass] = useState(false);
  const [newTargetKelas, setNewTargetKelas] = useState('');
  const [newJoinCode, setNewJoinCode] = useState('');

  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState(null);

  const currentDosenId = 'D001'; 

  const loadSyllabusData = async (selectIdAfterLoad = null) => {
    try {
      const { data: courseData } = await supabase.from('courses').select('*').eq('dosen_id', currentDosenId);
      const { data: configData } = await supabase.from('global_config').select('*').eq('id', 1).single();
      const { data: studentClasses } = await supabase.from('mahasiswa').select('kelas').not('kelas', 'is', null);
      
      const uniqueClasses = Array.from(new Set(studentClasses?.map(s => s.kelas))).sort();

      // Filter out data yang statusnya 'dihapus'
      const activeCourses = courseData?.filter(c => c.status !== 'dihapus') || [];
      setCourses(activeCourses);
      setGlobalConfig(configData);
      setAvailableClasses(uniqueClasses);
      
      const visibleCourses = activeCourses.filter(c => (c.status || 'aktif') === filterView);
      
      if (selectIdAfterLoad) {
        const found = activeCourses.find(c => c.course_id === selectIdAfterLoad);
        setSelectedCourse(found || (visibleCourses.length > 0 ? visibleCourses[0] : null));
      } else if (!selectedCourse || !activeCourses.find(c => c.course_id === selectedCourse.course_id)) {
        setSelectedCourse(visibleCourses.length > 0 ? visibleCourses[0] : null);
      } else {
        const updatedSelected = activeCourses.find(c => c.course_id === selectedCourse.course_id);
        setSelectedCourse(updatedSelected?.status === filterView ? updatedSelected : (visibleCourses.length > 0 ? visibleCourses[0] : null));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadSyllabusData();
  }, [filterView]);

  useEffect(() => {
    if (selectedCourse) loadDosenKelas(selectedCourse.course_id);
    else setDosenKelas([]);
  }, [selectedCourse]);

  const loadDosenKelas = async (courseId) => {
    const { data } = await supabase.from('dosen_kelas').select('*').eq('course_id', courseId).order('target_kelas');
    setDosenKelas(data || []);
  };

  const generateRandomCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const enrollStudentsToClass = async (courseId, kelasName, isTeori) => {
    const { data: targetStudents } = await supabase.from('mahasiswa').eq('kelas', kelasName);
    if (!targetStudents || targetStudents.length === 0) return;

    const { data: existingEnrolls } = await supabase.from('enrollments').select('user_id').eq('course_id', courseId);
    const existingUserIds = new Set(existingEnrolls?.map(e => e.user_id) || []);
    const newStudents = targetStudents.filter(s => !existingUserIds.has(s.user_id));

    if (newStudents.length > 0) {
      const enrollEntries = newStudents.map(s => ({
        enrollment_id: `E-${Math.random().toString(36).substr(2, 9)}`, // Generate Unique ID aman
        user_id: s.user_id,
        course_id: courseId,
        status: 'aktif'
      }));
      
      const { error: enrollErr } = await supabase.from('enrollments').insert(enrollEntries);
      if (enrollErr) throw enrollErr;

      // Beri Nilai 0 agar nama mahasiswa TETAP muncul di GCR & Kelola meskipun belum dinilai
      const gradeEntries = enrollEntries.map(e => ({
        enrollment_id: e.enrollment_id,
        nilai_tugas: 0,
        nilai_praktikum: 0,
        nilai_uts: 0,
        nilai_uas: 0
      }));
      await supabase.from('grades').insert(gradeEntries);
    }
  };

  const handleCreateNewCourse = async (e) => {
    e.preventDefault();
    setIsSavingCourse(true);
    try {
      const newCourseId = 'C' + Math.floor(1000 + Math.random() * 9000);
      
      await supabase.from('courses').insert([{
        course_id: newCourseId,
        kode_matkul: formCourse.kode_matkul,
        nama_matkul: formCourse.nama_matkul,
        sks: parseInt(formCourse.sks),
        prodi_target: formCourse.prodi_target,
        semester: formCourse.prodi_target.includes('D3') ? 3 : 5, 
        dosen_id: currentDosenId,
        jenis_matkul: formCourse.jenis_matkul,
        status: 'aktif'
      }]);

      const isTeori = formCourse.jenis_matkul === 'Teori';
      await supabase.from('syllabus_config').insert([{
        config_id: Math.floor(Math.random() * 1000000), 
        course_id: newCourseId,
        bobot_tugas: isTeori ? globalConfig.teori_tugas : globalConfig.prak_tugas,
        bobot_praktikum: isTeori ? 0 : globalConfig.prak_prak,
        bobot_uts: isTeori ? globalConfig.teori_uts : globalConfig.prak_uts,
        bobot_uas: isTeori ? globalConfig.teori_uas : globalConfig.prak_uas
      }]);

      if (formCourse.target_kelas && formCourse.join_code) {
        await supabase.from('dosen_kelas').insert([{ course_id: newCourseId, target_kelas: formCourse.target_kelas, join_code: formCourse.join_code }]);
        await enrollStudentsToClass(newCourseId, formCourse.target_kelas, isTeori);
      }

      alert("Mata Kuliah Pengampuan Berhasil Ditambahkan!");
      setIsNewCourseModalOpen(false);
      setFormCourse({ nama_matkul: '', kode_matkul: '', prodi_target: 'D4 Statistika', peminatan: 'Umum', sks: 3, jenis_matkul: 'Teori', target_kelas: '', join_code: '' });
      setFilterView('aktif');
      await loadSyllabusData(newCourseId);
    } catch (err) {
      alert("Gagal menambahkan mata kuliah: " + err.message);
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('courses').update({
        nama_matkul: editingCourse.nama_matkul, kode_matkul: editingCourse.kode_matkul,
        sks: parseInt(editingCourse.sks), prodi_target: editingCourse.prodi_target, jenis_matkul: editingCourse.jenis_matkul
      }).eq('course_id', editingCourse.course_id);
      alert("Informasi mata kuliah berhasil diubah!");
      setIsEditCourseModalOpen(false);
      await loadSyllabusData(editingCourse.course_id);
    } catch (err) { alert(err.message); }
  };

  const handleUpdateCourseStatus = async (courseId, newStatus) => {
    const actionText = newStatus === 'arsip' ? 'mengarsipkan' : newStatus === 'dihapus' ? 'MENGHAPUS PERMANEN' : 'mengaktifkan kembali';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} mata kuliah ini?`)) return;
    try {
      await supabase.from('courses').update({ status: newStatus }).eq('course_id', courseId);
      alert(`Berhasil!`);
      if (newStatus === 'dihapus') setSelectedCourse(null);
      await loadSyllabusData();
    } catch (err) { alert(err.message); }
  };

  const handleAddNewClassSession = async (e) => {
    e.preventDefault();
    if (!newTargetKelas || !newJoinCode) return alert("Pilih kelas dan kode terlebih dahulu!");
    setIsSavingClass(true);
    try {
      await supabase.from('dosen_kelas').insert([{ course_id: selectedCourse.course_id, target_kelas: newTargetKelas, join_code: newJoinCode }]);
      await enrollStudentsToClass(selectedCourse.course_id, newTargetKelas, selectedCourse.jenis_matkul === 'Teori');
      alert(`Sesi Kelas ${newTargetKelas} berhasil dibuka! Mahasiswa didaftarkan dengan nilai awal 0.`);
      setIsNewClassModalOpen(false);
      loadDosenKelas(selectedCourse.course_id);
    } catch (err) { alert("Gagal membuka kelas: " + err.message); } 
    finally { setIsSavingClass(false); }
  };

  const handleUpdateKelas = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('dosen_kelas').update({ target_kelas: editingKelas.target_kelas, join_code: editingKelas.join_code }).eq('id', editingKelas.id);
      alert("Sesi kelas berhasil diperbarui!");
      setIsEditModalOpen(false);
      loadDosenKelas(selectedCourse.course_id);
    } catch (err) { alert(err.message); }
  };

  const handleDeleteKelas = async (id, kelasName) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus sesi ruang kelas ${kelasName}?`)) return;
    try {
      await supabase.from('dosen_kelas').delete().eq('id', id);
      alert("Sesi kelas berhasil dihapus!");
      loadDosenKelas(selectedCourse.course_id);
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--navy)]" /></div>;

  const filteredCoursesList = courses.filter(c => (c.status || 'aktif') === filterView);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Konfigurasi Silabus & Sesi Kelas</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Kelola kurikulum pengampuan pengajar dan organisasi kelas aktif</p>
        </div>
        <button onClick={() => { setIsNewCourseModalOpen(true); setFormCourse({...formCourse, join_code: generateRandomCode()}); }} className="px-4 py-2.5 bg-[var(--navy)] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 hover:bg-[var(--navy-light)] transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Mata Kuliah Baru
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-4 bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-bold">
              <button onClick={() => setFilterView('aktif')} className={`px-2.5 py-1 rounded-md transition-all ${filterView === 'aktif' ? 'bg-white text-[var(--navy)] shadow-sm' : 'text-gray-400'}`}>Aktif</button>
              <button onClick={() => setFilterView('arsip')} className={`px-2.5 py-1 rounded-md transition-all ${filterView === 'arsip' ? 'bg-white text-[var(--navy)] shadow-sm' : 'text-gray-400'}`}>Arsip</button>
            </div>
            <span className="text-[11px] font-bold text-gray-400">Total: {filteredCoursesList.length}</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {filteredCoursesList.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-medium">Tidak ada mata kuliah.</div>
            ) : (
              filteredCoursesList.map((course) => (
                <button key={course.course_id} onClick={() => setSelectedCourse(course)} className={`w-full p-4 text-left transition-colors flex flex-col gap-1 ${selectedCourse?.course_id === course.course_id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                  <span className="text-[13px] font-bold text-[var(--text-primary)]">{course.nama_matkul}</span>
                  <span className="text-[11px] font-mono font-semibold text-gray-400">{course.kode_matkul} • {course.sks} SKS</span>
                  <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded w-max ${course.jenis_matkul === 'Praktikum' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                    {course.jenis_matkul || 'Teori'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="col-span-8 space-y-6">
          {selectedCourse ? (
            <>
              <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Spesifikasi Mata Kuliah</span>
                    <h2 className="text-base font-bold text-[var(--text-primary)] mt-0.5">{selectedCourse.nama_matkul} ({selectedCourse.kode_matkul})</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingCourse(selectedCourse); setIsEditCourseModalOpen(true); }} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-[var(--navy)] hover:bg-gray-50 transition-colors" title="Edit Detail Matkul"><Edit className="w-4 h-4" /></button>
                    {selectedCourse.status === 'arsip' ? (
                      <button onClick={() => handleUpdateCourseStatus(selectedCourse.course_id, 'aktif')} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-green-600 hover:bg-gray-50 transition-colors" title="Aktifkan Kembali Matkul"><FolderOpen className="w-4 h-4" /></button>
                    ) : (
                      <button onClick={() => handleUpdateCourseStatus(selectedCourse.course_id, 'arsip')} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-gray-50 transition-colors" title="Arsipkan Matkul"><Archive className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => handleUpdateCourseStatus(selectedCourse.course_id, 'dihapus')} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-colors" title="Hapus Matkul"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div><span className="text-gray-400 text-xs block">Prodi Target</span><span className="font-bold text-gray-700">{selectedCourse.prodi_target}</span></div>
                  <div><span className="text-gray-400 text-xs block">Beban SKS</span><span className="font-bold text-gray-700">{selectedCourse.sks} SKS</span></div>
                  <div><span className="text-gray-400 text-xs block">Tipe Pelaksanaan</span><span className="font-bold text-gray-700">{selectedCourse.jenis_matkul || 'Teori'}</span></div>
                </div>
              </div>

              <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[var(--navy)]" /><h2 className="text-[14px] font-bold text-gray-800">Daftar Sesi Kelas Google Classroom Aktif</h2></div>
                  {selectedCourse.status !== 'arsip' && (
                    <button onClick={() => { setNewTargetKelas(''); setNewJoinCode(generateRandomCode()); setIsNewClassModalOpen(true); }} className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Buka Kelas Baru
                    </button>
                  )}
                </div>
                
                <div className="p-5 divide-y divide-gray-100">
                  {dosenKelas.length > 0 ? (
                    dosenKelas.map(dk => (
                      <div key={dk.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <p className="text-[14px] font-bold text-gray-800">Sesi Kelas: {dk.target_kelas}</p>
                          <p className="text-xs text-gray-400 mt-0.5">GCR Join Code: <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{dk.join_code}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => { setEditingKelas(dk); setIsEditModalOpen(true); }} className="p-2 border border-gray-200 text-gray-400 hover:text-[var(--navy)] hover:bg-gray-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteKelas(dk.id, dk.target_kelas)} className="p-2 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-sm text-gray-400 font-medium">Belum ada sesi kelas dibuka untuk mata kuliah ini.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[14px] border border-gray-200 p-10 text-center text-sm text-gray-400 font-medium shadow-sm">Silakan pilih atau buat mata kuliah pengampuan terlebih dahulu.</div>
          )}
        </div>
      </div>

      {/* MODAL: TAMBAH MATA KULIAH BARU */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in duration-150 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-[14px] text-gray-800">Tambah Mata Kuliah Pengampuan Baru</h3>
              <button onClick={() => setIsNewCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleCreateNewCourse} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">Nama Mata Kuliah</label><input type="text" required value={formCourse.nama_matkul} onChange={(e)=>setFormCourse({...formCourse, nama_matkul: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[var(--navy)]" /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">Kode Mata Kuliah</label><input type="text" required placeholder="Contoh: STK201" value={formCourse.kode_matkul} onChange={(e)=>setFormCourse({...formCourse, kode_matkul: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[var(--navy)] font-mono" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Program Studi Target</label>
                  <select value={formCourse.prodi_target} onChange={(e)=>setFormCourse({...formCourse, prodi_target: e.target.value})} className="w-full px-2 py-2 border rounded-lg text-sm bg-white outline-none">
                    <option value="D3 Statistika">D3 Statistika</option><option value="D4 Statistika">D4 Statistika</option><option value="D4 Komputasi Statistik">D4 Komputasi Statistik</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Peminatan</label>
                  <select value={formCourse.peminatan} onChange={(e)=>setFormCourse({...formCourse, peminatan: e.target.value})} className="w-full px-2 py-2 border rounded-lg text-sm bg-white outline-none">
                    <option value="Umum">Umum / Polos</option><option value="Sistem Informasi">Sistem Informasi</option><option value="Sains Data">Sains Data</option><option value="Statistika Ekonomi">Statistika Ekonomi</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">Jumlah SKS</label><input type="number" min="1" max="4" value={formCourse.sks} onChange={(e)=>setFormCourse({...formCourse, sks: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" /></div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Tipe Pelaksanaan</label>
                  <select value={formCourse.jenis_matkul} onChange={(e)=>setFormCourse({...formCourse, jenis_matkul: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none">
                    <option value="Teori">Teori Murni</option><option value="Praktikum">Praktikum / Laboratorium</option>
                  </select>
                </div>
              </div>
              <div className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/30 space-y-3 mt-2">
                <h4 className="text-xs font-bold text-indigo-800">Opsi: Buka Sesi Kelas Pertama (Opsional)</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <select value={formCourse.target_kelas} onChange={(e)=>setFormCourse({...formCourse, target_kelas: e.target.value})} className="w-full px-2 py-2 border rounded-lg text-sm bg-white outline-none">
                      <option value="">-- Pilih Kelas Terdaftar --</option>
                      {availableClasses.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-2 py-1.5 border rounded-lg">
                    <span className="font-mono text-sm font-bold text-indigo-600">{formCourse.join_code}</span>
                    <button type="button" onClick={()=>setFormCourse({...formCourse, join_code: generateRandomCode()})} className="p-1 hover:bg-gray-100 rounded text-gray-500"><RefreshCw className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSavingCourse} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2">
                {isSavingCourse ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>} Buat Mata Kuliah
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MATA KULIAH */}
      {isEditCourseModalOpen && editingCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in duration-150 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-[14px] text-gray-800">Edit Informasi Mata Kuliah</h3>
              <button onClick={() => setIsEditCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdateCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">Nama Mata Kuliah</label><input type="text" required value={editingCourse.nama_matkul} onChange={(e)=>setEditingCourse({...editingCourse, nama_matkul: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">Kode Mata Kuliah</label><input type="text" required value={editingCourse.kode_matkul} onChange={(e)=>setEditingCourse({...editingCourse, kode_matkul: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-mono outline-none" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Target Prodi</label>
                  <select value={editingCourse.prodi_target} onChange={(e)=>setEditingCourse({...editingCourse, prodi_target: e.target.value})} className="w-full px-2 py-2 border rounded-lg text-xs bg-white">
                    <option value="D3 Statistika">D3 Statistika</option><option value="D4 Statistika">D4 Statistika</option><option value="D4 Komputasi Statistik">D4 Komputasi Statistik</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">SKS</label>
                  <input type="number" min="1" max="4" value={editingCourse.sks} onChange={(e)=>setEditingCourse({...editingCourse, sks: e.target.value})} className="w-full px-3 py-1.5 border rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Tipe</label>
                  <select value={editingCourse.jenis_matkul} onChange={(e)=>setEditingCourse({...editingCourse, jenis_matkul: e.target.value})} className="w-full px-2 py-2 border rounded-lg text-xs bg-white">
                    <option value="Teori">Teori</option><option value="Praktikum">Praktikum</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-[var(--navy)] hover:bg-[var(--navy-light)] text-white font-bold text-sm rounded-xl shadow-md">Simpan Perubahan Matkul</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH KELAS BARU (UNTUK MATKUL EXISTING) */}
      {isNewClassModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-[14px] text-gray-800">Buka Sesi Kelas Baru</h3>
              <button onClick={() => setIsNewClassModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddNewClassSession} className="p-6 space-y-4">
              <p className="text-xs text-gray-500 font-medium bg-gray-50 border p-2 rounded">Mata Kuliah: <b className="text-[var(--navy)]">{selectedCourse.nama_matkul}</b></p>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Pilih Kelas STIS Target</label>
                <select required value={newTargetKelas} onChange={(e)=>setNewTargetKelas(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none">
                  <option value="">-- Pilih Kelas --</option>
                  {availableClasses.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                </select>
              </div>
              <div className="border rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Kode GCR</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm tracking-wider">{newJoinCode}</span>
                  <button type="button" onClick={()=>setNewJoinCode(generateRandomCode())} className="p-1 hover:bg-gray-100 rounded border text-gray-500"><RefreshCw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <button type="submit" disabled={isSavingClass} className="w-full py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl">
                {isSavingClass ? "Menyimpan..." : "Buka Kelas & Daftarkan Mahasiswa"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SESI KELAS */}
      {isEditModalOpen && editingKelas && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-[14px]">Edit Sesi Kelas</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdateKelas} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Kelas Target STIS</label>
                <select required value={editingKelas.target_kelas} onChange={(e)=>setEditingKelas({...editingKelas, target_kelas: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  {availableClasses.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                </select>
              </div>
              <div className="border rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Kode GCR</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">{editingKelas.join_code}</span>
                  <button type="button" onClick={() => setEditingKelas({...editingKelas, join_code: generateRandomCode()})} className="p-1 hover:bg-gray-100 rounded border text-gray-500"><RefreshCw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-[var(--navy)] text-white font-bold text-sm rounded-xl">Simpan Perubahan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}