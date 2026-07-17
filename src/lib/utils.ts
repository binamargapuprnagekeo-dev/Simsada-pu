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
  
  const convert = (num: number): string => {
    const numbers = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    let result = '';
    
    if (num < 12) {
      result = numbers[num];
    } else if (num < 20) {
      result = convert(num - 10) + ' Belas';
    } else if (num < 100) {
      const rest = num % 10;
      result = convert(Math.floor(num / 10)) + ' Puluh' + (rest > 0 ? ' ' + convert(rest) : '');
    } else if (num < 200) {
      const rest = num - 100;
      result = 'Seratus' + (rest > 0 ? ' ' + convert(rest) : '');
    } else if (num < 1000) {
      const rest = num % 100;
      result = convert(Math.floor(num / 100)) + ' Ratus' + (rest > 0 ? ' ' + convert(rest) : '');
    } else if (num < 2000) {
      const rest = num - 1000;
      result = 'Seribu' + (rest > 0 ? ' ' + convert(rest) : '');
    } else if (num < 1000000) {
      const rest = num % 1000;
      result = convert(Math.floor(num / 1000)) + ' Ribu' + (rest > 0 ? ' ' + convert(rest) : '');
    } else if (num < 1000000000) {
      const rest = num % 1000000;
      result = convert(Math.floor(num / 1000000)) + ' Juta' + (rest > 0 ? ' ' + convert(rest) : '');
    } else if (num < 1000000000000) {
      const rest = num % 1000000000;
      result = convert(Math.floor(num / 1000000000)) + ' Milyar' + (rest > 0 ? ' ' + convert(rest) : '');
    } else if (num < 1000000000000000) {
      const rest = num % 1000000000000;
      result = convert(Math.floor(num / 1000000000000)) + ' Triliun' + (rest > 0 ? ' ' + convert(rest) : '');
    }
    
    return result;
  };
  
  let rawResult = convert(rounded);
  
  let cleanResult = rawResult.replace(/\s+/g, ' ').trim();
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
