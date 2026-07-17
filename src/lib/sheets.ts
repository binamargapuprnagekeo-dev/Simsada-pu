/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SPJBundle, Pegawai, Rekening } from '../types';

export interface SpreadsheetInfo {
  spreadsheetId: string;
  name: string;
  webViewLink: string;
}

// Default data templates matching user's uploaded documents exactly
const defaultPegawai: Pegawai[] = [
  {
    id: 'p-1',
    nama: 'FRANSISKUS P.G DADJO, ST,MT',
    nip: '19780325 201001 1 015',
    jabatan: 'Pejabat Pembuat Komitmen (PPK) Program Penyelenggaraan Jalan',
    golongan: '-'
  },
  {
    id: 'p-2',
    nama: 'FLORENTINA WONGA',
    nip: '19780822 200313 2 006',
    jabatan: 'BENDAHARA PENGELUARAN',
    golongan: '-'
  },
  {
    id: 'p-3',
    nama: 'YOHANES SAPA, ST',
    nip: '-',
    jabatan: 'Kepala Perwakilan CV. EL EMUNAH',
    golongan: '-'
  },
  {
    id: 'p-4',
    nama: 'SYARIFUDIN IBRAHIM, ST',
    nip: '19681102 199703 1 008',
    jabatan: 'Kepala Dinas Pekerjaan Umum dan Penataan Ruang Kab. Nagekeo / Pengguna Anggaran',
    golongan: 'Pembina Utama / IV.c'
  },
  {
    id: 'p-5',
    nama: 'ANSELMUS MERE, SE',
    nip: '19740413 200901 1 007',
    jabatan: 'PPTK (Pejabat Pelaksana Teknis Kegiatan)',
    golongan: '-'
  }
];

const defaultRekening: Rekening[] = [
  {
    id: 'r-1',
    kode: '1.03.10.2.01.0053.5.2.04.01.001.0003',
    uraian: 'Belanja Modal Jalan Kabupaten',
    anggaran: 3980000000,
    sisaAnggaran: 3980000000
  }
];

const defaultSPJ: SPJBundle[] = [
  {
    id: 'spj-1',
    noSpj: '53.16/03.0/000097/LS/1.03.0.00.0.00.01.0000/P2/7/2026',
    tanggalSpj: '2026-07-15',
    judulPekerjaan: 'Belanja Jasa Konsultasi Perencanaan Teknis Jalan Kabupaten DAU 2026',
    nilaiKontrak: 99900000,
    terbilang: 'Sembilan Puluh Sembilan Juta Sembilan Ratus Ribu Rupiah',
    
    noKontrak: '620/DPUPR-NGK/PJ.DAU/02/V/2026',
    tglKontrak: '2026-05-04',
    noSpmk: '620/DPUPR-NGK/PJ.DAU/03/V/2026',
    tglSpmk: '2026-05-05',
    noBast: '620/DPUPR-NGK/BAST-PPJ.DAU/05/VI/2026',
    tglBast: '2026-06-29',
    
    kontraktorNama: 'CV. EL EMUNAH',
    kontraktorPimpinan: 'YOHANES SAPA, ST',
    kontraktorAlamat: 'Jln. Pegangsaan II No. 9, Walikota Kupang',
    
    ppkNama: 'FRANSISKUS P.G DADJO, ST,MT',
    ppkNip: '19780325 201001 1 015',
    ppkJabatan: 'Pejabat Pembuat Komitmen (PPK) Program Penyelenggaraan Jalan',
    
    bendaharaNama: 'FLORENTINA WONGA',
    bendaharaNip: '19780822 200313 2 006',
    bendaharaJabatan: 'BENDAHARA PENGELUARAN',
    
    paNama: 'SYARIFUDIN IBRAHIM, ST',
    paNip: '19681102 199703 1 008',
    paGolongan: 'Pembina Utama / IV.c',
    paJabatan: 'Kepala Dinas Pekerjaan Umum dan Penataan Ruang Kab. Nagekeo / Pengguna Anggaran',
    
    pptkNama: 'ANSELMUS MERE, SE',
    pptkNip: '19740413 200901 1 007',
    pptkJabatan: 'PPTK (Pejabat Pelaksana Teknis Kegiatan)',
    
    noNpd: '900/DPUPR-NGK/96/VII/2026',
    tanggalNpd: '2026-07-15',
    jenisNpd: 'NON_PANJAR',
    noDpa: 'DPPA/A.3/1.03.0.00.0.00.01.0000/001/2026',
    
    kodeRekening: '1.03.10.2.01.0053.5.2.04.01.001.0003',
    uraianBelanja: 'Belanja Modal Jalan Kabupaten',
    anggaranTotal: 3980000000,
    anggaranSisa: 3980000000,
    
    pembayaranPersen: 100,
    potonganPph21: 0,
    potonganPph22: 0,
    potonganPph23: 0,
    potonganPpn: 0,
    potonganLain: 0,
    keteranganPotongan: '-',
    
    createdAt: '2026-07-16T20:00:00.000Z',
    updatedAt: '2026-07-16T20:00:00.000Z'
  }
];

// Helper to handle API requests with Authorization header
async function requestGoogleApi(url: string, method: string, accessToken: string, body?: any) {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);
  if (body) {
    headers.append('Content-Type', 'application/json');
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errText = await response.text();
    console.error(`Google API Error (${response.status}):`, errText);
    throw new Error(`Google API request failed: ${response.statusText} (${errText})`);
  }

  return response.json();
}

/**
 * Searches for a spreadsheet named "Sistem SPJ PUPR Nagekeo" in Google Drive.
 */
export const searchSpreadsheet = async (accessToken: string): Promise<SpreadsheetInfo | null> => {
  try {
    const query = encodeURIComponent("name = 'Sistem SPJ PUPR Nagekeo' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`;
    
    const data = await requestGoogleApi(url, 'GET', accessToken);
    if (data.files && data.files.length > 0) {
      return {
        spreadsheetId: data.files[0].id,
        name: data.files[0].name,
        webViewLink: data.files[0].webViewLink,
      };
    }
    return null;
  } catch (error) {
    console.error('Error searching for spreadsheet:', error);
    return null;
  }
};

/**
 * Creates a new spreadsheet named "Sistem SPJ PUPR Nagekeo" with appropriate sheets
 * and seeds it with default data.
 */
export const createSpreadsheet = async (accessToken: string): Promise<SpreadsheetInfo> => {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Sistem SPJ PUPR Nagekeo',
    },
    sheets: [
      { properties: { title: 'Transactions' } },
      { properties: { title: 'Pegawai' } },
      { properties: { title: 'Rekening' } },
    ],
  };

  const data = await requestGoogleApi(url, 'POST', accessToken, body);
  const spreadsheetId = data.spreadsheetId;
  const webViewLink = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Seed sheets with initial data templates immediately
  await seedSpreadsheet(spreadsheetId, accessToken);

  return {
    spreadsheetId,
    name: 'Sistem SPJ PUPR Nagekeo',
    webViewLink,
  };
};

/**
 * Seeds a newly created spreadsheet with templates
 */
const seedSpreadsheet = async (spreadsheetId: string, accessToken: string) => {
  // 1. Seed Pegawai
  await savePegawaiToSheet(spreadsheetId, defaultPegawai, accessToken);
  
  // 2. Seed Rekening
  await saveRekeningToSheet(spreadsheetId, defaultRekening, accessToken);
  
  // 3. Seed Transactions
  await saveTransactionsToSheet(spreadsheetId, defaultSPJ, accessToken);
};

/**
 * Helper to serialize / deserialize objects to/from sheet rows
 */
export const fetchPegawaiFromSheet = async (spreadsheetId: string, accessToken: string): Promise<Pegawai[]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pegawai!A1:Z100`;
  try {
    const data = await requestGoogleApi(url, 'GET', accessToken);
    if (!data.values || data.values.length <= 1) {
      return [];
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows.map((row: any) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] !== undefined ? row[index] : '';
      });
      return {
        id: obj.id || '',
        nama: obj.nama || '',
        nip: obj.nip || '',
        jabatan: obj.jabatan || '',
        golongan: obj.golongan || '',
      };
    });
  } catch (error) {
    console.error('Error fetching Pegawai from Sheet:', error);
    return [];
  }
};

export const savePegawaiToSheet = async (spreadsheetId: string, list: Pegawai[], accessToken: string) => {
  const range = 'Pegawai!A1';
  const headers = ['id', 'nama', 'nip', 'jabatan', 'golongan'];
  const values = [
    headers,
    ...list.map(item => [
      item.id,
      item.nama,
      item.nip,
      item.jabatan,
      item.golongan || '',
    ])
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  // First clear the sheet values to avoid leftover rows
  await requestGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pegawai!A1:Z100:clear`, 'POST', accessToken, {});
  await requestGoogleApi(url, 'PUT', accessToken, { values });
};

export const fetchRekeningFromSheet = async (spreadsheetId: string, accessToken: string): Promise<Rekening[]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekening!A1:Z100`;
  try {
    const data = await requestGoogleApi(url, 'GET', accessToken);
    if (!data.values || data.values.length <= 1) {
      return [];
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows.map((row: any) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] !== undefined ? row[index] : '';
      });
      return {
        id: obj.id || '',
        kode: obj.kode || '',
        uraian: obj.uraian || '',
        anggaran: Number(obj.anggaran) || 0,
        sisaAnggaran: Number(obj.sisaAnggaran) || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching Rekening from Sheet:', error);
    return [];
  }
};

export const saveRekeningToSheet = async (spreadsheetId: string, list: Rekening[], accessToken: string) => {
  const range = 'Rekening!A1';
  const headers = ['id', 'kode', 'uraian', 'anggaran', 'sisaAnggaran'];
  const values = [
    headers,
    ...list.map(item => [
      item.id,
      item.kode,
      item.uraian,
      item.anggaran,
      item.sisaAnggaran,
    ])
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  await requestGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekening!A1:Z100:clear`, 'POST', accessToken, {});
  await requestGoogleApi(url, 'PUT', accessToken, { values });
};

export const fetchTransactionsFromSheet = async (spreadsheetId: string, accessToken: string): Promise<SPJBundle[]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A1:AZ1000`;
  try {
    const data = await requestGoogleApi(url, 'GET', accessToken);
    if (!data.values || data.values.length <= 1) {
      return [];
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows.map((row: any) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] !== undefined ? row[index] : '';
      });
      
      return {
        id: obj.id || '',
        noSpj: obj.noSpj || '',
        tanggalSpj: obj.tanggalSpj || '',
        judulPekerjaan: obj.judulPekerjaan || '',
        nilaiKontrak: Number(obj.nilaiKontrak) || 0,
        terbilang: obj.terbilang || '',
        
        noKontrak: obj.noKontrak || '',
        tglKontrak: obj.tglKontrak || '',
        noSpmk: obj.noSpmk || '',
        tglSpmk: obj.tglSpmk || '',
        noBast: obj.noBast || '',
        tglBast: obj.tglBast || '',
        
        kontraktorNama: obj.kontraktorNama || '',
        kontraktorPimpinan: obj.kontraktorPimpinan || '',
        kontraktorAlamat: obj.kontraktorAlamat || '',
        
        ppkNama: obj.ppkNama || '',
        ppkNip: obj.ppkNip || '',
        ppkJabatan: obj.ppkJabatan || '',
        
        bendaharaNama: obj.bendaharaNama || '',
        bendaharaNip: obj.bendaharaNip || '',
        bendaharaJabatan: obj.bendaharaJabatan || '',
        
        paNama: obj.paNama || '',
        paNip: obj.paNip || '',
        paGolongan: obj.paGolongan || '',
        paJabatan: obj.paJabatan || '',
        
        pptkNama: obj.pptkNama || '',
        pptkNip: obj.pptkNip || '',
        pptkJabatan: obj.pptkJabatan || '',
        
        noNpd: obj.noNpd || '',
        tanggalNpd: obj.tanggalNpd || '',
        jenisNpd: obj.jenisNpd === 'PANJAR' ? 'PANJAR' : 'NON_PANJAR',
        noDpa: obj.noDpa || '',
        
        kodeRekening: obj.kodeRekening || '',
        uraianBelanja: obj.uraianBelanja || '',
        anggaranTotal: Number(obj.anggaranTotal) || 0,
        anggaranSisa: Number(obj.anggaranSisa) || 0,
        
        pembayaranPersen: Number(obj.pembayaranPersen) || 100,
        potonganPph21: Number(obj.potonganPph21) || 0,
        potonganPph22: Number(obj.potonganPph22) || 0,
        potonganPph23: Number(obj.potonganPph23) || 0,
        potonganPpn: Number(obj.potonganPpn) || 0,
        potonganLain: Number(obj.potonganLain) || 0,
        keteranganPotongan: obj.keteranganPotongan || '',
        
        createdAt: obj.createdAt || '',
        updatedAt: obj.updatedAt || '',
      };
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const saveTransactionsToSheet = async (spreadsheetId: string, list: SPJBundle[], accessToken: string) => {
  const range = 'Transactions!A1';
  const headers = [
    'id', 'noSpj', 'tanggalSpj', 'judulPekerjaan', 'nilaiKontrak', 'terbilang',
    'noKontrak', 'tglKontrak', 'noSpmk', 'tglSpmk', 'noBast', 'tglBast',
    'kontraktorNama', 'kontraktorPimpinan', 'kontraktorAlamat',
    'ppkNama', 'ppkNip', 'ppkJabatan',
    'bendaharaNama', 'bendaharaNip', 'bendaharaJabatan',
    'paNama', 'paNip', 'paGolongan', 'paJabatan',
    'pptkNama', 'pptkNip', 'pptkJabatan',
    'noNpd', 'tanggalNpd', 'jenisNpd', 'noDpa',
    'kodeRekening', 'uraianBelanja', 'anggaranTotal', 'anggaranSisa',
    'pembayaranPersen', 'potonganPph21', 'potonganPph22', 'potonganPph23', 'potonganPpn', 'potonganLain', 'keteranganPotongan',
    'createdAt', 'updatedAt'
  ];

  const values = [
    headers,
    ...list.map(item => [
      item.id,
      item.noSpj,
      item.tanggalSpj,
      item.judulPekerjaan,
      item.nilaiKontrak,
      item.terbilang,
      item.noKontrak,
      item.tglKontrak,
      item.noSpmk,
      item.tglSpmk,
      item.noBast,
      item.tglBast,
      item.kontraktorNama,
      item.kontraktorPimpinan,
      item.kontraktorAlamat,
      item.ppkNama,
      item.ppkNip,
      item.ppkJabatan,
      item.bendaharaNama,
      item.bendaharaNip,
      item.bendaharaJabatan,
      item.paNama,
      item.paNip,
      item.paGolongan,
      item.paJabatan,
      item.pptkNama,
      item.pptkNip,
      item.pptkJabatan,
      item.noNpd,
      item.tanggalNpd,
      item.jenisNpd,
      item.noDpa,
      item.kodeRekening,
      item.uraianBelanja,
      item.anggaranTotal,
      item.anggaranSisa,
      item.pembayaranPersen,
      item.potonganPph21,
      item.potonganPph22,
      item.potonganPph23,
      item.potonganPpn,
      item.potonganLain,
      item.keteranganPotongan || '-',
      item.createdAt,
      item.updatedAt
    ])
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  await requestGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A1:AZ1000:clear`, 'POST', accessToken, {});
  await requestGoogleApi(url, 'PUT', accessToken, { values });
};
