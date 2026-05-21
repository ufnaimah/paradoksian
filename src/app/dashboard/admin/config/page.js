"use client";

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function BareMinimumConfigPage() {
  const [config, setConfig] = useState({
    ipkMinDO: '2.00',
    nilaiMinLulus: '65',
    ipkTargetCumLaude: '3.50',
    gradeMinCumLaude: 'B- (tidak boleh C+)'
  });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Bare Minimum Config</h1>
        <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">
          Atur parameter akademik global
        </p>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--border)] shadow-sm overflow-hidden max-w-3xl">
        <div className="p-6 space-y-5">
          {/* Baris 1 */}
          <div className="grid grid-cols-2 gap-6 items-start">
            <div>
              <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-2">
                IPK Minimum (DO)
              </label>
              <input
                type="text"
                value={config.ipkMinDO}
                onChange={(e) => setConfig({ ...config, ipkMinDO: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[var(--border)] rounded-lg font-['JetBrains_Mono'] text-[15px] font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)]"
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-2">
                IPK Target Cum Laude
              </label>
              <input
                type="text"
                value={config.ipkTargetCumLaude}
                onChange={(e) => setConfig({ ...config, ipkTargetCumLaude: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[var(--border)] rounded-lg font-['JetBrains_Mono'] text-[15px] font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)]"
              />
            </div>
          </div>

          {/* Baris 2 */}
          <div className="grid grid-cols-2 gap-6 items-start">
            <div>
              <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-2">
                Nilai Min Lulus Matkul
              </label>
              <input
                type="text"
                value={config.nilaiMinLulus}
                onChange={(e) => setConfig({ ...config, nilaiMinLulus: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[var(--border)] rounded-lg font-['JetBrains_Mono'] text-[15px] font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)]"
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-2">
                Grade Min Cum Laude
              </label>
              <input
                type="text"
                value={config.gradeMinCumLaude}
                onChange={(e) => setConfig({ ...config, gradeMinCumLaude: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[var(--border)] rounded-lg text-[13px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)]"
              />
            </div>
          </div>

          <div className="bg-[var(--sky)] border border-[var(--sky-mid)] rounded-xl px-4 py-3 mt-4">
            <div className="text-[12px] text-[var(--navy)] leading-relaxed">
              <strong>Catatan:</strong> Perubahan konfigurasi ini akan mempengaruhi perhitungan MVE, prediksi cumlaude, dan status zona untuk seluruh mahasiswa di sistem.
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--gray-bg)] border-t border-[var(--border)] flex justify-end">
          <button className="px-6 py-2.5 bg-[var(--navy)] text-white rounded-lg text-[13px] font-semibold hover:bg-[var(--navy-light)] transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
}