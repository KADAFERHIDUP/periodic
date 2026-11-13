// 118 unsur: simbol, nama (Bahasa Indonesia), massa atom relatif, kategori.
// Massa dalam kurung siku untuk unsur tanpa isotop stabil (nomor massa isotop paling stabil).
const RAW = `
H,Hidrogen,1.008,nm|He,Helium,4.0026,ng|Li,Litium,6.94,am|Be,Berilium,9.0122,ae|B,Boron,10.81,ml|C,Karbon,12.011,nm|N,Nitrogen,14.007,nm|O,Oksigen,15.999,nm|F,Fluorin,18.998,hl|Ne,Neon,20.180,ng|
Na,Natrium,22.990,am|Mg,Magnesium,24.305,ae|Al,Aluminium,26.982,pt|Si,Silikon,28.085,ml|P,Fosfor,30.974,nm|S,Belerang,32.06,nm|Cl,Klorin,35.45,hl|Ar,Argon,39.948,ng|
K,Kalium,39.098,am|Ca,Kalsium,40.078,ae|Sc,Skandium,44.956,tm|Ti,Titanium,47.867,tm|V,Vanadium,50.942,tm|Cr,Kromium,51.996,tm|Mn,Mangan,54.938,tm|Fe,Besi,55.845,tm|Co,Kobalt,58.933,tm|Ni,Nikel,58.693,tm|Cu,Tembaga,63.546,tm|Zn,Seng,65.38,tm|Ga,Galium,69.723,pt|Ge,Germanium,72.630,ml|As,Arsen,74.922,ml|Se,Selenium,78.971,nm|Br,Bromin,79.904,hl|Kr,Kripton,83.798,ng|
Rb,Rubidium,85.468,am|Sr,Stronsium,87.62,ae|Y,Itrium,88.906,tm|Zr,Zirkonium,91.224,tm|Nb,Niobium,92.906,tm|Mo,Molibdenum,95.95,tm|Tc,Teknesium,[98],tm|Ru,Rutenium,101.07,tm|Rh,Rodium,102.91,tm|Pd,Paladium,106.42,tm|Ag,Perak,107.87,tm|Cd,Kadmium,112.41,tm|In,Indium,114.82,pt|Sn,Timah,118.71,pt|Sb,Antimon,121.76,ml|Te,Telurium,127.60,ml|I,Iodin,126.90,hl|Xe,Xenon,131.29,ng|
Cs,Sesium,132.91,am|Ba,Barium,137.33,ae|La,Lantanum,138.91,ln|Ce,Serium,140.12,ln|Pr,Praseodimium,140.91,ln|Nd,Neodimium,144.24,ln|Pm,Prometium,[145],ln|Sm,Samarium,150.36,ln|Eu,Europium,151.96,ln|Gd,Gadolinium,157.25,ln|Tb,Terbium,158.93,ln|Dy,Disprosium,162.50,ln|Ho,Holmium,164.93,ln|Er,Erbium,167.26,ln|Tm,Tulium,168.93,ln|Yb,Iterbium,173.05,ln|Lu,Lutesium,174.97,ln|
Hf,Hafnium,178.49,tm|Ta,Tantalum,180.95,tm|W,Tungsten,183.84,tm|Re,Renium,186.21,tm|Os,Osmium,190.23,tm|Ir,Iridium,192.22,tm|Pt,Platina,195.08,tm|Au,Emas,196.97,tm|Hg,Raksa,200.59,tm|Tl,Talium,204.38,pt|Pb,Timbal,207.2,pt|Bi,Bismut,208.98,pt|Po,Polonium,[209],pt|At,Astatin,[210],hl|Rn,Radon,[222],ng|
Fr,Fransium,[223],am|Ra,Radium,[226],ae|Ac,Aktinium,[227],ac|Th,Torium,232.04,ac|Pa,Protaktinium,231.04,ac|U,Uranium,238.03,ac|Np,Neptunium,[237],ac|Pu,Plutonium,[244],ac|Am,Amerisium,[243],ac|Cm,Kurium,[247],ac|Bk,Berkelium,[247],ac|Cf,Kalifornium,[251],ac|Es,Einsteinium,[252],ac|Fm,Fermium,[257],ac|Md,Mendelevium,[258],ac|No,Nobelium,[259],ac|Lr,Lawrensium,[266],ac|
Rf,Rutherfordium,[267],tm|Db,Dubnium,[268],tm|Sg,Seaborgium,[269],tm|Bh,Bohrium,[270],tm|Hs,Hassium,[269],tm|Mt,Meitnerium,[278],un|Ds,Darmstadtium,[281],un|Rg,Roentgenium,[282],un|Cn,Kopernisium,[285],un|Nh,Nihonium,[286],un|Fl,Flerovium,[289],un|Mc,Moskovium,[290],un|Lv,Livermorium,[293],un|Ts,Tenesin,[294],un|Og,Oganeson,[294],un`;

export const CATEGORIES = {
  am: { label: 'Logam alkali', color: '#ff6b6b' },
  ae: { label: 'Logam alkali tanah', color: '#ffa94d' },
  tm: { label: 'Logam transisi', color: '#ffd43b' },
  pt: { label: 'Logam pasca-transisi', color: '#69db7c' },
  ml: { label: 'Metaloid', color: '#38d9a9' },
  nm: { label: 'Nonlogam reaktif', color: '#4dabf7' },
  hl: { label: 'Halogen', color: '#748ffc' },
  ng: { label: 'Gas mulia', color: '#da77f2' },
  ln: { label: 'Lantanida', color: '#f783ac' },
  ac: { label: 'Aktinida', color: '#ff8787' },
  un: { label: 'Belum diketahui', color: '#adb5bd' },
};

export const BLOCKS = {
  s: { label: 'Blok s', color: '#ff6b6b' },
  p: { label: 'Blok p', color: '#4dabf7' },
  d: { label: 'Blok d', color: '#ffd43b' },
  f: { label: 'Blok f', color: '#da77f2' },
};

export const STATES = {
  solid: { label: 'Padat', color: '#e9ecef' },
  liquid: { label: 'Cair', color: '#4dabf7' },
  gas: { label: 'Gas', color: '#69db7c' },
  unknown: { label: 'Belum diketahui', color: '#868e96' },
};

const GAS = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86]);
const LIQUID = new Set([35, 80]);
const PERIOD_START = [1, 3, 11, 19, 37, 55, 87, 119];

// Hitung golongan, periode, dan posisi di tabel dari nomor atom.
function place(z) {
  const period = PERIOD_START.findIndex((s, i) => z >= s && z < PERIOD_START[i + 1]) + 1;
  const idx = z - PERIOD_START[period - 1];
  let group = null, col, row = period;
  if (period === 1) group = z === 1 ? 1 : 18;
  else if (period <= 3) group = idx < 2 ? idx + 1 : idx + 11;
  else if (period <= 5) group = idx + 1;
  else if (idx < 2) group = idx + 1;
  else if (idx < 17) { col = idx + 1; row = period + 3; } // baris lantanida/aktinida di bawah
  else group = idx - 13;
  if (group) col = group;
  return { period, group, col, row };
}

function blockOf(z, group, period) {
  if (z === 2) return 's';
  if (!group) return 'f';
  if (group <= 2) return 's';
  if (group <= 12) return 'd';
  return 'p';
}

export const ELEMENTS = RAW.replace(/\s+/g, '').split('|').map((s, i) => {
  const [symbol, name, mass, cat] = s.split(',');
  const z = i + 1;
  const pos = place(z);
  return {
    z, symbol, name, mass, cat, ...pos,
    block: blockOf(z, pos.group, pos.period),
    state: z >= 104 ? 'unknown' : GAS.has(z) ? 'gas' : LIQUID.has(z) ? 'liquid' : 'solid',
  };
});
