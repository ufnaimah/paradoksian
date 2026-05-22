"use client";

import { useState, useEffect } from 'react';
import { Save, Play, Loader2, CheckCircle2, AlertTriangle, BookOpen, FlaskConical } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function BareMinimumConfigPage() {
  const [loadingLoad, setLoadingLoad] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null); 

  const [config, setConfig] = useState({
    ipkMinDO: 2.50,
    nilaiMinLulus: 60,
    ipkTargetCumLaude: 3.50,
    gradeMinCumLaude: 'B (tidak boleh C+)',
    teori_tugas: 30, teori_uts: 35, teori_uas: 35,
    prak_tugas: 10, prak_prak: 30, prak_uts: 30, prak_uas: 30
  });

  // 1. LOAD CONFIG DARI DATABASE
  useEffect(() => {
    async function loadConfig() {
      const { data, error } = await supabase.from('global_config').select('*').eq('id', 1).single();
      if (!error && data) {
        setConfig({
          ipkMinDO: data.ipk_min_do,
          nilaiMinLulus: data.nilai_min_lulus,
          ipkTargetCumLaude: data.ipk_target_cumlaude,
          gradeMinCumLaude: data.grade_min_cumlaude,
          teori_tugas: data.teori_tugas, teori_uts: data.teori_uts, teori_uas: data.teori_uas,
          prak_tugas: data.prak_tugas, prak_prak: data.prak_prak, prak_uts: data.prak_uts, prak_uas: data.prak_uas
        });
      }
      setLoadingLoad(false);
    }
    loadConfig();
  }, []);

  // 2. FUNGSI SIMPAN PARAMETER
  const handleSaveConfig = async () => {
    const totalTeori = Number(config.teori_tugas) + Number(config.teori_uts) + Number(config.teori_uas);
    const totalPrak = Number(config.prak_tugas) + Number(config.prak_prak) + Number(config.prak_uts) + Number(config.prak_uas);
    
    if (totalTeori !== 100) return alert(`Gagal! Total bobot Teori saat ini ${totalTeori}%. Harus pas 100%.`);
    if (totalPrak !== 100) return alert(`Gagal! Total bobot Praktikum saat ini ${totalPrak}%. Harus pas 100%.`);

    setIsSaving(true);
    try {
      const { error: errGlobal } = await supabase.from('global_config').update({
        ipk_min_do: parseFloat(config.ipkMinDO),
        nilai_min_lulus: parseFloat(config.nilaiMinLulus),
        ipk_target_cumlaude: parseFloat(config.ipkTargetCumLaude),
        grade_min_cumlaude: config.gradeMinCumLaude,
        teori_tugas: parseFloat(config.teori_tugas), teori_uts: parseFloat(config.teori_uts), teori_uas: parseFloat(config.teori_uas),
        prak_tugas: parseFloat(config.prak_tugas), prak_prak: parseFloat(config.prak_prak), prak_uts: parseFloat(config.prak_uts), prak_uas: parseFloat(config.prak_uas)
      }).eq('id', 1);
      
      if (errGlobal) throw errGlobal;

      const { data: courses } = await supabase.from('courses').select('course_id, jenis_matkul');
      if (courses) {
        const syllabusUpdates = courses.map(c => {
          const isTeori = c.jenis_matkul === 'Teori';
          return {
            course_id: c.course_id,
            bobot_tugas: isTeori ? config.teori_tugas : config.prak_tugas,
            bobot_praktikum: isTeori ? 0 : config.prak_prak,
            bobot_uts: isTeori ? config.teori_uts : config.prak_uts,
            bobot_uas: isTeori ? config.teori_uas : config.prak_uas
          };
        });
        await supabase.from('syllabus_config').upsert(syllabusUpdates);
      }

      alert("Semua parameter berhasil disimpan dan diterapkan ke seluruh kurikulum!");
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. FUNGSI JALANKAN MONTE CARLO
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStatus(null);
    try {
      const [resGrades, resEnrolls, resSyllabus, resConfig] = await Promise.all([
        supabase.from('grades').select('*'),
        supabase.from('enrollments').select('enrollment_id, course_id'),
        supabase.from('syllabus_config').select('*'),
        supabase.from('global_config').select('nilai_min_lulus').eq('id', 1).single()
      ]);

      if (resGrades.error || resEnrolls.error || resSyllabus.error) throw new Error("Gagal menarik data mentah.");

      const enrollMap = {};
      resEnrolls.data.forEach(e => enrollMap[e.enrollment_id] = e.course_id);

      const syllabusMap = {};
      resSyllabus.data.forEach(s => syllabusMap[s.course_id] = s);

      const nilaiMinimal = parseFloat(resConfig.data.nilai_min_lulus);
      
      const cacheEntries = resGrades.data.map(grade => {
        const courseId = enrollMap[grade.enrollment_id];
        const syllabus = syllabusMap[courseId];
        if (!courseId || !syllabus) return null;

        const finalScore = 
          (grade.nilai_tugas * (syllabus.bobot_tugas / 100)) +
          (grade.nilai_praktikum * (syllabus.bobot_praktikum / 100)) +
          (grade.nilai_uts * (syllabus.bobot_uts / 100)) +
          (grade.nilai_uas * (syllabus.bobot_uas / 100));

        let zona = 'Hijau';
        if (finalScore < nilaiMinimal) zona = 'Merah';
        else if (finalScore < nilaiMinimal + 10) zona = 'Kuning'; 

        const prob = (finalScore / 100).toFixed(2);

        return {
          enrollment_id: grade.enrollment_id,
          prediksi_akhir: parseFloat(finalScore.toFixed(2)),
          prob_aman_do: parseFloat(prob),
          target_mve: nilaiMinimal,
          zona_status: zona
        };
      }).filter(Boolean); 

      await supabase.from('analytics_cache').delete().gt('cache_id', 0);
      const { error: insertError } = await supabase.from('analytics_cache').insert(cacheEntries);
      if (insertError) throw insertError;

      setAnalysisStatus('success');
    } catch (error) {
      setAnalysisStatus('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loadingLoad) {
    return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--navy)]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Bare Minimum Config</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Atur parameter akademik & standarisasi kurikulum</p>
      </div>

      {/* PANEL 1: Parameter Kelulusan */}
      <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden max-w-4xl">
        <div className="px-5 py-4 border-b border-gray-200 bg-[var(--gray-bg)]">
          <h2 className="text-[14px] font-bold text-[var(--text-primary)]">Parameter Kelulusan & Predikat</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <div>
            <label className="text-[12px] font-semibold text-gray-500 block mb-2">IPK Minimum (Batas DO)</label>
            <input type="number" step="0.01" value={config.ipkMinDO} onChange={(e) => setConfig({ ...config, ipkMinDO: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-[var(--navy)] transition-colors" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-gray-500 block mb-2">Nilai Lulus Minimal per Matkul</label>
            <input type="number" step="1" value={config.nilaiMinLulus} onChange={(e) => setConfig({ ...config, nilaiMinLulus: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-[var(--navy)] transition-colors" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-gray-500 block mb-2">Syarat IPK Cum Laude</label>
            <input type="number" step="0.01" value={config.ipkTargetCumLaude} onChange={(e) => setConfig({ ...config, ipkTargetCumLaude: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-[var(--navy)] transition-colors" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-gray-500 block mb-2">Minimal Grade Cum Laude</label>
            <input type="text" value={config.gradeMinCumLaude} onChange={(e) => setConfig({ ...config, gradeMinCumLaude: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--navy)] transition-colors" />
          </div>
        </div>
      </div>

      {/* PANEL 2: Standar Bobot Kurikulum */}
      <div className="bg-white rounded-[14px] border border-gray-200 shadow-sm overflow-hidden max-w-4xl">
        <div className="px-5 py-4 border-b border-gray-200 bg-[var(--gray-bg)]">
          <h2 className="text-[14px] font-bold text-[var(--text-primary)]">Standar Baku Bobot Silabus (Persentase)</h2>
          <p className="text-xs text-gray-500 mt-1">Dosen tidak perlu mengatur bobot lagi. Bobot ini akan berlaku global.</p>
        </div>
        
        <div className="p-6 grid grid-cols-2 gap-6 items-stretch">
          
          {/* Kolom Teori */}
          <div className="flex flex-col border border-gray-200 bg-gray-50/50 p-5 rounded-xl">
            <h3 className="text-[13px] font-bold text-blue-800 flex items-center gap-2 bg-blue-50 border border-blue-100 py-2 px-3 rounded-lg mb-5">
              <BookOpen className="w-4 h-4"/> Matkul Tipe Teori
            </h3>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">Komponen Tugas</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={config.teori_tugas} onChange={(e) => setConfig({ ...config, teori_tugas: e.target.value })} className="w-16 px-2 py-1.5 text-center border border-gray-200 bg-white rounded-md outline-none focus:border-[var(--navy)]" />
                  <span className="text-gray-400 font-bold w-4">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">Ujian Tengah Semester (UTS)</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={config.teori_uts} onChange={(e) => setConfig({ ...config, teori_uts: e.target.value })} className="w-16 px-2 py-1.5 text-center border border-gray-200 bg-white rounded-md outline-none focus:border-[var(--navy)]" />
                  <span className="text-gray-400 font-bold w-4">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">Ujian Akhir Semester (UAS)</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={config.teori_uas} onChange={(e) => setConfig({ ...config, teori_uas: e.target.value })} className="w-16 px-2 py-1.5 text-center border border-gray-200 bg-white rounded-md outline-none focus:border-[var(--navy)]" />
                  <span className="text-gray-400 font-bold w-4">%</span>
                </div>
              </div>
            </div>

            <div className={`text-center mt-6 text-xs font-bold py-2.5 rounded-lg border ${Number(config.teori_tugas)+Number(config.teori_uts)+Number(config.teori_uas) === 100 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
              Total Persentase: {Number(config.teori_tugas)+Number(config.teori_uts)+Number(config.teori_uas)}%
            </div>
          </div>

          {/* Kolom Praktikum */}
          <div className="flex flex-col border border-gray-200 bg-gray-50/50 p-5 rounded-xl">
            <h3 className="text-[13px] font-bold text-emerald-800 flex items-center gap-2 bg-emerald-50 border border-emerald-100 py-2 px-3 rounded-lg mb-5">
              <FlaskConical className="w-4 h-4"/> Matkul Tipe Praktikum
            </h3>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">Komponen Tugas</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={config.prak_tugas} onChange={(e) => setConfig({ ...config, prak_tugas: e.target.value })} className="w-16 px-2 py-1.5 text-center border border-gray-200 bg-white rounded-md outline-none focus:border-[var(--navy)]" />
                  <span className="text-gray-400 font-bold w-4">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">Komponen Praktikum</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={config.prak_prak} onChange={(e) => setConfig({ ...config, prak_prak: e.target.value })} className="w-16 px-2 py-1.5 text-center border border-gray-200 bg-white rounded-md outline-none focus:border-[var(--navy)]" />
                  <span className="text-gray-400 font-bold w-4">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">Ujian Tengah Semester (UTS)</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={config.prak_uts} onChange={(e) => setConfig({ ...config, prak_uts: e.target.value })} className="w-16 px-2 py-1.5 text-center border border-gray-200 bg-white rounded-md outline-none focus:border-[var(--navy)]" />
                  <span className="text-gray-400 font-bold w-4">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">Ujian Akhir Semester (UAS)</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={config.prak_uas} onChange={(e) => setConfig({ ...config, prak_uas: e.target.value })} className="w-16 px-2 py-1.5 text-center border border-gray-200 bg-white rounded-md outline-none focus:border-[var(--navy)]" />
                  <span className="text-gray-400 font-bold w-4">%</span>
                </div>
              </div>
            </div>

            <div className={`text-center mt-6 text-xs font-bold py-2.5 rounded-lg border ${Number(config.prak_tugas)+Number(config.prak_prak)+Number(config.prak_uts)+Number(config.prak_uas) === 100 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
              Total Persentase: {Number(config.prak_tugas)+Number(config.prak_prak)+Number(config.prak_uts)+Number(config.prak_uas)}%
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--gray-bg)] border-t border-gray-200 flex justify-end">
          <button onClick={handleSaveConfig} disabled={isSaving} className="px-6 py-2.5 bg-[var(--navy)] text-white rounded-lg text-[13px] font-semibold flex items-center gap-2 hover:bg-[var(--navy-light)] disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Simpan Konfigurasi
          </button>
        </div>
      </div>

      {/* PANEL 3: Mesin Analitik Monte Carlo */}
      <div className="bg-white rounded-[14px] border border-blue-100 shadow-sm overflow-hidden max-w-4xl">
         <div className="px-5 py-4 border-b border-blue-100 bg-indigo-50 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-indigo-900 flex items-center gap-2"><Play className="w-4 h-4" />Mesin Analitik Monte Carlo</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded">Engine Ready</span>
        </div>
        
        <div className="p-6 flex gap-5 items-start">
          <div className="flex-1 space-y-3">
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Jalankan modul ini untuk mengkalkulasi ulang seluruh probabilitas kelulusan dan penetapan status <strong>Zona Merah</strong> berdasarkan raw data terbaru dan konfigurasi bobot admin saat ini.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-[12px] text-yellow-800 leading-relaxed">
                Data <code>analytics_cache</code> akan di-reset. Dasbor global akan langsung merefleksikan hasil analisis terbaru.
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[200px]">
            <button onClick={handleRunAnalysis} disabled={isAnalyzing} className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengkalkulasi...</> : <><Play className="w-4 h-4" /> Jalankan Analisis</>}
            </button>
            {analysisStatus === 'success' && <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Kalkulasi Selesai!</div>}
            {analysisStatus === 'error' && <div className="flex items-center gap-1.5 text-[12px] font-bold text-red-600"><AlertTriangle className="w-4 h-4" /> Gagal mengeksekusi</div>}
          </div>
        </div>
      </div>
    </div>
  );
}