export interface BentukSediaan {
  id: string;
  nama: string;
}

export interface Obat {
  id: string;
  kode: string;
  nama: string;
  satuan: string;
  kategori: string;
  kategoriId?: string;
  bentukSediaanId?: string;
  bentukSediaanNama?: string;
  stokTotal: number;
  minStok: number;
  maxStok?: number;
  hargaBeli: number;
  hargaJual: number;
  deskripsi: string;
  created_at: number;
}

export interface Supplier {
  id: string;
  kode: string;
  nama: string;
  alamat: string;
  telepon: string;
}

export interface Lokasi {
  id: string;
  kode: string;
  nama: string;
}

export interface Kategori {
  id: string;
  nama: string;
}

export interface Satuan {
  id: string;
  nama: string;
}

export interface DetilItem {
  obatId: string;
  namaObat: string;
  jumlah: number;
  satuan: string;
}

export interface SuratPesanan {
  id: string;
  nomor: string;
  tanggal: string;
  supplierId: string;
  supplierNama: string;
  jenisSP?: string;
  items: DetilItem[];
  status: 'Draft' | 'Sent' | 'Completed';
  signature?: string;
  signed_by?: string;
  created_at: number;
}

export interface BAPBItem extends DetilItem {
  batch: string;
  kadaluarsa: string;
  lokasiId: string;
  lokasiNama: string;
  hargaBeli?: number;
}

export interface BAPB {
  id: string;
  nomor: string;
  tanggal: string;
  spId?: string; // Optional for BAPB tanpa SP
  nomorSP?: string;
  supplierId: string;
  supplierNama: string;
  items: BAPBItem[];
  status: 'Received' | 'Paid';
  // Additional fields for financial reporting
  noInvoice?: string;
  noFakturPajak?: string;
  diskonTotal?: number;
  ppnTotal?: number;
  usePPN?: boolean; // Toggle for PPN
  materaiOngkir?: number;
  jumlahDibayar?: number;
  tanggalJatuhTempo?: string;
  paid_at?: number;
  signature?: string;
  signed_by?: string;
  created_at: number;
}

export interface PindahLokasi {
  id: string;
  tanggal: string;
  obatId: string;
  namaObat: string;
  dariLokasiId: string;
  keLokasiId: string;
  jumlah: number;
  keterangan: string;
}

export interface MutasiStok {
  id: string;
  tanggal: number;
  obatId: string;
  tipe: 'Masuk' | 'Keluar' | 'Pindah' | 'Opname';
  jumlah: number;
  saldoAwal: number;
  saldoAkhir: number;
  referensiId: string; // ID SP, BAPB, atau Transaksi
  referensiNomor: string;
  keterangan: string;
}

export interface Customer {
  id: string;
  kode: string;
  nama: string;
  alamat: string;
  telepon: string;
  aktif: boolean;
}

export interface Dokter {
  id: string;
  kode: string;
  nama: string;
  spesialisasi: string;
  telepon: string;
}

export interface Spesialis {
  id: string;
  nama: string;
}

export interface TransaksiItem {
  obatId: string;
  namaObat: string;
  jumlah: number;
  harga: number;
  subtotal: number;
  aturanPakai?: string;
  kadaluarsa?: string;
}

export interface Transaksi {
  id: string;
  nomor: string;
  tanggal: string;
  tipe: 'Pembelian' | 'Peresepan';
  customerId?: string;
  customerNama?: string;
  dokter?: string;
  items: TransaksiItem[];
  total: number;
  created_at: number;
}

export interface StokOpname {
  id: string;
  tanggal: string;
  obatId: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  keterangan: string;
}

export interface AppSettings {
  namaKlinik: string;
  alamatKlinik: string;
  teleponKlinik: string;
  logoKlinik: string; // Base64 or URL
  namaPenanggungJawab: string;
  noSIPA: string;
  persenPPN: number;
  persenMargin: number;
}

export interface MappingSPKhusus {
  id: string;
  kategoriId: string;
  kategoriNama: string;
  jenisSP: string;
  keterangan?: string;
}

export interface InteractionCheck {
  id: string;
  tanggal: number;
  drugs: string[];
  analysis: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  checked_by?: string;
}
