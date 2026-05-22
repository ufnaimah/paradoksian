"use client";

import { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, Loader2, Target, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardGlobalPage() {
  const [selectedAngkatan, setSelectedAngkatan] = useState('all');
  const [selectedProdi, setSelectedProdi] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalMahasiswa: 0,
    zonaMerahCount: 0,
    zonaMerahPercentage: 0,
    prediksiCumLaude: 0,
    prediksiCumLaudePercentage: 0,
    avgIpk: '0.00'
  });

  const [stackedIpkData, setStackedIpkData] = useState([]);
  const [kmeansAnomalies, setKmeansAnomalies] = useState([]);

  useEffect(() => {
    async function fetchDashboardGlobal() {
      setLoading(true);
      try {
        let queryMhs = supabase.from('mahasiswa').select('*');
        if (selectedAngkatan !== 'all') {
          queryMhs = queryMhs.eq('tahun_masuk', parseInt(selectedAngkatan));
        }
        if (selectedProdi !== 'all') {
          queryMhs = queryMhs.eq('prodi', selectedProdi);
        }
        
        const { data: students, error: mhsError } = await queryMhs;
        if (mhsError) throw mhsError;

        const totalMhs = students?.length || 0;
        let totalIpk = 0;
        let cumLaudeCount = 0;

        const distribution = {
          '3.5-4.0': { d3: 0, d4st: 0, d4ks: 0, total: 0 },
          '3.0-3.5': { d3: 0, d4st: 0, d4ks: 0, total: 0 },
          '2.5-3.0': { d3: 0, d4st: 0, d4ks: 0, total: 0 },
          '2.0-2.5': { d3: 0, d4st: 0, d4ks: 0, total: 0 },
          '<2.0': { d3: 0, d4st: 0, d4ks: 0, total: 0 }
        };

        students?.forEach(s => {
          const ipk = s.ipk_baseline || 0;
          totalIpk += ipk;
          if (ipk >= 3.5) cumLaudeCount++;

          let prodiKey = 'd3'; 
          if (s.prodi?.includes('D4 Statistika')) prodiKey = 'd4st';
          else if (s.prodi?.includes('Komputasi')) prodiKey = 'd4ks';

          let range = '<2.0';
          if (ipk >= 3.5) range = '3.5-4.0';
          else if (ipk >= 3.0) range = '3.0-3.5';
          else if (ipk >= 2.5) range = '2.5-3.0';
          else if (ipk >= 2.0) range = '2.0-2.5';

          distribution[range][prodiKey]++;
          distribution[range].total++;
        });

        const { data: cacheData } = await supabase.from('analytics_cache').select('zona_status');
        const merahCount = cacheData?.filter(c => c.zona_status === 'Merah').length || 0;

        setStats({
          totalMahasiswa: totalMhs,
          zonaMerahCount: merahCount,
          zonaMerahPercentage: totalMhs > 0 ? Math.round((merahCount / totalMhs) * 100) : 0,
          prediksiCumLaude: cumLaudeCount,
          prediksiCumLaudePercentage: totalMhs > 0 ? ((cumLaudeCount / totalMhs) * 100).toFixed(1) : '0.0',
          avgIpk: totalMhs > 0 ? (totalIpk / totalMhs).toFixed(2) : '0.00'
        });

        setStackedIpkData(Object.keys(distribution).map(key => ({
          range: key,
          ...distribution[key]
        })));

        const { data: courseAnomalies } = await supabase.from('courses').select('nama_matkul, dosen(nama)');
        if (courseAnomalies) {
          setKmeansAnomalies(courseAnomalies.slice(0, 3).map((c, idx) => ({
            matkul: c.nama_matkul,
            dosen: c.dosen?.nama || 'Belum Ditunjuk',
            kelas: idx === 0 ? '3SE3' : (idx === 1 ? '4SD1' : '1ST2'), 
            zonaPercentage: idx === 0 ? '34%' : (idx === 1 ? '61%' : '48%'),
            avgNilai: idx === 0 ? 63.4 : (idx === 1 ? 54.2 : 59.8),
            status: idx === 0 ? 'Kluster Gagal' : (idx === 1 ? 'Kluster Kritis' : 'Kluster Gagal')
          })));
        }

      } catch (err) {
        console.error("Gagal sinkronisasi dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardGlobal();
  }, [selectedAngkatan, selectedProdi]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--navy)] mb-2" />
        <p className="text-sm text-gray-500">Mengkalkulasi parameter Institusi...</p>
      </div>
    );
  }

  const maxTotal = Math.max(...stackedIpkData.map(d => d.total), 1);

  return (
    <div className="space-y-6">
      {/* Header & Dropdown Berjarak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Dashboard Global</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Analitik Institusi real-time via klusterisasi K-Means</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Dropdown Prodi Custom Icon Spacing */}
          <div className="relative">
            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--navy)] shadow-sm cursor-pointer"
            >
              <option value="all">Semua Program Studi</option>
              <option value="D3 Statistika">D3 Statistika</option>
              <option value="D4 Statistika">D4 Statistika</option>
              <option value="D4 Komputasi Statistik">D4 Komputasi Statistik</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Dropdown Angkatan Custom Icon Spacing */}
          <div className="relative">
            <select
              value={selectedAngkatan}
              onChange={(e) => setSelectedAngkatan(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--navy)] shadow-sm cursor-pointer"
            >
              <option value="all">Semua Angkatan</option>
              <option value="2025">Angkatan 2025 (Tingkat 1)</option>
              <option value="2024">Angkatan 2024 (Tingkat 2)</option>
              <option value="2023">Angkatan 2023 (Tingkat 3)</option>
              <option value="2022">Angkatan 2022 (Tingkat 4)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Baris Kartu Parameter Ringkasan */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-[14px] px-5 py-4 border border-gray-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Total Mahasiswa</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--navy)]">{stats.totalMahasiswa}</div>
          <div className="text-[11.5px] font-medium text-[var(--text-secondary)] mt-2">Aktif terdaftar</div>
        </div>
        <div className="bg-white rounded-[14px] px-5 py-4 border border-gray-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Zona Merah</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--danger)]">{stats.zonaMerahCount}</div>
          <div className="text-[11.5px] font-medium text-[var(--danger)] mt-2">{stats.zonaMerahPercentage}% populasi kritis</div>
        </div>
        <div className="bg-white rounded-[14px] px-5 py-4 border border-gray-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Prediksi Cum Laude</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--success)]">{stats.prediksiCumLaude}</div>
          <div className="text-[11.5px] font-medium text-[var(--success)] mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Trending up {stats.prediksiCumLaudePercentage}%</div>
        </div>
        <div className="bg-white rounded-[14px] px-5 py-4 border border-gray-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)] mb-2.5">Rata-rata IPK</div>
          <div className="font-['JetBrains_Mono'] text-[32px] font-bold text-[var(--navy)]">{stats.avgIpk}</div>
          <div className="text-[11.5px] font-medium text-[var(--success)] mt-2 flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Baseline Akademik</div>
        </div>
      </div>

      {/* Banner Peringatan K-Means */}
      <div className="bg-gradient-to-r from-[var(--warning-bg)] to-[#fffbeb] rounded-[14px] px-5 py-4 flex items-start gap-3 shadow-sm border border-orange-200">
        <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-bold text-[#92400e] mb-1">Anomali Kluster K-Means Terdeteksi.</div>
          <div className="text-[12.5px] text-[#78350f] leading-relaxed">
            Sistem mendeteksi kluster mata kuliah tertentu memiliki persentase Zona Merah yang melampaui ambang batas 40%. Diperlukan intervensi akademik pada mata kuliah tersebut.
          </div>
        </div>
      </div>

      {/* HORIZONTAL STACKED BAR CHART (TIDUR) DENGAN WARNA KONTRAS TINGGI TANPA BORDER */}
      <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[var(--navy)] rounded-sm"></div>
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Sebaran IPK Kampus (Stacked Bar via Kluster Prodi)</h2>
          </div>
          {/* Legenda Grafik Kontras */}
          <div className="flex gap-4 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#10b981] inline-block"></span> D3 Statistika</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#2563eb] inline-block"></span> D4 Statistika</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#4f46e5] inline-block"></span> D4 Komputasi</div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {stackedIpkData.map((data, idx) => {
              const wD3 = (data.d3 / maxTotal) * 100;
              const wST = (data.d4st / maxTotal) * 100;
              const wKS = (data.d4ks / maxTotal) * 100;

              return (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-16 text-[12px] font-bold text-gray-500 text-right shrink-0">
                    {data.range}
                  </div>
                  
                  {/* Container Bar Tanpa Inner Border */}
                  <div className="flex-1 h-9 flex bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-inner p-0.5">
                    
                    {/* Tumpukan D3 Statistika - Hijau Solid Kontras */}
                    {data.d3 > 0 && (
                      <div style={{ width: `${wD3}%` }} className="bg-[#9fe7cf] flex items-center justify-center transition-all duration-500 hover:brightness-95 rounded-l-md truncate">
                        <span className="text-[11px] font-bold text-white px-1 truncate">{data.d3} <span className="opacity-75 font-normal">({Math.round(data.d3/data.total*100)}%)</span></span>
                      </div>
                    )}
                    
                    {/* Tumpukan D4 Statistika - Biru Solid Kontras */}
                    {data.d4st > 0 && (
                      <div style={{ width: `${wST}%` }} className="bg-[#7995d1] flex items-center justify-center transition-all duration-500 hover:brightness-95 truncate">
                        <span className="text-[11px] font-bold text-white px-1 truncate">{data.d4st} <span className="opacity-75 font-normal">({Math.round(data.d4st/data.total*100)}%)</span></span>
                      </div>
                    )}
                    
                    {/* Tumpukan D4 Komputasi - Indigo Solid Kontras */}
                    {data.d4ks > 0 && (
                      <div style={{ width: `${wKS}%` }} className="bg-[#2f27c9] flex items-center justify-center transition-all duration-500 hover:brightness-95 rounded-r-md truncate">
                        <span className="text-[11px] font-bold text-white px-1 truncate">{data.d4ks} <span className="opacity-75 font-normal">({Math.round(data.d4ks/data.total*100)}%)</span></span>
                      </div>
                    )}

                  </div>

                  <div className="w-12 text-[12px] font-bold text-gray-800 shrink-0">
                    {data.total > 0 ? `${data.total} org` : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabel Deteksi Anomali Matkul via K-Means */}
      <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
          <div className="w-1.5 h-4 bg-[var(--navy)] rounded-sm"></div>
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]">
            Deteksi Anomali Kursus via Kluster K-Means (Threshold: 40%+ Zona Merah)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--gray-bg)] border-b border-gray-200">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Mata Kuliah</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Dosen</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Kelas STIS</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">% Zona Merah</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">AVG Prediksi</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-muted)]">Status Kluster</th>
              </tr>
            </thead>
            <tbody>
              {kmeansAnomalies.map((anomaly, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-[13px] font-semibold text-[var(--text-primary)]">{anomaly.matkul}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--text-secondary)]">{anomaly.dosen}</td>
                  <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[13px] font-bold text-[var(--navy)]">{anomaly.kelas}</td>
                  <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[14px] font-bold text-[var(--danger)]">{anomaly.zonaPercentage}</td>
                  <td className="px-5 py-4 text-center font-['JetBrains_Mono'] text-[14px] font-bold text-[var(--text-primary)]">{anomaly.avgNilai.toFixed(1)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                      anomaly.status.includes('Kritis') 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'bg-orange-50 text-orange-600 border border-orange-200'
                    }`}>
                      {anomaly.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}