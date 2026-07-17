/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SPJBundle } from '../types';
import { formatRupiah, formatTanggalIndo } from '../lib/utils';
import { DigitalSeal } from '../lib/signature';
import logoNagekeo from '../assets/images/logo_nagekeo_pemda_1784266399665.jpg';

interface KwitansiViewProps {
  data: SPJBundle;
  forcedSignatureType?: 'manual' | 'digital';
}

export const KwitansiView: React.FC<KwitansiViewProps> = ({ data, forcedSignatureType }) => {
  const sigType = forcedSignatureType || data.signatureType || 'manual';
  return (
    <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-lg max-w-[800px] mx-auto my-4 font-serif text-black print:shadow-none print:border-none print:p-0 print:my-0 print:max-w-full">
      {/* KOP SURAT */}
      <div className="flex items-center justify-center border-b-[3px] border-double border-black pb-4 mb-4 text-center relative">
        <img 
          src={logoNagekeo} 
          alt="Logo Pemda Nagekeo" 
          className="absolute left-0 top-0 w-16 h-16 object-contain print:w-14 print:h-14" 
          referrerPolicy="no-referrer"
        />
        
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-wider leading-tight uppercase">Pemerintah Kabupaten Nagekeo</h2>
          <h1 className="text-xl font-bold tracking-widest leading-tight uppercase">Dinas Pekerjaan Umum dan Penataan Ruang</h1>
          <p className="text-xs italic font-sans font-medium text-gray-700 print:text-black">Kompleks Bendung Sutami - Mbay</p>
        </div>
      </div>

      {/* JUDUL DOKUMEN */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold tracking-widest underline decoration-1 uppercase">Kwitansi</h3>
        <p className="text-xs font-mono mt-1">NOMOR : {data.noSpj || '...........................................................................'}</p>
      </div>

      {/* CONTENT FIELDS */}
      <div className="space-y-4 text-sm leading-relaxed mb-8">
        {/* Row 1 */}
        <div className="grid grid-cols-[180px_15px_1fr] items-start">
          <div className="font-semibold">Sudah terima dari</div>
          <div>:</div>
          <div className="border-b border-dotted border-gray-400 print:border-black pb-0.5">
            Bendahara Pengeluaran Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Nagekeo
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-[180px_15px_1fr] items-center">
          <div className="font-semibold">Banyaknya Uang</div>
          <div>:</div>
          <div className="bg-gray-100 px-3 py-1 font-sans font-bold border border-black text-base inline-block w-fit rounded print:bg-transparent print:border-black">
            {formatRupiah(data.nilaiKontrak, true, false)}
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-[180px_15px_1fr] items-start">
          <div className="font-semibold italic">Terbilang</div>
          <div>:</div>
          <div className="border-b border-dotted border-gray-400 print:border-black pb-0.5 italic font-medium bg-gray-50 px-2 py-0.5 rounded print:bg-transparent print:p-0">
            ( {data.terbilang || '................................................................................................................................'} Rupiah )
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-[180px_15px_1fr] items-start">
          <div className="font-semibold">Untuk</div>
          <div>:</div>
          <div className="border-b border-dotted border-gray-400 print:border-black pb-0.5 text-justify leading-relaxed">
            Pembayaran {data.pembayaranPersen}% atas Pekerjaan {data.judulPekerjaan || '........................................................'} Kepada <span className="font-semibold">{data.kontraktorNama || '............................'}</span> pada Dinas PUPR TA. 2026 dari Dana DAU.
          </div>
        </div>

        {/* Row 5 - Sesuai Section */}
        <div className="grid grid-cols-[180px_15px_1fr] items-start pt-2">
          <div className="font-semibold">Sesuai</div>
          <div>:</div>
          <div className="space-y-2">
            <div className="grid grid-cols-[120px_15px_1fr] items-center text-xs">
              <div>* KONTRAK</div>
              <div>:</div>
              <div className="grid grid-cols-[1fr_80px_1fr] gap-2">
                <span className="border-b border-dotted border-gray-400 print:border-black font-semibold">{data.noKontrak || '........................'}</span>
                <span className="text-right">Tanggal :</span>
                <span className="border-b border-dotted border-gray-400 print:border-black font-semibold">{formatTanggalIndo(data.tglKontrak) || '........................'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-[120px_15px_1fr] items-center text-xs">
              <div>* SPMK</div>
              <div>:</div>
              <div className="grid grid-cols-[1fr_80px_1fr] gap-2">
                <span className="border-b border-dotted border-gray-400 print:border-black font-semibold">{data.noSpmk || '........................'}</span>
                <span className="text-right">Tanggal :</span>
                <span className="border-b border-dotted border-gray-400 print:border-black font-semibold">{formatTanggalIndo(data.tglSpmk) || '........................'}</span>
              </div>
            </div>

            <div className="grid grid-cols-[120px_15px_1fr] items-start text-xs">
              <div className="leading-tight">* BERITA ACARA SERAH TERIMA PRODUK PERENCANAAN</div>
              <div className="pt-0.5">:</div>
              <div className="grid grid-cols-[1fr_80px_1fr] gap-2 pt-0.5">
                <span className="border-b border-dotted border-gray-400 print:border-black font-semibold">{data.noBast || '........................'}</span>
                <span className="text-right">Tanggal :</span>
                <span className="border-b border-dotted border-gray-400 print:border-black font-semibold">{formatTanggalIndo(data.tglBast) || '........................'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURES BLOCK */}
      <div className="grid grid-cols-2 gap-y-10 text-xs mt-12 mb-8 leading-snug">
        {/* Setuju Dibayar (PPK) */}
        <div className="text-center px-4 flex flex-col justify-between h-44">
          <div>
            <p className="font-semibold">Setuju dibayar</p>
            <p className="font-semibold text-gray-600 uppercase text-[10px] print:text-black">{data.ppkJabatan || 'Pejabat Pembuat Komitmen (PPK)'}</p>
          </div>
          {sigType === 'digital' && data.ppkNama ? (
            <div className="my-1.5">
              <DigitalSeal signerNama={data.ppkNama} signerNip={data.ppkNip} docId={data.id} amount={data.nilaiKontrak} token={data.leaderToken} />
            </div>
          ) : (
            <div className="h-16"></div>
          )}
          <div className="mt-auto">
            <p className="font-bold underline uppercase tracking-wider">{data.ppkNama || '.............................................'}</p>
            <p className="font-sans">NIP. {data.ppkNip || '.............................................'}</p>
          </div>
        </div>

        {/* Lunas Dibayar (Bendahara) */}
        <div className="text-center px-4 flex flex-col justify-between h-44">
          <div>
            <p className="font-semibold">Lunas dibayar</p>
            <p className="font-semibold text-gray-600 uppercase text-[10px] print:text-black">BENDAHARA PENGELUARAN</p>
          </div>
          {sigType === 'digital' && data.bendaharaNama ? (
            <div className="my-1.5">
              <DigitalSeal signerNama={data.bendaharaNama} signerNip={data.bendaharaNip} docId={data.id} amount={data.nilaiKontrak} token={data.leaderToken} />
            </div>
          ) : (
            <div className="h-16"></div>
          )}
          <div className="mt-auto">
            <p className="font-bold underline uppercase tracking-wider">{data.bendaharaNama || '.............................................'}</p>
            <p className="font-sans">NIP. {data.bendaharaNip || '.............................................'}</p>
          </div>
        </div>

        {/* Yang Menerima (Kontraktor) */}
        <div className="text-center px-4 flex flex-col justify-between h-44 border border-gray-100 p-2 rounded relative print:border-none print:p-0">
          <div className="absolute left-4 top-10 w-24 h-16 border-2 border-dashed border-sky-400 text-sky-400 text-[9px] font-sans rounded flex flex-col items-center justify-center rotate-[-6deg] opacity-75 print:border-black print:text-black">
            <span className="font-bold">METERAI TEMPEL</span>
            <span className="text-[12px] font-black">10000</span>
            <span className="text-[7px]">8CBE8ANX414177174</span>
          </div>
          
          <div>
            <p className="font-semibold">Mbay, {formatTanggalIndo(data.tanggalSpj) || '..............................'}</p>
            <p className="font-semibold">Yang Menerima</p>
            <p className="font-bold uppercase text-[10px]">{data.kontraktorNama || '................................'}</p>
          </div>
          <div className="mt-auto z-10 h-16 flex items-end justify-center">
            <p className="font-bold underline uppercase tracking-wider">{data.kontraktorPimpinan || '.............................................'}</p>
          </div>
          <div className="text-[10px] italic">Kepala Perwakilan</div>
        </div>

        {/* Mengetahui (Kepala Dinas) */}
        <div className="text-center px-4 flex flex-col justify-between h-44">
          <div>
            <p className="font-semibold">Mengetahui</p>
            <p className="font-semibold text-gray-600 uppercase text-[9px] leading-tight print:text-black">
              Kepala Dinas Pekerjaan Umum dan Penataan Ruang Kab. Nagekeo / Pengguna Anggaran
            </p>
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
            <p className="font-medium text-gray-700 text-[10px] print:text-black">{data.paGolongan || '.............................................'}</p>
            <p className="font-sans">NIP. {data.paNip || '.............................................'}</p>
          </div>
        </div>
      </div>

      {/* FOOTER COPIES */}
      <div className="border-t border-gray-300 pt-3 mt-6 text-[9px] font-sans text-gray-500 grid grid-cols-2 gap-x-4 print:text-black print:border-black">
        <div className="space-y-1">
          <div className="grid grid-cols-[80px_10px_1fr]">
            <span className="font-semibold">Lembar Asli</span>
            <span>:</span>
            <span>Untuk Pengguna Anggaran / PPK-SKPD</span>
          </div>
          <div className="grid grid-cols-[80px_10px_1fr]">
            <span className="font-semibold">Salinan 1</span>
            <span>:</span>
            <span>Untuk Kuasa BUD</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-[80px_10px_1fr]">
            <span className="font-semibold">Salinan 2</span>
            <span>:</span>
            <span>Untuk Bendahara Pengeluaran / PPTK</span>
          </div>
          <div className="grid grid-cols-[80px_10px_1fr]">
            <span className="font-semibold">Salinan 3</span>
            <span>:</span>
            <span>Untuk Arsip Bendahara Pengeluaran / PPTK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
