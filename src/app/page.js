"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!nim || !password) {
      setError('NIM dan password harus diisi');
      return;
    }

    setLoading(true);

    try {
      // Check mahasiswa table for login
      const { data: mahasiswa, error: mhsError } = await supabase
        .from('mahasiswa')
        .select('*')
        .eq('nim', nim)
        .single();

      if (mhsError || !mahasiswa) {
        // Try dosen table
        const { data: dosen, error: dosenError } = await supabase
          .from('dosen')
          .select('*')
          .eq('nip', nim)
          .single();

        if (dosenError || !dosen) {
          // Try admin table
          const { data: admin, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('admin_id', nim)
            .single();

          if (adminError || !admin) {
            setError('NIM/NIP tidak ditemukan');
            setLoading(false);
            return;
          }

          // Admin login
          if (admin.password !== password) {
            setError('Password salah');
            setLoading(false);
            return;
          }

          // Store admin session
          localStorage.setItem('user', JSON.stringify({
            user_id: admin.admin_id,
            nama: admin.nama,
            role: 'admin',
            email: admin.email
          }));
          router.push('/dashboard/admin');
          return;
        }

        // Dosen login
        if (dosen.password !== password) {
          setError('Password salah');
          setLoading(false);
          return;
        }

        // Store dosen session
        localStorage.setItem('user', JSON.stringify({
          user_id: dosen.dosen_id,
          nama: dosen.nama,
          nip: dosen.nip,
          role: 'dosen',
          email: dosen.email
        }));
        router.push('/dashboard/dosen');
        return;
      }

      // Mahasiswa login
      if (mahasiswa.password !== password) {
        setError('Password salah');
        setLoading(false);
        return;
      }

      // Store mahasiswa session
      localStorage.setItem('user', JSON.stringify({
        user_id: mahasiswa.user_id,
        nama: mahasiswa.nama,
        nim: mahasiswa.nim,
        prodi: mahasiswa.prodi,
        peminatan: mahasiswa.peminatan,
        tingkat: mahasiswa.tingkat,
        kelas: mahasiswa.kelas,
        ipk_baseline: mahasiswa.ipk_baseline,
        tahun_masuk: mahasiswa.tahun_masuk,
        role: 'mahasiswa',
        email: mahasiswa.email
      }));
      router.push('/dashboard/mahasiswa');

    } catch (err) {
      console.error('[v0] Login error:', err);
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--gray-bg)]">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[var(--cream)] opacity-[0.05] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[var(--navy-light)] opacity-[0.05] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-[400px] bg-[var(--navy-dark)] rounded-[24px] p-8 shadow-2xl relative z-10 border border-white/[0.08]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-[52px] h-[52px] bg-[var(--cream)] rounded-[14px] flex items-center justify-center text-3xl mb-4 shadow-lg shadow-[var(--cream)]/20">
            🧭
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-[0.5px]">STISCOPE</h1>
          <p className="text-[11px] text-white/50 font-normal tracking-[0.5px] uppercase mt-1 text-center">
            Academic Tracker &<br/>Learning Analytics System
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-[var(--danger)]/10 text-[var(--danger)] text-[12px] font-medium p-3 rounded-lg border border-[var(--danger)]/20 text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/70 uppercase tracking-[0.5px] ml-1">NIM / NIP</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <User className="w-[18px] h-[18px]" />
              </div>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Masukkan NIM atau NIP"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-[13px] placeholder:text-white/30 focus:outline-none focus:border-[var(--cream)]/50 focus:bg-white/[0.08] transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5 mb-6">
            <label className="text-[11px] font-bold text-white/70 uppercase tracking-[0.5px] ml-1">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <Lock className="w-[18px] h-[18px]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-[13px] placeholder:text-white/30 focus:outline-none focus:border-[var(--cream)]/50 focus:bg-white/[0.08] transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--cream)] text-[var(--navy-dark)] font-bold text-[14px] py-3.5 rounded-xl transition-all hover:bg-white active:scale-[0.98] shadow-[0_4px_14px_rgba(240,233,210,0.2)] mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p className="text-[10px] text-white/30 text-center mt-6">
          Password default: 123456
        </p>
      </div>
    </div>
  );
}
