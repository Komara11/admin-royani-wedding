"use client";

import { useEffect, useState } from "react";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import imageCompression from "browser-image-compression";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  location: string;
  image_url: string;
  grid_class: string;
  sort_order: number;
  is_active: boolean;
}

const emptyItem: Omit<PortfolioItem, "id"> = {
  title: "", category: "Resepsi", location: "", image_url: "",
  grid_class: "col-6", sort_order: 0, is_active: true,
};

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Omit<PortfolioItem, "id"> & { id?: string }>(emptyItem);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = async () => {
    try {
      const q = query(collection(db, "portfolio_items"), orderBy("sort_order"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PortfolioItem)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditItem({ ...emptyItem, sort_order: items.length });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditItem(item);
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalImageUrl = editItem.image_url;

      // Handle file upload if a new file is selected
      if (imageFile) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(imageFile, options);
        const storageRef = ref(storage, `portfolio/${Date.now()}_${compressedFile.name}`);
        const uploadResult = await uploadBytes(storageRef, compressedFile);
        finalImageUrl = await getDownloadURL(uploadResult.ref);
      }

      const { id, ...data } = editItem as PortfolioItem;
      const dataToSave = { ...data, image_url: finalImageUrl };

      if (id) {
        await updateDoc(doc(db, "portfolio_items", id), dataToSave);
        showToast("Portfolio berhasil diperbarui");
      } else {
        await addDoc(collection(db, "portfolio_items"), { ...dataToSave, created_at: new Date() });
        showToast("Portfolio berhasil ditambahkan");
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "portfolio_items", deleteId));
      showToast("Portfolio berhasil dihapus");
      setDeleteId(null);
      fetchItems();
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus", "error");
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Portfolio</h1>
          <p>Kelola foto galeri dokumentasi pernikahan</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Tambah Foto</button>
        </div>
      </div>
      <div className="page-content">
        <div className="data-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Lokasi</th>
                <th>Grid</th>
                <th>Urutan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="empty-state">Belum ada data portfolio</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img src={item.image_url} alt={item.title} className="table-thumb" />
                    </td>
                    <td><strong>{item.title}</strong></td>
                    <td><span className="badge badge-gold">{item.category}</span></td>
                    <td>{item.location}</td>
                    <td><span className="badge badge-success">{item.grid_class}</span></td>
                    <td>{item.sort_order}</td>
                    <td>
                      <span className={`badge ${item.is_active ? "badge-success" : "badge-danger"}`}>
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(item.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem.id ? "Edit Portfolio" : "Tambah Portfolio"}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Judul</label>
                <input value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} placeholder="Pernikahan Andi & Sari" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori</label>
                  <select value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}>
                    <option>Resepsi</option><option>Akad</option><option>Outdoor</option><option>Kimono</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lokasi</label>
                  <input value={editItem.location} onChange={(e) => setEditItem({ ...editItem, location: e.target.value })} placeholder="Grand Ballroom" />
                </div>
              </div>
              <div className="form-group">
                <label>Gambar</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }} 
                  style={{ marginBottom: "8px" }}
                />
                <input 
                  value={editItem.image_url} 
                  onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} 
                  placeholder="URL Gambar (Atau upload file di atas)" 
                  style={{ opacity: 0.6, fontSize: "0.85rem" }}
                  disabled={!!imageFile}
                />
                {imageFile && <small style={{ color: "var(--success)", display: "block", marginTop: "4px" }}>File siap diunggah: {imageFile.name}</small>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ukuran Grid</label>
                  <select value={editItem.grid_class} onChange={(e) => setEditItem({ ...editItem, grid_class: e.target.value })}>
                    <option value="col-4">Kecil (col-4)</option>
                    <option value="col-6">Sedang (col-6)</option>
                    <option value="col-8">Besar (col-8)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Urutan</label>
                  <input type="number" value={editItem.sort_order} onChange={(e) => setEditItem({ ...editItem, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <div className="toggle-wrapper">
                  <button className={`toggle ${editItem.is_active ? "active" : ""}`} onClick={() => setEditItem({ ...editItem, is_active: !editItem.is_active })} type="button" />
                  <span style={{ fontSize: "0.88rem" }}>Aktif (tampil di website)</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="confirm-dialog">
              <h3>Hapus Portfolio?</h3>
              <p>Data yang dihapus tidak dapat dikembalikan.</p>
              <div className="btn-group">
                <button className="btn btn-outline btn-sm" onClick={() => setDeleteId(null)}>Batal</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </>
  );
}
