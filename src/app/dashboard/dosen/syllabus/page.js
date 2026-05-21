"use client";

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';

export default function SyllabusBuilderPage() {
  const [step, setStep] = useState(1);
  const [weights, setWeights] = useState({ uts: 30, uas: 40, kuis: 15, tugas: 15 });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Syllabus Builder</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">Buat struktur penilaian kelas baru</p>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-[var(--navy)] text-white' : 'bg-[var(--gray-bg)] text-[var(--text-muted)]'}`}>{step > 1 ? <Check className="w-5 h-5" /> : '1'}</div>
            <div className="flex-1"><div className={`text-[13px] font-semibold ${step >= 1 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Info Dasar</div></div>
          </div>
          <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-[var(--navy)]' : 'bg-[var(--border)]'}`}></div>
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-[var(--navy)] text-white' : 'bg-[var(--gray-bg)] text-[var(--text-muted)]'}`}>{step > 2 ? <Check className="w-5 h-5" /> : '2'}</div>
            <div className="flex-1"><div className={`text-[13px] font-semibold ${step >= 2 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Pohon Penilaian</div></div>
          </div>
          <div className={`h-0.5 flex-1 ${step >= 3 ? 'bg-[var(--navy)]' : 'bg-[var(--border)]'}`}></div>
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-[var(--navy)] text-white' : 'bg-[var(--gray-bg)] text-[var(--text-muted)]'}`}>3</div>
            <div className="flex-1"><div className={`text-[13px] font-semibold ${step >= 3 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Preview & Publish</div></div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-[var(--sky)] border border-[var(--sky-mid)] rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[var(--navy)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-bold text-[var(--navy)] mb-1">Informasi Dasar</div>
                <div className="text-[12px] text-[var(--text-secondary)]">Isi data mata kuliah terlebih dahulu sebelum mengatur bobot penilaian</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[12px] font-semibold block mb-2">Nama Mata Kuliah</label><input type="text" defaultValue="Statistika Matematika II" className="w-full px-4 py-2.5 border rounded-lg text-[13px] focus:ring-2 focus:ring-[var(--navy)]" /></div>
              <div><label className="text-[12px] font-semibold block mb-2">Kode Matkul</label><input type="text" defaultValue="STAT302" className="w-full px-4 py-2.5 border rounded-lg text-[13px] focus:ring-2 focus:ring-[var(--navy)]" /></div>
              <div><label className="text-[12px] font-semibold block mb-2">SKS</label><select className="w-full px-4 py-2.5 border rounded-lg text-[13px] focus:ring-2 focus:ring-[var(--navy)]"><option>4 SKS</option></select></div>
              <div><label className="text-[12px] font-semibold block mb-2">Semester</label><select className="w-full px-4 py-2.5 border rounded-lg text-[13px] focus:ring-2 focus:ring-[var(--navy)]"><option>Genap 2024/2025</option></select></div>
            </div>
            <div className="flex justify-end"><button onClick={() => setStep(2)} className="px-6 py-2.5 bg-[var(--navy)] text-white rounded-lg text-[13px] font-semibold">Lanjut ke Pohon Penilaian →</button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-[var(--cream-light)] border border-[var(--cream)] rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[var(--navy)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-bold text-[var(--navy)] mb-1">Pohon Penilaian</div>
                <div className="text-[12px] text-[var(--text-secondary)]">Total bobot harus <strong>100%</strong> • Total: <strong className={weights.uts + weights.uas + weights.kuis + weights.tugas === 100 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>{weights.uts + weights.uas + weights.kuis + weights.tugas}%</strong></div>
              </div>
            </div>
            <div className="space-y-4">
              {['uts', 'uas', 'kuis', 'tugas'].map(key => (
                <div key={key}>
                  <div className="flex justify-between mb-2"><label className="text-[13px] font-semibold uppercase">{key}</label><span className="font-['JetBrains_Mono'] font-bold text-[var(--navy)]">{weights[key]}%</span></div>
                  <input type="range" min="0" max="100" value={weights[key]} onChange={(e) => setWeights({ ...weights, [key]: parseInt(e.target.value) })} className="w-full h-2 bg-[var(--gray-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--navy)]" />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-[var(--gray-bg)] text-[var(--text-secondary)] rounded-lg text-[13px] font-semibold">← Kembali</button>
              <button onClick={() => setStep(3)} disabled={weights.uts + weights.uas + weights.kuis + weights.tugas !== 100} className="px-6 py-2.5 bg-[var(--navy)] text-white rounded-lg text-[13px] font-semibold disabled:opacity-50">Preview & Publish →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-[var(--success-bg)] to-[#f0fdf4] border border-[var(--success)]/20 rounded-xl p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
              <div className="flex-1"><div className="text-sm font-bold text-[var(--success)] mb-1">Siap Dipublish!</div><div className="text-[12px] text-[var(--text-secondary)]">Syllabus sudah valid dan siap digunakan.</div></div>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Ringkasan Syllabus</h3>
              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between"><span>Mata Kuliah</span><span className="font-semibold">Statistika Matematika II</span></div>
                <div className="border-t pt-3 mt-3">
                  <div className="text-[11px] font-bold uppercase text-[var(--text-muted)] mb-2">Bobot Penilaian</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['uts', 'uas', 'kuis', 'tugas'].map(key => (
                       <div key={key} className="flex justify-between"><span className="uppercase">{key}</span><span className="font-['JetBrains_Mono'] font-bold text-[var(--navy)]">{weights[key]}%</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-[var(--gray-bg)] rounded-lg text-[13px] font-semibold">← Kembali</button>
              <button className="px-6 py-3 bg-[var(--navy)] text-white rounded-lg text-[13px] font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Buat Kelas & Generate Kode</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}