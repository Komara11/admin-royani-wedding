"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";

interface SocialItem { platform: string; url: string; icon: string; }
interface SocialMedia { tag: string; title_first: string; title_highlight: string; description: string; items: SocialItem[]; }
interface Footer { description: string; copyright: string; logo_url?: string; }

export default function SettingsPage() {
  const [social, setSocial] = useState<SocialMedia | null>(null);
  const [footer, setFooter] = useState<Footer | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    async function load() {
      try {
        const [sSnap, fSnap] = await Promise.all([
          getDoc(doc(db, "site_content", "social_media")),
          getDoc(doc(db, "site_content", "footer")),
        ]);
        if (sSnap.exists()) setSocial(sSnap.data() as SocialMedia);
        if (fSnap.exists()) setFooter(fSnap.data() as Footer);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const saveSection = async (section: string, data: unknown) => {
    setSaving(section);
    try {
      await setDoc(doc(db, "site_content", section), data as Record<string, unknown>);
      showToast(`${section} berhasil disimpan`);
    } catch (err) { console.error(err); showToast("Gagal menyimpan", "error"); }
    finally { setSaving(null); }
  };

  const saveFooter = async () => {
    if (!footer) return;
    setSaving("footer");
    try {
      let finalLogoUrl = footer.logo_url || "";
      if (logoFile) {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
        const compressed = await imageCompression(logoFile, options);
        const storageRef = ref(storage, `site/logo_${Date.now()}_${compressed.name}`);
        const uploadRes = await uploadBytes(storageRef, compressed);
        finalLogoUrl = await getDownloadURL(uploadRes.ref);
      }
      const dataToSave = { ...footer, logo_url: finalLogoUrl };
      await setDoc(doc(db, "site_content", "footer"), dataToSave);
      setFooter(dataToSave);
      setLogoFile(null);
      showToast("Footer & Logo berhasil disimpan");
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan footer", "error");
    } finally {
      setSaving(null);
    }
  };

  const updateSocialItem = (idx: number, field: keyof SocialItem, val: string) => {
    if (!social) return;
    const items = [...social.items];
    items[idx] = { ...items[idx], [field]: val };
    setSocial({ ...social, items });
  };

  const addSocialItem = () => {
    if (!social) return;
    setSocial({ ...social, items: [...social.items, { platform: "", url: "", icon: "" }] });
  };

  const removeSocialItem = (idx: number) => {
    if (!social) return;
    setSocial({ ...social, items: social.items.filter((_, i) => i !== idx) });
  };

  if (loading) return <><div className="topbar"><div className="topbar-title"><h1>Pengaturan</h1></div></div><div className="page-content"><div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div></div></>;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title"><h1>Pengaturan</h1><p>Kelola sosial media dan footer website</p></div>
      </div>
      <div className="page-content">
        {/* SOCIAL MEDIA */}
        {social && (
          <div className="content-section">
            <h3>📱 Sosial Media</h3>
            <div className="form-row">
              <div className="form-group"><label>Tag</label><input value={social.tag} onChange={(e) => setSocial({ ...social, tag: e.target.value })} /></div>
              <div className="form-group"><label>Judul Highlight</label><input value={social.title_highlight} onChange={(e) => setSocial({ ...social, title_highlight: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Judul</label><input value={social.title_first} onChange={(e) => setSocial({ ...social, title_first: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Deskripsi</label><textarea value={social.description} onChange={(e) => setSocial({ ...social, description: e.target.value })} rows={2} /></div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: "0.85rem" }}>Akun Sosial Media</strong>
                <button className="btn btn-outline btn-sm" onClick={addSocialItem}>+ Tambah</button>
              </div>
              {social.items.map((item, idx) => (
                <div key={idx} className="section-editor">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <input value={item.platform} onChange={(e) => updateSocialItem(idx, "platform", e.target.value)} placeholder="Instagram" style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.85rem", fontFamily: "inherit" }} />
                      <input value={item.url} onChange={(e) => updateSocialItem(idx, "url", e.target.value)} placeholder="https://..." style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.85rem", fontFamily: "inherit", gridColumn: "span 2" }} />
                    </div>
                    <button onClick={() => removeSocialItem(idx)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 4 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => saveSection("social_media", social)} disabled={saving === "social_media"} style={{ marginTop: 8 }}>{saving === "social_media" ? "Menyimpan..." : "Simpan Sosial Media"}</button>
          </div>
        )}

        {/* FOOTER & LOGO */}
        {footer && (
          <div className="content-section">
            <h3>📄 Footer & Logo Web</h3>
            <div className="form-group">
              <label>Logo Website</label>
              <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "12px" }}>
                {footer.logo_url && !logoFile && (
                  <img src={footer.logo_url} alt="Current Logo" style={{ height: "60px", background: "#f3f4f6", padding: "4px", borderRadius: "8px" }} />
                )}
                <div>
                  <input type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setLogoFile(e.target.files[0]);
                  }} />
                  {logoFile && <small style={{ color: "var(--success)", display: "block", marginTop: "4px" }}>File siap diunggah: {logoFile.name}</small>}
                </div>
              </div>
            </div>
            <div className="form-group"><label>Deskripsi Footer</label><textarea value={footer.description} onChange={(e) => setFooter({ ...footer, description: e.target.value })} rows={2} /></div>
            <div className="form-group"><label>Copyright</label><input value={footer.copyright} onChange={(e) => setFooter({ ...footer, copyright: e.target.value })} /></div>
            <button className="btn btn-primary btn-sm" onClick={saveFooter} disabled={saving === "footer"} style={{ marginTop: 8 }}>{saving === "footer" ? "Menyimpan..." : "Simpan Footer"}</button>
          </div>
        )}
      </div>

      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
    </>
  );
}
