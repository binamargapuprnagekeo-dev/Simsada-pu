/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Convert a number to Indonesian "Terbilang" words
 */
export function terbilang(nominal: number): string {
  const rounded = Math.floor(nominal);
  if (rounded === 0) return 'Nol';
  
  const numbers = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  let result = '';
  
  if (rounded < 12) {
    result = numbers[rounded];
  } else if (rounded < 20) {
    result = terbilang(rounded - 10) + ' Belas';
  } else if (rounded < 100) {
    result = terbilang(Math.floor(rounded / 10)) + ' Puluh ' + terbilang(rounded % 10);
  } else if (rounded < 200) {
    result = 'Seratus ' + terbilang(rounded - 100);
  } else if (rounded < 1000) {
    result = terbilang(Math.floor(rounded / 100)) + ' Ratus ' + terbilang(rounded % 100);
  } else if (rounded < 2000) {
    result = 'Seribu ' + terbilang(rounded - 1000);
  } else if (rounded < 1000000) {
    result = terbilang(Math.floor(rounded / 1000)) + ' Ribu ' + terbilang(rounded % 1000);
  } else if (rounded < 1000000000) {
    result = terbilang(Math.floor(rounded / 1000000)) + ' Juta ' + terbilang(rounded % 1000000);
  } else if (rounded < 1000000000000) {
    result = terbilang(Math.floor(rounded / 1000000000)) + ' Milyar ' + terbilang(rounded % 1000000000);
  } else if (rounded < 1000000000000000) {
    result = terbilang(Math.floor(rounded / 1000000000000)) + ' Triliun ' + terbilang(rounded % 1000000000000);
  }
  
  // Title Case conversion with specific Indonesian grammar corrections (e.g. "Satu Ratus" -> "Seratus")
  let cleanResult = result.replace(/\s+/g, ' ').trim();
  cleanResult = cleanResult.replace(/^Satu Ratus/, 'Seratus');
  cleanResult = cleanResult.replace(/^Satu Ribu/, 'Seribu');
  
  return cleanResult;
}

/**
 * Formats a number to Indonesian Rupiah representation
 * @param nominal Value in IDR
 * @param withSymbol Whether to prefix with "Rp. "
 * @param withDecimal Whether to include ",00" decimal part
 */
export function formatRupiah(nominal: number, withSymbol = true, withDecimal = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: withDecimal ? 2 : 0,
    maximumFractionDigits: withDecimal ? 2 : 0,
  }).format(nominal);
  
  return withSymbol ? `Rp. ${formatted}` : formatted;
}

/**
 * Format a ISO date string to Indonesian formal date format
 * e.g. "2026-07-15" -> "15 Juli 2026"
 */
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const day = parseInt(parts[2], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    
    return `${day} ${months[monthIndex]} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Translates an ISO date string to full Indonesian text representation
 * e.g. "2026-07-15" -> "Rabu Tanggal Lima Belas Bulan Juli Tahun Dua Ribu Dua Puluh Enam"
 */
export function formatHariTanggalIndoTerbilang(dateStr: string): string {
  if (!dateStr) return '';
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  try {
    const date = new Date(dateStr);
    const dayName = days[date.getDay()];
    
    const parts = dateStr.split('-');
    const dayNum = parseInt(parts[2], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const yearNum = parseInt(parts[0], 10);
    
    const dayTerbilang = terbilang(dayNum);
    const monthName = months[monthIndex];
    const yearTerbilang = terbilang(yearNum);
    
    return `${dayName} Tanggal ${dayTerbilang} Bulan ${monthName} Tahun ${yearTerbilang}`;
  } catch (e) {
    return dateStr;
  }
}
