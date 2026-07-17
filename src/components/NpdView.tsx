/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SPJBundle } from '../types';
import { formatRupiah, formatTanggalIndo } from '../lib/utils';
import { DigitalSeal } from '../lib/signature';

interface NpdViewProps {
  data: SPJBundle;
  forcedSignatureType?: 'manual' | 'digital';
}

export const NpdView: React.FC<NpdViewProps> = ({ data, forcedSignatureType }) => {
  const sigType = forcedSignatureType || data.signatureType || 'manual';
  return (
    <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-lg max-w-[800px] mx-auto my-4 font-serif text-black print:shadow-none print:border-none print:p-0 print:my-0 print:max-w-full">
      {/* KOP SURAT */}
      <div className="flex items-center justify-center border-b-[3px] border-double border-black pb-4 mb-4 text-center relative">
        <div className="absolute left-0 top-0 w-16 h-16 border-2 border-black rounded-full flex flex-col items-center justify-center text-[8px] font-bold p-1 leading-none print:w-14 print:h-14">
          <span className="text-[6px]">KABUPATEN</span>
          <span className="font-sans text-[8px]">NAGEKEO</span>
          <div className="w-6 h-4 bg-gray-300 border border-black my-0.5 rounded-sm flex items-center justify-center text-[5px] text-black">PUPR</div>
          <span className="text-[5px]">FLORES</span>
        </div>
        
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-wider leading-tight uppercase">Pemerintah Kabupaten Nagekeo</h2>
          <h1 className="text-xl font-bold tracking-widest leading-tight uppercase">Dinas Pekerjaan Umum dan Penataan Ruang</h1>
          <p className="text-xs italic font-sans font-medium text-gray-700 print:text-black">Kompleks Bendung Sutami - Mbay</p>
        </div>
      </div>

      {/* JUDUL NPD */}
      <div className="border border-black p-3 text-center mb-6 bg-gray-50 print:bg-transparent">
        <h3 className="text-lg font-bold tracking-widest uppercase">Nota Pencairan Dana (NPD)</h3>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono mt-2 pt-2 border-t border-black/10">
          <div>NOMOR : {data.noNpd || '......................................................'}</div>
          <div>TANGGAL : {formatTanggalIndo(data.tanggalNpd) || '......................................................'}</div>
        </div>
      </div>

      {/* METADATA FORM */}
      <div className="space-y-2 text-xs leading-relaxed mb-6 border border-black p-4 rounded-sm bg-gray-50/30 print:bg-transparent">
        {/* Row 1: JENIS NPD */}
        <div className="grid grid-cols-[140px_15px_1fr] items-center">
          <div className="font-bold">JENIS NPD</div>
          <div>:</div>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className={`w-5 h-5 border border-black flex items-center justify-center text-xs font-bold bg-white rounded-sm ${data.jenisNpd === 'PANJAR' ? 'bg-amber-100' : ''}`}>
                {data.jenisNpd === 'PANJAR' ? '✔' : ''}
              </span>
              <span className="font-semibold text-[11px]">PANJAR</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className={`w-5 h-5 border border-black flex items-center justify-center text-xs font-bold bg-white rounded-sm ${data.jenisNpd === 'NON_PANJAR' ? 'bg-amber-100' : ''}`}>
                {data.jenisNpd === 'NON_PANJAR' ? '✔' : ''}
              </span>
              <span className="font-semibold text-[11px]">NON PANJAR</span>
            </label>
          </div>
        </div>

        {/* Row 2: PPTK */}
        <div className="grid grid-cols-[140px_15px_1fr] items-center">
          <div className="font-bold">PPTK</div>
          <div>:</div>
          <div className="font-semibold uppercase text-sm border-b border-dotted border-gray-400 print:border-black pb-0.5">{data.pptkNama || '...........................................................................'}</div>
        </div>

        {/* Row 3: PROGRAM */}
        <div className="grid grid-cols-[140px_15px_1fr] items-start">
          <div className="font-bold">PROGRAM</div>
          <div>:</div>
          <div className="border-b border-dotted border-gray-400 print:border-black pb-0.5 font-medium">1.03.10 PROGRAM PENYELENGGARAAN JALAN</div>
        </div>

        {/* Row 4: KEGIATAN */}
        <div className="grid grid-cols-[140px_15px_1fr] items-start">
          <div className="font-bold">KEGIATAN</div>
          <div>:</div>
          <div className="border-b border-dotted border-gray-400 print:border-black pb-0.5 font-medium">1.03.10.2.01 Penyelenggaraan Jalan Kabupaten/Kota</div>
        </div>

        {/* Row 5: SUB KEGIATAN */}
        <div className="grid grid-cols-[140px_15px_1fr] items-start">
          <div className="font-bold">SUB KEGIATAN</div>
          <div>:</div>
          <div className="border-b border-dotted border-gray-400 print:border-black pb-0.5 font-semibold">1.03.10.2.01.0053 Pembangunan Jalan</div>
        </div>

        {/* Row 6: NOMOR DPA */}
        <div className="grid grid-cols-[140px_15px_1fr] items-center">
          <div className="font-bold">NOMOR DPA</div>
          <div>:</div>
          <div className="font-mono text-[11px] border-b border-dotted border-gray-400 print:border-black pb-0.5">{data.noDpa || '...........................................................................'}</div>
        </div>

        {/* Row 7: TAHUN ANGGARAN */}
        <div className="grid grid-cols-[140px_15px_1fr] items-center">
          <div className="font-bold">TAHUN ANGGARAN</div>
          <div>:</div>
          <div className="font-semibold border-b border-dotted border-gray-400 print:border-black pb-0.5">{data.tanggalSpj.split('-')[0] || '2026'}</div>
        </div>
      </div>

      {/* Rincian Belanja Title */}
      <h4 className="text-xs font-bold mb-1 uppercase tracking-wider text-gray-700 print:text-black">Rincian Belanja :</h4>

      {/* BUDGET TABLE */}
      <div className="border border-black text-[10px] mb-6 overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-black text-center font-bold print:bg-transparent">
              <th className="border-r border-black p-2 w-[40px]">NO</th>
              <th className="border-r border-black p-2 w-[180px]">KODE REK SUB RINCIAN OBYEK BELANJA</th>
              <th className="border-r border-black p-2">URAIAN</th>
              <th className="border-r border-black p-2 w-[110px]">ANGGARAN</th>
              <th className="border-r border-black p-2 w-[110px]">SISA ANGGARAN TERAKHIR</th>
              <th className="p-2 w-[110px]">PENCAIRAN SAAT INI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            <tr className="align-top">
              <td className="border-r border-black p-2 text-center">1</td>
              <td className="border-r border-black p-2 font-mono text-center tracking-tight font-semibold">{data.kodeRekening || '......................................'}</td>
              <td className="border-r border-black p-2 font-medium leading-relaxed">{data.uraianBelanja || '......................................'}</td>
              <td className="border-r border-black p-2 text-right font-sans">{formatRupiah(data.anggaranTotal, false, true)}</td>
              <td className="border-r border-black p-2 text-right font-sans">{formatRupiah(data.anggaranSisa, false, true)}</td>
              <td className="p-2 text-right font-sans font-bold bg-amber-50/30 print:bg-transparent">{formatRupiah(data.nilaiKontrak, false, true)}</td>
            </tr>
            {/* Row JUMLAH */}
            <tr className="font-bold border-t border-black bg-gray-50 print:bg-transparent">
              <td colSpan={3} className="border-r border-black p-2 text-center uppercase tracking-wider">Jumlah</td>
              <td className="border-r border-black p-2 text-right font-sans">{formatRupiah(data.anggaranTotal, false, true)}</td>
              <td className="border-r border-black p-2 text-right font-sans">{formatRupiah(data.anggaranSisa, false, true)}</td>
              <td className="p-2 text-right font-sans bg-amber-100/20 print:bg-transparent">{formatRupiah(data.nilaiKontrak, false, true)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TANGGUNG JAWAB STATEMENT */}
      <div className="border border-black p-3 bg-gray-50/50 print:bg-transparent rounded-sm text-xs text-justify leading-relaxed mb-8 flex items-start space-x-3">
        <span className="text-sm font-bold text-gray-400 print:text-black">💡</span>
        <p className="italic">
          Dengan ini kami menyatakan siap bertanggung jawab dan bersedia melakukan penyetoran kembali terhadap pencairan belanja daerah yang melampaui beban anggaran pada Dokumen Pelaksanaan Anggaran Perangkat Daerah kami.
        </p>
      </div>

      {/* SIGNATURES SECTION */}
      <div className="grid grid-cols-2 gap-x-8 text-xs leading-snug mt-12 mb-4">
        {/* Left Signature: Disiapkan oleh (PPTK) */}
        <div className="text-center flex flex-col justify-between h-44 border border-gray-100/50 p-2 rounded print:border-none print:p-0">
          <div>
            <p className="font-semibold italic">Disiapkan oleh,</p>
            <p className="font-bold uppercase text-[10px] text-gray-700 print:text-black">{data.pptkJabatan || 'Pejabat Pelaksana Teknis Kegiatan (PPTK)'}</p>
          </div>
          {sigType === 'digital' && data.pptkNama ? (
            <div className="my-1.5">
              <DigitalSeal signerNama={data.pptkNama} signerNip={data.pptkNip} docId={data.id} amount={data.nilaiKontrak} token={data.leaderToken} />
            </div>
          ) : (
            <div className="h-16"></div>
          )}
          <div className="mt-auto">
            <p className="font-bold underline uppercase tracking-wider">{data.pptkNama || '.............................................'}</p>
            <p className="font-sans text-[10px]">NIP. {data.pptkNip || '.............................................'}</p>
          </div>
        </div>

        {/* Right Signature: Disetujui oleh (Pengguna Anggaran) */}
        <div className="text-center flex flex-col justify-between h-44">
          <div>
            <p className="font-semibold italic">Disetujui oleh,</p>
            <p className="font-bold uppercase text-[10px] text-gray-700 print:text-black">Pengguna Anggaran (PA)</p>
          </div>
          {sigType === 'digital' && data.paNama ? (
            <div className="my-1.5">
              <DigitalSeal signerNama={data.paNama} signerNip={data.paNip} docId={data.id} amount={data.nilaiKontrak} token={data.leaderToken} />
            </div>
          ) : (
            <div className="h-16"></div>
          )}
          <div className="mt-auto">
            <p className="font-bold underline uppercase tracking-wider">{data.paNama || '.............................................'}</p>
            <p className="font-sans text-[10px]">NIP. {data.paNip || '.............................................'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
