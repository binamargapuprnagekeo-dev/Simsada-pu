/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, setCachedAccessToken } from './lib/firebase';
import {
  searchSpreadsheet,
  createSpreadsheet,
  fetchPegawaiFromSheet,
  savePegawaiToSheet,
  fetchRekeningFromSheet,
  saveRekeningToSheet,
  fetchTransactionsFromSheet,
  saveTransactionsToSheet,
  fetchArchivedFromSheet,
  saveArchivedToSheet,
  SpreadsheetInfo
} from './lib/sheets';
import { SPJBundle, Pegawai, Rekening } from './types';
import { KwitansiView } from './components/KwitansiView';
import { BapView } from './components/BapView';
import { NpdView } from './components/NpdView';
import { SpjForm } from './components/SpjForm';
import { PegawaiMaster } from './components/PegawaiMaster';
import { RekeningMaster } from './components/RekeningMaster';
import { DashboardCharts } from './components/DashboardCharts';
import { DigitalSignatureList } from './components/DigitalSignatureList';
import firebaseConfig from '../firebase-applet-config.json';
import { formatRupiah, formatTanggalIndo } from './lib/utils';
import { generateDocHash, encryptToken, decryptToken } from './lib/signature';
import {
  FileText,
  RefreshCw,
  Search,
  LogOut,
  Layers,
  Printer,
  FilePlus2,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Archive,
  FolderDown,
  FolderUp,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<{ code: string; message: string } | null>(null);

  // Sheets state
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetInfo | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'searching' | 'loading' | 'saving' | 'synced' | 'error'>('idle');
  const [syncErrorMsg, setSyncErrorMsg] = useState<string>('');

  // Application Data lists
  const [spjList, setSpjList] = useState<SPJBundle[]>([]);
  const [archivedList, setArchivedList] = useState<SPJBundle[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [rekeningList, setRekeningList] = useState<Rekening[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'spj' | 'pegawai' | 'rekening' | 'arsip' | 'signatures'>('spj');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpj, setEditingSpj] = useState<SPJBundle | null>(null);
  const [previewSpj, setPreviewSpj] = useState<SPJBundle | null>(null);
  const [previewDocType, setPreviewDocType] = useState<'kwitansi' | 'bap' | 'npd'>('kwitansi');
  const [previewSignatureType, setPreviewSignatureType] = useState<'manual' | 'digital'>('manual');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Automatically update preview signature type based on document choice
  useEffect(() => {
    if (previewSpj) {
      setPreviewSignatureType(previewSpj.signatureType || 'manual');
    }
  }, [previewSpj]);

  // Setup Auth state listener on mount
  useEffect(() => {
    initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
        // Automatically search and load spreadsheet data
        handleDatabaseInit(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
  }, []);

  // Handle manual Google login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
        handleDatabaseInit(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      const code = err?.code || 'unknown';
      let message = 'Terjadi kesalahan saat masuk dengan Google. Silakan coba lagi.';
      
      if (code === 'auth/unauthorized-domain') {
        message = 'Domain ini belum diotorisasi untuk login di project Firebase Anda.';
      } else if (code === 'auth/popup-blocked') {
        message = 'Popup diblokir oleh browser Anda. Harap izinkan popup untuk situs ini.';
      } else if (code === 'auth/popup-closed-by-user') {
        message = 'Proses masuk dibatalkan karena popup ditutup oleh pengguna.';
      } else if (code === 'auth/cancelled-popup-request') {
        message = 'Permintaan popup masuk dibatalkan.';
      } else if (err?.message) {
        message = err.message;
      }
      
      setLoginError({ code, message });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      await logout();
      setSpreadsheet(null);
      setSpjList([]);
      setPegawaiList([]);
      setRekeningList([]);
      setNeedsAuth(true);
    }
  };

  // Helper to parse Google API errors
  const parseGoogleError = (error: any, defaultMsg: string): string => {
    const msg = error?.message || '';
    if (msg.includes('API_DISABLED') || msg.toLowerCase().includes('disabled') || msg.toLowerCase().includes('has not been used in project')) {
      return `API Google Sheets atau Google Drive belum diaktifkan di Google Cloud Project Firebase Anda (${firebaseConfig.projectId}). Silakan aktifkan kedua API tersebut di Google Cloud Console agar aplikasi dapat mencari dan membuat file spreadsheet di Drive Anda.`;
    }
    return `${defaultMsg} Detail error: ${msg}`;
  };

  // Search for an existing Google Sheet or trigger creation
  const handleDatabaseInit = async (accessToken: string) => {
    setSyncStatus('searching');
    try {
      const foundSheet = await searchSpreadsheet(accessToken);
      if (foundSheet) {
        setSpreadsheet(foundSheet);
        await loadAllData(foundSheet.spreadsheetId, accessToken);
      } else {
        // No spreadsheet found, we will prompt user to create one
        setSyncStatus('idle');
      }
    } catch (error: any) {
      console.error('Database initialization error:', error);
      setSyncStatus('error');
      setSyncErrorMsg(parseGoogleError(error, 'Gagal mencari database Google Sheets. Silakan coba masuk kembali.'));
    }
  };

  // Create a brand new database in Google Drive
  const handleCreateDatabase = async () => {
    if (!token) return;
    setSyncStatus('loading');
    try {
      const newSheet = await createSpreadsheet(token);
      setSpreadsheet(newSheet);
      await loadAllData(newSheet.spreadsheetId, token);
    } catch (error: any) {
      console.error('Error creating database:', error);
      setSyncStatus('error');
      setSyncErrorMsg(parseGoogleError(error, 'Gagal membuat spreadsheet baru di Drive Anda.'));
    }
  };

  // Load all tables from Google Sheets
  const loadAllData = async (spreadsheetId: string, accessToken: string) => {
    setSyncStatus('loading');
    try {
      const [txs, staff, budget, archivedTxs] = await Promise.all([
        fetchTransactionsFromSheet(spreadsheetId, accessToken),
        fetchPegawaiFromSheet(spreadsheetId, accessToken),
        fetchRekeningFromSheet(spreadsheetId, accessToken),
        fetchArchivedFromSheet(spreadsheetId, accessToken)
      ]);
      
      setSpjList(txs);
      setPegawaiList(staff);
      setRekeningList(budget);
      setArchivedList(archivedTxs);
      setSyncStatus('synced');
    } catch (error: any) {
      console.error('Error loading data:', error);
      setSyncStatus('error');
      setSyncErrorMsg(parseGoogleError(error, 'Gagal mengunduh data dari Google Sheets Anda.'));
    }
  };

  // Trigger manual synchronization / refresh
  const handleRefresh = async () => {
    if (!token || !spreadsheet) return;
    await loadAllData(spreadsheet.spreadsheetId, token);
  };

  // Save changes to Google Sheets
  const saveAllDataToSheet = async (
    updatedTxs: SPJBundle[],
    updatedStaff: Pegawai[],
    updatedBudget: Rekening[],
    updatedArchived: SPJBundle[] = archivedList
  ) => {
    if (!token || !spreadsheet) {
      // Local mode fallback
      return;
    }

    setSyncStatus('saving');
    try {
      await Promise.all([
        saveTransactionsToSheet(spreadsheet.spreadsheetId, updatedTxs, token),
        savePegawaiToSheet(spreadsheet.spreadsheetId, updatedStaff, token),
        saveRekeningToSheet(spreadsheet.spreadsheetId, updatedBudget, token),
        saveArchivedToSheet(spreadsheet.spreadsheetId, updatedArchived, token)
      ]);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error syncing to sheet:', error);
      setSyncStatus('error');
      setSyncErrorMsg('Gagal menyimpan perubahan ke Google Sheet Anda.');
    }
  };

  // SPJ Operations
  const handleSaveSpj = async (newSpj: SPJBundle) => {
    let updatedList;
    let updatedArchived = archivedList;
    
    if (newSpj.isArchived) {
      updatedArchived = archivedList.map(item => item.id === newSpj.id ? newSpj : item);
      updatedList = spjList;
    } else {
      if (spjList.some(item => item.id === newSpj.id)) {
        updatedList = spjList.map(item => item.id === newSpj.id ? newSpj : item);
      } else {
        updatedList = [newSpj, ...spjList];
      }
    }
    
    // Dynamically adjust Sisa Anggaran in Rekening when NPD is processed
    const updatedRekening = rekeningList.map(rek => {
      if (rek.kode === newSpj.kodeRekening) {
        // Recalculate based on current transaction
        const otherActiveTxsTotal = updatedList
          .filter(t => t.id !== newSpj.id && t.kodeRekening === rek.kode)
          .reduce((sum, t) => sum + t.nilaiKontrak, 0);
        const otherArchivedTxsTotal = updatedArchived
          .filter(t => t.id !== newSpj.id && t.kodeRekening === rek.kode)
          .reduce((sum, t) => sum + t.nilaiKontrak, 0);
          
        return {
          ...rek,
          sisaAnggaran: rek.anggaran - otherActiveTxsTotal - otherArchivedTxsTotal - newSpj.nilaiKontrak
        };
      }
      return rek;
    });

    setSpjList(updatedList);
    setArchivedList(updatedArchived);
    setRekeningList(updatedRekening);
    setIsFormOpen(false);
    setEditingSpj(null);

    // Sync to Google Sheets
    await saveAllDataToSheet(updatedList, pegawaiList, updatedRekening, updatedArchived);
  };

  const handleArchiveSpj = async (id: string) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin mengarsipkan Berkas SPJ ini? Berkas akan dipindahkan ke tab Arsip untuk menjaga sistem utama tetap cepat.');
    if (!confirmed) return;

    const targetSpj = spjList.find(t => t.id === id);
    if (!targetSpj) return;

    const updatedSpj = { ...targetSpj, isArchived: true };
    const nextSpjList = spjList.filter(item => item.id !== id);
    const nextArchivedList = [updatedSpj, ...archivedList];

    setSpjList(nextSpjList);
    setArchivedList(nextArchivedList);
    
    await saveAllDataToSheet(nextSpjList, pegawaiList, rekeningList, nextArchivedList);
  };

  const handleRestoreSpj = async (id: string) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin memulihkan Berkas SPJ ini ke daftar aktif?');
    if (!confirmed) return;

    const targetSpj = archivedList.find(t => t.id === id);
    if (!targetSpj) return;

    const updatedSpj = { ...targetSpj, isArchived: false };
    const nextArchivedList = archivedList.filter(item => item.id !== id);
    const nextSpjList = [updatedSpj, ...spjList];

    setSpjList(nextSpjList);
    setArchivedList(nextArchivedList);
    
    await saveAllDataToSheet(nextSpjList, pegawaiList, rekeningList, nextArchivedList);
  };

  const handleDeleteSpj = async (id: string, isFromArchive: boolean = false) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus Berkas SPJ ini? Tindakan ini akan menghapus Kuitansi, BAP, dan NPD sekaligus secara permanen.');
    if (!confirmed) return;

    let targetSpj = spjList.find(t => t.id === id);
    let nextSpjList = spjList.filter(item => item.id !== id);
    let nextArchivedList = archivedList;

    if (isFromArchive) {
      targetSpj = archivedList.find(t => t.id === id);
      nextArchivedList = archivedList.filter(item => item.id !== id);
      nextSpjList = spjList;
    }
    
    // Restore budget back to sisa anggaran
    let updatedRekening = rekeningList;
    if (targetSpj) {
      updatedRekening = rekeningList.map(rek => {
        if (rek.kode === targetSpj.kodeRekening) {
          return {
            ...rek,
            sisaAnggaran: rek.sisaAnggaran + targetSpj.nilaiKontrak
          };
        }
        return rek;
      });
    }

    setSpjList(nextSpjList);
    setArchivedList(nextArchivedList);
    setRekeningList(updatedRekening);
    await saveAllDataToSheet(nextSpjList, pegawaiList, updatedRekening, nextArchivedList);
  };

  const handleUnsignSpj = async (id: string) => {
    const spj = spjList.find(s => s.id === id) || archivedList.find(s => s.id === id);
    if (!spj) return;
    
    const updated = {
      ...spj,
      signatureType: 'manual',
      leaderToken: '',
      digitalSignatureHash: ''
    } as SPJBundle;

    if (previewSpj && previewSpj.id === id) {
      setPreviewSpj(updated);
    }

    await handleSaveSpj(updated);
  };

  // Pegawai Operations
  const handleSavePegawai = async (staff: Pegawai) => {
    let updatedList;
    if (pegawaiList.some(p => p.id === staff.id)) {
      updatedList = pegawaiList.map(p => p.id === staff.id ? staff : p);
    } else {
      updatedList = [...pegawaiList, staff];
    }
    setPegawaiList(updatedList);
    await saveAllDataToSheet(spjList, updatedList, rekeningList);
  };

  const handleDeletePegawai = async (id: string) => {
    const updatedList = pegawaiList.filter(p => p.id !== id);
    setPegawaiList(updatedList);
    await saveAllDataToSheet(spjList, updatedList, rekeningList);
  };

  // Rekening Operations
  const handleSaveRekening = async (rek: Rekening) => {
    let updatedList;
    if (rekeningList.some(r => r.id === rek.id)) {
      updatedList = rekeningList.map(r => r.id === rek.id ? rek : r);
    } else {
      updatedList = [...rekeningList, rek];
    }
    setRekeningList(updatedList);
    await saveAllDataToSheet(spjList, pegawaiList, updatedList);
  };

  const handleDeleteRekening = async (id: string) => {
    const updatedList = rekeningList.filter(r => r.id !== id);
    setRekeningList(updatedList);
    await saveAllDataToSheet(spjList, pegawaiList, updatedList);
  };

  // Search Filter
  const filteredSpj = spjList.filter(item =>
    item.judulPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.noSpj.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kontraktorNama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchived = archivedList.filter(item =>
    item.judulPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.noSpj.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kontraktorNama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Total Calculations for Dashboard Widgets
  const totalAnggaranDpa = rekeningList.reduce((sum, r) => sum + r.anggaran, 0);
  const totalRealisasiActive = spjList.reduce((sum, s) => sum + s.nilaiKontrak, 0);
  const totalRealisasiArchived = archivedList.reduce((sum, s) => sum + s.nilaiKontrak, 0);
  const totalRealisasi = totalRealisasiActive + totalRealisasiArchived;
  const totalSisaSaldo = totalAnggaranDpa - totalRealisasi;

  // LANDING PAGE (NEEDS AUTH)
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        {/* Top Navbar */}
        <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm tracking-widest shadow-sm">
                PUPR
              </div>
              <div>
                <span className="font-display font-bold text-slate-800 text-sm tracking-wide">SISTEM SPJ</span>
                <span className="text-[10px] text-slate-400 block font-bold leading-none uppercase tracking-wider">KABUPATEN NAGEKEO</span>
              </div>
            </div>
            <div className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-600 font-semibold border border-slate-200/50">
              V.2026.1
            </div>
          </div>
        </header>

        {/* Hero Landing */}
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Terkoneksi Google Sheets Akun Dinas Anda
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Kelola Berkas SPJ PUPR <br />
              <span className="text-indigo-600">Lebih Cepat & Otomatis</span>
            </h1>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
              Platform modern khusus Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Nagekeo untuk mengenerate dokumen <span className="font-bold">Kuitansi</span>, <span className="font-bold">BAP (Berita Acara Pembayaran)</span>, dan <span className="font-bold">NPD</span> secara simultan hanya dengan satu kali input data.
            </p>

            <div className="space-y-3.5 border-l-2 border-indigo-500 pl-4 py-1 text-slate-600 text-xs font-medium">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                <span>Input data 1 kali, otomatis mengisi 3 dokumen SPJ sekaligus.</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pencetakan dokumen rapi dan presisi sesuai format fisik.</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tersinkronisasi otomatis dengan Google Spreadsheet dinas Anda.</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="pt-4">
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button w-full sm:w-auto inline-flex items-center justify-center bg-white border border-slate-300 hover:border-slate-400 text-slate-700 px-6 py-3 rounded-xl shadow-sm hover:shadow-md font-semibold transition cursor-pointer"
              >
                <div className="gsi-material-button-content-wrapper flex items-center gap-3">
                  <div className="gsi-material-button-icon w-5 h-5">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-sans text-sm">
                    {isLoggingIn ? 'Menghubungkan Akun...' : 'Masuk dengan Google (Akun Dinas)'}
                  </span>
                </div>
              </button>
              <p className="text-[10px] text-slate-400 mt-2.5 max-w-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-300" /> Menggunakan OAuth Google API Resmi. Data terjamin aman dan disimpan langsung di Google Drive Anda.
              </p>

              {/* Login Error & Solution Box */}
              {loginError && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 text-xs max-w-xl text-left animate-fade-in">
                  <div className="flex items-start gap-2.5 text-rose-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Gagal Menghubungkan Google Drive</p>
                      <p className="mt-0.5 leading-relaxed text-rose-700">{loginError.message}</p>
                    </div>
                  </div>

                  {loginError.code === 'auth/unauthorized-domain' && (
                    <div className="pt-3 border-t border-rose-200/50 space-y-2.5 text-slate-600 font-medium">
                      <p className="font-bold text-slate-800 text-[11px]">Cara Mengatasi di Firebase & Google Console Anda:</p>
                      <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed text-[11px]">
                        <li>
                          Buka <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a>
                        </li>
                        <li>
                          Pilih project Anda: <span className="font-mono bg-slate-150 px-1 py-0.5 rounded font-bold text-slate-800">{firebaseConfig.projectId}</span> (atau project Firebase aktif Anda)
                        </li>
                        <li>
                          Masuk ke menu <span className="font-bold text-slate-700">Authentication</span> &gt; tab <span className="font-bold text-slate-700">Settings</span> &gt; klik <span className="font-bold text-slate-700">Authorized domains</span> (Domain yang diotorisasi)
                        </li>
                        <li>
                          Klik tombol <span className="font-bold text-slate-800">"Add domain"</span> lalu masukkan domain tempat Anda mendeploy saat ini:
                          <span className="block mt-1 font-mono bg-white border border-slate-200 px-2.5 py-1 rounded text-indigo-700 font-bold text-xs select-all w-fit">
                            {window.location.hostname}
                          </span>
                        </li>
                        <li>
                          Selanjutnya, buka <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5">Google Cloud Credentials <ExternalLink className="w-3 h-3" /></a>
                        </li>
                        <li>
                          Cari Client ID OAuth 2.0 milik Anda, edit, lalu tambahkan:
                          <div className="mt-1 space-y-1 pl-4 text-[10px]">
                            <p>• <span className="font-semibold text-slate-700">Authorized JavaScript origins:</span> <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-indigo-600 font-bold font-mono">{window.location.origin}</code></p>
                            <p>• <span className="font-semibold text-slate-700">Authorized redirect URIs:</span> <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-indigo-600 font-bold font-mono">{window.location.origin}</code></p>
                          </div>
                        </li>
                      </ol>
                      <p className="text-[10px] text-slate-400 italic mt-1.5 leading-normal">
                        * Setelah kedua langkah di atas selesai disimpan, silakan segarkan halaman ini dan klik tombol login kembali.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Visual Document Previews on Right */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-sm bg-white border border-slate-200/60 shadow-xl rounded-2xl p-6 rotate-[-2deg] space-y-4 relative z-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono">DOKUMEN KWITANSI</span>
                <span className="text-xs font-mono text-slate-400">#53.16/03.0/...</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-1/3 bg-slate-200 rounded"></div>
                <div className="h-5 w-full bg-slate-100 rounded"></div>
                <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-xs font-bold font-sans text-slate-700">Rp. 99.900.000</span>
                <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider flex items-center gap-1">Lunas ✔</span>
              </div>
            </div>

            <div className="absolute w-full max-w-sm bg-white border border-slate-200/50 shadow-lg rounded-2xl p-6 rotate-[3deg] space-y-4 z-10 translate-y-8 translate-x-4 opacity-80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold font-mono">BERITA ACARA PEMBAYARAN</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                <div className="h-3 w-full bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer info */}
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-slate-400 text-xs">
          © 2026 Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) Kabupaten Nagekeo. All Rights Reserved.
        </footer>
      </div>
    );
  }

  // MAIN DASHBOARD (AUTHENTICATED)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 relative">
      
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs tracking-widest shadow-sm">
            PUPR
          </div>
          <div>
            <h1 className="font-display font-extrabold text-slate-800 text-xs tracking-wide leading-none">
              Sistem SPJ
            </h1>
            <span className="text-[8px] text-slate-400 block font-bold leading-none uppercase tracking-wider mt-0.5">
              KAB. NAGEKEO
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer animate-none"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col print:hidden flex-shrink-0 z-50 transform md:transform-none transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo & Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm tracking-widest shadow-md">
              PUPR
            </div>
            <div>
              <h1 className="font-display font-extrabold text-slate-800 text-sm tracking-wide leading-none">
                Sistem SPJ
              </h1>
              <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase tracking-wider mt-1">
                KAB. NAGEKEO
              </span>
            </div>
          </div>
          {/* Close Button inside Sidebar on Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 md:hidden transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Layanan Dinas
          </div>
          
          <button
            onClick={() => {
              setActiveTab('spj');
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition text-left cursor-pointer ${
              activeTab === 'spj' && !isFormOpen
                ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            Berkas SPJ Dokumen
          </button>

          <button
            onClick={() => {
              setActiveTab('pegawai');
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition text-left cursor-pointer ${
              activeTab === 'pegawai' && !isFormOpen
                ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-500" />
            Master Pejabat
          </button>

          <button
            onClick={() => {
              setActiveTab('rekening');
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition text-left cursor-pointer ${
              activeTab === 'rekening' && !isFormOpen
                ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Master Rekening DPA
          </button>

          <button
            onClick={() => {
              setActiveTab('arsip');
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition text-left cursor-pointer ${
              activeTab === 'arsip' && !isFormOpen
                ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Archive className="w-4 h-4 text-indigo-500" />
            Arsip SPJ (Dokumen Lama)
          </button>

          <button
            onClick={() => {
              setActiveTab('signatures');
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition text-left cursor-pointer ${
              activeTab === 'signatures' && !isFormOpen
                ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Otorisasi E-Sign (Tanda Tangan)
          </button>

          <div className="pt-4 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Integrasi
          </div>
          
          {spreadsheet ? (
            <a
              href={spreadsheet.webViewLink}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium text-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Google Sheets Sync
            </a>
          ) : (
            <span className="flex items-center gap-3 px-3 py-2.5 text-slate-400 rounded-xl font-medium text-xs">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              Belum Terkoneksi
            </span>
          )}
        </nav>

        {/* User Profile Card in Sidebar */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'PU'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.displayName || 'Dinas PUPR'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between print:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            {spreadsheet ? (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Tersinkronisasi
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-850 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Menunggu Koneksi
              </span>
            )}
            <span className="text-xs text-slate-400 hidden sm:inline">Database: Google Sheets</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Status Action Button */}
            {spreadsheet && (
              <button
                onClick={handleRefresh}
                disabled={syncStatus === 'loading' || syncStatus === 'saving'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer ${
                  syncStatus === 'loading' || syncStatus === 'saving' ? 'animate-pulse' : ''
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${syncStatus === 'loading' || syncStatus === 'saving' ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">
                  {syncStatus === 'synced' && 'Segarkan Data'}
                  {syncStatus === 'loading' && 'Mengunduh...'}
                  {syncStatus === 'saving' && 'Menyimpan...'}
                  {syncStatus === 'error' && 'Gagal Sinkron'}
                </span>
              </button>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 rounded-xl text-slate-500 transition cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 print:p-0 print:m-0">
          
          {/* Sync Error Banner */}
          {syncStatus === 'error' && syncErrorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl mb-6 text-xs flex items-start gap-2.5 relative animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-sm">Gagal Sinkronisasi Google Sheets</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed font-medium">{syncErrorMsg}</p>
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                  Kemungkinan besar token akses Google Anda telah kedaluwarsa atau belum memiliki izin akses Google Drive/Sheets yang memadai. Silakan keluar (logout) menggunakan tombol ikon pintu di kanan atas, lalu masuk kembali dengan memberikan izin penuh saat login Google.
                </p>
              </div>
              <button 
                onClick={() => setSyncStatus('idle')} 
                className="absolute top-4 right-4 text-rose-450 hover:text-rose-650 font-bold transition cursor-pointer text-sm"
                title="Sembunyikan"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* If database is missing, show a beautiful prompt to initialize it */}
          {!spreadsheet && syncStatus !== 'searching' && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12 space-y-5 shadow-sm">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-md">
                📂
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 font-display">Inisialisasi Database Google Sheets</h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                  Aplikasi belum mendeteksi file spreadsheet khusus <span className="font-bold">"Sistem SPJ PUPR Nagekeo"</span> di Google Drive akun Anda. Klik tombol di bawah ini untuk membuat database secara otomatis di Google Drive Anda.
                </p>
              </div>
              <button
                onClick={handleCreateDatabase}
                disabled={syncStatus === 'loading'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition inline-flex items-center gap-2 cursor-pointer"
              >
                {syncStatus === 'loading' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Membuat Spreadsheet & Menyemai Data Contoh...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Buat Database di Google Drive Saya
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400">Database akan otomatis disemai dengan 5 Pejabat Dinas PUPR, 1 Rekening Belanja Utama, dan 1 Berkas Transaksi Contoh agar Anda bisa langsung mencoba cetak dokumen.</p>
            </div>
          )}

          {/* Dashboard Content (Visible only after Spreadsheet has been established) */}
          {spreadsheet && (
            <div className="space-y-6 print:hidden">
              
              {/* Form Mode View */}
              {isFormOpen ? (
                <SpjForm
                  initialData={editingSpj}
                  pegawaiList={pegawaiList}
                  rekeningList={rekeningList}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingSpj(null);
                  }}
                  onSave={handleSaveSpj}
                />
              ) : (
                <>
                  {/* Bento Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Bento Card 1: Total Berkas */}
                    <div className="md:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Berkas SPJ Diproses</span>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-extrabold text-slate-900">{spjList.length}</span>
                          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md">Aktif</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 border-l border-slate-150 pl-4">
                          <span className="text-2xl font-bold text-slate-500">{archivedList.length}</span>
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md">Arsip</span>
                        </div>
                      </div>
                    </div>

                    {/* Bento Card 2: Total Realisasi */}
                    <div className="md:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Realisasi Belanja</span>
                      <div className="flex items-baseline gap-2 mt-4 overflow-hidden">
                        <span className="text-xl font-black text-slate-900 truncate" title={formatRupiah(totalRealisasi, true, false)}>
                          {formatRupiah(totalRealisasi, true, false)}
                        </span>
                      </div>
                    </div>

                    {/* Bento Card 3: Google Sheets Sync Banner (Matches Design HTML bg-indigo-900) */}
                    <div className="md:col-span-6 bg-indigo-950 p-6 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md relative overflow-hidden">
                      {/* Background decor blur */}
                      <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-32 h-32 bg-indigo-800/20 rounded-full blur-2xl"></div>
                      
                      <div className="space-y-1 relative z-10">
                        <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5 text-indigo-100">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          Status Sinkronisasi Sheet
                        </h3>
                        <p className="text-xs text-indigo-200 max-w-xs truncate" title={spreadsheet.spreadsheetId}>
                          ID: {spreadsheet.spreadsheetId}
                        </p>
                        <p className="text-[10px] text-indigo-300 font-medium">
                          Pagu DPA: {formatRupiah(totalAnggaranDpa, true, false)} | Sisa Saldo: {formatRupiah(totalSisaSaldo, true, false)}
                        </p>
                      </div>

                      <div className="flex gap-2 relative z-10 w-full sm:w-auto flex-shrink-0">
                        <a
                          href={spreadsheet.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 sm:flex-initial text-center px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 text-white border border-white/10 cursor-pointer"
                        >
                          Buka Sheet <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={handleRefresh}
                          disabled={syncStatus === 'loading' || syncStatus === 'saving'}
                          className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 text-white shadow-sm cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncStatus === 'loading' || syncStatus === 'saving' ? 'animate-spin' : ''}`} />
                          Refresh
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Visual Charts Section */}
                  <DashboardCharts
                    spjList={spjList}
                    archivedList={archivedList}
                    rekeningList={rekeningList}
                  />

                  {/* Main Data Container matching Bento Grid Layout */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    
                    {/* Tab Content Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
                      <div>
                        <h2 className="font-bold text-slate-800 text-sm tracking-tight font-display flex items-center gap-1.5">
                          {activeTab === 'spj' && <>Data Berkas SPJ Terintegrasi</>}
                          {activeTab === 'pegawai' && <>Data Master Pejabat & Pegawai</>}
                          {activeTab === 'rekening' && <>Data Master Rekening & Anggaran</>}
                          {activeTab === 'arsip' && <>Arsip Berkas SPJ (Dokumen Lama)</>}
                          {activeTab === 'signatures' && <>Daftar Otorisasi Tanda Tangan Digital</>}
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {activeTab === 'spj' && 'Kelola draf kuitansi, BAP, dan dokumen NPD PUPR.'}
                          {activeTab === 'pegawai' && 'Kelola daftar pejabat resmi untuk tanda tangan otomatis.'}
                          {activeTab === 'rekening' && 'Pagu anggaran sub kegiatan belanja DPA dinas.'}
                          {activeTab === 'arsip' && 'Lihat dan pulihkan dokumen lama yang telah diarsipkan.'}
                          {activeTab === 'signatures' && 'Kelola dan dekripsi token tanda tangan digital pimpinan.'}
                        </p>
                      </div>
                      
                      {/* Inner actions depending on active Tab */}
                      {(activeTab === 'spj' || activeTab === 'arsip') && (
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Search */}
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <Search className="w-3.5 h-3.5 text-slate-400" />
                            </span>
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              placeholder="Cari SPJ, rekanan..."
                              className="bg-white hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl pl-8 pr-3 py-1.5 text-[11px] focus:outline-none transition font-medium w-48"
                            />
                          </div>

                          {activeTab === 'spj' && (
                            <button
                              onClick={() => {
                                setEditingSpj(null);
                                setIsFormOpen(true);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-[11px] font-bold shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <FilePlus2 className="w-3.5 h-3.5" /> + Berkas SPJ
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rendering children tabs inside the beautiful Bento container */}
                    <div className="overflow-hidden">
                      {activeTab === 'spj' && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                                <th className="px-6 py-3.5">Judul Pekerjaan & No SPJ</th>
                                <th className="px-6 py-3.5">Kontraktor / Penyedia</th>
                                <th className="px-6 py-3.5">Kode Rekening</th>
                                <th className="px-6 py-3.5 text-right">Nilai Kontrak</th>
                                <th className="px-6 py-3.5 text-right">Aksi Dokumen</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {filteredSpj.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Tidak ditemukan Berkas SPJ. Klik tombol "+ Berkas SPJ" di atas.</td>
                                </tr>
                              ) : (
                                filteredSpj.map(item => (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-6 py-4 max-w-sm">
                                      <div className="font-bold text-slate-900 leading-normal">{item.judulPekerjaan}</div>
                                      <div className="font-mono text-[10px] text-slate-400 mt-1 tracking-tight">SPJ: {item.noSpj || '-'}</div>
                                      <div className="text-[10px] text-slate-500 mt-0.5">Tanggal: {formatTanggalIndo(item.tanggalSpj)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="font-bold text-slate-800 uppercase">{item.kontraktorNama}</div>
                                      <div className="text-slate-500 mt-0.5">{item.kontraktorPimpinan}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100/50 text-[10px] font-semibold">{item.kodeRekening}</span>
                                      <div className="text-slate-500 text-[10px] mt-1 max-w-[150px] truncate">{item.uraianBelanja}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-extrabold text-slate-900 text-sm">
                                      {formatRupiah(item.nilaiKontrak, true, false)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="inline-flex items-center gap-1.5 justify-end">
                                        <button
                                          onClick={() => {
                                            setPreviewSpj(item);
                                            setPreviewDocType('kwitansi');
                                          }}
                                          className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                                          title="Preview & Cetak"
                                        >
                                          <Printer className="w-3.5 h-3.5" /> Cetak & Preview
                                        </button>
                                        
                                        <button
                                          onClick={() => {
                                            setEditingSpj(item);
                                            setIsFormOpen(true);
                                          }}
                                          className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition cursor-pointer"
                                          title="Edit Data"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleArchiveSpj(item.id)}
                                          className="p-1.5 border border-slate-200 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-xl transition cursor-pointer"
                                          title="Arsipkan Berkas"
                                        >
                                          <FolderDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSpj(item.id)}
                                          className="p-1.5 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition cursor-pointer"
                                          title="Hapus"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activeTab === 'arsip' && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                                <th className="px-6 py-3.5">Judul Pekerjaan & No SPJ</th>
                                <th className="px-6 py-3.5">Kontraktor / Penyedia</th>
                                <th className="px-6 py-3.5">Kode Rekening</th>
                                <th className="px-6 py-3.5 text-right">Nilai Kontrak</th>
                                <th className="px-6 py-3.5 text-right">Aksi Dokumen</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {filteredArchived.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Tidak ditemukan Berkas SPJ dalam arsip.</td>
                                </tr>
                              ) : (
                                filteredArchived.map(item => (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-6 py-4 max-w-sm">
                                      <div className="font-bold text-slate-900 leading-normal">{item.judulPekerjaan}</div>
                                      <div className="font-mono text-[10px] text-slate-400 mt-1 tracking-tight">SPJ: {item.noSpj || '-'}</div>
                                      <div className="text-[10px] text-slate-500 mt-0.5">Tanggal: {formatTanggalIndo(item.tanggalSpj)}</div>
                                      <span className="inline-flex items-center gap-1 mt-1.5 bg-amber-50 text-amber-700 text-[9px] px-2 py-0.5 border border-amber-200/50 rounded-full font-bold">
                                        📁 Terarsipkan
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="font-bold text-slate-800 uppercase">{item.kontraktorNama}</div>
                                      <div className="text-slate-500 mt-0.5">{item.kontraktorPimpinan}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100/50 text-[10px] font-semibold">{item.kodeRekening}</span>
                                      <div className="text-slate-500 text-[10px] mt-1 max-w-[150px] truncate">{item.uraianBelanja}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-extrabold text-slate-900 text-sm">
                                      {formatRupiah(item.nilaiKontrak, true, false)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="inline-flex items-center gap-1.5 justify-end">
                                        <button
                                          onClick={() => {
                                            setPreviewSpj(item);
                                            setPreviewDocType('kwitansi');
                                          }}
                                          className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                                          title="Preview & Cetak"
                                        >
                                          <Printer className="w-3.5 h-3.5" /> Cetak & Preview
                                        </button>
                                        
                                        <button
                                          onClick={() => handleRestoreSpj(item.id)}
                                          className="p-1.5 border border-slate-200 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-xl transition cursor-pointer"
                                          title="Pulihkan Berkas ke Aktif"
                                        >
                                          <FolderUp className="w-3.5 h-3.5" />
                                        </button>
                                        
                                        <button
                                          onClick={() => handleDeleteSpj(item.id, true)}
                                          className="p-1.5 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition cursor-pointer"
                                          title="Hapus Permanen"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activeTab === 'pegawai' && (
                        <PegawaiMaster
                          list={pegawaiList}
                          onSave={handleSavePegawai}
                          onDelete={handleDeletePegawai}
                        />
                      )}

                      {activeTab === 'rekening' && (
                        <RekeningMaster
                          list={rekeningList}
                          onSave={handleSaveRekening}
                          onDelete={handleDeleteRekening}
                        />
                      )}

                      {activeTab === 'signatures' && (
                        <div className="p-6">
                          <DigitalSignatureList
                            spjList={[...spjList, ...archivedList]}
                            onUnsign={handleUnsignSpj}
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* OVERLAY: PREVIEW & PRINT SYSTEM */}
      {previewSpj && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col z-50 print:hidden overflow-y-auto p-4 sm:p-6">
          <div className="bg-slate-100 rounded-2xl w-full max-w-5xl mx-auto shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200/50">
            
            {/* Header of Preview Toolbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-sm">Preview Dokumen Cetak SPJ</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">{previewSpj.judulPekerjaan.substring(0, 70)}...</p>
              </div>

              {/* Document selector buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'kwitansi', label: '1. Kwitansi (Receipt)' },
                  { id: 'bap', label: '2. BAP (Payment Minutes)' },
                  { id: 'npd', label: '3. NPD (Disbursement Note)' }
                ].map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setPreviewDocType(doc.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      previewDocType === doc.id
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    {doc.label}
                  </button>
                ))}
              </div>

              {/* Action buttons (Print & Close) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" /> Cetak Dokumen
                </button>
                <button
                  onClick={() => setPreviewSpj(null)}
                  className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition"
                >
                  Tutup Preview
                </button>
              </div>
            </div>

            {/* Digital Signature Management Control Panel */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  previewSignatureType === 'digital' 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}>
                  {previewSignatureType === 'digital' ? <ShieldCheck className="w-5 h-5 text-indigo-600" /> : <ShieldAlert className="w-5 h-5 text-slate-500" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-800">Pilihan Tanda Tangan Cetak:</span>
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
                      <button
                        onClick={() => setPreviewSignatureType('manual')}
                        className={`px-3 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
                          previewSignatureType === 'manual'
                            ? 'bg-slate-200 text-slate-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        ✍ Tanda Tangan Manual
                      </button>
                      <button
                        onClick={() => setPreviewSignatureType('digital')}
                        className={`px-3 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
                          previewSignatureType === 'digital'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-indigo-600'
                        }`}
                      >
                        🔒 Digital (QR Code)
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xl leading-relaxed">
                    {previewSignatureType === 'digital'
                      ? (previewSpj.leaderToken 
                        ? `Dokumen terdaftar dengan Tanda Tangan Digital (QR Code). Token terenkripsi tersimpan aman di Google Sheet.` 
                        : 'Sertifikat digital belum terdaftar untuk berkas ini. Silakan masukkan PIN Pejabat untuk mengaktifkan QR Code.')
                      : 'Menggunakan format tanda tangan basah (manual) pada dokumen hasil cetak.'}
                  </p>
                  
                  {previewSignatureType === 'digital' && (
                    <div className="mt-1.5 p-2 bg-indigo-50/50 border border-indigo-100/30 rounded-lg text-[10px] text-indigo-950 max-w-xl flex items-start gap-1.5 font-sans leading-relaxed">
                      <span className="text-xs">🔒</span>
                      <div>
                        <span className="font-bold text-indigo-900">Keamanan & Kerahasiaan Token: </span> 
                        Sistem ini menggunakan penyimpanan serverless terenkripsi langsung ke Google Drive dinas Anda tanpa pihak ketiga. PIN dibuat secara mandiri oleh Pejabat tanpa pengiriman lewat email publik untuk mencegah penyadapan/kebocoran token di jaringan luar. Anda tetap dapat mencatat alamat email dinas resmi di menu <span className="font-bold text-indigo-900">"Pegawai & Pejabat"</span> sebagai master data administrasi penanda tangan.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Input / Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {previewSignatureType === 'digital' && (
                  previewSpj.leaderToken ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> E-Sign Terdaftar
                      </span>
                      <button
                        onClick={async () => {
                          const adminPinInput = window.prompt('Masukkan PIN Admin (sims@dadpupr) untuk menghapus otorisasi E-Sign:');
                          if (adminPinInput === null) return; // cancelled
                          if (adminPinInput === 'sims@dadpupr') {
                            if (window.confirm('Hapus otorisasi tanda tangan digital dari berkas ini?')) {
                              const updated = {
                                ...previewSpj,
                                signatureType: 'manual',
                                leaderToken: '',
                                digitalSignatureHash: ''
                              } as SPJBundle;
                              setPreviewSpj(updated);
                              setPreviewSignatureType('manual');
                              await handleSaveSpj(updated);
                            }
                          } else {
                            alert('PIN Salah! Hanya Admin yang dapat menghapus otorisasi tanda tangan digital.');
                          }
                        }}
                        className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-[11px] font-bold transition cursor-pointer"
                      >
                        Hapus E-Sign
                      </button>
                    </div>
                  ) : (
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.elements.namedItem('leaderToken') as HTMLInputElement;
                        const tokenVal = input.value.trim();
                        if (!tokenVal) {
                          alert('Silakan masukkan PIN/Token pejabat!');
                          return;
                        }
                        
                        // Generate document signature hash
                        const hash = generateDocHash(previewSpj.id, previewSpj.paNip, previewSpj.nilaiKontrak, tokenVal);
                        const encryptedToken = encryptToken(tokenVal);
                        
                        const updated = {
                          ...previewSpj,
                          signatureType: 'digital',
                          leaderToken: encryptedToken,
                          digitalSignatureHash: hash
                        } as SPJBundle;
                        
                        setPreviewSpj(updated);
                        setPreviewSignatureType('digital');
                        await handleSaveSpj(updated);
                      }}
                      className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs"
                    >
                      <input
                        name="leaderToken"
                        type="password"
                        placeholder="Masukkan PIN Pejabat..."
                        required
                        className="px-3 py-1.5 text-[11px] border-none focus:outline-none w-44 font-mono bg-transparent"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition flex items-center gap-1 cursor-pointer"
                      >
                        <Lock className="w-3 h-3" /> Daftarkan QR
                      </button>
                    </form>
                  )
                )}
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-amber-50 border-b border-amber-100/50 px-6 py-2 flex items-center gap-2 text-amber-800 text-[10px] font-semibold">
              <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>Sistem cetak otomatis mengisolasi dokumen di bawah ini. Tombol "Cetak Dokumen" akan memanggil fungsi browser untuk mencetak kertas ber-kop rapi secara profesional.</span>
            </div>

            {/* Preview Document Stage */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[70vh] bg-slate-200">
              {/* Dynamic printable ID container */}
              <div id="printable-document">
                {previewDocType === 'kwitansi' && <KwitansiView data={previewSpj} forcedSignatureType={previewSignatureType} />}
                {previewDocType === 'bap' && <BapView data={previewSpj} forcedSignatureType={previewSignatureType} />}
                {previewDocType === 'npd' && <NpdView data={previewSpj} forcedSignatureType={previewSignatureType} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER DUMMY VISIBLE PORTION ONLY FOR PRINT MEDIA CAPTURE */}
      <div className="hidden print:block" id="printable-document">
        {previewSpj && (
          <>
            {previewDocType === 'kwitansi' && <KwitansiView data={previewSpj} forcedSignatureType={previewSignatureType} />}
            {previewDocType === 'bap' && <BapView data={previewSpj} forcedSignatureType={previewSignatureType} />}
            {previewDocType === 'npd' && <NpdView data={previewSpj} forcedSignatureType={previewSignatureType} />}
          </>
        )}
      </div>

    </div>
  );
}
