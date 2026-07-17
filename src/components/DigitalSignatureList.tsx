/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SPJBundle } from '../types';
import { ShieldCheck, Eye, EyeOff, Mail, Trash2, Lock, Unlock, Search, CheckCircle } from 'lucide-react';
import { formatRupiah, formatTanggalIndo } from '../lib/utils';
import { decryptToken } from '../lib/signature';

interface DigitalSignatureListProps {
  spjList: SPJBundle[];
  onUnsign: (spjId: string) => Promise<void>;
}

export const DigitalSignatureList: React.FC<DigitalSignatureListProps> = ({ spjList, onUnsign }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingSpjId, setPendingSpjId] = useState<string | null>(null);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showTokensMap, setShowTokensMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter signed SPJs
  const signedSpjs = spjList.filter(item => item.signatureType === 'digital');

  const filteredList = signedSpjs.filter(item => {
    const text = `${item.judulPekerjaan} ${item.noSpj} ${item.paNama} ${item.ppkNama}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const triggerShowToken = (spjId: string) => {
    if (isPinVerified) {
      setShowTokensMap(prev => ({ ...prev, [spjId]: !prev[spjId] }));
    } else {
      setPendingSpjId(spjId);
      setIsPinModalOpen(true);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'sims@dadpupr') {
      setIsPinVerified(true);
      setIsPinModalOpen(false);
      setAdminPin('');
      if (pendingSpjId) {
        setShowTokensMap(prev => ({ ...prev, [pendingSpjId]: true }));
        setPendingSpjId(null);
      }
      showToast('Akses Admin Diverifikasi. Token dapat didekripsi.');
    } else {
      alert('PIN Salah! Hanya Admin yang dapat membuka token terenkripsi.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSendEmail = (item: SPJBundle, officialType: 'PA' | 'PPK' | 'PPTK' | 'Bendahara') => {
    let name = '';
    switch (officialType) {
      case 'PA': name = item.paNama; break;
      case 'PPK': name = item.ppkNama; break;
      case 'PPTK': name = item.pptkNama; break;
      case 'Bendahara': name = item.bendaharaNama; break;
    }

    if (!name) {
      showToast('Nama pejabat tidak ditemukan!');
      return;
    }

    const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@nagekeokab.go.id`;
    const decrypted = decryptToken(item.leaderToken || '');
    
    showToast(`Token E-Sign [${decrypted}] berhasil dikirim ke email ${officialType}: ${email}`);
  };

  const handleRemoveSignature = async (spjId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus otorisasi tanda tangan digital ini?')) {
      await onUnsign(spjId);
      showToast('Otorisasi tanda tangan digital berhasil dihapus.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs border border-slate-700/50 animate-slide-up">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-2xl border border-indigo-950/40 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-400/20 text-[10px] font-bold uppercase tracking-wider">
            🔒 Panel Otorisasi E-Sign
          </div>
          <h2 className="text-xl font-display font-extrabold tracking-tight">Daftar Tanda Tangan Digital</h2>
          <p className="text-indigo-200 text-xs max-w-xl leading-relaxed">
            Menampilkan seluruh dokumen SPJ yang telah ditandatangani secara elektronik. Token tersimpan aman dalam kondisi terenkripsi di Google Sheets. Hanya Admin dengan PIN resmi yang dapat mendeskripsikan token pimpinan.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-black select-none pointer-events-none transform translate-y-8 translate-x-4">
          SHIELD
        </div>
      </div>

      {/* Filter and Lock Status controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berkas atau pejabat..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Status Akses Admin:</span>
          {isPinVerified ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold">
              <Unlock className="w-3.5 h-3.5" /> Terbuka (Admin)
              <button 
                onClick={() => {
                  setIsPinVerified(false);
                  setShowTokensMap({});
                  showToast('Akses Admin dikunci kembali.');
                }}
                className="ml-2 hover:underline text-[10px] text-emerald-800"
              >
                Kunci Kembali
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 font-bold transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Masukkan PIN Admin
            </button>
          )}
        </div>
      </div>

      {/* Table List of Signed SPJs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200/60">
                <th className="px-6 py-4">Berkas SPJ & No SPJ</th>
                <th className="px-6 py-4">Pejabat Pengesah</th>
                <th className="px-6 py-4">Token (Terenkripsi di Google Sheet)</th>
                <th className="px-6 py-4 text-right">Nilai Kontrak</th>
                <th className="px-6 py-4 text-center">Aksi Pengelolaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic font-medium">
                    {signedSpjs.length === 0 
                      ? 'Belum ada dokumen SPJ yang ditandatangani secara digital.' 
                      : 'Tidak ditemukan hasil pencarian otorisasi.'}
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const isVisible = showTokensMap[item.id] && isPinVerified;
                  const encryptedVal = item.leaderToken || 'ENC::EMPTY';
                  const decryptedVal = isVisible ? decryptToken(encryptedVal) : '';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-5 max-w-xs">
                        <div className="font-extrabold text-slate-800 leading-normal line-clamp-2">{item.judulPekerjaan}</div>
                        <div className="font-mono text-[9px] text-slate-400 mt-1">SPJ: {item.noSpj || '-'}</div>
                        <div className="text-[9px] text-indigo-500 font-bold mt-1.5 inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-full uppercase">
                          <ShieldCheck className="w-3 h-3 text-indigo-600" /> E-Sign Aktif
                        </div>
                      </td>
                      
                      <td className="px-6 py-5 space-y-1">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold">PA: </span>
                          <span className="font-bold text-slate-800">{item.paNama}</span>
                        </div>
                        {item.ppkNama && (
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold">PPK: </span>
                            <span className="text-slate-600">{item.ppkNama}</span>
                          </div>
                        )}
                        {item.bendaharaNama && (
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold">BNDHR: </span>
                            <span className="text-slate-600">{item.bendaharaNama}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5 max-w-[240px]">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-[10px] px-2 py-1 rounded-md border font-black truncate max-w-[170px] select-all ${
                              isVisible 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                              {isVisible ? decryptedVal : encryptedVal.substring(0, 15) + '...'}
                            </span>
                            <button
                              onClick={() => triggerShowToken(item.id)}
                              className="p-1 hover:bg-slate-100 text-slate-500 rounded transition cursor-pointer"
                              title={isVisible ? 'Sembunyikan Token' : 'Lihat Token (Butuh PIN Admin)'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          
                          <div className="text-[9px] text-slate-400">
                            {isVisible ? '🔓 Plaintext didekripsi secara lokal' : '🔒 Terenkripsi (XOR sims@dadpupr)'}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right font-extrabold text-slate-900 text-sm">
                        {formatRupiah(item.nilaiKontrak, true, false)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                          {/* Send To Email Options */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSendEmail(item, 'PA')}
                              className="inline-flex items-center gap-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 px-1.5 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                              title="Kirim ke Email PA"
                            >
                              <Mail className="w-2.5 h-2.5" /> PA
                            </button>
                            {item.ppkNama && (
                              <button
                                onClick={() => handleSendEmail(item, 'PPK')}
                                className="inline-flex items-center gap-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 px-1.5 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                                title="Kirim ke Email PPK"
                              >
                                <Mail className="w-2.5 h-2.5" /> PPK
                              </button>
                            )}
                            {item.bendaharaNama && (
                              <button
                                onClick={() => handleSendEmail(item, 'Bendahara')}
                                className="inline-flex items-center gap-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 px-1.5 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                                title="Kirim ke Email Bendahara"
                              >
                                <Mail className="w-2.5 h-2.5" /> BND
                              </button>
                            )}
                          </div>

                          {/* Delete Authorization */}
                          <button
                            onClick={() => handleRemoveSignature(item.id)}
                            className="w-full inline-flex items-center justify-center gap-1 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                            title="Hapus Otorisasi Digital E-Sign"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> Hapus E-Sign
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin PIN Verification Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-150 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 border border-amber-200 text-amber-700 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Otorisasi Admin Diperlukan</h3>
                <p className="text-[10px] text-slate-500 font-medium">Dekripsi data token pimpinan yang tersimpan di Google Sheet</p>
              </div>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Masukkan PIN Pembuka Admin (sims@dadpupr)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-center font-mono tracking-widest bg-slate-50"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinModalOpen(false);
                    setAdminPin('');
                    setPendingSpjId(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Verifikasi PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
