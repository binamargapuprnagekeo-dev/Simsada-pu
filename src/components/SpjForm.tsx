/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SPJBundle, Pegawai, Rekening } from '../types';
import { terbilang, formatRupiah } from '../lib/utils';
import { FileText, Building2, UserCheck, Receipt, DollarSign, ArrowRight, ArrowLeft, Save, Plus } from 'lucide-react';

interface SpjFormProps {
  initialData?: SPJBundle | null;
  pegawaiList: Pegawai[];
  rekeningList: Rekening[];
  onSave: (data: SPJBundle) => void;
  onCancel: () => void;
}

export const SpjForm: React.FC<SpjFormProps> = ({
  initialData,
  pegawaiList,
  rekeningList,
  onSave,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SPJBundle>({
    id: '',
    noSpj: '',
    tanggalSpj: new Date().toISOString().split('T')[0],
    judulPekerjaan: '',
    nilaiKontrak: 0,
    terbilang: '',
    
    noKontrak: '',
    tglKontrak: '',
    noSpmk: '',
    tglSpmk: '',
    noBast: '',
    tglBast: '',
    
    kontraktorNama: '',
    kontraktorPimpinan: '',
    kontraktorAlamat: '',
    
    ppkNama: '',
    ppkNip: '',
    ppkJabatan: '',
    
    bendaharaNama: '',
    bendaharaNip: '',
    bendaharaJabatan: '',
    
    paNama: '',
    paNip: '',
    paGolongan: '',
    paJabatan: '',
    
    pptkNama: '',
    pptkNip: '',
    pptkJabatan: '',
    
    noNpd: '',
    tanggalNpd: new Date().toISOString().split('T')[0],
    jenisNpd: 'NON_PANJAR',
    noDpa: '',
    
    kodeRekening: '',
    uraianBelanja: '',
    anggaranTotal: 0,
    anggaranSisa: 0,
    
    pembayaranPersen: 100,
    potonganPph21: 0,
    potonganPph22: 0,
    potonganPph23: 0,
    potonganPpn: 0,
    potonganLain: 0,
    keteranganPotongan: '',
    createdAt: '',
    updatedAt: ''
  });

  // Populate initial data for editing
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      // Set some smart default strings or empty state
      setForm(prev => ({
        ...prev,
        id: `spj-${Date.now()}`,
        bendaharaJabatan: 'BENDAHARA PENGELUARAN',
        paJabatan: 'Kepala Dinas Pekerjaan Umum dan Penataan Ruang Kab. Nagekeo / Pengguna Anggaran',
        noDpa: 'DPPA/A.3/1.03.0.00.0.00.01.0000/001/2026',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
  }, [initialData]);

  // Recalculate Terbilang whenever Nilai Kontrak changes
  useEffect(() => {
    if (form.nilaiKontrak > 0) {
      const words = terbilang(form.nilaiKontrak);
      setForm(prev => ({ ...prev, terbilang: words }));
    } else {
      setForm(prev => ({ ...prev, terbilang: '' }));
    }
  }, [form.nilaiKontrak]);

  const handlePegawaiSelect = (role: 'ppk' | 'bendahara' | 'pa' | 'pptk', employeeId: string) => {
    const emp = pegawaiList.find(p => p.id === employeeId);
    if (!emp) return;

    if (role === 'ppk') {
      setForm(prev => ({ ...prev, ppkNama: emp.nama, ppkNip: emp.nip, ppkJabatan: emp.jabatan }));
    } else if (role === 'bendahara') {
      setForm(prev => ({ ...prev, bendaharaNama: emp.nama, bendaharaNip: emp.nip, bendaharaJabatan: emp.jabatan }));
    } else if (role === 'pa') {
      setForm(prev => ({ ...prev, paNama: emp.nama, paNip: emp.nip, paGolongan: emp.golongan || '', paJabatan: emp.jabatan }));
    } else if (role === 'pptk') {
      setForm(prev => ({ ...prev, pptkNama: emp.nama, pptkNip: emp.nip, pptkJabatan: emp.jabatan }));
    }
  };

  const handleRekeningSelect = (rekId: string) => {
    const rek = rekeningList.find(r => r.id === rekId);
    if (!rek) return;

    setForm(prev => ({
      ...prev,
      kodeRekening: rek.kode,
      uraianBelanja: rek.uraian,
      anggaranTotal: rek.anggaran,
      anggaranSisa: rek.sisaAnggaran
    }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      updatedAt: new Date().toISOString()
    });
  };

  const totalPotongan = form.potonganPph21 + form.potonganPph22 + form.potonganPph23 + form.potonganPpn + form.potonganLain;
  const bersih = form.nilaiKontrak - totalPotongan;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation Steps */}
      <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-100 shadow-sm self-start space-y-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Langkah Pengisian</h3>
        <ul className="space-y-3">
          {[
            { n: 1, label: 'Detail Kontrak & SPJ', icon: FileText },
            { n: 2, label: 'Data Rekanan/Penyedia', icon: Building2 },
            { n: 3, label: 'Pejabat Penandatangan', icon: UserCheck },
            { n: 4, label: 'NPD & Kode Rekening', icon: Receipt },
            { n: 5, label: 'Pembayaran & Potongan', icon: DollarSign },
          ].map(s => (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => setStep(s.n)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition text-left ${
                  step === s.n
                    ? 'bg-indigo-50 text-indigo-700 border-l-[3px] border-indigo-600 pl-2.5'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <s.icon className={`w-4 h-4 ${step === s.n ? 'text-indigo-600' : 'text-slate-400'}`} />
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Real-time Summary Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 mt-4 space-y-3 text-xs">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">Kalkulasi Pembayaran</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Nilai Kontrak:</span>
              <span className="font-semibold text-slate-800">{formatRupiah(form.nilaiKontrak, true, false)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Potongan:</span>
              <span className="font-semibold text-red-600">-{formatRupiah(totalPotongan, true, false)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold">
              <span className="text-slate-700 text-[11px]">Net Diterima:</span>
              <span className="text-indigo-600 text-[13px]">{formatRupiah(bersih, true, false)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: KONTRAK */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Detail Kontrak & Nomor SPJ
                </h3>
                <p className="text-xs text-slate-500 mt-1">Lengkapi nomor SPJ utama, judul pekerjaan perencanaan/fisik, nilai kontrak, serta tanggal penandatanganan.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Nomor SPJ / Kwitansi / BAP</label>
                  <input
                    type="text"
                    value={form.noSpj}
                    onChange={e => setForm({ ...form, noSpj: e.target.value })}
                    placeholder="CONTOH: 53.16/03.0/000097/LS/..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-mono font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Tanggal SPJ / Pembayaran</label>
                  <input
                    type="date"
                    value={form.tanggalSpj}
                    onChange={e => setForm({ ...form, tanggalSpj: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-sans font-semibold"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Judul / Uraian Pekerjaan (SPJ)</label>
                  <textarea
                    rows={2}
                    value={form.judulPekerjaan}
                    onChange={e => setForm({ ...form, judulPekerjaan: e.target.value })}
                    placeholder="CONTOH: Pembayaran 100% atas Pekerjaan Belanja Jasa Konsultasi Perencanaan Teknis Jalan Kabupaten DAU 2026"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Nilai Kontrak Pekerjaan (IDR)</label>
                  <input
                    type="number"
                    value={form.nilaiKontrak || ''}
                    onChange={e => setForm({ ...form, nilaiKontrak: Number(e.target.value) })}
                    placeholder="CONTOH: 99900000"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Terbilang (Otomatis)</label>
                  <input
                    type="text"
                    value={form.terbilang}
                    onChange={e => setForm({ ...form, terbilang: e.target.value })}
                    placeholder="Sembilan Puluh Sembilan Juta Sembilan Ratus Ribu Rupiah"
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none font-medium italic text-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Rincian Nomor Kontrak */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Nomor Dokumen Rujukan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor KONTRAK</label>
                    <input
                      type="text"
                      value={form.noKontrak}
                      onChange={e => setForm({ ...form, noKontrak: e.target.value })}
                      placeholder="620/DPUPR-NGK/PJ.DAU/02/V/2026"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal KONTRAK</label>
                    <input
                      type="date"
                      value={form.tglKontrak}
                      onChange={e => setForm({ ...form, tglKontrak: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor SPMK</label>
                    <input
                      type="text"
                      value={form.noSpmk}
                      onChange={e => setForm({ ...form, noSpmk: e.target.value })}
                      placeholder="620/DPUPR-NGK/PJ.DAU/03/V/2026"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal SPMK</label>
                    <input
                      type="date"
                      value={form.tglSpmk}
                      onChange={e => setForm({ ...form, tglSpmk: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor BAST (Produk Perencanaan)</label>
                    <input
                      type="text"
                      value={form.noBast}
                      onChange={e => setForm({ ...form, noBast: e.target.value })}
                      placeholder="620/DPUPR-NGK/BAST-PPJ.DAU/05/VI/2026"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal BAST</label>
                    <input
                      type="date"
                      value={form.tglBast}
                      onChange={e => setForm({ ...form, tglBast: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PENYEDIA/REKANAN */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Data Penyedia Jasa / Kontraktor (Pihak Kedua)
                </h3>
                <p className="text-xs text-slate-500 mt-1">Lengkapi nama perusahaan, nama direktur/pimpinan yang menandatangani kuitansi, beserta alamat resmi.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Nama Perusahaan / Penyedia</label>
                  <input
                    type="text"
                    value={form.kontraktorNama}
                    onChange={e => setForm({ ...form, kontraktorNama: e.target.value })}
                    placeholder="CONTOH: CV. EL EMUNAH"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-semibold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Nama Pimpinan / Direktur / Kepala Perwakilan</label>
                  <input
                    type="text"
                    value={form.kontraktorPimpinan}
                    onChange={e => setForm({ ...form, kontraktorPimpinan: e.target.value })}
                    placeholder="CONTOH: YOHANES SAPA, ST"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-bold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Alamat Resmi Kantor</label>
                  <textarea
                    rows={2}
                    value={form.kontraktorAlamat}
                    onChange={e => setForm({ ...form, kontraktorAlamat: e.target.value })}
                    placeholder="CONTOH: Jln. Pegangsaan II No. 9, Walikota Kupang"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PEJABAT PENANDATANGAN */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" /> Pejabat Penandatangan Dokumen
                </h3>
                <p className="text-xs text-slate-500 mt-1">Pilih dari Master Pegawai untuk mengisi tanda tangan PPK, Bendahara, PPTK, dan Kepala Dinas secara instan.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PPK */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 text-xs uppercase">Pejabat Pembuat Komitmen (PPK)</span>
                    <select
                      onChange={e => handlePegawaiSelect('ppk', e.target.value)}
                      className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Pilih dari Master --</option>
                      {pegawaiList.map(p => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={form.ppkNama}
                      onChange={e => setForm({ ...form, ppkNama: e.target.value })}
                      placeholder="Nama Lengkap & Gelar PPK"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                    <input
                      type="text"
                      value={form.ppkNip}
                      onChange={e => setForm({ ...form, ppkNip: e.target.value })}
                      placeholder="NIP PPK"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
                    />
                    <input
                      type="text"
                      value={form.ppkJabatan}
                      onChange={e => setForm({ ...form, ppkJabatan: e.target.value })}
                      placeholder="Jabatan PPK"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bendahara */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 text-xs uppercase">Bendahara Pengeluaran</span>
                    <select
                      onChange={e => handlePegawaiSelect('bendahara', e.target.value)}
                      className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Pilih dari Master --</option>
                      {pegawaiList.map(p => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={form.bendaharaNama}
                      onChange={e => setForm({ ...form, bendaharaNama: e.target.value })}
                      placeholder="Nama Lengkap & Gelar Bendahara"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                    <input
                      type="text"
                      value={form.bendaharaNip}
                      onChange={e => setForm({ ...form, bendaharaNip: e.target.value })}
                      placeholder="NIP Bendahara"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* PPTK */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 text-xs uppercase">Pejabat Pelaksana Teknis (PPTK)</span>
                    <select
                      onChange={e => handlePegawaiSelect('pptk', e.target.value)}
                      className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Pilih dari Master --</option>
                      {pegawaiList.map(p => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={form.pptkNama}
                      onChange={e => setForm({ ...form, pptkNama: e.target.value })}
                      placeholder="Nama Lengkap & Gelar PPTK"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                    <input
                      type="text"
                      value={form.pptkNip}
                      onChange={e => setForm({ ...form, pptkNip: e.target.value })}
                      placeholder="NIP PPTK"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
                    />
                    <input
                      type="text"
                      value={form.pptkJabatan}
                      onChange={e => setForm({ ...form, pptkJabatan: e.target.value })}
                      placeholder="Jabatan PPTK"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pengguna Anggaran / Kadis */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 text-xs uppercase">Kepala Dinas / Pengguna Anggaran</span>
                    <select
                      onChange={e => handlePegawaiSelect('pa', e.target.value)}
                      className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Pilih dari Master --</option>
                      {pegawaiList.map(p => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={form.paNama}
                      onChange={e => setForm({ ...form, paNama: e.target.value })}
                      placeholder="Nama Kepala Dinas / PA"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                    <input
                      type="text"
                      value={form.paNip}
                      onChange={e => setForm({ ...form, paNip: e.target.value })}
                      placeholder="NIP Kepala Dinas / PA"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
                    />
                    <input
                      type="text"
                      value={form.paGolongan}
                      onChange={e => setForm({ ...form, paGolongan: e.target.value })}
                      placeholder="Golongan Kepala Dinas (e.g. Pembina Utama / IV.c)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: NPD & REKENING BELANJA */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-500" /> Nota Pencairan Dana (NPD) & Rekening Belanja
                </h3>
                <p className="text-xs text-slate-500 mt-1">Lengkapi dokumen pencairan dana NPD dengan nomor DPA, rincian anggaran total, serta sisa anggaran terakhir.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Nomor NPD (Nota Pencairan Dana)</label>
                  <input
                    type="text"
                    value={form.noNpd}
                    onChange={e => setForm({ ...form, noNpd: e.target.value })}
                    placeholder="CONTOH: 900/DPUPR-NGK/96/VII/2026"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Tanggal Dokumen NPD</label>
                  <input
                    type="date"
                    value={form.tanggalNpd}
                    onChange={e => setForm({ ...form, tanggalNpd: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-sans font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Jenis NPD (Pembayaran)</label>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="jenisNpd"
                        checked={form.jenisNpd === 'PANJAR'}
                        onChange={() => setForm({ ...form, jenisNpd: 'PANJAR' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      PANJAR (Uang Muka)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="jenisNpd"
                        checked={form.jenisNpd === 'NON_PANJAR'}
                        onChange={() => setForm({ ...form, jenisNpd: 'NON_PANJAR' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      NON PANJAR (Lunas/Langsung)
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Nomor DPA (Dokumen Pelaksanaan Anggaran)</label>
                  <input
                    type="text"
                    value={form.noDpa}
                    onChange={e => setForm({ ...form, noDpa: e.target.value })}
                    placeholder="DPPA/A.3/1.03.0.00.0.00.01.0000/001/2026"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Master Rekening Link */}
              <div className="bg-indigo-50/40 p-5 rounded-xl border border-indigo-100/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wider">Hubungkan dengan Master Rekening</h4>
                  <select
                    onChange={e => handleRekeningSelect(e.target.value)}
                    className="text-xs bg-white border border-indigo-200 rounded px-3 py-1.5 font-bold text-indigo-700 focus:outline-none cursor-pointer shadow-sm"
                  >
                    <option value="">-- Pilih Rekening Anggaran --</option>
                    {rekeningList.map(r => (
                      <option key={r.id} value={r.id}>{r.kode} - {r.uraian.substring(0, 30)}...</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">KODE REK SUB RINCIAN OBYEK BELANJA</label>
                    <input
                      type="text"
                      value={form.kodeRekening}
                      onChange={e => setForm({ ...form, kodeRekening: e.target.value })}
                      placeholder="CONTOH: 1.03.10.2.01.0053.5.2.04.01.001.0003"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">URAIAN SUB RINCIAN BELANJA</label>
                    <input
                      type="text"
                      value={form.uraianBelanja}
                      onChange={e => setForm({ ...form, uraianBelanja: e.target.value })}
                      placeholder="Belanja Modal Jalan Kabupaten"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">TOTAL ANGGARAN DPA (Rp)</label>
                    <input
                      type="number"
                      value={form.anggaranTotal || ''}
                      onChange={e => setForm({ ...form, anggaranTotal: Number(e.target.value) })}
                      placeholder="3980000000"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">SISA ANGGARAN TERAKHIR SEBELUM PENCAIRAN (Rp)</label>
                    <input
                      type="number"
                      value={form.anggaranSisa || ''}
                      onChange={e => setForm({ ...form, anggaranSisa: Number(e.target.value) })}
                      placeholder="3980000000"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PEMBAYARAN & POTONGAN */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-500" /> Rincian Pembayaran & Potongan Pajak
                </h3>
                <p className="text-xs text-slate-500 mt-1">Sesuaikan persentase termin pembayaran dan masukkan potongan-potongan pajak yang berlaku (PPh 21/22/23, PPN, dll).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Persen Termin Pembayaran (%)</label>
                  <input
                    type="number"
                    value={form.pembayaranPersen || ''}
                    onChange={e => setForm({ ...form, pembayaranPersen: Number(e.target.value) })}
                    placeholder="CONTOH: 100"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Potongan PPN (Rupiah)</label>
                  <input
                    type="number"
                    value={form.potonganPpn || ''}
                    onChange={e => setForm({ ...form, potonganPpn: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Potongan PPh Pasal 21 (Rupiah)</label>
                  <input
                    type="number"
                    value={form.potonganPph21 || ''}
                    onChange={e => setForm({ ...form, potonganPph21: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Potongan PPh Pasal 22 (Rupiah)</label>
                  <input
                    type="number"
                    value={form.potonganPph22 || ''}
                    onChange={e => setForm({ ...form, potonganPph22: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Potongan PPh Pasal 23 (Rupiah)</label>
                  <input
                    type="number"
                    value={form.potonganPph23 || ''}
                    onChange={e => setForm({ ...form, potonganPph23: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Potongan Lain-Lain (Rupiah)</label>
                  <input
                    type="number"
                    value={form.potonganLain || ''}
                    onChange={e => setForm({ ...form, potonganLain: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Keterangan Potongan Lain-Lain</label>
                  <input
                    type="text"
                    value={form.keteranganPotongan}
                    onChange={e => setForm({ ...form, keteranganPotongan: e.target.value })}
                    placeholder="CONTOH: Potongan Jaminan Pemeliharaan 5%"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition"
            >
              Kembali Ke Dashboard
            </button>
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Sebelumnya
                </button>
              )}
              
              {step < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition"
                >
                  Selanjutnya <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition"
                >
                  <Save className="w-4 h-4" /> Simpan SPJ Berkas
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
