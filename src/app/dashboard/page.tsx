"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function DashboardPage() {
  const [stats, setStats] = useState({ portfolio: 0, packages: 0, faqs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [portSnap, pkgSnap, faqSnap] = await Promise.all([
          getDocs(collection(db, "portfolio_items")),
          getDocs(collection(db, "pricing_packages")),
          getDocs(collection(db, "faqs")),
        ]);
        setStats({
          portfolio: portSnap.size,
          packages: pkgSnap.size,
          faqs: faqSnap.size,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Dashboard</h1>
          <p>Selamat datang di panel administrasi Royani Wedding</p>
        </div>
      </div>
      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            </div>
            <h3>{loading ? "—" : stats.portfolio}</h3>
            <p>Foto Portfolio</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <h3>{loading ? "—" : stats.packages}</h3>
            <p>Paket Harga</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <h3>{loading ? "—" : stats.faqs}</h3>
            <p>FAQ</p>
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-header">
            <h2>Panduan Cepat</h2>
          </div>
          <div style={{ padding: "24px" }}>
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div className="stat-card-icon" style={{ minWidth: 40, width: 40, height: 40, borderRadius: 10, marginBottom: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </div>
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>Portfolio</strong>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>Kelola foto galeri pernikahan. Tambah, edit, hapus, dan atur urutan foto.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div className="stat-card-icon" style={{ minWidth: 40, width: 40, height: 40, borderRadius: 10, marginBottom: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>Paket Harga</strong>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>Kelola paket akad dan lengkap beserta semua detailnya.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div className="stat-card-icon" style={{ minWidth: 40, width: 40, height: 40, borderRadius: 10, marginBottom: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </div>
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>Konten Website</strong>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>Edit teks hero, tentang kami, dan kontak langsung dari sini.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
