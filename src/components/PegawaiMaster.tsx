/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pegawai } from '../types';
import { Plus, Edit2, Trash2, Save, X, User } from 'lucide-react';

interface PegawaiMasterProps {
  list: Pegawai[];
  onSave: (pegawai: Pegawai) => void;
  onDelete: (id: string) => void;
}

export const PegawaiMaster: React.FC<PegawaiMasterProps> = ({ list, onSave, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Pegawai, 'id'>>({
    nama: '',
    nip: '',
    jabatan: '',
    golongan: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (item: Pegawai) => {
    setEditingId(item.id);
    setForm({
      nama: item.nama,
      nip: item.nip,
      jabatan: item.jabatan,
      golongan: item.golongan || ''
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm({ nama: '', nip: '', jabatan: '', golongan: '' });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.jabatan) {
      alert('Nama dan Jabatan wajib diisi');
      return;
    }
    const targetId = editingId || `p-${Date.now()}`;
    onSave({
      id: targetId,
      ...form
    });
    cancelEdit();
  };

  const startAdd = () => {
    setEditingId(null);
    setForm({ nama: '', nip: '', jabatan: '', golongan: '' });
    setIsAdding(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-150 flex items-center justify-between bg-slate-50/40">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
            <User className="w-4 h-4 text-indigo-500" />
            Daftar Pejabat & Pegawai (Master Signatures)
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">Kelola nama, NIP, dan jabatan resmi untuk memudahkan penandatanganan dokumen secara otomatis.</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Pejabat Baru
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="p-6 bg-indigo-50/20 border-b border-indigo-100/50 space-y-4">
          <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 font-display uppercase tracking-wider">
            {editingId ? 'Edit Data Pejabat' : 'Tambah Pejabat Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap & Gelar</label>
              <input
                type="text"
                value={form.nama}
                onChange={e => setForm({ ...form, nama: e.target.value })}
                placeholder="CONTOH: FRANSISKUS P.G DADJO, ST,MT"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-semibold text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">NIP (Nomor Induk Pegawai)</label>
              <input
                type="text"
                value={form.nip}
                onChange={e => setForm({ ...form, nip: e.target.value })}
                placeholder="CONTOH: 19780325 201001 1 015"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jabatan Resmi</label>
              <input
                type="text"
                value={form.jabatan}
                onChange={e => setForm({ ...form, jabatan: e.target.value })}
                placeholder="CONTOH: Bendahara Pengeluaran"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Golongan (Opsional)</label>
              <input
                type="text"
                value={form.golongan}
                onChange={e => setForm({ ...form, golongan: e.target.value })}
                placeholder="CONTOH: Pembina Utama / IV.c"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Simpan
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-3.5">Nama Pejabat / Pegawai</th>
              <th className="px-6 py-3.5">NIP</th>
              <th className="px-6 py-3.5">Jabatan</th>
              <th className="px-6 py-3.5">Golongan</th>
              <th className="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Belum ada data pejabat. Klik tombol "Pejabat Baru" untuk menambahkan.</td>
              </tr>
            ) : (
              list.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.nama}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-slate-500">{item.nip || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{item.jabatan}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{item.golongan || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition cursor-pointer"
                        title="Edit data"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus data ${item.nama}? Pejabat ini tidak akan bisa dipilih lagi.`)) {
                            onDelete(item.id);
                          }
                        }}
                        className="p-1.5 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition cursor-pointer"
                        title="Hapus data"
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
    </div>
  );
};
