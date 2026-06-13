"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface FAQ { id: string; question: string; answer: string; sort_order: number; is_active: boolean; }

export default function FaqPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Omit<FAQ, "id"> & { id?: string }>({ question: "", answer: "", sort_order: 0, is_active: true });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchItems = async () => {
    try {
      const q = query(collection(db, "faqs"), orderBy("sort_order"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FAQ)));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditItem({ question: "", answer: "", sort_order: items.length, is_active: true }); setModalOpen(true); };
  const openEdit = (item: FAQ) => { setEditItem(item); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, ...data } = editItem as FAQ;
      if (id) { await updateDoc(doc(db, "faqs", id), data); showToast("FAQ berhasil diperbarui"); }
      else { await addDoc(collection(db, "faqs"), data); showToast("FAQ berhasil ditambahkan"); }
      setModalOpen(false); fetchItems();
    } catch (err) { console.error(err); showToast("Gagal menyimpan", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteDoc(doc(db, "faqs", deleteId)); showToast("FAQ berhasil dihapus"); setDeleteId(null); fetchItems(); }
    catch (err) { console.error(err); showToast("Gagal menghapus", "error"); }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title"><h1>FAQ</h1><p>Kelola pertanyaan yang sering ditanyakan</p></div>
        <div className="topbar-actions"><button className="btn btn-primary btn-sm" onClick={openCreate}>+ Tambah FAQ</button></div>
      </div>
      <div className="page-content">
        <div className="data-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Pertanyaan</th><th>Urutan</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="empty-state">Belum ada FAQ</td></tr>
                ) : items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.question}</strong><br /><span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.answer.substring(0, 80)}...</span></td>
                    <td>{item.sort_order}</td>
                    <td><span className={`badge ${item.is_active ? "badge-success" : "badge-danger"}`}>{item.is_active ? "Aktif" : "Nonaktif"}</span></td>
                    <td>
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

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>{editItem.id ? "Edit FAQ" : "Tambah FAQ"}</h2><button className="modal-close" onClick={() => setModalOpen(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Pertanyaan</label><input value={editItem.question} onChange={(e) => setEditItem({ ...editItem, question: e.target.value })} placeholder="Apakah paket bisa disesuaikan?" /></div>
              <div className="form-group"><label>Jawaban</label><textarea value={editItem.answer} onChange={(e) => setEditItem({ ...editItem, answer: e.target.value })} placeholder="Ya, semua paket fleksibel..." rows={4} /></div>
              <div className="form-row">
                <div className="form-group"><label>Urutan</label><input type="number" value={editItem.sort_order} onChange={(e) => setEditItem({ ...editItem, sort_order: Number(e.target.value) })} /></div>
                <div className="form-group"><div className="toggle-wrapper"><button className={`toggle ${editItem.is_active ? "active" : ""}`} onClick={() => setEditItem({ ...editItem, is_active: !editItem.is_active })} type="button" /><span style={{ fontSize: "0.88rem" }}>Aktif</span></div></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="confirm-dialog"><h3>Hapus FAQ?</h3><p>Data yang dihapus tidak dapat dikembalikan.</p><div className="btn-group"><button className="btn btn-outline btn-sm" onClick={() => setDeleteId(null)}>Batal</button><button className="btn btn-danger btn-sm" onClick={handleDelete}>Ya, Hapus</button></div></div>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
    </>
  );
}
