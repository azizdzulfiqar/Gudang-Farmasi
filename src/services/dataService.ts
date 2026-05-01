import { Obat, Supplier, Lokasi, Kategori, Satuan, Customer, SuratPesanan, BAPB, MutasiStok, Transaksi, StokOpname, Dokter, Spesialis, AppSettings } from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';

// Mock Storage keys
const KEYS = {
  OBAT: 'farmasi_obat',
  SUPPLIER: 'farmasi_supplier',
  LOKASI: 'farmasi_lokasi',
  KATEGORI: 'farmasi_kategori',
  SATUAN: 'farmasi_satuan',
  SUB_KEY: 'farmasi_sub_key',
  CUSTOMER: 'farmasi_customer',
  SP: 'farmasi_sp',
  BAPB: 'farmasi_bapb',
  MUTASI: 'farmasi_mutasi',
  TRANSAKSI: 'farmasi_transaksi',
  OPNAME: 'farmasi_opname',
  DOKTER: 'farmasi_dokter',
  SPESIALIS: 'farmasi_spesialis',
  SETTINGS: 'farmasi_settings',
  ACTIVITY: 'farmasi_activity'
};

export interface Log {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: number;
}

const get = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const set = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const dataService = {
  // Dokter
  getDokter: () => get<Dokter>(KEYS.DOKTER),
  addDokter: (data: Omit<Dokter, 'id'>) => {
    const list = get<Dokter>(KEYS.DOKTER);
    const newItem: Dokter = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.DOKTER, list);
    return newItem;
  },
  updateDokter: (id: string, data: Partial<Dokter>) => {
    const list = get<Dokter>(KEYS.DOKTER);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.DOKTER, list);
    }
  },
  deleteDokter: (id: string) => {
    const list = get<Dokter>(KEYS.DOKTER).filter(i => i.id !== id);
    set(KEYS.DOKTER, list);
  },

  // Spesialis
  getSpesialis: () => get<Spesialis>(KEYS.SPESIALIS),
  addSpesialis: (data: Omit<Spesialis, 'id'>) => {
    const list = get<Spesialis>(KEYS.SPESIALIS);
    const newItem: Spesialis = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.SPESIALIS, list);
    return newItem;
  },
  updateSpesialis: (id: string, data: Partial<Spesialis>) => {
    const list = get<Spesialis>(KEYS.SPESIALIS);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.SPESIALIS, list);
    }
  },
  deleteSpesialis: (id: string) => {
    const list = get<Spesialis>(KEYS.SPESIALIS).filter(i => i.id !== id);
    set(KEYS.SPESIALIS, list);
  },

  // Obat
  getObat: () => get<Obat>(KEYS.OBAT),
  addObat: (data: Omit<Obat, 'id'>) => {
    const list = get<Obat>(KEYS.OBAT);
    const newItem: Obat = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.OBAT, list);
    dataService.addLog(`Menambah obat: ${newItem.nama}`, 'Master Obat');
    return newItem;
  },
  updateObat: (id: string, data: Partial<Obat>) => {
    const list = get<Obat>(KEYS.OBAT);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.OBAT, list);
      dataService.addLog(`Memperbarui data obat: ${list[index].nama}`, 'Master Obat');
    }
  },

  // Supplier
  getSuppliers: () => get<Supplier>(KEYS.SUPPLIER),
  addSupplier: (data: Omit<Supplier, 'id'>) => {
    const list = get<Supplier>(KEYS.SUPPLIER);
    const newItem: Supplier = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.SUPPLIER, list);
    return newItem;
  },
  updateSupplier: (id: string, data: Partial<Supplier>) => {
    const list = get<Supplier>(KEYS.SUPPLIER);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.SUPPLIER, list);
    }
  },

  // Lokasi
  getLokasi: () => get<Lokasi>(KEYS.LOKASI),
  addLokasi: (data: Omit<Lokasi, 'id'>) => {
    const list = get<Lokasi>(KEYS.LOKASI);
    const newItem: Lokasi = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.LOKASI, list);
    return newItem;
  },
  updateLokasi: (id: string, data: Partial<Lokasi>) => {
    const list = get<Lokasi>(KEYS.LOKASI);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.LOKASI, list);
    }
  },

  // Kategori
  getKategori: () => get<Kategori>(KEYS.KATEGORI),
  addKategori: (data: Omit<Kategori, 'id'>) => {
    const list = get<Kategori>(KEYS.KATEGORI);
    const newItem: Kategori = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.KATEGORI, list);
    return newItem;
  },
  updateKategori: (id: string, data: Partial<Kategori>) => {
    const list = get<Kategori>(KEYS.KATEGORI);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.KATEGORI, list);
    }
  },

  // Satuan
  getSatuan: () => get<Satuan>(KEYS.SATUAN),
  addSatuan: (data: Omit<Satuan, 'id'>) => {
    const list = get<Satuan>(KEYS.SATUAN);
    const newItem: Satuan = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.SATUAN, list);
    return newItem;
  },
  updateSatuan: (id: string, data: Partial<Satuan>) => {
    const list = get<Satuan>(KEYS.SATUAN);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.SATUAN, list);
    }
  },

  // Surat Pesanan
  getSP: () => get<SuratPesanan>(KEYS.SP),
  addSP: (data: Omit<SuratPesanan, 'id'>) => {
    const list = get<SuratPesanan>(KEYS.SP);
    const newItem: SuratPesanan = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.SP, list);
    return newItem;
  },
  updateSP: (id: string, data: Partial<SuratPesanan>) => {
    const list = get<SuratPesanan>(KEYS.SP);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.SP, list);
    }
  },
  deleteSP: (id: string) => {
    const list = get<SuratPesanan>(KEYS.SP).filter(i => i.id !== id);
    set(KEYS.SP, list);
  },

  // Customer
  getCustomers: () => get<Customer>(KEYS.CUSTOMER),
  addCustomer: (data: Omit<Customer, 'id'>) => {
    const list = get<Customer>(KEYS.CUSTOMER);
    const newItem: Customer = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.CUSTOMER, list);
    return newItem;
  },
  updateCustomer: (id: string, data: Partial<Customer>) => {
    const list = get<Customer>(KEYS.CUSTOMER);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.CUSTOMER, list);
    }
  },
  deleteCustomer: (id: string) => {
    const list = get<Customer>(KEYS.CUSTOMER).filter(i => i.id !== id);
    set(KEYS.CUSTOMER, list);
  },
  deleteObat: (id: string) => {
    const list = get<Obat>(KEYS.OBAT).filter(i => i.id !== id);
    set(KEYS.OBAT, list);
  },
  deleteSupplier: (id: string) => {
    const list = get<Supplier>(KEYS.SUPPLIER).filter(i => i.id !== id);
    set(KEYS.SUPPLIER, list);
  },
  deleteLokasi: (id: string) => {
    const list = get<Lokasi>(KEYS.LOKASI).filter(i => i.id !== id);
    set(KEYS.LOKASI, list);
  },
  deleteKategori: (id: string) => {
    const list = get<Kategori>(KEYS.KATEGORI).filter(i => i.id !== id);
    set(KEYS.KATEGORI, list);
  },
  deleteSatuan: (id: string) => {
    const list = get<Satuan>(KEYS.SATUAN).filter(i => i.id !== id);
    set(KEYS.SATUAN, list);
  },

  // BAPB (Penerimaan)
  getBAPB: () => get<BAPB>(KEYS.BAPB),
  addBAPB: (data: Omit<BAPB, 'id'>) => {
    const list = get<BAPB>(KEYS.BAPB);
    const newItem: BAPB = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.BAPB, list);

    // Update Stok and log mutasi for each item
    data.items.forEach(item => {
      const obats = get<Obat>(KEYS.OBAT);
      const obatIndex = obats.findIndex(o => o.id === item.obatId);
      if (obatIndex > -1) {
        const saldoAwal = obats[obatIndex].stokTotal;
        obats[obatIndex].stokTotal = (obats[obatIndex].stokTotal || 0) + item.jumlah;
        set(KEYS.OBAT, obats);

        // Log Mutasi
        const mutasiList = get<MutasiStok>(KEYS.MUTASI);
        mutasiList.push({
          id: Math.random().toString(36).substr(2, 9),
          tanggal: Date.now(),
          obatId: item.obatId,
          tipe: 'Masuk',
          jumlah: item.jumlah,
          saldoAwal,
          saldoAkhir: saldoAwal + item.jumlah,
          referensiId: newItem.id,
          referensiNomor: newItem.nomor,
          keterangan: `Penerimaan dari BAPB ${newItem.nomor}`
        });
        set(KEYS.MUTASI, mutasiList);
      }
    });

    // Mark SP as Completed if exists
    if (data.spId) {
      const spList = get<SuratPesanan>(KEYS.SP);
      const spIdx = spList.findIndex(s => s.id === data.spId);
      if (spIdx > -1) {
        spList[spIdx].status = 'Completed';
        set(KEYS.SP, spList);
      }
    }

    return newItem;
  },
  deleteBAPB: (id: string) => {
    const list = get<BAPB>(KEYS.BAPB);
    const item = list.find(i => i.id === id);
    if (!item) return;

    // Reverse Stock
    item.items.forEach(detil => {
      const obats = get<Obat>(KEYS.OBAT);
      const oIdx = obats.findIndex(o => o.id === detil.obatId);
      if (oIdx > -1) {
        const saldoAwal = obats[oIdx].stokTotal;
        obats[oIdx].stokTotal -= detil.jumlah;
        set(KEYS.OBAT, obats);

        // Log Reverse Mutasi
        const mutasiList = get<MutasiStok>(KEYS.MUTASI);
        mutasiList.push({
          id: Math.random().toString(36).substr(2, 9),
          tanggal: Date.now(),
          obatId: detil.obatId,
          tipe: 'Keluar',
          jumlah: detil.jumlah,
          saldoAwal,
          saldoAkhir: saldoAwal - detil.jumlah,
          referensiId: item.id,
          referensiNomor: item.nomor,
          keterangan: `Pembatalan/Hapus BAPB ${item.nomor}`
        });
        set(KEYS.MUTASI, mutasiList);
      }
    });

    // If it was linked to SP, we might want to revert SP status to 'Sent' 
    // but in a real system we usually don't delete BAPBs once verified.
    // For this app, let's revert SP status if it exists.
    if (item.spId) {
       const spList = get<SuratPesanan>(KEYS.SP);
       const spIdx = spList.findIndex(s => s.id === item.spId);
       if (spIdx > -1) {
         spList[spIdx].status = 'Sent';
         set(KEYS.SP, spList);
       }
    }

    const filtered = list.filter(i => i.id !== id);
    set(KEYS.BAPB, filtered);
  },
  updateBAPB: (id: string, data: Partial<BAPB>) => {
    const list = get<BAPB>(KEYS.BAPB);
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return;

    const oldBAPB = list[index];

    // 1. Revert previous stock
    oldBAPB.items.forEach(item => {
      const obats = get<Obat>(KEYS.OBAT);
      const obatIndex = obats.findIndex(o => o.id === item.obatId);
      if (obatIndex > -1) {
        const saldoAwal = obats[obatIndex].stokTotal;
        obats[obatIndex].stokTotal = (obats[obatIndex].stokTotal || 0) - item.jumlah;
        set(KEYS.OBAT, obats);

        // Log Mutasi (Reversal)
        const mutasiList = get<MutasiStok>(KEYS.MUTASI);
        mutasiList.push({
          id: Math.random().toString(36).substr(2, 9),
          tanggal: Date.now(),
          obatId: item.obatId,
          tipe: 'Keluar',
          jumlah: item.jumlah,
          saldoAwal,
          saldoAkhir: saldoAwal - item.jumlah,
          referensiId: oldBAPB.id,
          referensiNomor: oldBAPB.nomor,
          keterangan: `Revisi BAPB ${oldBAPB.nomor} (Koreksi Stok Lama)`
        });
        set(KEYS.MUTASI, mutasiList);
      }
    });

    // 2. Update BAPB record
    const updatedBAPB = { ...oldBAPB, ...data };
    list[index] = updatedBAPB;
    set(KEYS.BAPB, list);

    // 3. Apply new stock
    updatedBAPB.items.forEach(item => {
      const obats = get<Obat>(KEYS.OBAT);
      const obatIndex = obats.findIndex(o => o.id === item.obatId);
      if (obatIndex > -1) {
        const saldoAwal = obats[obatIndex].stokTotal;
        obats[obatIndex].stokTotal = (obats[obatIndex].stokTotal || 0) + item.jumlah;
        set(KEYS.OBAT, obats);

        // Log Mutasi (New)
        const mutasiList = get<MutasiStok>(KEYS.MUTASI);
        mutasiList.push({
          id: Math.random().toString(36).substr(2, 9),
          tanggal: Date.now(),
          obatId: item.obatId,
          tipe: 'Masuk',
          jumlah: item.jumlah,
          saldoAwal,
          saldoAkhir: saldoAwal + item.jumlah,
          referensiId: updatedBAPB.id,
          referensiNomor: updatedBAPB.nomor,
          keterangan: `Revisi BAPB ${updatedBAPB.nomor} (Koreksi Stok Baru)`
        });
        set(KEYS.MUTASI, mutasiList);
      }
    });
  },
  markBAPBPaid: (id: string) => {
    const list = get<BAPB>(KEYS.BAPB);
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return;
    list[index].status = 'Paid';
    list[index].paid_at = Date.now();
    set(KEYS.BAPB, list);
  },

  // Mutasi/Kartu Stok
  getMutasi: (obatId?: string) => {
    const list = get<MutasiStok>(KEYS.MUTASI);
    if (obatId) return list.filter(m => m.obatId === obatId);
    return list;
  },

  logMutasi: (entry: Omit<MutasiStok, 'id'>) => {
    const list = get<MutasiStok>(KEYS.MUTASI);
    const newEntry: MutasiStok = { ...entry, id: Math.random().toString(36).substr(2, 9) };
    list.push(newEntry);
    set(KEYS.MUTASI, list);
    return newEntry;
  },

  // Transaksi/Peresepan
  getTransaksi: () => get<Transaksi>(KEYS.TRANSAKSI),
  addTransaksi: (data: Omit<Transaksi, 'id'>) => {
    const list = get<Transaksi>(KEYS.TRANSAKSI);
    const newItem: Transaksi = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.TRANSAKSI, list);

    // Update Stok and log mutasi
    data.items.forEach(item => {
      const obats = get<Obat>(KEYS.OBAT);
      const obatIndex = obats.findIndex(o => o.id === item.obatId);
      if (obatIndex > -1) {
        const saldoAwal = obats[obatIndex].stokTotal;
        obats[obatIndex].stokTotal -= item.jumlah;
        set(KEYS.OBAT, obats);

        // Log Mutasi
        const mutasiList = get<MutasiStok>(KEYS.MUTASI);
        mutasiList.push({
          id: Math.random().toString(36).substr(2, 9),
          tanggal: Date.now(),
          obatId: item.obatId,
          tipe: 'Keluar',
          jumlah: item.jumlah,
          saldoAwal,
          saldoAkhir: saldoAwal - item.jumlah,
          referensiId: newItem.id,
          referensiNomor: newItem.nomor,
          keterangan: `Pengeluaran via ${data.tipe} ${newItem.nomor}`
        });
        set(KEYS.MUTASI, mutasiList);
      }
    });

    return newItem;
  },
  updateTransaksi: (id: string, data: Partial<Transaksi>) => {
    const list = get<Transaksi>(KEYS.TRANSAKSI);
    const index = list.findIndex(i => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      set(KEYS.TRANSAKSI, list);
    }
  },
  deleteTransaksi: (id: string) => {
    const list = get<Transaksi>(KEYS.TRANSAKSI);
    const item = list.find(l => l.id === id);
    if (!item) return;

    // Reverse stock
    item.items.forEach(detil => {
      const obats = get<Obat>(KEYS.OBAT);
      const oIdx = obats.findIndex(o => o.id === detil.obatId);
      if (oIdx > -1) {
        const saldoAwal = obats[oIdx].stokTotal;
        obats[oIdx].stokTotal += detil.jumlah;
        set(KEYS.OBAT, obats);

        // Log Reverse Mutasi
        const mutasiList = get<MutasiStok>(KEYS.MUTASI);
        mutasiList.push({
          id: Math.random().toString(36).substr(2, 9),
          tanggal: Date.now(),
          obatId: detil.obatId,
          tipe: 'Masuk',
          jumlah: detil.jumlah,
          saldoAwal,
          saldoAkhir: saldoAwal + detil.jumlah,
          referensiId: item.id,
          referensiNomor: item.nomor,
          keterangan: `Batal/Hapus Transaksi ${item.nomor}`
        });
        set(KEYS.MUTASI, mutasiList);
      }
    });

    const filtered = list.filter(l => l.id !== id);
    set(KEYS.TRANSAKSI, filtered);
  },

  // Stok Opname
  getOpname: () => get<StokOpname>(KEYS.OPNAME),
  addOpname: (data: Omit<StokOpname, 'id'>) => {
    const list = get<StokOpname>(KEYS.OPNAME);
    const newItem: StokOpname = { ...data, id: Math.random().toString(36).substr(2, 9) };
    list.push(newItem);
    set(KEYS.OPNAME, list);

    // Update Obat Stock
    const obats = get<Obat>(KEYS.OBAT);
    const obatIndex = obats.findIndex(o => o.id === data.obatId);
    if (obatIndex > -1) {
      const saldoAwal = obats[obatIndex].stokTotal;
      obats[obatIndex].stokTotal = data.stokFisik;
      set(KEYS.OBAT, obats);

      // Log Mutasi
      const mutasiList = get<MutasiStok>(KEYS.MUTASI);
      mutasiList.push({
        id: Math.random().toString(36).substr(2, 9),
        tanggal: Date.now(),
        obatId: data.obatId,
        tipe: 'Opname',
        jumlah: Math.abs(data.selisih),
        saldoAwal,
        saldoAkhir: data.stokFisik,
        referensiId: newItem.id,
        referensiNomor: `OPN-${newItem.id.substr(0, 4).toUpperCase()}`,
        keterangan: data.keterangan || `Opname Penyesuaian (${data.selisih > 0 ? '+' : ''}${data.selisih})`
      });
      set(KEYS.MUTASI, mutasiList);
    }

    return newItem;
  },
  deleteOpname: (id: string) => {
    const list = get<StokOpname>(KEYS.OPNAME);
    const item = list.find(h => h.id === id);
    if (!item) return;

    // Reverse Stock Impact
    const obats = get<Obat>(KEYS.OBAT);
    const obatIndex = obats.findIndex(o => o.id === item.obatId);
    if (obatIndex > -1) {
      const currentObat = obats[obatIndex];
      const saldoAwal = currentObat.stokTotal;
      const newStok = saldoAwal - item.selisih;
      obats[obatIndex].stokTotal = newStok;
      set(KEYS.OBAT, obats);

      // Log Reversal in Mutasi/Kartu Stok
      const mutasiList = get<MutasiStok>(KEYS.MUTASI);
      mutasiList.push({
        id: Math.random().toString(36).substr(2, 9),
        tanggal: Date.now(),
        obatId: item.obatId,
        tipe: item.selisih > 0 ? 'Keluar' : 'Masuk',
        jumlah: Math.abs(item.selisih),
        saldoAwal,
        saldoAkhir: newStok,
        referensiId: item.id,
        referensiNomor: `REV-OPN`,
        keterangan: `Pembatalkan Opname (Kembali ke stok sebelum selisih ${item.selisih})`
      });
      set(KEYS.MUTASI, mutasiList);
    }

    const filtered = list.filter(h => h.id !== id);
    set(KEYS.OPNAME, filtered);
  },

  // Analytics
  getSalesAnalytics: () => {
    const txs = get<Transaksi>(KEYS.TRANSAKSI);
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return format(date, 'yyyy-MM-dd');
    });

    const salesByDay = last30Days.map(date => {
      const daySales = txs.filter(t => t.tanggal.startsWith(date))
        .reduce((sum, t) => sum + t.total, 0);
      return { date: format(parseISO(date), 'dd/MM'), total: daySales };
    });

    return salesByDay;
  },

  getTopProducts: () => {
    const txs = get<Transaksi>(KEYS.TRANSAKSI);
    const productSales: Record<string, { nama: string; total: number }> = {};

    txs.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.obatId]) {
          productSales[item.obatId] = { nama: item.namaObat, total: 0 };
        }
        productSales[item.obatId].total += item.jumlah;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  },

  getExpiryAlerts: () => {
    const bapbs = get<BAPB>(KEYS.BAPB);
    const obats = get<Obat>(KEYS.OBAT);
    const alerts: any[] = [];

    bapbs.forEach(b => {
      b.items.forEach(item => {
        if (item.kadaluarsa) {
          const expDate = parseISO(item.kadaluarsa);
          const daysToExpiry = differenceInDays(expDate, new Date());
          if (daysToExpiry <= 90 && daysToExpiry > 0) {
            const obat = obats.find(o => o.id === item.obatId);
            alerts.push({
               obatNama: item.namaObat,
               kode: obat?.kode,
               batch: item.batch,
               kadaluarsa: item.kadaluarsa,
               daysLeft: daysToExpiry
            });
          }
        }
      });
    });

    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  },

  getReorderSuggestions: () => {
    const obats = get<Obat>(KEYS.OBAT);
    const suggestions = obats
      .filter(o => (o.stokTotal || 0) <= (o.minStok || 0))
      .map(o => ({
        id: o.id,
        kode: o.kode,
        nama: o.nama,
        stokSekarang: o.stokTotal || 0,
        minStok: o.minStok || 0,
        saranOrder: Math.max((o.maxStok || (o.minStok * 2)) - (o.stokTotal || 0), o.minStok),
        kategori: o.kategori
      }));
    return suggestions;
  },

  getInventoryForecast: () => {
    const txs = get<Transaksi>(KEYS.TRANSAKSI);
    const obats = get<Obat>(KEYS.OBAT);
    
    // Calculate total units sold per item in last 30 days
    const itemVelocity: Record<string, number> = {};
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    txs.filter(t => new Date(t.tanggal).getTime() > thirtyDaysAgo).forEach(t => {
      t.items.forEach(item => {
        itemVelocity[item.obatId] = (itemVelocity[item.obatId] || 0) + item.jumlah;
      });
    });

    return obats.map(o => {
      const soldLastMonth = itemVelocity[o.id] || 0;
      const dailyVelocity = soldLastMonth / 30;
      const daysRemaining = dailyVelocity > 0 ? (o.stokTotal / dailyVelocity) : 999;
      
      return {
        id: o.id,
        nama: o.nama,
        stok: o.stokTotal,
        velocity: dailyVelocity,
        daysRemaining: Math.round(daysRemaining),
        status: daysRemaining < 7 ? 'Critical' : daysRemaining < 14 ? 'Warning' : 'Healthy'
      };
    }).filter(o => o.velocity > 0 || o.stok < 10).sort((a,b) => a.daysRemaining - b.daysRemaining);
  },

  getFinancialInsights: () => {
    const txs = get<Transaksi>(KEYS.TRANSAKSI);
    const bapbs = get<BAPB>(KEYS.BAPB);
    
    const totalRevenue = txs.reduce((sum, t) => sum + t.total, 0);
    const totalPurchases = bapbs.reduce((sum, b) => sum + (b.jumlahDibayar || 0), 0);
    
    // Simple profit margin estimate
    // In real app we would track COGS (HPP) precisely
    const estimatedProfit = txs.reduce((sum, t) => {
      const txProfit = t.items.reduce((pSum, item) => {
        // We assume 20% margin if cost isn't tracked properly per transaction
        const itemPrice = (t.total / t.items.length); // simplified
        return pSum + (itemPrice * 0.2); 
      }, 0);
      return sum + txProfit;
    }, 0);

    return {
      revenue: totalRevenue,
      purchases: totalPurchases,
      grossProfit: estimatedProfit,
      margin: totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0
    };
  },

  // Backup & Restore
  exportData: () => {
    const data: Record<string, any> = {};
    Object.entries(KEYS).forEach(([key, storageKey]) => {
      data[key] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    });
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      Object.entries(KEYS).forEach(([key, storageKey]) => {
        if (data[key]) {
          localStorage.setItem(storageKey, JSON.stringify(data[key]));
        }
      });
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  addLog: (action: string, module: string) => {
    const logs = get<Log>(KEYS.ACTIVITY);
    const newLog: Log = {
      id: Math.random().toString(36).substr(2, 9),
      user: 'Administrator',
      action,
      module,
      timestamp: Date.now()
    };
    localStorage.setItem(KEYS.ACTIVITY, JSON.stringify([newLog, ...logs].slice(0, 50)));
  },

  getLogs: (limit = 10) => {
    return get<Log>(KEYS.ACTIVITY).slice(0, limit);
  },

  // App Settings
  getSettings: (): AppSettings => {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return {
      namaKlinik: 'KLINIK ASUHAN SEHAT',
      alamatKlinik: 'Jln. Sehat Selalu No. 123, Yogyakarta',
      teleponKlinik: '0274-123456',
      logoKlinik: '',
      namaPenanggungJawab: 'APT. AZIZ DZULFIQAR, S.FARM',
      noSIPA: '19950101/SIPA_34.71/2023/2.1.1',
      persenPPN: 11,
      persenMargin: 25
    };
    return JSON.parse(raw);
  },
  updateSettings: (data: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data));
  }
};

// Initial Data Seed if empty
if (dataService.getLokasi().length === 0) {
  dataService.addLokasi({ kode: 'LOC-001', nama: 'GUDANG UTAMA - RAK A' });
  dataService.addLokasi({ kode: 'LOC-002', nama: 'GUDANG UTAMA - RAK B' });
}
if (dataService.getKategori().length === 0) {
  ['OBAT BEBAS', 'OBAT KERAS', 'OBAT PSIKOTROPIKA', 'ALAT KESEHATAN', 'SUPLEMEN'].forEach(nama => dataService.addKategori({ nama }));
}
if (dataService.getSatuan().length === 0) {
  ['TABLET', 'KAPSUL', 'SIRUP', 'AMPULE', 'VIAL', 'PCS', 'BOX'].forEach(nama => dataService.addSatuan({ nama }));
}
if (dataService.getCustomers().length === 0) {
  dataService.addCustomer({ kode: 'CUST-001', nama: 'AZIZ DZULFIQAR', alamat: 'Gamping, Yogyakarta', telepon: '08123456789', aktif: true });
}
if (dataService.getSuppliers().length === 0) {
  dataService.addSupplier({ kode: 'SPL-001', nama: 'PT Kimia Farma', alamat: 'Jakarta', telepon: '021-123456' });
}
if (dataService.getDokter().length === 0) {
  dataService.addDokter({ kode: 'DR-001', nama: 'DR. RUDY, SP.A', spesialisasi: 'SPESIALIS ANAK', telepon: '0812-9876-5432' });
  dataService.addDokter({ kode: 'DR-002', nama: 'DR. SANTI, SP.PD', spesialisasi: 'PENYAKIT DALAM', telepon: '0813-1122-3344' });
}
if (dataService.getSpesialis().length === 0) {
  dataService.addSpesialis({ nama: 'UMUM' });
  dataService.addSpesialis({ nama: 'SPESIALIS ANAK' });
  dataService.addSpesialis({ nama: 'PENYAKIT DALAM' });
  dataService.addSpesialis({ nama: 'BEDAH' });
  dataService.addSpesialis({ nama: 'KANDUNGAN' });
}
if (dataService.getObat().length === 0) {
  const medicineData = [
    { kode: 'OB-001', nama: 'Paracetamol 500mg', satuan: 'TABLET', kategori: 'OBAT BEBAS', stokTotal: 100, minStok: 50, hargaBeli: 500, hargaJual: 1000, deskripsi: 'Penurun panas dan pereda nyeri' },
    { kode: 'OB-002', nama: 'Amoxicillin 500mg', satuan: 'KAPSUL', kategori: 'OBAT KERAS', stokTotal: 80, minStok: 30, hargaBeli: 1200, hargaJual: 2000, deskripsi: 'Antibiotik' },
    { kode: 'OB-003', nama: 'Cefadroxil 500mg', satuan: 'KAPSUL', kategori: 'OBAT KERAS', stokTotal: 50, minStok: 20, hargaBeli: 2500, hargaJual: 4000, deskripsi: 'Antibiotik cephalosporin' },
    { kode: 'OB-004', nama: 'Dexamethasone 0.5mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 200, minStok: 100, hargaBeli: 200, hargaJual: 500, deskripsi: 'Kortikosteroid anti-inflamasi' },
    { kode: 'OB-005', nama: 'Asam Mefenamat 500mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 150, minStok: 50, hargaBeli: 800, hargaJual: 1500, deskripsi: 'Pereda nyeri sedang' },
    { kode: 'OB-006', nama: 'Antasida Doen', satuan: 'TABLET', kategori: 'OBAT BEBAS', stokTotal: 300, minStok: 100, hargaBeli: 300, hargaJual: 600, deskripsi: 'Penetral asam lambung' },
    { kode: 'OB-007', nama: 'Amlodipine 5mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 120, minStok: 40, hargaBeli: 1000, hargaJual: 1800, deskripsi: 'Obat darah tinggi' },
    { kode: 'OB-008', nama: 'Metformin 500mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 150, minStok: 50, hargaBeli: 900, hargaJual: 1600, deskripsi: 'Obat diabetes' },
    { kode: 'OB-009', nama: 'Omeprazole 20mg', satuan: 'KAPSUL', kategori: 'OBAT KERAS', stokTotal: 90, minStok: 30, hargaBeli: 3000, hargaJual: 5500, deskripsi: 'Pengahambat pompa proton' },
    { kode: 'OB-010', nama: 'Cetirizine 10mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 100, minStok: 30, hargaBeli: 1100, hargaJual: 2000, deskripsi: 'Antihistamin/Anti-alergi' },
    { kode: 'OB-011', nama: 'OBH Sirup 100ml', satuan: 'SIRUP', kategori: 'OBAT BEBAS', stokTotal: 40, minStok: 10, hargaBeli: 15000, hargaJual: 22000, deskripsi: 'Obat batuk hitam' },
    { kode: 'OB-012', nama: 'Sanmol Sirup', satuan: 'SIRUP', kategori: 'OBAT BEBAS', stokTotal: 30, minStok: 10, hargaBeli: 18000, hargaJual: 25000, deskripsi: 'Sirup penurun panas anak' },
    { kode: 'OB-013', nama: 'Vitamin C 500mg', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 500, minStok: 100, hargaBeli: 500, hargaJual: 1000, deskripsi: 'Suplemen daya tahan tubuh' },
    { kode: 'OB-014', nama: 'Sangobion', satuan: 'KAPSUL', kategori: 'SUPLEMEN', stokTotal: 120, minStok: 30, hargaBeli: 2500, hargaJual: 3500, deskripsi: 'Suplemen penambah darah' },
    { kode: 'OB-015', nama: 'Masker Bedah 3-Ply', satuan: 'BOX', kategori: 'ALAT KESEHATAN', stokTotal: 25, minStok: 5, hargaBeli: 35000, hargaJual: 50000, deskripsi: 'Masker pelindung' },
    { kode: 'OB-016', nama: 'Hansaplast Plester', satuan: 'PCS', kategori: 'ALAT KESEHATAN', stokTotal: 100, minStok: 20, hargaBeli: 1000, hargaJual: 2000, deskripsi: 'Plester luka' },
    { kode: 'OB-017', nama: 'Betadine 15ml', satuan: 'PCS', kategori: 'OBAT BEBAS', stokTotal: 50, minStok: 10, hargaBeli: 12000, hargaJual: 18000, deskripsi: 'Antiseptik luka' },
    { kode: 'OB-018', nama: 'Salbutamol 2mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 100, minStok: 30, hargaBeli: 400, hargaJual: 800, deskripsi: 'Obat asma' },
    { kode: 'OB-019', nama: 'Loperamide 2mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 80, minStok: 20, hargaBeli: 600, hargaJual: 1200, deskripsi: 'Obat diare' },
    { kode: 'OB-020', nama: 'Alprazolam 0.5mg', satuan: 'TABLET', kategori: 'OBAT PSIKOTROPIKA', stokTotal: 30, minStok: 10, hargaBeli: 5000, hargaJual: 8000, deskripsi: 'Obat penenang (Psikotropika)' },
    { kode: 'OB-021', nama: 'Diazepam 2mg', satuan: 'TABLET', kategori: 'OBAT PSIKOTROPIKA', stokTotal: 20, minStok: 5, hargaBeli: 4500, hargaJual: 7500, deskripsi: 'Anti-ansietas' },
    { kode: 'OB-022', nama: 'Simvastatin 10mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 100, minStok: 30, hargaBeli: 1200, hargaJual: 2200, deskripsi: 'Penurun kolesterol' },
    { kode: 'OB-023', nama: 'Ranitidine 150mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 120, minStok: 40, hargaBeli: 800, hargaJual: 1500, deskripsi: 'Obat maag/tukak lambung' },
    { kode: 'OB-024', nama: 'Captopril 25mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 150, minStok: 50, hargaBeli: 500, hargaJual: 1000, deskripsi: 'Obat hipertensi' },
    { kode: 'OB-025', nama: 'Spironolakton 25mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 60, minStok: 20, hargaBeli: 2000, hargaJual: 3500, deskripsi: 'Diuretik' },
    { kode: 'OB-026', nama: 'Furosemide 40mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 100, minStok: 30, hargaBeli: 400, hargaJual: 900, deskripsi: 'Obat diuretik' },
    { kode: 'OB-027', nama: 'Neurobion Forte', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 100, minStok: 20, hargaBeli: 4000, hargaJual: 5500, deskripsi: 'Vitamin saraf' },
    { kode: 'OB-028', nama: 'Alcohol 70% 100ml', satuan: 'PCS', kategori: 'ALAT KESEHATAN', stokTotal: 40, minStok: 10, hargaBeli: 8000, hargaJual: 12000, deskripsi: 'Cairan antiseptik' },
    { kode: 'OB-029', nama: 'Kasa Steril 16x16', satuan: 'BOX', kategori: 'ALAT KESEHATAN', stokTotal: 30, minStok: 5, hargaBeli: 12000, hargaJual: 18000, deskripsi: 'Kasa penutup luka' },
    { kode: 'OB-030', nama: 'Glimepiride 2mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 80, minStok: 20, hargaBeli: 1500, hargaJual: 2500, deskripsi: 'Obat diabetes oral' },
    { kode: 'OB-031', nama: 'Metronidazole 500mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 50, minStok: 15, hargaBeli: 1000, hargaJual: 1800, deskripsi: 'Anti-amuba' },
    { kode: 'OB-032', nama: 'Acyclovir 400mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 60, minStok: 20, hargaBeli: 800, hargaJual: 1500, deskripsi: 'Obat anti-virus (Herpes)' },
    { kode: 'OB-033', nama: 'Allopurinol 100mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 100, minStok: 30, hargaBeli: 600, hargaJual: 1200, deskripsi: 'Obat asam urat' },
    { kode: 'OB-034', nama: 'Meloxicam 15mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 40, minStok: 10, hargaBeli: 2500, hargaJual: 4500, deskripsi: 'Anti-inflamasi (Rematik)' },
    { kode: 'OB-035', nama: 'Ketoconazole Cr 2%', satuan: 'PCS', kategori: 'OBAT KERAS', stokTotal: 30, minStok: 5, hargaBeli: 7000, hargaJual: 12000, deskripsi: 'Salep antijamur' },
    { kode: 'OB-036', nama: 'Gentamicin Tetes Mata', satuan: 'PCS', kategori: 'OBAT KERAS', stokTotal: 25, minStok: 5, hargaBeli: 15000, hargaJual: 22000, deskripsi: 'Obat tetes mata infeksi' },
    { kode: 'OB-037', nama: 'Lansoprazole 30mg', satuan: 'KAPSUL', kategori: 'OBAT KERAS', stokTotal: 50, minStok: 15, hargaBeli: 4000, hargaJual: 7000, deskripsi: 'Obat asam lambung kronis' },
    { kode: 'OB-038', nama: 'Attapulgite (Oralit)', satuan: 'TABLET', kategori: 'OBAT BEBAS', stokTotal: 200, minStok: 50, hargaBeli: 500, hargaJual: 1000, deskripsi: 'Obat antidiare' },
    { kode: 'OB-039', nama: 'Imboost Force', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 60, minStok: 10, hargaBeli: 6000, hargaJual: 8500, deskripsi: 'Imunomodulator' },
    { kode: 'OB-040', nama: 'Curcuma Plus', satuan: 'SIRUP', kategori: 'SUPLEMEN', stokTotal: 25, minStok: 5, hargaBeli: 20000, hargaJual: 28000, deskripsi: 'Suplemen napsu makan' },
    { kode: 'OB-041', nama: 'Interbat Microlax', satuan: 'PCS', kategori: 'OBAT BEBAS', stokTotal: 20, minStok: 5, hargaBeli: 22000, hargaJual: 30000, deskripsi: 'Pencahar dubur' },
    { kode: 'OB-042', nama: 'Infus NaCl 0.9% 500ml', satuan: 'VIAL', kategori: 'ALAT KESEHATAN', stokTotal: 40, minStok: 10, hargaBeli: 12000, hargaJual: 18000, deskripsi: 'Cairan infus fisiologis' },
    { kode: 'OB-043', nama: 'Abocath No. 24', satuan: 'PCS', kategori: 'ALAT KESEHATAN', stokTotal: 50, minStok: 15, hargaBeli: 15000, hargaJual: 20000, deskripsi: 'Jarum infus pediatrik' },
    { kode: 'OB-044', nama: 'Termometer Digital', satuan: 'PCS', kategori: 'ALAT KESEHATAN', stokTotal: 15, minStok: 3, hargaBeli: 35000, hargaJual: 55000, deskripsi: 'Alat ukur suhu tubuh' },
    { kode: 'OB-045', nama: 'Bisoprolol 5mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 60, minStok: 20, hargaBeli: 3000, hargaJual: 5000, deskripsi: 'Beta-blocker jantung' },
    { kode: 'OB-046', nama: 'Candesartan 8mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 70, minStok: 20, hargaBeli: 4500, hargaJual: 7500, deskripsi: 'Obat hipertensi baru' },
    { kode: 'OB-047', nama: 'Lorazepam 1mg', satuan: 'TABLET', kategori: 'OBAT PSIKOTROPIKA', stokTotal: 25, minStok: 5, hargaBeli: 6000, hargaJual: 9500, deskripsi: 'Sedatif-hipnotik' },
    { kode: 'OB-048', nama: 'Cefixime 100mg', satuan: 'KAPSUL', kategori: 'OBAT KERAS', stokTotal: 45, minStok: 15, hargaBeli: 3500, hargaJual: 6000, deskripsi: 'Antibiotik cephalosporin gen 3' },
    { kode: 'OB-049', nama: 'Dramamine 50mg', satuan: 'TABLET', kategori: 'OBAT BEBAS', stokTotal: 100, minStok: 20, hargaBeli: 2000, hargaJual: 3500, deskripsi: 'Obat mabuk perjalanan' },
    { kode: 'OB-050', nama: 'Tensoplast Strip', satuan: 'BOX', kategori: 'ALAT KESEHATAN', stokTotal: 20, minStok: 5, hargaBeli: 25000, hargaJual: 35000, deskripsi: 'Plester strip luka' },
    { kode: 'OB-051', nama: 'Ibuprofen 400mg', satuan: 'TABLET', kategori: 'OBAT BEBAS TERBATAS', stokTotal: 150, minStok: 50, hargaBeli: 800, hargaJual: 1500, deskripsi: 'Anti-inflamasi pereda nyeri' },
    { kode: 'OB-052', nama: 'Loratadine 10mg', satuan: 'TABLET', kategori: 'OBAT BEBAS TERBATAS', stokTotal: 100, minStok: 30, hargaBeli: 500, hargaJual: 1000, deskripsi: 'Antihistamin non-sedatif' },
    { kode: 'OB-053', nama: 'Naproxen 250mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 80, minStok: 25, hargaBeli: 1500, hargaJual: 2500, deskripsi: 'NSAID untuk nyeri sendi' },
    { kode: 'OB-054', nama: 'Diphenhydramine 25mg', satuan: 'KAPSUL', kategori: 'OBAT BEBAS TERBATAS', stokTotal: 120, minStok: 40, hargaBeli: 300, hargaJual: 700, deskripsi: 'Antihistamin penyebab kantuk' },
    { kode: 'OB-055', nama: 'Prednisone 5mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 200, minStok: 50, hargaBeli: 400, hargaJual: 800, deskripsi: 'Kortikosteroid sistemik' },
    { kode: 'OB-056', nama: 'Lisinopril 10mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 100, minStok: 30, hargaBeli: 1200, hargaJual: 2200, deskripsi: 'ACE inhibitor untuk hipertensi' },
    { kode: 'OB-057', nama: 'Atorvastatin 20mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 90, minStok: 25, hargaBeli: 3000, hargaJual: 5000, deskripsi: 'Statin penurun kolesterol' },
    { kode: 'OB-058', nama: 'Hydrochlorothiazide 12.5mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 110, minStok: 30, hargaBeli: 300, hargaJual: 800, deskripsi: 'Diuretik thiazide' },
    { kode: 'OB-059', nama: 'Losartan 50mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 85, minStok: 20, hargaBeli: 2000, hargaJual: 3500, deskripsi: 'Angiotensin II receptor blocker' },
    { kode: 'OB-060', nama: 'Gabapentin 300mg', satuan: 'KAPSUL', kategori: 'OBAT KERAS', stokTotal: 70, minStok: 15, hargaBeli: 2500, hargaJual: 4500, deskripsi: 'Obat nyeri neuropatik' },
    { kode: 'OB-061', nama: 'Sertraline 50mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 50, minStok: 10, hargaBeli: 5000, hargaJual: 8500, deskripsi: 'Antidepresan SSRI' },
    { kode: 'OB-062', nama: 'Fluoxetine 20mg', satuan: 'KAPSUL', kategori: 'OBAT KERAS', stokTotal: 40, minStok: 10, hargaBeli: 4500, hargaJual: 7500, deskripsi: 'Antidepresan' },
    { kode: 'OB-063', nama: 'Escitalopram 10mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 60, minStok: 15, hargaBeli: 6000, hargaJual: 10000, deskripsi: 'Obat gangguan kecemasan' },
    { kode: 'OB-064', nama: 'Pantoprazole 40mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 90, minStok: 25, hargaBeli: 3500, hargaJual: 6000, deskripsi: 'Penghambat asam lambung' },
    { kode: 'OB-065', nama: 'Famotidine 20mg', satuan: 'TABLET', kategori: 'OBAT BEBAS TERBATAS', stokTotal: 100, minStok: 30, hargaBeli: 800, hargaJual: 1500, deskripsi: 'H2 blocker untuk maag' },
    { kode: 'OB-066', nama: 'Clopidogrel 75mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 80, minStok: 20, hargaBeli: 5000, hargaJual: 9000, deskripsi: 'Anti-platelet pengencer darah' },
    { kode: 'OB-067', nama: 'Warfarin 5mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 50, minStok: 10, hargaBeli: 1500, hargaJual: 3000, deskripsi: 'Antikoagulan' },
    { kode: 'OB-068', nama: 'Levothyroxine 50mcg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 120, minStok: 30, hargaBeli: 1000, hargaJual: 2000, deskripsi: 'Hormon tiroid' },
    { kode: 'OB-069', nama: 'Rosuvastatin 10mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 85, minStok: 20, hargaBeli: 4000, hargaJual: 7500, deskripsi: 'Penurun lipid kuat' },
    { kode: 'OB-070', nama: 'Tamsulosin 0.4mg', satuan: 'KAPSUL', kategori: 'OBAT KERAS', stokTotal: 60, minStok: 15, hargaBeli: 5000, hargaJual: 9000, deskripsi: 'Obat prostat' },
    { kode: 'OB-071', nama: 'Finasteride 5mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 40, minStok: 10, hargaBeli: 8000, hargaJual: 14000, deskripsi: 'Obat pembesaran prostat' },
    { kode: 'OB-072', nama: 'Sildenafil 50mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 30, minStok: 5, hargaBeli: 15000, hargaJual: 25000, deskripsi: 'Obat disfungsi ereksi' },
    { kode: 'OB-073', nama: 'Montelukast 10mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 50, minStok: 10, hargaBeli: 6000, hargaJual: 11000, deskripsi: 'Obat asma dan alergi' },
    { kode: 'OB-074', nama: 'Albuterol Inhaler', satuan: 'PCS', kategori: 'OBAT KERAS', stokTotal: 25, minStok: 5, hargaBeli: 45000, hargaJual: 65000, deskripsi: 'Inhaler pereda asma' },
    { kode: 'OB-075', nama: 'Budesonide Inhaler', satuan: 'PCS', kategori: 'OBAT KERAS', stokTotal: 15, minStok: 3, hargaBeli: 120000, hargaJual: 165000, deskripsi: 'Steroid inhalasi' },
    { kode: 'OB-076', nama: 'Metoprolol 50mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 80, minStok: 20, hargaBeli: 1500, hargaJual: 2800, deskripsi: 'Beta-blocker selektif' },
    { kode: 'OB-077', nama: 'Carvedilol 6.25mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 60, minStok: 15, hargaBeli: 2000, hargaJual: 3500, deskripsi: 'Beta-blocker non-selektif' },
    { kode: 'OB-078', nama: 'Zolpidem 5mg', satuan: 'TABLET', kategori: 'OBAT PSIKOTROPIKA', stokTotal: 30, minStok: 5, hargaBeli: 8000, hargaJual: 13000, deskripsi: 'Obat tidur' },
    { kode: 'OB-079', nama: 'Vitamin D3 1000IU', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 200, minStok: 50, hargaBeli: 1500, hargaJual: 2500, deskripsi: 'Kesehatan tulang dan imun' },
    { kode: 'OB-080', nama: 'Vitamin B12 500mcg', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 300, minStok: 50, hargaBeli: 500, hargaJual: 1200, deskripsi: 'Kesehatan saraf' },
    { kode: 'OB-081', nama: 'Folic Acid 400mcg', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 150, minStok: 30, hargaBeli: 400, hargaJual: 1000, deskripsi: 'Kesehatan janin & sel darah' },
    { kode: 'OB-082', nama: 'Magnesium Citrate', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 100, minStok: 20, hargaBeli: 2500, hargaJual: 4500, deskripsi: 'Kesehatan otot dan saraf' },
    { kode: 'OB-083', nama: 'Calcium Carbonate', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 250, minStok: 50, hargaBeli: 600, hargaJual: 1200, deskripsi: 'Kalsium tulang' },
    { kode: 'OB-084', nama: 'Omega-3 Fish Oil', satuan: 'KAPSUL', kategori: 'SUPLEMEN', stokTotal: 120, minStok: 20, hargaBeli: 3500, hargaJual: 6000, deskripsi: 'Kesehatan jantung' },
    { kode: 'OB-085', nama: 'Probiotics', satuan: 'KAPSUL', kategori: 'SUPLEMEN', stokTotal: 80, minStok: 15, hargaBeli: 5000, hargaJual: 8000, deskripsi: 'Kesehatan pencernaan' },
    { kode: 'OB-086', nama: 'Zinc Gluconate', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 140, minStok: 30, hargaBeli: 800, hargaJual: 1800, deskripsi: 'Pemulihan tubuh' },
    { kode: 'OB-087', nama: 'Echinacea Extract', satuan: 'KAPSUL', kategori: 'SUPLEMEN', stokTotal: 50, minStok: 10, hargaBeli: 6500, hargaJual: 9500, deskripsi: 'Suplemen herbal imun' },
    { kode: 'OB-088', nama: 'Ginger Root 500mg', satuan: 'KAPSUL', kategori: 'SUPLEMEN', stokTotal: 70, minStok: 15, hargaBeli: 3000, hargaJual: 5500, deskripsi: 'Mual dan pencernaan' },
    { kode: 'OB-089', nama: 'Turmeric Curcumin', satuan: 'KAPSUL', kategori: 'SUPLEMEN', stokTotal: 90, minStok: 20, hargaBeli: 4000, hargaJual: 6500, deskripsi: 'Anti-oksidan alami' },
    { kode: 'OB-090', nama: 'CoQ10 100mg', satuan: 'KAPSUL', kategori: 'SUPLEMEN', stokTotal: 40, minStok: 10, hargaBeli: 12000, hargaJual: 18000, deskripsi: 'Energi seluler' },
    { kode: 'OB-091', nama: 'Glucosamine 500mg', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 100, minStok: 20, hargaBeli: 3500, hargaJual: 5500, deskripsi: 'Kesehatan persendian' },
    { kode: 'OB-092', nama: 'Chondroitin 400mg', satuan: 'TABLET', kategori: 'SUPLEMEN', stokTotal: 100, minStok: 20, hargaBeli: 4000, hargaJual: 6000, deskripsi: 'Kesehatan tulang rawan' },
    { kode: 'OB-093', nama: 'Biotin 5000mcg', satuan: 'KAPSUL', kategori: 'SUPLEMEN', stokTotal: 110, minStok: 25, hargaBeli: 4500, hargaJual: 7500, deskripsi: 'Kesehatan kulit & rambut' },
    { kode: 'OB-094', nama: 'Melatonin 3mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 60, minStok: 10, hargaBeli: 2000, hargaJual: 3500, deskripsi: 'Hormon pengatur tidur' },
    { kode: 'OB-095', nama: 'Fexofenadine 120mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 75, minStok: 15, hargaBeli: 4500, hargaJual: 8000, deskripsi: 'Antihistamin generasi 3' },
    { kode: 'OB-096', nama: 'Hydroxyzine 25mg', satuan: 'TABLET', kategori: 'OBAT KERAS', stokTotal: 50, minStok: 10, hargaBeli: 1800, hargaJual: 3500, deskripsi: 'Anti-gatal & anti-cemas' },
    { kode: 'OB-097', nama: 'Meclizine 25mg', satuan: 'TABLET', kategori: 'OBAT BEBAS TERBATAS', stokTotal: 100, minStok: 20, hargaBeli: 1000, hargaJual: 2000, deskripsi: 'Obat vertigo/mabuk' },
    { kode: 'OB-098', nama: 'Guaifenesin 200mg', satuan: 'TABLET', kategori: 'OBAT BEBAS TERBATAS', stokTotal: 150, minStok: 40, hargaBeli: 500, hargaJual: 1100, deskripsi: 'Ekspektoran batuk berdahak' },
    { kode: 'OB-099', nama: 'Dextromethorphan HBr', satuan: 'SIRUP', kategori: 'OBAT BEBAS TERBATAS', stokTotal: 40, minStok: 10, hargaBeli: 12000, hargaJual: 18000, deskripsi: 'Penekan batuk kering' },
    { kode: 'OB-100', nama: 'Chlorpheniramine (CTM)', satuan: 'TABLET', kategori: 'OBAT BEBAS TERBATAS', stokTotal: 500, minStok: 100, hargaBeli: 100, hargaJual: 300, deskripsi: 'Antialergi klasik' }
  ];

  medicineData.forEach(item => {
    const obat = dataService.addObat({
      ...item,
      created_at: Date.now()
    });

    // Seed initial Mutasi for each obat
    dataService.logMutasi({
      tanggal: Date.now() - 86400000, 
      obatId: obat.id,
      tipe: 'Masuk',
      jumlah: item.stokTotal,
      saldoAwal: 0,
      saldoAkhir: item.stokTotal,
      referensiId: 'init-' + item.kode,
      referensiNomor: 'BAPB-INIT',
      keterangan: 'Stock Awal Sistem'
    });
  });
}
