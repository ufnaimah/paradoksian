"use client";

import { useState } from 'react';
import { FileText, Link, User } from 'lucide-react';

const courses = [
  { id: '1', name: 'Pemrograman Web', lecturer: 'Prof. Ani M.', initial: 'AM', color: 'bg-blue-500' },
  { id: '2', name: 'Basis Data Lanjut', lecturer: 'Dr. Budi S.', initial: 'BS', color: 'bg-purple-500' },
  { id: '3', name: 'Machine Learning', lecturer: 'Dr. Citra R.', initial: 'CR', color: 'bg-green-500' },
  { id: '4', name: 'Sistem Operasi', lecturer: 'Ir. Dani P.', initial: 'DP', color: 'bg-orange-500' }
];

const posts = [
  {
    id: '1', author: 'Prof. Ani M.', time: '2 jam lalu', type: 'tugas', typeLabel: 'Tugas',
    content: 'Deadline tugas #3 diperpanjang menjadi Minggu depan. Jangan lupa submit di GCR sebelum pukul 23:59 WIB.',
    attachment: 'tugas_web_3.pdf'
  },
  {
    id: '2', author: 'Dr. Citra R.', time: '5 jam lalu', type: 'materi', typeLabel: 'Materi',
    content: 'Materi kuliah minggu ini: Deep Learning & Neural Networks. Silakan download slide.',
    attachment: 'ML_Week8_Slides.pdf'
  }
];

export default function GCRPage() {
  const [selectedCourse, setSelectedCourse] = useState('1');

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">GCR Mahasiswa</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Integrasi Google Classroom</p>
      </div>

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
                onClick={() => setSelectedCourse(course.id)}
                className={`px-4 py-3 border-b border-[var(--gray-bg)] cursor-pointer transition-all flex items-center gap-2.5 ${selectedCourse === course.id ? 'bg-[var(--sky)]' : 'hover:bg-[var(--sky)]'}`}
              >
                <div className={`w-8 h-8 ${course.color} rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>{course.initial}</div>
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
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">AM</div>
              <div>
                <div className="text-base font-bold text-white">Pemrograman Web</div>
                <div className="text-xs text-white/60 mt-0.5">Prof. Ani M.</div>
              </div>
            </div>
            <button className="px-3.5 py-[7px] rounded-lg text-xs font-semibold bg-[var(--cream)] text-[var(--navy-dark)] transition-all hover:bg-[var(--cream)]/90">
              Buka GCR
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-[18px] space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="border border-[var(--border)] rounded-xl px-4 py-3.5 transition-all hover:shadow-md">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--navy)] flex items-center justify-center text-xs font-bold text-white"><User className="w-3.5 h-3.5" /></div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-[var(--text-primary)]">{post.author}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{post.time}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.type === 'tugas' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--sky)] text-[var(--navy)]'}`}>{post.typeLabel}</span>
                </div>
                <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-2.5">{post.content}</div>
                {post.attachment && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-[var(--gray-bg)] rounded-lg text-xs text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--sky)] transition-colors">
                    <FileText className="w-4 h-4" />
                    <span className="flex-1">{post.attachment}</span>
                    <Link className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}