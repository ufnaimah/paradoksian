"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell, ChevronLeft, ChevronRight, Home, BookOpen, Monitor, 
  BarChart3, Users, GraduationCap, User, LayoutDashboard, 
  School, Settings, Globe, UserCog, Wrench 
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname() || '';
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4)); // Mei 2026

  // Tentukan Role Otomatis dari URL
  let role = 'murid';
  let userName = 'Rizky Aditya';
  let userSubtitle = 'Mahasiswa';
  let userInitials = 'RA';

  if (pathname.includes('/admin')) {
    role = 'admin';
    userName = 'Admin STIS';
    userSubtitle = 'Administrator';
    userInitials = 'AS';
  } else if (pathname.includes('/dosen')) {
    role = 'dosen';
    userName = 'Dr. Sari Permata';
    userSubtitle = 'Dosen';
    userInitials = 'SP';
  }

  // --- LOGIKA KALENDER ---
  const calendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      const prevMonthDays = new Date(year, month, 0).getDate();
      days.push({ day: prevMonthDays - firstDay + i + 1, isOtherMonth: true, hasEvent: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i, isOtherMonth: false,
        isToday: i === 15 && month === 4 && year === 2026, // Asumsi hari ini 15 Mei 2026
        hasEvent: [8, 12, 19, 24].includes(i)
      });
    }
    return days;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--gray-bg)] font-sans">
      
      {/* ================= 1. LEFT SIDEBAR (Dinamis Semua Role) ================= */}
      <aside className="w-60 bg-[var(--navy-dark)] flex flex-col h-screen flex-shrink-0 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-[var(--cream)] opacity-[0.07] pointer-events-none"></div>

        {/* Logo ATLAS */}
        <div className="px-5 py-[22px] pb-[18px] flex items-center gap-2.5 border-b border-white/[0.08]">
          <div className="w-[34px] h-[34px] bg-[var(--cream)] rounded-[10px] flex items-center justify-center text-base flex-shrink-0 shadow-lg shadow-[var(--cream)]/20">
            🧭
          </div>
          <div>
            <div className="text-lg font-extrabold text-white tracking-[0.5px]">ATLAS</div>
            <div className="text-[9px] text-white/45 font-normal tracking-[0.3px] leading-[1.3] uppercase">
              Academic Tracker &<br/>Learning Analytics System
            </div>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="px-3 py-4 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-white/30 tracking-[1.2px] uppercase px-2 mb-1.5">Menu</div>

          {/* Menu Mahasiswa */}
          {role === 'murid' && [
            { path: '/dashboard/mahasiswa', icon: Home, label: 'Dashboard' },
            { path: '/dashboard/mahasiswa/matkul', icon: BookOpen, label: 'Mata Kuliah' },
            { path: '/dashboard/mahasiswa/gcr', icon: Monitor, label: 'GCR Mahasiswa' },
            { path: '/dashboard/mahasiswa/ipk', icon: BarChart3, label: 'IPK Tracker' },
            { path: '/dashboard/mahasiswa/peer-radar', icon: Users, label: 'Peer Radar', badge: '2' },
            { path: '/dashboard/mahasiswa/cumlaude', icon: GraduationCap, label: 'Cum Laude', badge: '✓', badgeGold: true }
          ].map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all text-[13px] font-medium mb-0.5 relative ${
                pathname === item.path ? 'bg-[var(--cream)]/[0.13] text-[var(--cream)]' : 'text-white/55 hover:bg-white/[0.08] hover:text-white/85'
              }`}>
                <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] font-bold px-1.5 py-[1px] rounded-full min-w-[18px] text-center ${
                    item.badgeGold ? 'bg-[var(--cream)] text-[var(--navy-dark)]' : 'bg-[var(--danger)] text-white'
                  }`}>{item.badge}</span>
                )}
              </div>
            </Link>
          ))}

          {/* Menu Dosen */}
          {role === 'dosen' && [
            { path: '/dashboard/dosen', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/dashboard/dosen/kelola', icon: School, label: 'Kelola Kelas' },
            { path: '/dashboard/dosen/gcr', icon: Monitor, label: 'GCR Dosen' },
            { path: '/dashboard/dosen/syllabus', icon: Settings, label: 'Syllabus Builder' }
          ].map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all text-[13px] font-medium mb-0.5 ${
                pathname === item.path ? 'bg-[var(--cream)]/[0.13] text-[var(--cream)]' : 'text-white/55 hover:bg-white/[0.08] hover:text-white/85'
              }`}>
                <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}

          {/* Menu Admin */}
          {role === 'admin' && [
            { path: '/dashboard/admin', icon: Globe, label: 'Dashboard Global' },
            { path: '/dashboard/admin/users', icon: UserCog, label: 'Manajemen User' },
            { path: '/dashboard/admin/config', icon: Wrench, label: 'Bare Minimum Config' }
          ].map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all text-[13px] font-medium mb-0.5 ${
                pathname === item.path ? 'bg-[var(--cream)]/[0.13] text-[var(--cream)]' : 'text-white/55 hover:bg-white/[0.08] hover:text-white/85'
              }`}>
                <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}

          {role === 'murid' && (
            <>
              <div className="text-[10px] font-bold text-white/30 tracking-[1.2px] uppercase px-2 mb-1.5 mt-4">Akun</div>
              <Link href="/dashboard/mahasiswa/notifikasi">
                <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all text-[13px] font-medium mb-0.5 ${pathname === '/dashboard/mahasiswa/notifikasi' ? 'bg-[var(--cream)]/[0.13] text-[var(--cream)]' : 'text-white/55 hover:bg-white/[0.08] hover:text-white/85'}`}>
                  <Bell className="w-[17px] h-[17px] flex-shrink-0" />
                  <span>Notifikasi</span>
                  <span className="ml-auto bg-[var(--danger)] text-white text-[10px] font-bold px-1.5 py-[1px] rounded-full min-w-[18px] text-center">3</span>
                </div>
              </Link>
              <Link href="/dashboard/mahasiswa/profil">
                <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all text-[13px] font-medium mb-0.5 ${pathname === '/dashboard/mahasiswa/profil' ? 'bg-[var(--cream)]/[0.13] text-[var(--cream)]' : 'text-white/55 hover:bg-white/[0.08] hover:text-white/85'}`}>
                  <User className="w-[17px] h-[17px] flex-shrink-0" />
                  <span>Profil</span>
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* User Profile (Dinamis Berdasarkan Role) */}
        <Link href="/">
          <div className="px-4 py-3.5 border-t border-white/[0.08] flex items-center gap-2.5 flex-shrink-0 hover:bg-white/[0.05] transition-colors cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-[var(--navy-light)] to-[var(--cream)] rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 shadow-md">
              {userInitials}
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-white leading-[1.3]">{userName}</div>
              <div className="text-[10.5px] text-white/40">{userSubtitle}</div>
            </div>
            {role === 'murid' && (
              <div className="ml-auto text-[9px] font-bold px-[7px] py-[3px] rounded-md bg-[var(--cream)]/[0.15] text-[var(--cream)] border border-[var(--cream)]/25 whitespace-nowrap">
                🎓 CL
              </div>
            )}
          </div>
        </Link>
      </aside>

      {/* ================= 2. MAIN CONTENT (Tengah) ================= */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-10 min-w-0 bg-[var(--gray-bg)]">
        {children}
      </main>

      {/* ================= 3. RIGHT SIDEBAR (Khusus Halaman Utama Dashboard) ================= */}
      {/* Kita hanya tampilkan kalender jika URL persis di "/dashboard/mahasiswa" */}
      {pathname === '/dashboard/mahasiswa' && (
        <aside className="w-[280px] bg-white border-l border-[var(--border)] px-4 py-5 overflow-y-auto flex-shrink-0 hidden lg:block shadow-sm z-10">
          
          {/* Kalender */}
          <div className="mb-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5 pb-2 border-b border-[var(--border)]">Kalender</div>
            <div className="bg-[var(--gray-bg)] rounded-xl p-3 shadow-inner">
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="text-[var(--text-muted)] hover:text-[var(--navy)] transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="text-[var(--text-muted)] hover:text-[var(--navy)] transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                  <div key={day} className="text-center text-[9px] font-bold text-[var(--text-muted)] tracking-[0.3px]">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays().map((day, idx) => (
                  <div key={idx} className={`text-center text-[11px] py-1 rounded-md cursor-pointer transition-all ${day.isToday ? 'bg-[var(--navy)] text-white font-bold shadow-md' : day.isOtherMonth ? 'text-[var(--text-muted)] opacity-40' : day.hasEvent ? 'font-semibold text-[var(--navy)] hover:bg-[var(--sky)]' : 'text-[var(--text-secondary)] hover:bg-[var(--sky)]'} ${day.hasEvent && !day.isToday ? 'relative' : ''}`}>
                    {day.day}
                    {day.hasEvent && !day.isToday && <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[var(--danger)]"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monte Carlo Widget */}
          <div className="mb-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5 pb-2 border-b border-[var(--border)]">Monte Carlo Simulation</div>
            <div className="bg-[var(--navy-dark)] rounded-xl px-3.5 py-3.5 relative overflow-hidden shadow-lg border border-[var(--navy)]">
              <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full bg-[var(--cream)] opacity-[0.08]"></div>
              <div className="relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-white/60 mb-2">Prediksi IPK Akhir</div>
                <div className="flex items-baseline gap-2 mb-3">
                  <div className="font-['JetBrains_Mono'] text-[28px] font-bold text-[var(--cream)]">3.72</div>
                  <div className="text-xs text-white/60">±0.08</div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-white/70">Best Case</span>
                      <span className="font-['JetBrains_Mono'] text-white font-semibold">3.85</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--success)] rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-white/70">Worst Case</span>
                      <span className="font-['JetBrains_Mono'] text-white font-semibold">3.58</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--danger)] rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-[10.5px] text-white/60 leading-relaxed">
                  <strong className="text-white">92% confidence</strong> untuk maintain IPK cumlaude (≥3.50)
                </div>
              </div>
            </div>
          </div>

          {/* Deadline Terdekat */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5 pb-2 border-b border-[var(--border)]">Deadline Terdekat</div>
            <div className="space-y-2.5">
              {[
                { title: 'UTS Basis Data', date: 'Besok', type: 'ujian', color: 'danger' },
                { title: 'Tugas ML #3', date: '3 hari lagi', type: 'tugas', color: 'warning' },
                { title: 'Presentasi Web', date: '5 hari lagi', type: 'presentasi', color: 'navy' }
              ].map((event, idx) => (
                <div key={idx} className="px-3 py-2.5 bg-[var(--gray-bg)] rounded-lg hover:bg-[var(--sky)] transition-colors cursor-pointer border border-[var(--border)]">
                  <div className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">{event.title}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-muted)]">{event.date}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${event.color === 'danger' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : event.color === 'warning' ? 'bg-[var(--warning-bg)] text-[#b45309]' : 'bg-[var(--sky)] text-[var(--navy)]'}`}>
                      {event.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

    </div>
  );
}