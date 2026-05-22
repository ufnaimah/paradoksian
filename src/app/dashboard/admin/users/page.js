"use client";

import { useEffect, useState } from 'react';
import { 
  Edit, Trash2, Search, Plus, Upload, UserPlus, 
  Loader2, ChevronLeft, ChevronRight, X, AlertCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ManajemenUserPage() {
  const [activeTab, setActiveTab] = useState('mahasiswa');
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // STATE MODAL TAMBAH & EDIT & HAPUS
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMethod, setAddMethod] = useState('manual'); // 'manual' | 'file'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // STATE FORM MAHASISWA
  const [formMhs, setFormMhs] = useState({
    user_id: '', nama: '', nim: '', prodi: 'D4 Statistika', 
    peminatan: 'Umum', tingkat: 1, tahun_masuk: 2025, 
    kelas: '', ipk_baseline: 3.00, email: ''
  });

  // STATE FORM DOSEN
  const [formDosen, setFormDosen] = useState({
    dosen_id: '', nama: '', nip: '', email: ''
  });

  // STATE UNTUK FILE UPLOAD CSV
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState('');

  // LOAD DATA DARI DATABASE
  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'mahasiswa') {
        res = await supabase
          .from('mahasiswa')
          .select('user_id, nama, nim, prodi, peminatan, tingkat, tahun_masuk, kelas, ipk_baseline, email')
          .order('nim', { ascending: true });
      } else if (activeTab === 'dosen') {
        res = await supabase.from('dosen').select('*').order('nama');
      } else {
        res = await supabase.from('admins').select('*').order('nama');
      }
      setDataList(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Gagal memuat entitas data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // FUNGSI HAPUS USER
  const handleDeleteUser = async (id, targetTab) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data user ini secara permanen?")) return;
    
    try {
      const table = targetTab === 'mahasiswa' ? 'mahasiswa' : targetTab === 'dosen' ? 'dosen' : 'admins';
      const idColumn = targetTab === 'mahasiswa' ? 'user_id' : targetTab === 'dosen' ? 'dosen_id' : 'admin_id';
      
      const { error } = await supabase.from(table).delete().eq(idColumn, id);
      if (error) throw error;
      
      alert("Data berhasil dihapus!");
      loadData();
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    }
  };

  // FUNGSI SIMPAN TAMBAH MANUAL
  const handleAddManualSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'mahasiswa') {
        const uid = formMhs.user_id || 'U' + Math.floor(100 + Math.random() * 900);
        const { error } = await supabase.from('mahasiswa').insert([{
          ...formMhs,
          user_id: uid,
          tingkat: parseInt(formMhs.tingkat),
          tahun_masuk: parseInt(formMhs.tahun_masuk),
          ipk_baseline: parseFloat(formMhs.ipk_baseline)
        }]);
        if (error) throw error;
      } else if (activeTab === 'dosen') {
        const did = formDosen.dosen_id || 'D' + Math.floor(100 + Math.random() * 900);
        const { error } = await supabase.from('dosen').insert([{
          dosen_id: did,
          nama: formDosen.nama,
          nip: formDosen.nip,
          email: formDosen.email,
          password: '123456'
        }]);
        if (error) throw error;
      }
      alert("User baru berhasil ditambahkan!");
      setIsAddModalOpen(false);
      // Reset form fields
      setFormMhs({ user_id: '', nama: '', nim: '', prodi: 'D4 Statistika', peminatan: 'Umum', tingkat: 1, tahun_masuk: 2025, kelas: '', ipk_baseline: 3.00, email: '' });
      setFormDosen({ dosen_id: '', nama: '', nip: '', email: '' });
      loadData();
    } catch (err) {
      alert("Gagal menambahkan user: " + err.message);
    }
  };

  // FUNGSI PARSING & INSERT BATCH FILE CSV
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setCsvError("Silakan pilih file CSV terlebih dahulu.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split("\n");

      if (activeTab === 'mahasiswa' && !lines[0].toLowerCase().includes('nim')) {
        setCsvError("Format file tidak sesuai. Header wajib mengandung format kolom mahasiswa.");
        return;
      }
      if (activeTab === 'dosen' && !lines[0].toLowerCase().includes('nip')) {
        setCsvError("Format file tidak sesuai. Header wajib mengandung format kolom dosen.");
        return;
      }

      const records = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const columns = lines[i].split(",");
        
        if (activeTab === 'mahasiswa') {
          records.push({
            user_id: columns[0]?.trim(),
            nama: columns[1]?.trim(),
            nim: columns[2]?.trim(),
            prodi: columns[3]?.trim(),
            peminatan: columns[4]?.trim(),
            tingkat: parseInt(columns[5]?.trim() || '1'),
            ipk_baseline: parseFloat(columns[6]?.trim() || '3.0'),
            email: columns[7]?.trim(),
            tahun_masuk: parseInt(columns[8]?.trim() || '2023'),
            kelas: columns[9]?.trim()
          });
        } else if (activeTab === 'dosen') {
          records.push({
            dosen_id: columns[0]?.trim() || 'D' + Math.floor(100 + Math.random() * 900),
            nama: columns[1]?.trim(),
            nip: columns[2]?.trim(),
            email: columns[3]?.trim(),
            password: '123456'
          });
        }
      }

      try {
        const table = activeTab === 'mahasiswa' ? 'mahasiswa' : 'dosen';
        const { error } = await supabase.from(table).insert(records);
        if (error) throw error;

        alert(`Berhasil mengimpor ${records.length} data secara massal!`);
        setIsAddModalOpen(false);
        setCsvFile(null);
        loadData();
      } catch (err) {
        setCsvError("Gagal menyimpan data massal: " + err.message);
      }
    };
    reader.readAsText(csvFile);
  };

  // FUNGSI UPDATE EDIT DATA
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'mahasiswa') {
        const { error } = await supabase
          .from('mahasiswa')
          .update({
            nama: selectedUser.nama,
            prodi: selectedUser.prodi,
            peminatan: selectedUser.peminatan,
            tahun_masuk: parseInt(selectedUser.tahun_masuk),
            kelas: selectedUser.kelas,
            ipk_baseline: parseFloat(selectedUser.ipk_baseline),
            email: selectedUser.email
          })
          .eq('user_id', selectedUser.user_id);
        if (error) throw error;
      } else if (activeTab === 'dosen') {
        const { error } = await supabase
          .from('dosen')
          .update({
            nama: selectedUser.nama,
            nip: selectedUser.nip,
            email: selectedUser.email
          })
          .eq('dosen_id', selectedUser.dosen_id);
        if (error) throw error;
      }
      alert("Data berhasil diperbarui!");
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      alert("Gagal memperbarui data: " + err.message);
    }
  };

  // FILTER PENCARIAN
  const filteredData = dataList.filter(u => 
    u.nama?.toLowerCase().includes(search.toLowerCase()) || 
    (u.nim || u.nip || u.admin_id || '').toLowerCase().includes(search.toLowerCase()) ||
    u.kelas?.toLowerCase().includes(search.toLowerCase())
  );

  // PERHITUNGAN DATA SCREEN PAGINATION
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="space-y-5">
      {/* HEADER UTAMA */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Manajemen User</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Kelola identitas civitas akademis STISCOPE</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari data..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none w-64 focus:ring-2 focus:ring-[var(--navy)] bg-white shadow-sm"
            />
          </div>

          {/* PROTEKSI ADMIN: Hanya tampil untuk Mahasiswa & Dosen */}
          {activeTab !== 'admin' && (
            <button 
              onClick={() => { setIsAddModalOpen(true); setCsvError(''); setCsvFile(null); }}
              className="px-4 py-2 bg-[var(--navy)] text-white font-semibold text-sm rounded-lg flex items-center gap-1.5 hover:bg-[var(--navy-light)] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah {activeTab === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}
            </button>
          )}
        </div>
      </div>

      {/* TABS PERAN LEVEL */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-px">
        <div className="flex gap-2">
          {['mahasiswa', 'dosen', 'admin'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => { setActiveTab(tab); setSearch(''); }} 
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab ? 'border-[var(--navy)] text-[var(--navy)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-secondary)] font-medium">
          <span>Tampilkan per halaman:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1 bg-white border border-gray-200 rounded-md font-semibold text-[var(--text-primary)] focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* DATA KONTEN TABEL SCREEN */}
      <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--navy)] mb-2" />
            <p className="text-sm text-gray-500">Menghubungkan jaringan data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--gray-bg)] border-b border-gray-200">
                  {activeTab === 'mahasiswa' ? (
                    <>
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">NIM</th>
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nama</th>
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Prodi & Peminatan</th>
                      <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Angkatan</th>
                      <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Kelas</th>
                      <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">IPK Terakhir</th>
                    </>
                  ) : (
                    <>
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">{activeTab === 'dosen' ? 'NIP' : 'Admin ID'}</th>
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Nama</th>
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Email</th>
                    </>
                  )}
                  <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-sm text-gray-400 font-medium">Tidak ada data ditemukan</td>
                  </tr>
                ) : (
                  currentRows.map((user, idx) => (
                    <tr key={idx} className="border-b border-gray-200 last:border-0 hover:bg-[var(--gray-bg)] transition-colors">
                      {activeTab === 'mahasiswa' ? (
                        <>
                          <td className="px-5 py-4 font-['JetBrains_Mono'] text-[13px] font-semibold text-[var(--text-secondary)]">{user.nim}</td>
                          <td className="px-5 py-4 text-[13px] font-bold text-[var(--text-primary)]">{user.nama}</td>
                          <td className="px-5 py-4 text-[12.5px] text-[var(--text-secondary)]">{user.prodi} <span className="text-[11px] text-[var(--text-muted)] block">Peminatan: {user.peminatan || 'Umum'}</span></td>
                          <td className="px-5 py-4 text-center text-[13px] font-medium text-[var(--text-primary)]">{user.tahun_masuk}</td>
                          <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-[var(--navy)]">{user.kelas || '-'}</td>
                          <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-[var(--success)]">{user.ipk_baseline?.toFixed(2)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-4 font-['JetBrains_Mono'] text-[13px] font-semibold text-[var(--text-secondary)]">{user.nip || user.admin_id}</td>
                          <td className="px-5 py-4 text-[13px] font-bold text-[var(--text-primary)]">{user.nama}</td>
                          <td className="px-5 py-4 text-[12.5px] text-[var(--text-secondary)]">{user.email || '-'}</td>
                        </>
                      )}
                      
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
                            className="text-gray-400 hover:text-[var(--navy)] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.user_id || user.dosen_id || user.admin_id, activeTab)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        <div className="px-5 py-4 bg-[var(--gray-bg)] border-t border-gray-200 flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <div>
            Menampilkan <strong>{totalItems === 0 ? 0 : indexOfFirstRow + 1}</strong> sampai <strong>{Math.min(indexOfLastRow, totalItems)}</strong> dari <strong>{totalItems}</strong> entitas.
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-bold px-3">
              Halaman {currentPage} dari {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-200 bg-[var(--gray-bg)] flex justify-between items-center">
              <h3 className="font-bold text-[15px] text-[var(--text-primary)]">Registrasi Data {activeTab === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'} Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-2 text-center border-b border-gray-200 text-xs font-bold uppercase tracking-wider">
              <button onClick={() => setAddMethod('manual')} className={`py-3 border-b-2 ${addMethod === 'manual' ? 'border-[var(--navy)] text-[var(--navy)]' : 'border-transparent text-gray-400'}`}>
                <UserPlus className="w-4 h-4 inline mr-1" /> Input Manual
              </button>
              <button onClick={() => setAddMethod('file')} className={`py-3 border-b-2 ${addMethod === 'file' ? 'border-[var(--navy)] text-[var(--navy)]' : 'border-transparent text-gray-400'}`}>
                <Upload className="w-4 h-4 inline mr-1" /> Upload File CSV
              </button>
            </div>

            <div className="p-6">
              {addMethod === 'manual' ? (
                <form onSubmit={handleAddManualSubmit} className="space-y-4">
                  {activeTab === 'mahasiswa' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">NIM / ID</label>
                          <input type="text" required placeholder="Contoh: 221045" value={formMhs.nim} onChange={(e)=>setFormMhs({...formMhs, nim: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Nama Lengkap</label>
                          <input type="text" required placeholder="Nama Mahasiswa" value={formMhs.nama} onChange={(e)=>setFormMhs({...formMhs, nama: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Program Studi</label>
                          <select value={formMhs.prodi} onChange={(e)=>setFormMhs({...formMhs, prodi: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white outline-none">
                            <option value="D3 Statistika">D3 Statistika</option>
                            <option value="D4 Statistika">D4 Statistika</option>
                            <option value="D4 Komputasi Statistik">D4 Komputasi Statistik</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Kode Kelas</label>
                          <input type="text" required placeholder="Contoh: 3SE3" value={formMhs.kelas} onChange={(e)=>setFormMhs({...formMhs, kelas: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Tahun Masuk</label>
                          <input type="number" value={formMhs.tahun_masuk} onChange={(e)=>setFormMhs({...formMhs, tahun_masuk: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Tingkat</label>
                          <input type="number" value={formMhs.tingkat} onChange={(e)=>setFormMhs({...formMhs, tingkat: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">IPK Baseline</label>
                          <input type="text" value={formMhs.ipk_baseline} onChange={(e)=>setFormMhs({...formMhs, ipk_baseline: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Email Resmi</label>
                        <input type="email" placeholder="email@stis.ac.id" value={formMhs.email} onChange={(e)=>setFormMhs({...formMhs, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">NIP Dosen</label>
                          <input type="text" required placeholder="Contoh: 19850101" value={formDosen.nip} onChange={(e)=>setFormDosen({...formDosen, nip: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Nama Dosen</label>
                          <input type="text" required placeholder="Nama Lengkap Dosen beserta Gelar" value={formDosen.nama} onChange={(e)=>setFormDosen({...formDosen, nama: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Email Resmi</label>
                        <input type="email" required placeholder="dosen@stis.ac.id" value={formDosen.email} onChange={(e)=>setFormDosen({...formDosen, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                      </div>
                    </>
                  )}
                  <button type="submit" className="w-full py-2.5 bg-[var(--navy)] hover:bg-[var(--navy-light)] text-white text-sm font-bold rounded-lg shadow-md transition-colors mt-2">Simpan User Baru</button>
                </form>
              ) : (
                <form onSubmit={handleCsvUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100/70 transition-colors relative cursor-pointer group">
                    <input type="file" accept=".csv" onChange={(e) => { setCsvFile(e.target.files[0]); setCsvError(''); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-[var(--navy)] transition-colors" />
                    <p className="text-sm font-semibold text-gray-600">{csvFile ? csvFile.name : "Pilih atau Seret File CSV Ke Sini"}</p>
                    <p className="text-xs text-gray-400 mt-1">Hanya mendukung ekstensi file berkode .csv</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-[11px] text-blue-800 font-medium">
                    <p className="font-bold mb-1">💡 Contoh Struktur Baris Kolom CSV ({activeTab === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}):</p>
                    <code className="bg-white/80 p-1 rounded font-mono block overflow-x-auto text-gray-600">
                      {activeTab === 'mahasiswa' 
                        ? "user_id,nama,nim,prodi,peminatan,tingkat,ipk_baseline,email,tahun_masuk,kelas" 
                        : "dosen_id,nama,nip,email"
                      }
                    </code>
                  </div>

                  {csvError && (
                    <div className="flex gap-1.5 items-center text-xs font-bold text-red-600 bg-red-50 p-2 border border-red-200 rounded">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {csvError}
                    </div>
                  )}

                  <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-md transition-colors">Proses Impor File Massal</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-[var(--gray-bg)] flex justify-between items-center">
              <h3 className="font-bold text-[15px] text-[var(--text-primary)]">Edit Informasi {activeTab === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Nama Lengkap</label>
                <input type="text" required value={selectedUser.nama} onChange={(e)=>setSelectedUser({...selectedUser, nama: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
              </div>
              {activeTab === 'mahasiswa' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Program Studi</label>
                      <input type="text" value={selectedUser.prodi} onChange={(e)=>setSelectedUser({...selectedUser, prodi: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Kode Kelas</label>
                      <input type="text" value={selectedUser.kelas || ''} onChange={(e)=>setSelectedUser({...selectedUser, kelas: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Tahun Masuk</label>
                      <input type="number" value={selectedUser.tahun_masuk} onChange={(e)=>setSelectedUser({...selectedUser, tahun_masuk: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">IPK Baseline</label>
                      <input type="text" value={selectedUser.ipk_baseline} onChange={(e)=>setSelectedUser({...selectedUser, ipk_baseline: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono outline-none" />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">NIP Dosen</label>
                  <input type="text" required value={selectedUser.nip || ''} onChange={(e)=>setSelectedUser({...selectedUser, nip: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Email Resmi</label>
                <input type="email" value={selectedUser.email || ''} onChange={(e)=>setSelectedUser({...selectedUser, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[var(--navy)] text-white text-sm font-bold rounded-lg shadow-md mt-2">Simpan Perubahan Data</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}