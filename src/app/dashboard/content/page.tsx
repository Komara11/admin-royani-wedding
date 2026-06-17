"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";

interface HeroContent {
  subtitle: string; title_first: string; title_second: string;
  description: string; cta_text: string; scroll_text: string;
  bg_image_url: string; parallax_image_url: string; parallax_quote: string;
}

interface AboutContent {
  tag: string; title_first: string; title_highlight: string;
  paragraph_1: string; paragraph_2: string; quote: string;
  image_url: string;
  metrics: { value: string; label: string }[];
}

interface ContactContent {
  tag: string; title_first: string; title_highlight: string;
  description: string; whatsapp_number: string; address: string;
  maps_url: string; maps_embed_url: string;
  form_tag: string; form_title: string; form_description: string;
}

export default function ContentPage() {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [contact, setContact] = useState<ContactContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[] | null>(null);
  const [newCat, setNewCat] = useState("");

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string, field: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(`${section}-${field}`);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const storageRef = ref(storage, `content/${fileName}`);
      
      const uploadResult = await uploadBytes(storageRef, compressedFile);
      const url = await getDownloadURL(uploadResult.ref);
      
      if (section === "hero") {
        setHero(prev => prev ? { ...prev, [field]: url } : prev);
      } else if (section === "about") {
        setAbout(prev => prev ? { ...prev, [field]: url } : prev);
      }
      
      showToast("Gambar berhasil diunggah");
    } catch (error) {
      console.error(error);
      showToast("Gagal mengunggah gambar", "error");
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [hSnap, aSnap, cSnap, catSnap] = await Promise.all([
          getDoc(doc(db, "site_content", "hero")),
          getDoc(doc(db, "site_content", "about")),
          getDoc(doc(db, "site_content", "contact")),
          getDoc(doc(db, "site_content", "portfolio_categories")),
        ]);
        if (hSnap.exists()) setHero(hSnap.data() as HeroContent);
        if (aSnap.exists()) setAbout(aSnap.data() as AboutContent);
        if (cSnap.exists()) setContact(cSnap.data() as ContactContent);
        if (catSnap.exists() && catSnap.data().list) {
          setCategories(catSnap.data().list as string[]);
        } else {
          setCategories(["Adat", "Resepsi", "Outdoor", "Kimono", "Dekorasi"]);
        }
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

  const addCategory = () => {
    if (!newCat.trim() || !categories) return;
    if (categories.includes(newCat.trim())) {
      showToast("Kategori sudah ada", "error");
      return;
    }
    const newList = [...categories, newCat.trim()];
    setCategories(newList);
    setNewCat("");
  };

  const removeCategory = (cat: string) => {
    if (!categories) return;
    const newList = categories.filter(c => c !== cat);
    setCategories(newList);
  };

  const saveCategories = async () => {
    setSaving("categories");
    try {
      await setDoc(doc(db, "site_content", "portfolio_categories"), { list: categories });
      showToast("Kategori dokumentasi berhasil disimpan");
    } catch (err) { console.error(err); showToast("Gagal menyimpan kategori", "error"); }
    finally { setSaving(null); }
  };

  if (loading) return <><div className="topbar"><div className="topbar-title"><h1>Konten Website</h1></div></div><div className="page-content"><div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div></div></>;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title"><h1>Konten Website</h1><p>Edit teks yang tampil di website utama</p></div>
      </div>
      <div className="page-content">
        {/* HERO */}
        {hero && (
          <div className="content-section">
            <h3>🏠 Hero (Halaman Utama)</h3>
            <div className="form-row">
              <div className="form-group"><label>Subtitle</label><input value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></div>
              <div className="form-group"><label>Teks CTA</label><input value={hero.cta_text} onChange={(e) => setHero({ ...hero, cta_text: e.target.value })} /></div>
            </div>
            <div className="form-row">
            <div className="form-group"><label>Judul Baris 1</label><input value={hero.title_first} onChange={(e) => setHero({ ...hero, title_first: e.target.value })} /></div>
              <div className="form-group"><label>Judul Baris 2</label><input value={hero.title_second} onChange={(e) => setHero({ ...hero, title_second: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Deskripsi</label><textarea value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} rows={2} /></div>
            <div className="form-row">
              <div className="form-group"><label>Teks Scroll</label><input value={hero.scroll_text} onChange={(e) => setHero({ ...hero, scroll_text: e.target.value })} /></div>
              <div className="form-group">
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  URL Gambar Latar Belakang (Hero)
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm" 
                    style={{ padding: "2px 8px", fontSize: "0.75rem", height: "auto" }}
                    onClick={() => setHero({ ...hero, bg_image_url: "https://firebasestorage.googleapis.com/v0/b/royani-weding.firebasestorage.app/o/content%2F1781607573225_WhatsAppImage20260612at9.54.27PM3.jpeg?alt=media&token=a0251585-37df-40ed-99b6-7c8d5f67f862" })}
                  >
                    Reset ke Default
                  </button>
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input value={hero.bg_image_url || ""} onChange={(e) => setHero({ ...hero, bg_image_url: e.target.value })} style={{ flex: 1 }} placeholder="URL atau Upload..." />
                  <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", height: "auto", padding: "8px 12px", margin: 0, whiteSpace: "nowrap" }}>
                    {uploading === "hero-bg_image_url" ? "Loading..." : "Upload"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e, "hero", "bg_image_url")} />
                  </label>
                </div>
              </div>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "16px 0" }} />
            <h4 style={{ marginBottom: "12px", fontSize: "0.95rem", color: "var(--text-primary)" }}>🌌 Parallax Quote (Pemisah Halaman)</h4>
            <div className="form-row">
              <div className="form-group">
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  URL Gambar Parallax
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm" 
                    style={{ padding: "2px 8px", fontSize: "0.75rem", height: "auto" }}
                    onClick={() => setHero({ ...hero, parallax_image_url: "/images/bg-divider.jpg" })}
                  >
                    Reset ke Default
                  </button>
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input value={hero.parallax_image_url || ""} onChange={(e) => setHero({ ...hero, parallax_image_url: e.target.value })} style={{ flex: 1 }} placeholder="URL atau Upload..." />
                  <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", height: "auto", padding: "8px 12px", margin: 0, whiteSpace: "nowrap" }}>
                    {uploading === "hero-parallax_image_url" ? "Loading..." : "Upload"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e, "hero", "parallax_image_url")} />
                  </label>
                </div>
              </div>
            </div>
            <div className="form-group"><label>Quote Parallax</label><textarea value={hero.parallax_quote || ""} onChange={(e) => setHero({ ...hero, parallax_quote: e.target.value })} rows={2} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => saveSection("hero", hero)} disabled={saving === "hero"} style={{ marginTop: 8 }}>{saving === "hero" ? "Menyimpan..." : "Simpan Hero"}</button>
          </div>
        )}

        {/* ABOUT */}
        {about && (
          <div className="content-section">
            <h3>📝 Tentang Kami</h3>
            <div className="form-row">
              <div className="form-group"><label>Tag</label><input value={about.tag} onChange={(e) => setAbout({ ...about, tag: e.target.value })} /></div>
              <div className="form-group">
                <label>URL Gambar</label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input value={about.image_url} onChange={(e) => setAbout({ ...about, image_url: e.target.value })} style={{ flex: 1 }} placeholder="URL atau Upload..." />
                  <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", height: "auto", padding: "8px 12px", margin: 0, whiteSpace: "nowrap" }}>
                    {uploading === "about-image_url" ? "Loading..." : "Upload"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e, "about", "image_url")} />
                  </label>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Judul</label><input value={about.title_first} onChange={(e) => setAbout({ ...about, title_first: e.target.value })} /></div>
              <div className="form-group"><label>Judul Highlight</label><input value={about.title_highlight} onChange={(e) => setAbout({ ...about, title_highlight: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Paragraf 1</label><textarea value={about.paragraph_1} onChange={(e) => setAbout({ ...about, paragraph_1: e.target.value })} rows={3} /></div>
            <div className="form-group"><label>Paragraf 2</label><textarea value={about.paragraph_2} onChange={(e) => setAbout({ ...about, paragraph_2: e.target.value })} rows={3} /></div>
            <div className="form-group"><label>Quote</label><textarea value={about.quote} onChange={(e) => setAbout({ ...about, quote: e.target.value })} rows={2} /></div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Metrik</label>
              {about.metrics.map((m, i) => (
                <div key={i} className="form-row" style={{ marginBottom: 8 }}>
                  <input value={m.value} onChange={(e) => { const ms = [...about.metrics]; ms[i].value = e.target.value; setAbout({ ...about, metrics: ms }); }} placeholder="500+" style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.88rem", fontFamily: "inherit" }} />
                  <input value={m.label} onChange={(e) => { const ms = [...about.metrics]; ms[i].label = e.target.value; setAbout({ ...about, metrics: ms }); }} placeholder="Acara Sukses" style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.88rem", fontFamily: "inherit" }} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => saveSection("about", about)} disabled={saving === "about"} style={{ marginTop: 8 }}>{saving === "about" ? "Menyimpan..." : "Simpan About"}</button>
          </div>
        )}

        {/* CONTACT */}
        {contact && (
          <div className="content-section">
            <h3>📞 Kontak</h3>
            <div className="form-row">
              <div className="form-group"><label>Tag</label><input value={contact.tag} onChange={(e) => setContact({ ...contact, tag: e.target.value })} /></div>
              <div className="form-group"><label>No. WhatsApp</label><input value={contact.whatsapp_number} onChange={(e) => setContact({ ...contact, whatsapp_number: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Judul</label><input value={contact.title_first} onChange={(e) => setContact({ ...contact, title_first: e.target.value })} /></div>
              <div className="form-group"><label>Judul Highlight</label><input value={contact.title_highlight} onChange={(e) => setContact({ ...contact, title_highlight: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Deskripsi</label><textarea value={contact.description} onChange={(e) => setContact({ ...contact, description: e.target.value })} rows={2} /></div>
            <div className="form-group"><label>Alamat</label><input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
            <div className="form-group"><label>URL Google Maps</label><input value={contact.maps_url} onChange={(e) => setContact({ ...contact, maps_url: e.target.value })} /></div>
            <div className="form-group"><label>URL Embed Maps (iframe)</label><input value={contact.maps_embed_url} onChange={(e) => setContact({ ...contact, maps_embed_url: e.target.value })} /></div>
            <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "16px 0" }} />
            <div className="form-row">
              <div className="form-group"><label>Form Tag</label><input value={contact.form_tag} onChange={(e) => setContact({ ...contact, form_tag: e.target.value })} /></div>
              <div className="form-group"><label>Form Judul</label><input value={contact.form_title} onChange={(e) => setContact({ ...contact, form_title: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Form Deskripsi</label><textarea value={contact.form_description} onChange={(e) => setContact({ ...contact, form_description: e.target.value })} rows={2} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => saveSection("contact", contact)} disabled={saving === "contact"} style={{ marginTop: 8 }}>{saving === "contact" ? "Menyimpan..." : "Simpan Kontak"}</button>
          </div>
        )}

        {/* CATEGORIES */}
        {categories && (
          <div className="content-section">
            <h3>📂 Kategori Dokumentasi (Portfolio)</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>Kelola filter kategori yang akan muncul di dropdown saat menambah portfolio, dan tombol filter di halaman beranda web.</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {categories.map((cat) => (
                <span key={cat} className="badge badge-outline" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "0.9rem" }}>
                  {cat}
                  <button onClick={() => removeCategory(cat)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="form-row" style={{ maxWidth: "400px" }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nama kategori baru..." onKeyDown={(e) => e.key === "Enter" && addCategory()} />
              </div>
              <button className="btn btn-outline" onClick={addCategory} style={{ height: "42px", marginTop: "24px" }}>Tambah</button>
            </div>
            <button className="btn btn-primary btn-sm" onClick={saveCategories} disabled={saving === "categories"} style={{ marginTop: 16 }}>{saving === "categories" ? "Menyimpan..." : "Simpan Perubahan Kategori"}</button>
          </div>
        )}
      </div>

      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
    </>
  );
}
