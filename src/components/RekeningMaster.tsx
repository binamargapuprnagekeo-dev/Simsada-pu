/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Rekening } from '../types';
import { Plus, Edit2, Trash2, Save, X, BookOpen } from 'lucide-react';
import { formatRupiah } from '../lib/utils';

interface RekeningMasterProps {
  list: Rekening[];
  onSave: (rekening: Rekening) => void;
  onDelete: (id: string) => void;
}

export const RekeningMaster: React.FC<RekeningMasterProps> = ({ list, onSave, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Rekening, 'id'>>({
    kode: '',
    uraian: '',
    anggaran: 0,
    sisaAnggaran: 0
  });
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (item: Rekening) => {
    setEditingId(item.id);
    setForm({
      kode: item.kode,
      uraian: item.uraian,
      anggaran: item.anggaran,
      sisaAnggaran: item.sisaAnggaran
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm({ kode: '', uraian: '', anggaran: 0, sisaAnggaran: 0 });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kode || !form.uraian) {
      alert('Kode Rekening dan Uraian wajib diisi');
      return;
    }
    const targetId = editingId || `r-${Date.now()}`;
    onSave({
      id: targetId,
      ...form
    });
    cancelEdit();
  };

  const startAdd = () => {
    setEditingId(null);
    setForm({ kode: '', uraian: '', anggaran: 0, sisaAnggaran: 0 });
    setIsAdding(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-150 flex items-center justify-between bg-slate-50/40">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Daftar Kode Rekening & Anggaran (Master Belanja)
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">Kelola pagu anggaran sub kegiatan dan melacak sisa saldo secara akurat untuk pengisian dokumen NPD.</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Kode Rekening Baru
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="p-6 bg-indigo-50/20 border-b border-indigo-100/50 space-y-4">
          <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 font-display uppercase tracking-wider">
            {editingId ? 'Edit Kode Rekening' : 'Tambah Kode Rekening Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kode Rekening</label>
              <input
                type="text"
                value={form.kode}
                onChange={e => setForm({ ...form, kode: e.target.value })}
                placeholder="CONTOH: 1.03.10.2.01.0053.5.2.04.01.001.0003"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono font-semibold text-slate-800"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Uraian Rekening Belanja</label>
              <input
                type="text"
                value={form.uraian}
                onChange={e => setForm({ ...form, uraian: e.target.value })}
                placeholder="CONTOH: Belanja Modal Jalan Kabupaten"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jumlah Pagu Anggaran (Rp)</label>
              <input
                type="number"
                value={form.anggaran || ''}
                onChange={e => {
                  const val = Number(e.target.value);
                  setForm({ ...form, anggaran: val, sisaAnggaran: editingId ? form.sisaAnggaran : val });
                }}
                placeholder="CONTOH: 3980000000"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans font-semibold text-slate-800"
                required
              />
            </div>
            {editingId && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sisa Anggaran Terakhir (Rp)</label>
                <input
                  type="number"
                  value={form.sisaAnggaran || ''}
                  onChange={e => setForm({ ...form, sisaAnggaran: Number(e.target.value) })}
                  placeholder="CONTOH: 3980000000"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans font-semibold text-slate-800"
                />
              </div>
            )}
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
              <th className="px-6 py-3.5">Kode Rekening</th>
              <th className="px-6 py-3.5">Uraian Rekening Belanja</th>
              <th className="px-6 py-3.5 text-right">Total Pagu Anggaran</th>
              <th className="px-6 py-3.5 text-right">Sisa Anggaran Terakhir</th>
              <th className="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Belum ada data rekening anggaran. Klik "Kode Rekening Baru" untuk menambahkan.</td>
              </tr>
            ) : (
              list.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50 inline-block">{item.kode}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium leading-relaxed">{item.uraian}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-800">{formatRupiah(item.anggaran, true, false)}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatRupiah(item.sisaAnggaran, true, false)}</td>
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
                          if (window.confirm(`Hapus rekening ${item.kode}? Semua NPD yang menggunakan kode ini akan kehilangan link master anggaran.`)) {
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
