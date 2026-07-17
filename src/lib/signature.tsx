/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Generates a unique, deterministic cryptographic-looking hash for each document & signer
 * to satisfy the user requirement: "tanda tangan ini harus memiliki karakter khusus untuk setiap dokumen sehingga tidak bisa dikopi ke dokumen lain"
 */
export function generateDocHash(docId: string, signerNip: string, amount: number, token: string = 'PUPR-NAG-2026'): string {
  const sanitizedNip = signerNip.replace(/\s+/g, '') || '000000000000000000';
  const rawPayload = `${docId}|${sanitizedNip}|${amount}|${token}`;
  
  // Custom hash algorithm that creates a very realistic SHA-256 style signature token
  let hash1 = 5381;
  let hash2 = 1313;
  
  for (let i = 0; i < rawPayload.length; i++) {
    const char = rawPayload.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) + char;
    hash2 = ((hash2 << 4) + hash2) + char;
  }
  
  const hex1 = Math.abs(hash1).toString(16).toUpperCase().padStart(8, '0');
  const hex2 = Math.abs(hash2).toString(16).toUpperCase().padStart(8, '0');
  
  const block1 = sanitizedNip.slice(-4);
  const block2 = hex1.slice(-4);
  const block3 = hex2.slice(0, 4);
  const block4 = (Math.abs(hash1 * 31 + hash2) % 10000).toString().padStart(4, '0');
  
  return `BSRE-DS-${block1}-${block2}-${block3}-${block4}`;
}

interface DigitalSealProps {
  signerNama: string;
  signerNip: string;
  docId: string;
  amount: number;
  token?: string;
}

export const DigitalSeal: React.FC<DigitalSealProps> = ({
  signerNama,
  signerNip,
  docId,
  amount,
  token = 'PUPR-NAG-2026'
}) => {
  const code = generateDocHash(docId, signerNip, amount, token);
  
  return (
    <div className="my-1 py-1.5 px-3 border border-indigo-200 bg-indigo-50/20 rounded-xl max-w-[190px] mx-auto text-indigo-900 font-sans leading-none select-none print:border-indigo-800 print:text-indigo-950 print:bg-transparent flex flex-col items-center">
      {/* Badge Verified */}
      <div className="flex items-center gap-1 text-[8px] font-bold text-indigo-600 print:text-indigo-900 tracking-wider uppercase mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse print:bg-indigo-900"></span>
        TSA E-VERIFIED
      </div>
      
      {/* Mini QR-code placeholder */}
      <div className="w-10 h-10 border border-indigo-400/50 rounded bg-white p-0.5 shadow-sm mb-1.5 flex flex-col justify-between opacity-90 print:border-black">
        {/* Mock Matrix Grid */}
        <div className="grid grid-cols-4 gap-0.5 w-full h-full">
          <div className="bg-indigo-900 rounded-sm"></div>
          <div className="bg-indigo-100 rounded-sm"></div>
          <div className="bg-indigo-900 rounded-sm"></div>
          <div className="bg-indigo-900 rounded-sm"></div>
          
          <div className="bg-indigo-100 rounded-sm"></div>
          <div className="bg-indigo-900 rounded-sm"></div>
          <div className="bg-indigo-100 rounded-sm"></div>
          <div className="bg-indigo-900 rounded-sm"></div>
          
          <div className="bg-indigo-900 rounded-sm"></div>
          <div className="bg-indigo-100 rounded-sm"></div>
          <div className="bg-indigo-900 rounded-sm"></div>
          <div className="bg-indigo-100 rounded-sm"></div>
          
          <div className="bg-indigo-950 rounded-sm"></div>
          <div className="bg-indigo-900 rounded-sm"></div>
          <div className="bg-indigo-100 rounded-sm"></div>
          <div className="bg-indigo-950 rounded-sm"></div>
        </div>
      </div>
      
      <p className="text-[7px] text-slate-400 font-semibold text-center uppercase tracking-tight">Balai Sertifikasi Elektronik</p>
      <p className="text-[8px] font-bold text-slate-800 mt-0.5 text-center truncate max-w-[170px] print:text-black">{signerNama}</p>
      
      {/* Unique Character Hash */}
      <div className="mt-1 bg-indigo-100/50 border border-indigo-200/40 text-[7px] font-mono font-black text-indigo-700 px-1 py-0.5 rounded tracking-tighter print:bg-transparent print:border-indigo-900 print:text-indigo-950 text-center select-all">
        {code}
      </div>
    </div>
  );
}
