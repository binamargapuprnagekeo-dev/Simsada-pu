/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  golongan?: string;
}

export interface Rekening {
  id: string;
  kode: string;
  uraian: string;
  anggaran: number;
  sisaAnggaran: number;
}

export interface SPJBundle {
  id: string;
  noSpj: string; // e.g. 53.16/03.0/000097/LS/1.03.0.00.0.00.01.0000/P2/7/2026
  tanggalSpj: string; // e.g. 2026-07-15
  judulPekerjaan: string; // e.g. Belanja Jasa Konsultasi Perencanaan Teknis Jalan Kabupaten DAU 2026
  nilaiKontrak: number; // e.g. 99900000
  terbilang: string; // e.g. Sembilan Puluh Sembilan Juta Sembilan Ratus Ribu Rupiah
  
  // Kontrak & Dates
  noKontrak: string;
  tglKontrak: string;
  noSpmk: string;
  tglSpmk: string;
  noBast: string;
  tglBast: string;
  
  // Kontraktor
  kontraktorNama: string; // e.g. CV. EL EMUNAH
  kontraktorPimpinan: string; // e.g. YOHANES SAPA, ST
  kontraktorAlamat: string; // e.g. Jln. Pegangsaan II No. 9, Walikota Kupang
  
  // Pegawai / Signatures
  ppkNama: string;
  ppkNip: string;
  ppkJabatan: string;
  
  bendaharaNama: string;
  bendaharaNip: string;
  bendaharaJabatan: string;
  
  paNama: string;
  paNip: string;
  paGolongan: string;
  paJabatan: string;
  
  pptkNama: string;
  pptkNip: string;
  pptkJabatan: string;
  
  // NPD details
  noNpd: string; // e.g. 900/DPUPR-NGK/96/VII/2026
  tanggalNpd: string;
  jenisNpd: 'PANJAR' | 'NON_PANJAR';
  noDpa: string; // e.g. DPPA/A.3/1.03.0.00.0.00.01.0000/001/2026
  
  // Rekening / Anggaran
  kodeRekening: string;
  uraianBelanja: string;
  anggaranTotal: number;
  anggaranSisa: number; // sisa anggaran terakhir sebelum pencairan saat ini
  
  // Pembayaran & Potongan
  pembayaranPersen: number; // e.g. 100
  potonganPph21: number;
  potonganPph22: number;
  potonganPph23: number;
  potonganPpn: number;
  potonganLain: number;
  keteranganPotongan: string;
  
  // Meta
  createdAt: string;
  updatedAt: string;
}
