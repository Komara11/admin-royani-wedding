"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface Section { title: string; is_bonus: boolean; features: string[]; }
interface Package {
  id: string; name: string; price: string; type: string;
  featured: boolean; sort_order: number; is_active: boolean; sections: Section[];
}

const emptyPkg: Omit<Package, "id"> = {
  name: "", price: "", type: "lengkap", featured: false,
  sort_order: 0, is_active: true, sections: [{ title: "", is_bonus: false, features: [""] }],
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
      const q = query(collection(db, "pricing_packages"), orderBy("sort_order"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Package)));
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
      if (id) {
        await updateDoc(doc(db, "pricing_packages", id), data);
        showToast("Paket berhasil diperbarui");
      } else {
        await addDoc(collection(db, "pricing_packages"), data);
        showToast("Paket berhasil ditambahkan");
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "pricing_packages", deleteId));
      showToast("Paket berhasil dihapus");
      setDeleteId(null);
      fetchItems();
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus", "error");
    }
  };

  // Section helpers
  const updateSection = (idx: number, field: keyof Section, value: unknown) => {
    const secs = [...editItem.sections];
    secs[idx] = { ...secs[idx], [field]: value } as Section;
    setEditItem({ ...editItem, sections: secs });
  };

  const addSection = () => {
    setEditItem({ ...editItem, sections: [...editItem.sections, { title: "", is_bonus: false, features: [""] }] });
  };

  const removeSection = (idx: number) => {
    setEditItem({ ...editItem, sections: editItem.sections.filter((_, i) => i !== idx) });
  };

  const updateFeature = (sIdx: number, fIdx: number, val: string) => {
    const secs = [...editItem.sections];
    secs[sIdx].features[fIdx] = val;
    setEditItem({ ...editItem, sections: secs });
  };

  const addFeature = (sIdx: number) => {
    const secs = [...editItem.sections];
    secs[sIdx].features.push("");
    setEditItem({ ...editItem, sections: secs });
  };

  const removeFeature = (sIdx: number, fIdx: number) => {
    const secs = [...editItem.sections];
    secs[sIdx].features = secs[sIdx].features.filter((_, i) => i !== fIdx);
    setEditItem({ ...editItem, sections: secs });
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Paket</th><th>Harga</th><th>Seksi</th><th>Urutan</th><th>Status</th><th>Unggulan</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-state">Belum ada paket {tab}</td></tr>
              ) : (
                filtered.map((pkg) => (
                  <tr key={pkg.id}>
                    <td><strong>{pkg.name}</strong></td>
                    <td>{pkg.price}</td>
                    <td>{pkg.sections.length} seksi</td>
                    <td>{pkg.sort_order}</td>
                    <td><span className={`badge ${pkg.is_active ? "badge-success" : "badge-danger"}`}>{pkg.is_active ? "Aktif" : "Nonaktif"}</span></td>
                    <td>{pkg.featured ? <span className="badge badge-gold">Best Seller</span> : "—"}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(pkg)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(pkg.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                <button className="btn btn-outline btn-sm" onClick={addSection}>+ Tambah Seksi</button>
              </div>

              {editItem.sections.map((sec, sIdx) => (
                <div key={sIdx} className="section-editor">
                  <div className="section-editor-header">
                    <div className="form-row" style={{ flex: 1, gap: 12 }}>
                      <input
                        value={sec.title} placeholder="Judul Seksi (Dekorasi, Make-up, dll)"
                        onChange={(e) => updateSection(sIdx, "title", e.target.value)}
                        style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.88rem", fontFamily: "inherit" }}
                      />
                      <div className="toggle-wrapper">
                        <button className={`toggle ${sec.is_bonus ? "active" : ""}`} onClick={() => updateSection(sIdx, "is_bonus", !sec.is_bonus)} type="button" />
                        <span style={{ fontSize: "0.8rem" }}>Bonus</span>
                      </div>
                    </div>
                    {editItem.sections.length > 1 && (
                      <button onClick={() => removeSection(sIdx)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 4, marginLeft: 8 }}>✕</button>
                    )}
                  </div>
                  <div className="feature-list">
                    {sec.features.map((f, fIdx) => (
                      <div key={fIdx} className="feature-item">
                        <input
                          value={f} placeholder="Item fitur..."
                          onChange={(e) => updateFeature(sIdx, fIdx, e.target.value)}
                          style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.85rem", fontFamily: "inherit" }}
                        />
                        {sec.features.length > 1 && (
                          <button onClick={() => removeFeature(sIdx, fIdx)}>✕</button>
                        )}
                      </div>
                    ))}
                    <button className="btn btn-outline btn-sm" onClick={() => addFeature(sIdx)} style={{ alignSelf: "flex-start", marginTop: 4 }}>+ Fitur</button>
                  </div>
                </div>
              ))}
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
