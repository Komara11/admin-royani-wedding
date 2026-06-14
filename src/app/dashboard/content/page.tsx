"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    async function load() {
      try {
        const [hSnap, aSnap, cSnap] = await Promise.all([
          getDoc(doc(db, "site_content", "hero")),
          getDoc(doc(db, "site_content", "about")),
          getDoc(doc(db, "site_content", "contact")),
        ]);
        if (hSnap.exists()) setHero(hSnap.data() as HeroContent);
        if (aSnap.exists()) setAbout(aSnap.data() as AboutContent);
        if (cSnap.exists()) setContact(cSnap.data() as ContactContent);
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
              <div className="form-group"><label>URL Gambar Latar Belakang (Hero)</label><input value={hero.bg_image_url || ""} onChange={(e) => setHero({ ...hero, bg_image_url: e.target.value })} /></div>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "16px 0" }} />
            <h4 style={{ marginBottom: "12px", fontSize: "0.95rem", color: "var(--text-primary)" }}>🌌 Parallax Quote (Pemisah Halaman)</h4>
            <div className="form-row">
              <div className="form-group"><label>URL Gambar Parallax</label><input value={hero.parallax_image_url || ""} onChange={(e) => setHero({ ...hero, parallax_image_url: e.target.value })} /></div>
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
              <div className="form-group"><label>URL Gambar</label><input value={about.image_url} onChange={(e) => setAbout({ ...about, image_url: e.target.value })} /></div>
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
      </div>

      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
    </>
  );
}
