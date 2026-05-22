"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { FileText, Link as LinkIcon, User, Loader2, ExternalLink } from 'lucide-react';

// Format waktu relatif
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// Warna random untuk initial avatar
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

export default function GCRPage() {
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch enrolled courses
  useEffect(() => {
    async function fetchCourses() {
      if (!user?.user_id) return;
      if (!supabase) {
        console.warn('[v0] Supabase client not available');
        setLoading(false);
        return;
      }

      try {
        const { data: enrollments, error } = await supabase
          .from('enrollments')
          .select(`
            enrollment_id,
            courses (
              course_id,
              nama_matkul,
              kode_matkul,
              join_code,
              dosen:dosen_id (
                dosen_id,
                nama
              )
            )
          `)
          .eq('user_id', user.user_id)
          .eq('status', 'aktif');

        if (error) {
          console.error('[v0] Error fetching courses:', error);
          return;
        }

        const processedCourses = enrollments?.map((e, idx) => ({
          id: e.courses?.course_id,
          enrollment_id: e.enrollment_id,
          name: e.courses?.nama_matkul || 'Unknown',
          kode: e.courses?.kode_matkul,
          lecturer: e.courses?.dosen?.nama || '-',
          dosen_id: e.courses?.dosen?.dosen_id,
          initial: e.courses?.nama_matkul?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??',
          color: colors[idx % colors.length],
          join_code: e.courses?.join_code
        })) || [];

        setCourses(processedCourses);
        
        // Select first course by default
        if (processedCourses.length > 0 && !selectedCourse) {
          setSelectedCourse(processedCourses[0]);
        }
      } catch (err) {
        console.error('[v0] Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [user]);

  // Fetch posts when course changes
  useEffect(() => {
    async function fetchPosts() {
      if (!selectedCourse?.id) return;
      if (!supabase) return;

      setLoadingPosts(true);
      try {
        // Juga cek target_kelas jika user punya kelas
        let query = supabase
          .from('gcr_posts')
          .select(`
            id,
            tipe,
            judul,
            konten,
            file_name,
            tenggat_waktu,
            created_at,
            target_kelas,
            dosen:dosen_id (
              nama
            )
          `)
          .eq('course_id', selectedCourse.id)
          .order('created_at', { ascending: false });

        const { data: postsData, error } = await query;

        if (error) {
          console.error('[v0] Error fetching posts:', error);
          return;
        }

        // Filter posts berdasarkan target_kelas
        const filteredPosts = postsData?.filter(post => {
          if (!post.target_kelas) return true; // No target = all classes
          if (!user?.kelas) return true; // User has no class = show all
          return post.target_kelas === user.kelas;
        }) || [];

        const processedPosts = filteredPosts.map(post => ({
          id: post.id,
          author: post.dosen?.nama || 'Dosen',
          time: formatTimeAgo(post.created_at),
          type: post.tipe?.toLowerCase() || 'pengumuman',
          typeLabel: post.tipe === 'tugas' ? 'Tugas' : post.tipe === 'materi' ? 'Materi' : 'Pengumuman',
          title: post.judul,
          content: post.konten,
          attachment: post.file_name,
          deadline: post.tenggat_waktu ? new Date(post.tenggat_waktu).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : null
        }));

        setPosts(processedPosts);
      } catch (err) {
        console.error('[v0] Error:', err);
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchPosts();
  }, [selectedCourse, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--navy)] mb-4" />
        <p className="text-[var(--text-secondary)] font-semibold animate-pulse">Memuat Data GCR...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">GCR Mahasiswa</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Integrasi Google Classroom</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm p-8 text-center">
          <p className="text-[var(--text-muted)]">Belum ada kelas yang terdaftar</p>
        </div>
      ) : (
        <div className="grid grid-cols-[280px_1fr] gap-5">
          {/* Course List Sidebar */}
          <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[var(--border)] bg-[var(--navy)]">
              <div className="text-sm font-bold text-white">Kelas Saya</div>
            </div>
            <div>
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`px-4 py-3 border-b border-[var(--gray-bg)] cursor-pointer transition-all flex items-center gap-2.5 ${
                    selectedCourse?.id === course.id ? 'bg-[var(--sky)]' : 'hover:bg-[var(--sky)]'
                  }`}
                >
                  <div className={`w-8 h-8 ${course.color} rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                    {course.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-[var(--text-primary)] leading-tight mb-0.5">{course.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">{course.lecturer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Feed Content */}
          <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-[18px] border-b border-[var(--border)] bg-[var(--navy)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${selectedCourse?.color || 'bg-blue-500'} rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                  {selectedCourse?.initial || '??'}
                </div>
                <div>
                  <div className="text-base font-bold text-white">{selectedCourse?.name || 'Pilih Kelas'}</div>
                  <div className="text-xs text-white/60 mt-0.5">{selectedCourse?.lecturer || '-'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-[7px] rounded-lg text-xs font-semibold bg-white/10 text-white transition-all hover:bg-white/20">
                  Tugas
                </button>
                <button className="px-3.5 py-[7px] rounded-lg text-xs font-semibold bg-[var(--cream)] text-[var(--navy-dark)] transition-all hover:bg-[var(--cream)]/90 flex items-center gap-1.5">
                  Buka GCR
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-[18px] space-y-3 max-h-[calc(100vh-300px)]">
              {loadingPosts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--navy)]" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  Belum ada postingan di kelas ini
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border border-[var(--border)] rounded-xl px-4 py-3.5 transition-all hover:shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--navy)] flex items-center justify-center text-xs font-bold text-white">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-[var(--text-primary)]">{post.author}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{post.time}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.type === 'tugas' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 
                        post.type === 'materi' ? 'bg-[var(--sky)] text-[var(--navy)]' :
                        'bg-[var(--success-bg)] text-[var(--success)]'
                      }`}>
                        {post.typeLabel}
                      </span>
                    </div>
                    
                    {post.title && (
                      <div className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">{post.title}</div>
                    )}
                    
                    <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-2.5">{post.content}</div>
                    
                    {post.deadline && (
                      <div className="text-[11px] text-[var(--warning)] font-medium mb-2">
                        Deadline: {post.deadline}
                      </div>
                    )}
                    
                    {post.attachment && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--gray-bg)] rounded-lg text-xs text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--sky)] transition-colors">
                        <FileText className="w-4 h-4" />
                        <span className="flex-1">{post.attachment}</span>
                        <LinkIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
