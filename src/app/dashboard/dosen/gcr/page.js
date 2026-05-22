"use client";

import { useEffect, useState } from 'react';
import { 
  Users, MessageSquare, Send, Plus, Loader2, BookOpen, Search,
  FileText, Paperclip, Calendar, ChevronDown, X, CheckCircle, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DosenGCRPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const [classSessions, setClassSessions] = useState([]);
  const [selectedSessionStr, setSelectedSessionStr] = useState(''); 
  
  const [students, setStudents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); 

  const [newPost, setNewPost] = useState({ tipe: 'pengumuman', judul: '', konten: '', tenggat: '', fileName: '' });
  const [newComment, setNewComment] = useState({});
  const [isPosting, setIsPosting] = useState(false);

  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedPostForGrading, setSelectedPostForGrading] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [inputNilai, setInputNilai] = useState({});

  const [syllabus, setSyllabus] = useState(null);
  const [minLulus, setMinLulus] = useState(65);

  const currentDosenId = 'D001';
  const currentDosenName = 'Dr. Sari Permata';

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
      const { data: coursesData } = await supabase
        .from('courses')
        .select('course_id, nama_matkul, jenis_matkul')
        .eq('dosen_id', currentDosenId)
        .neq('status', 'dihapus');      
        
        if(!coursesData || coursesData.length === 0) return setLoading(false);
            
      const courseIds = coursesData.map(c => c.course_id);
      const { data: dkData } = await supabase.from('dosen_kelas').select('id, course_id, target_kelas, join_code').in('course_id', courseIds);

      const combined = dkData?.map(dk => {
        const course = coursesData.find(c => c.course_id === dk.course_id);
        return {
          ...dk,
          nama_matkul: course.nama_matkul,
          jenis_matkul: course.jenis_matkul
        };
      }).sort((a,b) => {
        if (a.nama_matkul === b.nama_matkul) return a.target_kelas.localeCompare(b.target_kelas);
        return a.nama_matkul.localeCompare(b.nama_matkul);
      }) || [];

      setClassSessions(combined);
      if (combined.length > 0) {
        setSelectedSessionStr(`${combined[0].course_id}|${combined[0].target_kelas}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassData = async (courseId, targetKelas) => {
    try {
      const { data: configData } = await supabase.from('global_config').select('nilai_min_lulus').eq('id', 1).single();
      if (configData) setMinLulus(configData.nilai_min_lulus);

      const { data: syllabusData } = await supabase.from('syllabus_config').select('*').eq('course_id', courseId).single();
      setSyllabus(syllabusData);

      const { data: postData } = await supabase.from('gcr_posts').select('*').eq('course_id', courseId).eq('target_kelas', targetKelas).order('created_at', { ascending: false });
      setPosts(postData || []);

      if (postData && postData.length > 0) {
        const postIds = postData.map(p => p.id);
        const { data: commentData } = await supabase.from('gcr_comments').select('*').in('post_id', postIds).order('created_at', { ascending: true });
        
        const groupedComments = {};
        commentData?.forEach(c => {
          if (!groupedComments[c.post_id]) groupedComments[c.post_id] = [];
          groupedComments[c.post_id].push(c);
        });
        setComments(groupedComments);
      } else {
        setComments({});
      }

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

      setStudents(enrollData?.map(e => ({
        ...e.mahasiswa,
        enrollment_id: e.enrollment_id,
        grades: e.grades?.[0] || { nilai_tugas: 0, nilai_praktikum: 0, nilai_uts: 0, nilai_uas: 0 }
      })).sort((a,b) => a.nama.localeCompare(b.nama)) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.judul || !newPost.konten || !selectedSessionStr) return;
    setIsPosting(true);
    const [cId, tKelas] = selectedSessionStr.split('|');

    try {
      const { data, error } = await supabase.from('gcr_posts').insert([{
        course_id: cId, dosen_id: currentDosenId, target_kelas: tKelas,
        tipe: newPost.tipe, judul: newPost.judul, konten: newPost.konten, file_name: newPost.fileName || null,
        tenggat_waktu: newPost.tipe === 'tugas' && newPost.tenggat ? newPost.tenggat : null
      }]).select();

      if (error) throw error;
      setPosts([data[0], ...posts]);
      setNewPost({ tipe: 'pengumuman', judul: '', konten: '', tenggat: '', fileName: '' });
      alert("Postingan berhasil diterbitkan!");
    } catch (err) { alert(err.message); } finally { setIsPosting(false); }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    const text = newComment[postId];
    if (!text) return;

    try {
      const { data, error } = await supabase.from('gcr_comments').insert([{ post_id: postId, user_id: currentDosenId, nama_user: currentDosenName, komentar: text }]).select();
      if (error) throw error;
      setComments({ ...comments, [postId]: [...(comments[postId] || []), data[0]] });
      setNewComment({ ...newComment, [postId]: '' });
    } catch (err) { alert(err.message); }
  };

  const openGradingModal = async (post) => {
    setSelectedPostForGrading(post);
    setGradingModalOpen(true);
    setInputNilai({});
    try {
      const { data } = await supabase.from('gcr_submissions').select('*, mahasiswa(nama, nim)').eq('post_id', post.id);
      setSubmissions(data || []);
      const initialGrades = {};
      data?.forEach(sub => { if (sub.nilai) initialGrades[sub.id] = sub.nilai; });
      setInputNilai(initialGrades);
    } catch (err) { console.error(err); }
  };

  const handleSaveGrade = async (submissionId, userId) => {
    const nilai = inputNilai[submissionId];
    if (nilai === undefined || nilai === '') return;
    const [cId, tKelas] = selectedSessionStr.split('|');

    try {
      await supabase.from('gcr_submissions').update({ nilai: parseFloat(nilai), status: 'dinilai' }).eq('id', submissionId);
      await supabase.from('grades').upsert([{ enrollment_id: `E-${cId}-${userId}`, nilai_tugas: parseFloat(nilai) }], { onConflict: 'enrollment_id' });
      alert("Nilai berhasil disimpan!");
      
      setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, nilai: parseFloat(nilai), status: 'dinilai' } : s));
      await loadClassData(cId, tKelas);
    } catch (err) { alert("Gagal menilai: " + err.message); }
  };

  const filteredStudents = students.filter(s => 
    s.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || s.nim?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && classSessions.length === 0) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--navy)]" /></div>;

  const selectedSessionInfo = classSessions.find(cs => `${cs.course_id}|${cs.target_kelas}` === selectedSessionStr);
  const isPraktikum = selectedSessionInfo?.jenis_matkul === 'Praktikum';

  let statTotal = 0;
  let statHijau = 0;
  let statKuning = 0;
  let statMerah = 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Google Classroom Workspace</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Kelola forum pendelegasian tugas akademik pengampuan Anda</p>
        </div>

        {classSessions.length > 0 && (
          <div className="relative w-96">
            <select
              value={selectedSessionStr}
              onChange={(e) => { setSelectedSessionStr(e.target.value); setSearchQuery(''); }}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-[13px] font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
            >
              {classSessions.map(cs => (
                <option key={cs.id} value={`${cs.course_id}|${cs.target_kelas}`}>
                  {cs.nama_matkul} - Kelas {cs.target_kelas}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center border-b border-gray-200 pb-px">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'posts' ? 'border-[var(--navy)] text-[var(--navy)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <MessageSquare className="w-4 h-4" /> Forum & Tugas
          </button>
          <button onClick={() => setActiveTab('students')} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'students' ? 'border-[var(--navy)] text-[var(--navy)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <Users className="w-4 h-4" /> Anggota & Rekap Nilai ({filteredStudents.length})
          </button>
        </div>

        {activeTab === 'students' && (
          <div className="relative mb-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" placeholder="Cari nama atau NIM mahasiswa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl text-xs outline-none w-60 bg-white focus:ring-2 focus:ring-[var(--navy)]"
            />
          </div>
        )}
      </div>

      {activeTab === 'posts' && (
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-4 bg-white rounded-[14px] border border-gray-200 shadow-sm p-5 space-y-4 sticky top-6">
            <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-1.5 border-b border-gray-100 pb-3"><Plus className="w-4 h-4 text-[var(--navy)]" /> Buat Postingan Baru</h3>
            <form onSubmit={handleCreatePost} className="space-y-4 pt-1">
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setNewPost({...newPost, tipe: 'pengumuman'})} className={`py-2 text-[11px] font-bold rounded-lg border flex flex-col items-center gap-1 transition-colors ${newPost.tipe === 'pengumuman' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><MessageSquare className="w-4 h-4" /> Info</button>
                <button type="button" onClick={() => setNewPost({...newPost, tipe: 'materi'})} className={`py-2 text-[11px] font-bold rounded-lg border flex flex-col items-center gap-1 transition-colors ${newPost.tipe === 'materi' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><BookOpen className="w-4 h-4" /> Materi</button>
                <button type="button" onClick={() => setNewPost({...newPost, tipe: 'tugas'})} className={`py-2 text-[11px] font-bold rounded-lg border flex flex-col items-center gap-1 transition-colors ${newPost.tipe === 'tugas' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><FileText className="w-4 h-4" /> Tugas</button>
              </div>
              <input type="text" required placeholder="Judul Postingan..." value={newPost.judul} onChange={(e)=>setNewPost({...newPost, judul: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--navy)] font-semibold" />
              <textarea required rows={4} placeholder="Tulis instruksi materi di sini..." value={newPost.konten} onChange={(e)=>setNewPost({...newPost, konten: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[var(--navy)] resize-none" />
              {(newPost.tipe === 'materi' || newPost.tipe === 'tugas') && (
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1.5"><Paperclip className="w-3 h-3"/> Lampirkan File</label>
                  <input type="text" placeholder="Nama file (contoh: Modul_KMeans.pdf)" value={newPost.fileName} onChange={(e)=>setNewPost({...newPost, fileName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-gray-50" />
                </div>
              )}
              {newPost.tipe === 'tugas' && (
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1.5"><Calendar className="w-3 h-3"/> Tenggat Waktu (Due Date)</label>
                  <input type="datetime-local" required value={newPost.tenggat} onChange={(e)=>setNewPost({...newPost, tenggat: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                </div>
              )}
              <button type="submit" className="w-full py-2.5 bg-[var(--navy)] hover:bg-[var(--navy-light)] text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all">
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-3.5 h-3.5" />} Terbitkan ke Kelas
              </button>
            </form>
          </div>

          <div className="col-span-8 space-y-5 pb-10">
            {posts.length === 0 ? (
              <div className="bg-white rounded-[14px] border border-gray-200 p-10 text-center text-gray-400 flex flex-col items-center">
                <MessageSquare className="w-10 h-10 mb-3 opacity-20" /><p className="text-sm font-medium">Belum ada postingan di kelas ini.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${post.tipe === 'pengumuman' ? 'bg-blue-500' : post.tipe === 'materi' ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
                          {post.tipe === 'pengumuman' && <MessageSquare className="w-5 h-5" />}
                          {post.tipe === 'materi' && <BookOpen className="w-5 h-5" />}
                          {post.tipe === 'tugas' && <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-[var(--text-primary)]">{post.judul}</h4>
                          <span className="text-[11px] font-medium text-gray-400 block">{new Date(post.created_at).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{post.konten}</p>
                    {post.file_name && (
                      <div className="mt-4 p-3 border border-gray-200 rounded-lg flex items-center gap-3 bg-gray-50 max-w-sm">
                        <div className="bg-red-100 p-2 rounded text-red-600"><FileText className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-0"><p className="text-[12px] font-bold text-gray-700 truncate">{post.file_name}</p></div>
                      </div>
                    )}
                    {post.tipe === 'tugas' && (
                      <div className="mt-5 flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                        <div>
                          <p className="text-[11px] font-bold text-indigo-800">Tenggat Pengumpulan:</p>
                          <p className="text-[12px] font-medium text-indigo-900">{new Date(post.tenggat_waktu).toLocaleString('id-ID')}</p>
                        </div>
                        <button onClick={() => openGradingModal(post)} className="px-4 py-2 bg-indigo-600 text-white text-[12px] font-bold rounded-lg hover:bg-indigo-700">Lihat Pengumpulan & Nilai</button>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50/50 border-t border-gray-100 p-5">
                    <div className="space-y-4 mb-4">
                      {comments[post.id]?.map((komentar) => (
                        <div key={komentar.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{komentar.nama_user.charAt(0)}</div>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[12px] font-bold text-gray-800">{komentar.nama_user}</span>
                              <span className="text-[10px] text-gray-400">{new Date(komentar.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-[12px] text-gray-600 mt-0.5">{komentar.komentar}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2">
                      <input type="text" placeholder="Tambahkan komentar kelas..." value={newComment[post.id] || ''} onChange={(e) => setNewComment({...newComment, [post.id]: e.target.value})} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-full text-[12px] outline-none" />
                      <button type="submit" disabled={!newComment[post.id]} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"><Send className="w-4 h-4" /></button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--navy)] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-5 py-4 w-16 text-center rounded-tl-lg">No</th>
                  <th className="px-5 py-4">Data Mahasiswa</th>
                  <th className="px-5 py-4 text-center">Tugas ({syllabus?.bobot_tugas || 0}%)</th>
                  {isPraktikum && <th className="px-5 py-4 text-center">Praktikum ({syllabus?.bobot_praktikum || 0}%)</th>}
                  <th className="px-5 py-4 text-center">UTS ({syllabus?.bobot_uts || 0}%)</th>
                  <th className="px-5 py-4 text-center">UAS ({syllabus?.bobot_uas || 0}%)</th>
                  <th className="px-5 py-4 text-center">Nilai Akhir</th>
                  <th className="px-5 py-4 text-center rounded-tr-lg">Status Zona</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">Tidak ada mahasiswa yang ditemukan</td></tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const g = s.grades || { nilai_tugas: 0, nilai_praktikum: 0, nilai_uts: 0, nilai_uas: 0 };
                    
                    let score = 0;
                    if (syllabus) {
                      score = (g.nilai_tugas * (syllabus.bobot_tugas / 100)) +
                              (g.nilai_praktikum * (syllabus.bobot_praktikum / 100)) +
                              (g.nilai_uts * (syllabus.bobot_uts / 100)) +
                              (g.nilai_uas * (syllabus.bobot_uas / 100));
                    }
                    
                    let zone = 'Hijau';
                    if (score < minLulus) zone = 'Merah';
                    else if (score < minLulus + 5) zone = 'Kuning';

                    statTotal++;
                    if (zone === 'Hijau') statHijau++;
                    else if (zone === 'Kuning') statKuning++;
                    else if (zone === 'Merah') statMerah++;

                    return (
                      <tr key={s.enrollment_id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-5 py-4 text-center text-xs font-bold text-gray-400">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <p className="text-[13px] font-bold text-[var(--text-primary)]">{s.nama}</p>
                          <p className="text-[11px] font-mono text-gray-500 mt-0.5">{s.nim}</p>
                        </td>
                        <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-gray-700">{g.nilai_tugas}</td>
                        {isPraktikum && <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-gray-700">{g.nilai_praktikum}</td>}
                        <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-gray-700">{g.nilai_uts}</td>
                        <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-gray-700">{g.nilai_uas}</td>
                        <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[15px] font-extrabold text-gray-800 bg-gray-50/50">{score.toFixed(2)}</td>
                        <td className="px-5 py-4 text-center">
                          {zone === 'Hijau' && <span className="inline-block px-3 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full">Hijau (Aman)</span>}
                          {zone === 'Kuning' && <span className="inline-block px-3 py-1 text-[11px] font-bold bg-yellow-100 text-yellow-800 rounded-full">Kuning (Waspada)</span>}
                          {zone === 'Merah' && <span className="inline-block px-3 py-1 text-[11px] font-bold bg-red-100 text-red-800 rounded-full">Merah (Kritis)</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredStudents.length > 0 && (
            <div className="bg-gray-50 p-5 border-t border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Statistik Kelas Berdasarkan Input Saat Ini</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
                  <div><p className="text-[11px] font-bold text-blue-600 uppercase">Total Mahasiswa</p><p className="text-2xl font-bold text-blue-900 mt-1">{statTotal}</p></div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                  <div><p className="text-[11px] font-bold text-emerald-600 uppercase">Aman (Hijau)</p><p className="text-2xl font-bold text-emerald-900 mt-1">{statHijau}</p></div>
                  <ShieldCheck className="w-8 h-8 text-emerald-500 opacity-50" />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center justify-between">
                  <div><p className="text-[11px] font-bold text-yellow-600 uppercase">Waspada (Kuning)</p><p className="text-2xl font-bold text-yellow-900 mt-1">{statKuning}</p></div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500 opacity-50" />
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center justify-between">
                  <div><p className="text-[11px] font-bold text-red-600 uppercase">Kritis (Merah)</p><p className="text-2xl font-bold text-red-900 mt-1">{statMerah}</p></div>
                  <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Return Nilai Tugas */}
      {gradingModalOpen && selectedPostForGrading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center"><h3 className="font-bold text-[16px]">Penilaian: {selectedPostForGrading.judul}</h3><button onClick={() => setGradingModalOpen(false)}><X className="w-5 h-5"/></button></div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
               <table className="w-full bg-white rounded-xl shadow-sm border overflow-hidden text-left text-sm">
                  <thead className="bg-gray-100 text-[11px] uppercase text-gray-500"><th className="p-3">Mahasiswa</th><th className="p-3">File</th><th className="p-3">Nilai Tugas</th><th className="p-3">Aksi</th></thead>
                  <tbody className="divide-y">
                    {students.map(mhs => {
                      const sub = submissions.find(s => s.user_id === mhs.user_id);
                      return (
                        <tr key={mhs.user_id} className="hover:bg-gray-50">
                          <td className="p-3"><b>{mhs.nama}</b><br/><span className="text-xs text-gray-500 font-mono">{mhs.nim}</span></td>
                          <td className="p-3">{sub?.file_name ? <span className="text-xs bg-blue-50 text-blue-600 p-1 rounded">{sub.file_name}</span> : <span className="text-xs text-red-500 italic">Belum submit</span>}</td>
                          <td className="p-3"><input type="number" disabled={!sub?.file_name} value={inputNilai[sub?.id] || ''} onChange={(e)=>setInputNilai({...inputNilai, [sub?.id]: e.target.value})} className="w-16 border rounded p-1 text-center font-mono outline-none"/></td>
                          <td className="p-3"><button onClick={()=>handleSaveGrade(sub?.id, mhs.user_id)} disabled={!sub?.file_name} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 disabled:opacity-40">Return</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}