"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Globe, UserCog, Wrench, Home, BookOpen, BarChart3, Users, LayoutDashboard, FileText, Bell
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname() || '';

  let role = 'murid';
  let userName = 'Rizky Aditya';
  let userSubtitle = 'Mahasiswa';
  let userInitials = 'RA';

  if (pathname.includes('/admin')) {
    role = 'admin';
    userName = 'Admin Pusat';
    userSubtitle = 'Administrator';
    userInitials = 'AP';
  } else if (pathname.includes('/dosen')) {
    role = 'dosen';
    userName = 'Dr. Sari Permata';
    userSubtitle = 'Dosen';
    userInitials = 'SP';
  }

  // --- DEFINISI MENU BERDASARKAN ROLE ---
  const adminMenus = [
    { path: '/dashboard/admin', icon: Globe, label: 'Dashboard Global' },
    { path: '/dashboard/admin/users', icon: UserCog, label: 'Manajemen User' },
    { path: '/dashboard/admin/config', icon: Wrench, label: 'Bare Minimum Config' }
  ];

  const dosenMenus = [
    { path: '/dashboard/dosen', icon: LayoutDashboard, label: 'Dashboard Pengajar' },
    { path: '/dashboard/dosen/syllabus', icon: BookOpen, label: 'Konfigurasi Silabus' },
    { path: '/dashboard/dosen/gcr', icon: Users, label: 'Google Classroom' },
    { path: '/dashboard/dosen/kelola', icon: FileText, label: 'Kelola Penilaian' }
  ];

  const mahasiswaMenus = [
    { path: '/dashboard/mahasiswa', icon: Home, label: 'Overview' },
    { path: '/dashboard/mahasiswa/matkul', icon: BookOpen, label: 'Mata Kuliah' },
    { path: '/dashboard/mahasiswa/ipk', icon: BarChart3, label: 'Simulasi IPK' },
    { path: '/dashboard/mahasiswa/peer-radar', icon: Users, label: 'Peer Radar' },
    { path: '/dashboard/mahasiswa/cumlaude', icon: LayoutDashboard, label: 'Cum Laude Tracker' },
    { path: '/dashboard/mahasiswa/gcr', icon: Globe, label: 'Google Classroom' },
    { path: '/dashboard/mahasiswa/notifikasi', icon: Bell, label: 'Notifikasi' },
    { path: '/dashboard/mahasiswa/profil', icon: UserCog, label: 'Profil Saya' }
  ];

  // Pilih menu yang akan di-render
  const activeMenus = role === 'admin' ? adminMenus : role === 'dosen' ? dosenMenus : mahasiswaMenus;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--gray-bg)] font-sans">
      {/* Sidebar Kiri */}
      <aside className="w-60 bg-[var(--navy-dark)] flex flex-col h-screen flex-shrink-0 relative overflow-hidden shadow-xl z-20">
        <div className="px-5 py-[22px] pb-[18px] flex items-center gap-2.5 border-b border-white/[0.08]">
          <div className="w-[34px] h-[34px] bg-[var(--cream)] rounded-[10px] flex items-center justify-center text-base flex-shrink-0 shadow-lg">
            🧭
          </div>
          <div>
            <div className="text-lg font-extrabold text-white tracking-[0.5px]">STISCOPE</div>
            <div className="text-[9px] text-white/45 font-normal tracking-[0.3px] leading-[1.3]">
              Academic Tracker &<br/>Learning Analytics System
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-white/30 tracking-[1.2px] uppercase px-2 mb-1.5">Menu Utama</div>

          {/* Render menu secara dinamis */}
          {activeMenus.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all text-[13px] font-medium mb-0.5 ${
                pathname === item.path ? 'bg-[var(--cream)]/[0.13] text-[var(--cream)] shadow-sm' : 'text-white/55 hover:bg-white/[0.08] hover:text-white/85'
              }`}>
                <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <Link href="/">
          <div className="px-4 py-3.5 border-t border-white/[0.08] flex items-center gap-2.5 flex-shrink-0 hover:bg-white/[0.05] transition-colors cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-[var(--navy-light)] to-[var(--cream)] rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 shadow-md">
              {userInitials}
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-white leading-[1.3]">{userName}</div>
              <div className="text-[10.5px] text-white/40">{userSubtitle}</div>
            </div>
          </div>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-8 pb-10 min-w-0 bg-[var(--gray-bg)]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}