// JAKIM e-solat zone codes for Malaysia
// Maps city/district names to JAKIM zone codes

export interface JakimZone {
  code: string;
  state: string;
  areas: string[];
}

export const JAKIM_ZONES: JakimZone[] = [
  { code: 'JHR01', state: 'Johor', areas: ['Pulau Aur', 'Pulau Pemanggil'] },
  { code: 'JHR02', state: 'Johor', areas: ['Johor Bahru', 'Kota Tinggi', 'Mersing'] },
  { code: 'JHR03', state: 'Johor', areas: ['Kluang', 'Pontian'] },
  { code: 'JHR04', state: 'Johor', areas: ['Batu Pahat', 'Muar', 'Segamat', 'Gemas'] },
  { code: 'KDH01', state: 'Kedah', areas: ['Kota Setar', 'Kubang Pasu', 'Pokok Sena'] },
  { code: 'KDH02', state: 'Kedah', areas: ['Kuala Muda', 'Yan', 'Pendang'] },
  { code: 'KDH03', state: 'Kedah', areas: ['Padang Terap', 'Sik'] },
  { code: 'KDH04', state: 'Kedah', areas: ['Baling'] },
  { code: 'KDH05', state: 'Kedah', areas: ['Bandar Baharu', 'Kulim'] },
  { code: 'KDH06', state: 'Kedah', areas: ['Langkawi'] },
  { code: 'KDH07', state: 'Kedah', areas: ['Gunung Jerai'] },
  { code: 'KTN01', state: 'Kelantan', areas: ['Bachok', 'Kota Bharu', 'Machang', 'Pasir Mas', 'Pasir Puteh', 'Tanah Merah', 'Tumpat', 'Kuala Krai', 'Mukim Chiku'] },
  { code: 'KTN03', state: 'Kelantan', areas: ['Gua Musang', 'Jeli'] },
  { code: 'MLK01', state: 'Melaka', areas: ['Melaka'] },
  { code: 'NGS01', state: 'Negeri Sembilan', areas: ['Tampin', 'Jempol'] },
  { code: 'NGS02', state: 'Negeri Sembilan', areas: ['Jelebu', 'Kuala Pilah', 'Rembau', 'Seremban'] },
  { code: 'PHG01', state: 'Pahang', areas: ['Rompin', 'Muadzam Shah'] },
  { code: 'PHG02', state: 'Pahang', areas: ['Kuantan', 'Pekan', 'Maran'] },
  { code: 'PHG03', state: 'Pahang', areas: ['Jerantut', 'Temerloh', 'Bera', 'Chenor', 'Jengka'] },
  { code: 'PHG04', state: 'Pahang', areas: ['Bentong', 'Lipis', 'Raub'] },
  { code: 'PHG05', state: 'Pahang', areas: ['Genting Highlands', 'Cameron Highlands'] },
  { code: 'PHG06', state: 'Pahang', areas: ['Tioman'] },
  { code: 'PLS01', state: 'Perlis', areas: ['Perlis', 'Kangar'] },
  { code: 'PNG01', state: 'Pulau Pinang', areas: ['Pulau Pinang', 'Penang', 'Georgetown'] },
  { code: 'PRK01', state: 'Perak', areas: ['Tapah', 'Slim River', 'Tanjung Malim'] },
  { code: 'PRK02', state: 'Perak', areas: ['Ipoh', 'Batu Gajah', 'Kampar', 'Kuala Kangsar', 'Sungai Siput'] },
  { code: 'PRK03', state: 'Perak', areas: ['Pengkalan Hulu', 'Grik', 'Lenggong'] },
  { code: 'PRK04', state: 'Perak', areas: ['Temengor'] },
  { code: 'PRK05', state: 'Perak', areas: ['Taiping', 'Kuala Kangsar'] },
  { code: 'PRK06', state: 'Perak', areas: ['Hilir Perak', 'Teluk Intan', 'Bagan Datoh'] },
  { code: 'PRK07', state: 'Perak', areas: ['Manjung', 'Lumut', 'Sitiawan'] },
  { code: 'SBH01', state: 'Sabah', areas: ['Sandakan', 'Kinabatangan', 'Beluran'] },
  { code: 'SBH02', state: 'Sabah', areas: ['Lahad Datu', 'Silabukan', 'Kunak', 'Semporna', 'Tungku', 'Tawau'] },
  { code: 'SBH03', state: 'Sabah', areas: ['Kota Kinabalu', 'Ranau', 'Kota Belud', 'Tuaran', 'Penampang', 'Papar'] },
  { code: 'SBH04', state: 'Sabah', areas: ['Beaufort', 'Kuala Penyu', 'Sipitang', 'Tenom', 'Long Pasia'] },
  { code: 'SBH05', state: 'Sabah', areas: ['Kudat', 'Kota Marudu', 'Pitas'] },
  { code: 'SBH06', state: 'Sabah', areas: ['Gunung Kinabalu'] },
  { code: 'SGR01', state: 'Selangor', areas: ['Gombak', 'Petaling', 'Sepang', 'Hulu Langat', 'Hulu Selangor', 'Rawang', 'Shah Alam'] },
  { code: 'SGR02', state: 'Selangor', areas: ['Kuala Selangor', 'Sabak Bernam'] },
  { code: 'SGR03', state: 'Selangor', areas: ['Klang', 'Kuala Langat'] },
  { code: 'SWK01', state: 'Sarawak', areas: ['Limbang', 'Lawas', 'Sundar', 'Trusan'] },
  { code: 'SWK02', state: 'Sarawak', areas: ['Miri', 'Niah', 'Bekenu', 'Sibuti', 'Marudi'] },
  { code: 'SWK03', state: 'Sarawak', areas: ['Tatau', 'Bintulu', 'Belaga', 'Sebauh'] },
  { code: 'SWK04', state: 'Sarawak', areas: ['Sibu', 'Mukah', 'Dalat', 'Song', 'Igan', 'Oya', 'Balingian', 'Kanowit', 'Kapit'] },
  { code: 'SWK05', state: 'Sarawak', areas: ['Sarikei', 'Julau', 'Bintangor', 'Rajang'] },
  { code: 'SWK06', state: 'Sarawak', areas: ['Lubok Antu', 'Sri Aman', 'Engkilili'] },
  { code: 'SWK07', state: 'Sarawak', areas: ['Betong', 'Saratok', 'Pusa', 'Kabong'] },
  { code: 'SWK08', state: 'Sarawak', areas: ['Kuching', 'Bau', 'Lundu', 'Sematan', 'Samarahan', 'Simunjan', 'Serian'] },
  { code: 'SWK09', state: 'Sarawak', areas: ['Kampung Patarikan'] },
  { code: 'TRG01', state: 'Terengganu', areas: ['Kuala Terengganu', 'Marang', 'Kuala Nerus'] },
  { code: 'TRG02', state: 'Terengganu', areas: ['Besut', 'Setiu'] },
  { code: 'TRG03', state: 'Terengganu', areas: ['Hulu Terengganu'] },
  { code: 'TRG04', state: 'Terengganu', areas: ['Dungun', 'Kemaman'] },
  { code: 'WLY01', state: 'Wilayah Persekutuan', areas: ['Kuala Lumpur', 'Putrajaya'] },
  { code: 'WLY02', state: 'Wilayah Persekutuan', areas: ['Labuan'] },
];

// Default zone for KL
export const DEFAULT_ZONE = 'WLY01';

/**
 * Find JAKIM zone code from city name (fuzzy match)
 */
export function findZoneByCity(city: string): string | null {
  if (!city) return null;
  const lower = city.toLowerCase().trim();

  // Direct area match
  for (const zone of JAKIM_ZONES) {
    for (const area of zone.areas) {
      if (area.toLowerCase() === lower || lower.includes(area.toLowerCase()) || area.toLowerCase().includes(lower)) {
        return zone.code;
      }
    }
  }

  // State match — return first zone of that state
  for (const zone of JAKIM_ZONES) {
    if (zone.state.toLowerCase() === lower) {
      return zone.code;
    }
  }

  return null;
}

/**
 * Check if a country string indicates Malaysia
 */
export function isMalaysia(country: string): boolean {
  const c = country.toLowerCase().trim();
  return c === 'malaysia' || c === 'my' || c === 'mys';
}

/**
 * Get all zones grouped by state for a settings picker
 */
export function getZonesByState(): Record<string, JakimZone[]> {
  const grouped: Record<string, JakimZone[]> = {};
  for (const zone of JAKIM_ZONES) {
    if (!grouped[zone.state]) grouped[zone.state] = [];
    grouped[zone.state].push(zone);
  }
  return grouped;
}
