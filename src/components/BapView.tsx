/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SPJBundle } from '../types';
import { formatRupiah, formatTanggalIndo, formatHariTanggalIndoTerbilang } from '../lib/utils';
import { DigitalSeal } from '../lib/signature';
import logoNagekeo from '../assets/images/logo_nagekeo_pemda_1784266399665.jpg';

interface BapViewProps {
  data: SPJBundle;
  forcedSignatureType?: 'manual' | 'digital';
}

export const BapView: React.FC<BapViewProps> = ({ data, forcedSignatureType }) => {
  const totalPotongan = data.potonganPph21 + data.potonganPph22 + data.potonganPph23 + data.potonganPpn + data.potonganLain;
  const fisikBersih = data.nilaiKontrak - totalPotongan;
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
        <h3 className="text-lg font-bold tracking-widest underline decoration-1 uppercase">Berita Acara Pembayaran</h3>
        <p className="text-xs font-mono mt-1">NOMOR : {data.noSpj || '...........................................................................'}</p>
      </div>

      {/* PARAGRAPH PEMBUKA */}
      <p className="text-sm text-justify leading-relaxed mb-6">
        Pada Hari ini <span className="font-semibold">{formatHariTanggalIndoTerbilang(data.tanggalSpj) || '........................................................'}</span>, kami yang bertanda tangan di bawah ini :
      </p>

      {/* PIHAK IDENTITAS */}
      <div className="space-y-4 text-sm mb-6 leading-relaxed">
        {/* Pihak Kesatu */}
        <div>
          <div className="grid grid-cols-[120px_15px_1fr] font-semibold">
            <div>I. Nama</div>
            <div>:</div>
            <div className="font-bold underline uppercase">{data.ppkNama || '........................................................'}</div>
          </div>
          <div className="grid grid-cols-[120px_15px_1fr] pl-6 text-gray-800 print:text-black text-xs">
            <div>NIP</div>
            <div>:</div>
            <div>{data.ppkNip || '........................................................'}</div>
          </div>
          <div className="grid grid-cols-[120px_15px_1fr] pl-6 text-gray-800 print:text-black text-xs">
            <div>Alamat</div>
            <div>:</div>
            <div>Kompleks Bendung Sutami - Mbay</div>
          </div>
          <div className="grid grid-cols-[120px_15px_1fr] pl-6 text-gray-800 print:text-black text-xs">
            <div>Jabatan</div>
            <div>:</div>
            <div className="font-semibold">{data.ppkJabatan || 'Pejabat Pembuat Komitmen (PPK) Program Penyelenggaraan Jalan'}</div>
          </div>
          <div className="pl-6 text-xs text-right italic font-medium mt-1">
            Yang selanjutnya disebut : <span className="font-bold border border-black px-1 rounded bg-gray-50 print:bg-transparent">PIHAK KESATU</span>
          </div>
        </div>

        {/* Pihak Kedua */}
        <div>
          <div className="grid grid-cols-[120px_15px_1fr] font-semibold">
            <div>II. Nama</div>
            <div>:</div>
            <div className="font-bold underline uppercase">{data.kontraktorPimpinan || '........................................................'}</div>
          </div>
          <div className="grid grid-cols-[120px_15px_1fr] pl-6 text-gray-800 print:text-black text-xs">
            <div>Alamat</div>
            <div>:</div>
            <div>{data.kontraktorAlamat || '........................................................'}</div>
          </div>
          <div className="grid grid-cols-[120px_15px_1fr] pl-6 text-gray-800 print:text-black text-xs">
            <div>Jabatan</div>
            <div>:</div>
            <div>Kepala Perwakilan <span className="font-bold uppercase">{data.kontraktorNama || '................................'}</span></div>
          </div>
          <div className="pl-6 text-xs text-right italic font-medium mt-1">
            Yang selanjutnya disebut : <span className="font-bold border border-black px-1 rounded bg-gray-50 print:bg-transparent">PIHAK KEDUA</span>
          </div>
        </div>
      </div>

      {/* BERDASARKAN SECTION */}
      <div className="text-sm space-y-2 mb-6 leading-relaxed">
        <div className="font-semibold text-xs border-b border-gray-200 pb-1 uppercase tracking-wider text-gray-700 print:text-black">Berdasarkan :</div>
        
        {/* Kontrak */}
        <div className="grid grid-cols-[20px_150px_15px_1fr] text-xs items-start">
          <div>2.</div>
          <div className="font-semibold">KONTRAK</div>
          <div>:</div>
          <div>
            <div className="grid grid-cols-[60px_15px_1fr]">
              <div>Nomor</div>
              <div>:</div>
              <div className="font-semibold">{data.noKontrak || '.............................................'}</div>
            </div>
            <div className="grid grid-cols-[60px_15px_1fr]">
              <div>Tanggal</div>
              <div>:</div>
              <div>{formatTanggalIndo(data.tglKontrak) || '.............................................'}</div>
            </div>
            <div className="grid grid-cols-[60px_15px_1fr]">
              <div className="font-semibold">NILAI</div>
              <div>:</div>
              <div className="font-bold">{formatRupiah(data.nilaiKontrak, true, true)}</div>
            </div>
            <div className="grid grid-cols-[60px_15px_1fr] items-start mt-1">
              <div>Uraian</div>
              <div>:</div>
              <div className="text-justify font-medium">{data.judulPekerjaan || '................................................................................'}</div>
            </div>
          </div>
        </div>

        {/* BAST */}
        <div className="grid grid-cols-[20px_150px_15px_1fr] text-xs items-start pt-2 border-t border-dotted border-gray-200 print:border-black">
          <div>3.</div>
          <div className="font-semibold leading-tight">BERITA ACARA SERAH TERIMA</div>
          <div>:</div>
          <div>
            Nomor: <span className="font-semibold">{data.noBast || '.............................................'}</span>, Tanggal: <span className="font-semibold">{formatTanggalIndo(data.tglBast) || '.............................................'}</span> atas Pekerjaan <span className="italic">{data.judulPekerjaan || '................................................................'}</span>.
          </div>
        </div>
      </div>

      {/* HAK PEMBAYARAN & RINCIAN TABLE */}
      <div className="text-sm leading-relaxed mb-6">
        <p className="text-justify mb-3">
          III. Sesuai Syarat-Syarat Khusus Kontrak, maka <span className="font-bold">PIHAK KEDUA</span> BERHAK MENERIMA Pembayaran <span className="font-semibold">{data.pembayaranPersen}%</span>, dengan rincian perhitungan sebagai berikut :
        </p>

        {/* Rincian Table */}
        <div className="border border-black rounded-sm overflow-hidden text-xs">
          <div className="grid grid-cols-[1fr_200px] border-b border-black font-semibold bg-gray-50 px-3 py-1.5 print:bg-transparent">
            <div>Uraian Perhitungan</div>
            <div className="text-right">Jumlah (Rupiah)</div>
          </div>
          
          <div className="divide-y divide-gray-200 print:divide-black">
            {/* Pembayaran 100% */}
            <div className="grid grid-cols-[1fr_200px] px-3 py-1.5">
              <div>Pembayaran {data.pembayaranPersen}%</div>
              <div className="text-right font-medium">{formatRupiah(data.nilaiKontrak, false, true)}</div>
            </div>
            
            {/* Perhitungan Pembayarannya */}
            <div className="grid grid-cols-[1fr_200px] px-3 py-1.5 bg-gray-50/50 print:bg-transparent">
              <div className="pl-4">
                a. Jumlah Pembayaran BAP ini ({data.pembayaranPersen}% x {formatRupiah(data.nilaiKontrak, false, false)})
              </div>
              <div className="text-right font-semibold">{formatRupiah(data.nilaiKontrak, false, true)}</div>
            </div>

            {/* Potongan */}
            <div className="grid grid-cols-[1fr_200px] px-3 py-1.5">
              <div className="pl-4 flex flex-col">
                <span>b. Potongan-Potongan:</span>
                {totalPotongan > 0 && (
                  <div className="pl-4 text-[10px] text-gray-600 print:text-black space-y-0.5 mt-0.5">
                    {data.potonganPph21 > 0 && <div>- PPh 21: {formatRupiah(data.potonganPph21)}</div>}
                    {data.potonganPph22 > 0 && <div>- PPh 22: {formatRupiah(data.potonganPph22)}</div>}
                    {data.potonganPph23 > 0 && <div>- PPh 23: {formatRupiah(data.potonganPph23)}</div>}
                    {data.potonganPpn > 0 && <div>- PPN: {formatRupiah(data.potonganPpn)}</div>}
                    {data.potonganLain > 0 && <div>- Potongan Lain: {formatRupiah(data.potonganLain)} {data.keteranganPotongan && `(${data.keteranganPotongan})`}</div>}
                  </div>
                )}
              </div>
              <div className="text-right self-start font-medium text-red-600 print:text-black">
                {totalPotongan > 0 ? `(${formatRupiah(totalPotongan, false, true)})` : '-'}
              </div>
            </div>

            {/* Jumlah Potongan */}
            <div className="grid grid-cols-[1fr_200px] px-3 py-1.5 bg-gray-50/50 print:bg-transparent font-medium">
              <div className="pl-8">Jumlah Potongan</div>
              <div className="text-right font-semibold text-red-600 print:text-black">
                {totalPotongan > 0 ? formatRupiah(totalPotongan, false, true) : '-'}
              </div>
            </div>

            {/* Pembayaran BAP Fisik Saat Ini */}
            <div className="grid grid-cols-[1fr_200px] px-3 py-2 font-bold bg-amber-50/40 print:bg-transparent border-t border-black">
              <div className="pl-4">c. Pembayaran BAP Fisik saat ini</div>
              <div className="text-right text-sm underline decoration-double">{formatRupiah(fisikBersih, true, true)}</div>
            </div>
          </div>
        </div>

        {/* Terbilang block */}
        <div className="mt-3 px-3 py-1.5 border-l-[3px] border-black bg-gray-100 font-sans italic text-xs print:bg-transparent print:border-black rounded-r">
          <span className="font-semibold font-serif not-italic">terbilang :</span> ( {data.terbilang || '...........................................................................................'} {totalPotongan > 0 ? 'Kurang Potongan Pajak' : ''} Rupiah )
        </div>
      </div>

      {/* FOOTER TEXT */}
      <div className="text-sm leading-relaxed text-justify mb-8 space-y-3">
        <p>
          <span className="font-bold">PIHAK KESATU</span> membayar kepada <span className="font-bold">PIHAK KEDUA</span> sebesar <span className="font-bold">{formatRupiah(fisikBersih, true, true)}</span> ({data.terbilang || '................................'} Rupiah) yang dibebankan pada Dinas PUPR Kabupaten Nagekeo Tahun Anggaran {data.tanggalSpj.split('-')[0] || '2026'} dengan Kode Rekening: <span className="font-mono font-bold">{data.kodeRekening || '.............................................'}</span>, serta dengan Pengajuan SPP LS.
        </p>
        <p>Demikian Berita Acara ini dibuat untuk dipergunakan seperlunya.</p>
      </div>

      {/* SIGNATURES BLOCK */}
      <div className="grid grid-cols-2 gap-y-12 text-xs mt-12 mb-8 leading-snug">
        {/* Pihak Kedua (Kontraktor) */}
        <div className="text-center px-4 flex flex-col justify-between h-44 border border-gray-100 p-2 rounded relative print:border-none print:p-0">
          <div className="absolute left-8 top-10 w-24 h-16 border-2 border-dashed border-sky-400 text-sky-400 text-[9px] font-sans rounded flex flex-col items-center justify-center rotate-[4deg] opacity-75 print:border-black print:text-black">
            <span className="font-bold">METERAI TEMPEL</span>
            <span className="text-[12px] font-black">10000</span>
            <span className="text-[7px]">60B88ANX414177173</span>
          </div>
          
          <div>
            <p className="font-bold uppercase tracking-wider">PIHAK KEDUA</p>
            <p className="font-bold uppercase text-[10px] text-gray-600 print:text-black">{data.kontraktorNama || 'CV. EL EMUNAH'}</p>
          </div>
          <div className="mt-auto z-10 h-16 flex items-end justify-center">
            <p className="font-bold underline uppercase tracking-wider">{data.kontraktorPimpinan || '.............................................'}</p>
          </div>
          <div className="text-[10px] italic">Kepala Perwakilan</div>
        </div>

        {/* Pihak Kesatu (PPK) */}
        <div className="text-center px-4 flex flex-col justify-between h-44">
          <div>
            <p className="font-bold uppercase tracking-wider">PIHAK KESATU</p>
            <p className="font-semibold text-gray-600 uppercase text-[9px] leading-tight print:text-black">
              Pejabat Pembuat Komitmen (PPK) Program Penyelenggaraan Jalan Kegiatan Pembangunan Jalan T.A. {data.tanggalSpj.split('-')[0] || '2026'}
            </p>
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

        {/* Mengetahui (Kepala Dinas) - Spanned to Center bottom */}
        <div className="col-span-2 text-center px-4 flex flex-col justify-between h-44 mt-4 max-w-[400px] mx-auto">
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
      <div className="border-t border-gray-300 pt-3 mt-8 text-[9px] font-sans text-gray-500 grid grid-cols-2 gap-x-4 print:text-black print:border-black">
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
