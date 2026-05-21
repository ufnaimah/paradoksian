"use client";

import { useState } from 'react';
import { Plus, Edit } from 'lucide-react';

const courses = [
  { id: '1', name: 'Statistika Matematika II', students: '32 mahasiswa', kode: '4SM2', color: 'bg-blue-500' },
  { id: '2', name: 'Statistika Dasar', students: '28 mahasiswa', kode: '3SD1', color: 'bg-purple-500' }
];

const posts = [
  {
    id: '1',
    author: 'Dr. Sari Permata (Anda)',
    time: 'Hari ini, 08:30',
    type: 'tugas',
    typeLabel: 'Tugas',
    content: 'Tugas 5 sudah diposting. Mohon diserahkan kepada mahasiswa bahwa ini opsional namun berdampak pada nilai akhir. Tenggat: 3 hari.',
    tags: ['#4 dilihat', '3 dikumpulkan']
  }
];

export default function GCRDosenPage() {
  const [selectedCourse, setSelectedCourse] = useState('1');

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">GCR Dosen</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Kelola stream dan tugas kelasmu</p>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-5">
        <div>
          <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--navy)]">
              <div className="text-sm font-bold text-white">Kelas Saya</div>
              <div className="text-[11px] text-white/60 mt-0.5">2 kelas</div>
            </div>
            <div>
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`px-4 py-3.5 border-b border-[var(--gray-bg)] last:border-0 cursor-pointer transition-all flex items-center gap-2.5 ${selectedCourse === course.id ? 'bg-[var(--sky)]' : 'hover:bg-[var(--sky)]'}`}
                >
                  <div className={`w-10 h-10 ${course.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-white">{course.kode}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight mb-0.5">{course.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{course.students}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--navy)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">4SM2</span>
              </div>
              <div>
                <div className="text-base font-bold text-white">Statistika Matematika II</div>
                <div className="text-xs text-white/60 mt-0.5">32 mahasiswa • Kode: STAT4A-2.4</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3.5 py-2 bg-white text-[var(--navy)] rounded-lg text-[12px] font-semibold hover:bg-white/90 transition-colors flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Nilai</button>
              <button className="px-3.5 py-2 bg-[var(--cream)] text-[var(--navy-dark)] rounded-lg text-[12px] font-semibold hover:bg-[var(--cream)]/90 transition-colors flex items-center gap-1.5"><Edit className="w-3.5 h-3.5" />Buat Postingan</button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border border-[var(--border)] rounded-xl p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">DS</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div>
                        <div className="text-[13px] font-bold text-[var(--text-primary)]">{post.author}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{post.time}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.type === 'tugas' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--warning-bg)] text-[#b45309]'}`}>{post.typeLabel}</span>
                    </div>
                    <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">{post.content}</div>
                    {post.tags && (
                      <div className="flex gap-2">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="text-[11px] text-[var(--text-muted)] bg-[var(--gray-bg)] px-2 py-1 rounded-md">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}