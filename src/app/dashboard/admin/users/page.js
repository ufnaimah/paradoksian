"use client";

import { Edit } from 'lucide-react';

const users = [
  { nama: 'Rizky Aditya', role: 'Mahasiswa', status: 'Aktif', ipk: '2.87' },
  { nama: 'Dr. Budi Santoso', role: 'Dosen', status: 'Aktif', ipk: '—' }
];

export default function ManajemenUserPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Manajemen User</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">
          Kelola akun mahasiswa dan dosen
        </p>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--gray-bg)]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nama</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Role</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">IPK</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={idx} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--gray-bg)] transition-colors">
                  <td className="px-5 py-4">
                    <div className="text-[13px] font-semibold text-[var(--text-primary)]">{user.nama}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[13px] text-[var(--text-secondary)]">{user.role}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--success-bg)] text-[var(--success)]">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-['JetBrains_Mono'] text-[13px] font-semibold text-[var(--text-primary)]">
                      {user.ipk}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-[var(--navy-light)] hover:text-[var(--navy)] text-[13px] font-semibold transition-colors flex items-center gap-1.5">
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-8 text-center border-t border-[var(--border)]">
          <div className="text-[13px] text-[var(--text-secondary)]">
            Menampilkan 2 dari 1,247 user • <button className="text-[var(--navy-light)] font-semibold hover:underline">Lihat Semua</button>
          </div>
        </div>
      </div>
    </div>
  );
}