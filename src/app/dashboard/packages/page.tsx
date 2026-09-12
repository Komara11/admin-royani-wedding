"use client";

import { useEffect, useState } from "react";
import { getPackages, createPackage, updatePackage, deletePackage, updatePackageOrder } from "@/app/actions";


interface Package {
  id: string; name: string; price: string; type: string;
  featured: boolean; sort_order: number; is_active: boolean; sections: string[];
}

const emptyPkg: Omit<Package, "id"> = {
  name: "", price: "", type: "lengkap", featured: false,
  sort_order: 0, is_active: true, sections: [""],
};

export default function PackagesPage() {
  const [items, setItems] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"akad" | "lengkap">("lengkap");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Omit<Package, "id"> & { id?: string }>(emptyPkg);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = async () => {
    try {
      const snap = await getPackages();
      setItems(snap as any);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter((i) => i.type === tab);

  const openCreate = () => {
    setEditItem({ ...emptyPkg, type: tab, sort_order: filtered.length });
    setModalOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setEditItem(pkg);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, ...data } = editItem as Package;
      if (id) { await updatePackage(id, data); showToast("Paket berhasil diperbarui"); }
      else { await createPackage(data); showToast("Paket berhasil ditambahkan"); }
      setModalOpen(false); fetchItems();
    } catch (err) { console.error(err); showToast("Gagal menyimpan", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deletePackage(deleteId); showToast("Paket berhasil dihapus"); setDeleteId(null); fetchItems(); }
    catch (err) { console.error(err); showToast("Gagal menghapus", "error"); }
  };

  // Features helpers
  const addFeature = () => setEditItem({ ...editItem, sections: [...editItem.sections, ""] });
  const updateFeature = (idx: number, val: string) => {
    const newSecs = [...editItem.sections];
    newSecs[idx] = val;
    setEditItem({ ...editItem, sections: newSecs });
  };
  const removeFeature = (idx: number) => {
    const newSecs = editItem.sections.filter((_, i) => i !== idx);
    setEditItem({ ...editItem, sections: newSecs });
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Paket Harga</h1>
          <p>Kelola paket akad dan lengkap</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Tambah Paket</button>
        </div>
      </div>
      <div className="page-content">
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["lengkap", "akad"] as const).map((t) => (
            <button key={t} className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-outline"}`} onClick={() => setTab(t)}>
              {t === "lengkap" ? "Paket Lengkap" : "Paket Akad"}
            </button>
          ))}
        </div>

        <div className="data-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Tipe</th><th>Nama Paket</th><th>Harga</th><th>Fitur & Bagian</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state">Belum ada data paket</td></tr>
                ) : items.filter((i) => i.type === tab).map((item) => (
                  <tr key={item.id}>
                    <td data-label="Tipe"><span className={`badge ${item.type === "akad" ? "badge-info" : "badge-gold"}`}>{item.type.toUpperCase()}</span></td>
                    <td data-label="Nama Paket"><strong>{item.name}</strong><br /><span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>Urutan: {item.sort_order} {item.featured && <span style={{ color: "var(--gold)" }}>★</span>}</span></td>
                    <td data-label="Harga">{item.price}</td>
                    <td data-label="Fitur Utama"><span className="badge badge-outline">{item.sections[0]?.features?.length || 0} Fitur</span></td>
                    <td data-label="Status"><span className={`badge ${item.is_active ? "badge-success" : "badge-danger"}`}>{item.is_active ? "Aktif" : "Nonaktif"}</span></td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(item.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h2>{editItem.id ? "Edit Paket" : "Tambah Paket"}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nama Paket</label>
                  <input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} placeholder="Gold" />
                </div>
                <div className="form-group">
                  <label>Harga</label>
                  <input value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} placeholder="Rp 20.000.000" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipe</label>
                  <select value={editItem.type} onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}>
                    <option value="lengkap">Lengkap</option><option value="akad">Akad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Urutan</label>
                  <input type="number" value={editItem.sort_order} onChange={(e) => setEditItem({ ...editItem, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <div className="toggle-wrapper">
                    <button className={`toggle ${editItem.is_active ? "active" : ""}`} onClick={() => setEditItem({ ...editItem, is_active: !editItem.is_active })} type="button" />
                    <span style={{ fontSize: "0.88rem" }}>Aktif</span>
                  </div>
                </div>
                <div className="form-group">
                  <div className="toggle-wrapper">
                    <button className={`toggle ${editItem.featured ? "active" : ""}`} onClick={() => setEditItem({ ...editItem, featured: !editItem.featured })} type="button" />
                    <span style={{ fontSize: "0.88rem" }}>Best Seller</span>
                  </div>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "20px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <strong>Seksi Paket</strong>
              </div>
              <div className="feature-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {editItem.sections.map((feat, idx) => (
                  <div key={idx} className="feature-item" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      value={typeof feat === 'string' ? feat : (feat as any).title || (feat as any).features?.[0] || ""} 
                      placeholder="Contoh: 1x sepasang busana akad"
                      onChange={(e) => updateFeature(idx, e.target.value)}
                      style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.88rem", fontFamily: "inherit" }}
                    />
                    <button onClick={() => removeFeature(idx)} type="button" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: "8px" }}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={addFeature} style={{ alignSelf: 'flex-start', marginTop: '8px' }}>+ Tambah Fitur</button>
              </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE */}
      {deleteId && (
        <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="confirm-dialog">
              <h3>Hapus Paket?</h3>
              <p>Data yang dihapus tidak dapat dikembalikan.</p>
              <div className="btn-group">
                <button className="btn btn-outline btn-sm" onClick={() => setDeleteId(null)}>Batal</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
    </>
  );
}
