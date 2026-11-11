'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { OrderRecord } from '@/lib/validations';
import { formatCZK, formatPercent } from '@/lib/calculator';
import { SITE_CONFIG } from '@/lib/config';

// Valid password SHA-256 hashes
// Passwords: "UUGDSJD8767SD.?" and "UUGDSJD8767SD"
const VALID_HASHES = [
  'e657805177bbd944e45d19fe0dcceebc492c0aeaa04ea0cfdcfad2fbe45a165d', // UUGDSJD8767SD.?
  '9e6c09c03b8a4281485611c144e8100a06267aae80b0b5435d312f8d7b74115f', // UUGDSJD8767SD
];

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Check existing session
  useEffect(() => {
    const saved = sessionStorage.getItem('g3ne5is_admin_session');
    if (saved && VALID_HASHES.includes(saved)) {
      setIsAuthenticated(true);
      loadOrders();
    }
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        // Fallback to local storage if API is unreachable
        const stored = localStorage.getItem('genesis_orders');
        if (stored) setOrders(JSON.parse(stored));
      }
    } catch {
      const stored = localStorage.getItem('genesis_orders');
      if (stored) setOrders(JSON.parse(stored));
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hash = await sha256(passwordInput.trim());
    if (VALID_HASHES.includes(hash) || passwordInput.trim() === 'UUGDSJD8767SD.?') {
      sessionStorage.setItem('g3ne5is_admin_session', hash);
      setIsAuthenticated(true);
      loadOrders();
    } else {
      setIsShaking(true);
      setPasswordError('Nesprávné přístupové heslo.');
      setTimeout(() => setIsShaking(false), 500);
      setTimeout(() => setPasswordError(''), 3000);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const updateOrderStatus = async (id: string, newStatus: 'pending' | 'paid' | 'sent') => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.warn('API error updating status:', err);
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );

    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    showToast(`Stav objednávky změněn na: ${newStatus}`);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Opravdu chcete tuto objednávku odstranit?')) return;
    try {
      await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.warn('API error deleting order:', err);
    }

    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (selectedOrder?.id === id) setSelectedOrder(null);
    showToast('Objednávka byla odstraněna.');
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.vs.includes(searchQuery) ||
        o.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalVolume = orders.reduce((acc, curr) => acc + curr.amount, 0);
    const paidVolume = orders
      .filter((o) => o.status === 'paid' || o.status === 'sent')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    return { totalCount, totalVolume, paidVolume, pendingCount };
  }, [orders]);

  // Certificate printing / export
  const printCertificate = (order: OrderRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Povolte vyskakovací okna pro tisk certifikátu.');
      return;
    }

    const fmtDate = new Date(order.timestamp).toLocaleDateString('cs-CZ', {
      dateStyle: 'long',
    });
    const total = order.amount * Math.pow(1 + order.rate, order.years);
    const gain = total - order.amount;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dluhopis - ${order.name} - VS ${order.vs}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 0; color: #1a1a1a; background: #fff; }
          .cert { width: 210mm; min-height: 297mm; padding: 0; box-sizing: border-box; position: relative; background: #fff; }
          .header { background: #012B12; color: #fff; padding: 35px 50px; }
          .logo { font-size: 32px; font-weight: 800; letter-spacing: 2px; }
          .logo span { color: #C8A96E; }
          .sub { color: #C8A96E; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 5px; }
          .gold-bar { height: 6px; background: #C8A96E; }
          .body { padding: 40px 50px; }
          .title-row { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #e0e8e4; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 26px; font-weight: 800; color: #012B12; margin: 0; }
          .meta { font-size: 13px; color: #666; text-align: right; }
          .sec-h { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #012B12; margin-top: 25px; margin-bottom: 12px; border-bottom: 1px solid #e0e8e4; padding-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px; }
          td { padding: 8px 0; border-bottom: 1px solid #f0f4f2; }
          td.label { width: 45%; color: #666; font-weight: 500; }
          td.val { font-weight: 700; color: #111; }
          .highlight-box { background: #f4fbf7; border: 1px solid #d4ede0; border-radius: 8px; padding: 20px; margin: 25px 0; }
          .footer { position: absolute; bottom: 0; left: 0; width: 100%; background: #012B12; color: #fff; padding: 20px 50px; font-size: 11px; display: flex; justify-content: space-between; box-sizing: border-box; }
          .disclaimer { font-size: 9px; color: #888; line-height: 1.5; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="header">
            <div class="logo">G3NE<span>5</span>IS</div>
            <div class="sub">holdingová společnost s.r.o.</div>
          </div>
          <div class="gold-bar"></div>
          <div class="body">
            <div class="title-row">
              <div>
                <h1 class="title">CERTIFIKÁT DLUHOPISU</h1>
                <div style="font-size:14px;color:#012B12;font-weight:600;margin-top:4px;">
                  ${order.tier === 'vip' ? '👑 PRIVÁTNÍ VIP EMISE' : 'ZÁKLADNÍ EMISE PODNIKOVÝCH DLUHOPISŮ'}
                </div>
              </div>
              <div class="meta">
                Variabilní symbol: <strong>${order.vs}</strong><br />
                Datum vystavení: <strong>${fmtDate}</strong>
              </div>
            </div>

            <div class="sec-h">1. VLASTNÍK DLUHOPISU</div>
            <table>
              <tr><td class="label">Jméno a příjmení / Název:</td><td class="val">${order.name}</td></tr>
              <tr><td class="label">Typ investora:</td><td class="val">${order.investorType === 'SRO' ? 'Firemní subjekt (s.r.o.)' : 'Fyzická osoba'}</td></tr>
              <tr><td class="label">Adresa sídla / bydliště:</td><td class="val">${order.street}, ${order.city}</td></tr>
              <tr><td class="label">Datum narození:</td><td class="val">${order.dob}</td></tr>
              <tr><td class="label">Kontaktní e-mail:</td><td class="val">${order.email}</td></tr>
              <tr><td class="label">Telefon:</td><td class="val">${order.phone || 'Neuveden'}</td></tr>
              ${
                order.beneficiary
                  ? `<tr><td class="label">Obmyšlená osoba (dědic):</td><td class="val">${order.beneficiary} ${order.beneficiaryYear ? `(*${order.beneficiaryYear})` : ''}</td></tr>`
                  : ''
              }
            </table>

            <div class="sec-h">2. PARAMETRY A ZHODNOCENÍ</div>
            <div class="highlight-box">
              <table>
                <tr><td class="label">Jmenovitá hodnota investice:</td><td class="val" style="font-size:16px;color:#012B12;">${formatCZK(order.amount)}</td></tr>
                <tr><td class="label">Doba splatnosti:</td><td class="val">${order.years} ${order.years === 1 ? 'rok' : order.years < 5 ? 'roky' : 'let'}</td></tr>
                <tr><td class="label">Pevná roční úroková sazba:</td><td class="val" style="color:#C8A96E;font-size:16px;">${formatPercent(order.rate)} p.a.</td></tr>
                <tr><td class="label">Hrubý výnos celkem:</td><td class="val">+ ${formatCZK(gain)}</td></tr>
                <tr><td class="label">Celková hodnota po splatnosti:</td><td class="val" style="font-size:16px;color:#012B12;">${formatCZK(total)}</td></tr>
                <tr><td class="label">Správní fixní poplatek:</td><td class="val">2 000 Kč</td></tr>
              </table>
            </div>

            <div class="disclaimer">
              Emitent: ${SITE_CONFIG.COMPANY}, IČO: ${SITE_CONFIG.ICO}, se sídlem ${SITE_CONFIG.ADDRESS}. Společnost je zapsána u Krajského soudu v Ostravě, oddíl C, vložka 99244. Podnikové dluhopisy nejsou pojištěny Fondem pojištění vkladů. Tento certifikát je dokladem o registraci a nabytí podnikového dluhopisu.
            </div>
          </div>

          <div class="footer">
            <div>${SITE_CONFIG.COMPANY} &nbsp;|&nbsp; ${SITE_CONFIG.EMAIL}</div>
            <div>VS: ${order.vs} &nbsp;|&nbsp; Jednatel: ${SITE_CONFIG.FOUNDER}</div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Password gate screen
  if (!isAuthenticated) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #012B12 0%, #0f3d20 60%, #1a5c30 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', system-ui, sans-serif",
          padding: '20px',
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '48px 40px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
            textAlign: 'center',
            transform: isShaking ? 'translateX(10px)' : 'none',
            transition: 'transform 0.1s ease',
          }}
        >
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#012B12', marginBottom: '4px' }}>
            G3NE<span style={{ color: '#C8A96E' }}>5</span>IS
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#888',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '28px',
            }}
          >
            Administrační systém
          </div>

          <div style={{ fontSize: '0.95rem', color: '#444', marginBottom: '20px' }}>
            🔐 Zadejte přístupové heslo
          </div>

          <input
            type="password"
            placeholder="Heslo administrátora..."
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: passwordError ? '2px solid #c0392b' : '2px solid #e0e8e4',
              borderRadius: '10px',
              fontSize: '1rem',
              outline: 'none',
              marginBottom: '16px',
              boxSizing: 'border-box',
            }}
            autoFocus
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: '#012B12',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#C8A96E')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#012B12')}
          >
            Přihlásit se →
          </button>

          {passwordError && (
            <div style={{ marginTop: '14px', color: '#c0392b', fontSize: '0.85rem', fontWeight: 600 }}>
              ❌ {passwordError}
            </div>
          )}

          <div style={{ marginTop: '24px', fontSize: '0.72rem', color: '#bbb' }}>
            Vyhrazeno pro vedení společnosti G3NE5IS s.r.o.
          </div>
        </form>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f6', color: '#1a1a1a', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Bar */}
      <header
        style={{
          background: '#012B12',
          color: '#fff',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #C8A96E',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            G3NE<span style={{ color: '#C8A96E' }}>5</span>IS
          </div>
          <span style={{ fontSize: '0.8rem', color: '#C8A96E', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Správa dluhopisů
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/"
            style={{
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.85rem',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            ← Zpět na web
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem('g3ne5is_admin_session');
              setIsAuthenticated(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Odhlásit
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Statistics Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0e8e4' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
              Celkem objednávek
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#012B12' }}>
              {stats.totalCount}
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0e8e4' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
              Objem rezervací
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#012B12' }}>
              {formatCZK(stats.totalVolume)}
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0e8e4' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
              Zaplacený kapitál
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#1a6b4a' }}>
              {formatCZK(stats.paidVolume)}
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0e8e4' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
              Čekající platby
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#f39c12' }}>
              {stats.pendingCount}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            background: '#fff',
            padding: '20px 24px',
            borderRadius: '12px 12px 0 0',
            border: '1px solid #e0e8e4',
            borderBottom: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#012B12' }}>
            Přehled objednávek
          </h2>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Hledat jméno, VS, e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #e0e8e4',
                fontSize: '0.85rem',
                minWidth: '220px',
                outline: 'none',
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                border: '1px solid #e0e8e4',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              <option value="all">Všechny stavy</option>
              <option value="pending">Čekající (pending)</option>
              <option value="paid">Zaplaceno (paid)</option>
              <option value="sent">Odesláno (sent)</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div
          style={{
            background: '#fff',
            borderRadius: '0 0 12px 12px',
            border: '1px solid #e0e8e4',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e0e8e4', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>VS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>Investor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>Emise</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>Částka</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>Doba / Sazba</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>Stav</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>Akce</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                    Žádné objednávky neodpovídají zadaným kritériím.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f0f4f2' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'monospace' }}>
                      {o.vs}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{o.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>{o.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {o.tier === 'vip' ? (
                        <span
                          style={{
                            background: '#fdf8ee',
                            color: '#b8860b',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          👑 VIP (7%)
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#e8f5ee',
                            color: '#1a6b4a',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        >
                          Standard
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {formatCZK(o.amount)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {o.years} let · {formatPercent(o.rate)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background:
                            o.status === 'paid'
                              ? '#eafaf1'
                              : o.status === 'sent'
                              ? '#e8f5ee'
                              : '#fef9e7',
                          color:
                            o.status === 'paid'
                              ? '#27ae60'
                              : o.status === 'sent'
                              ? '#1a6b4a'
                              : '#f39c12',
                        }}
                      >
                        {o.status === 'paid'
                          ? 'Zaplaceno'
                          : o.status === 'sent'
                          ? 'Odesláno'
                          : 'Čeká na platbu'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            background: '#fff',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => printCertificate(o)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid #1a4a6b',
                            background: '#e8f0f5',
                            color: '#1a4a6b',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          📄 PDF
                        </button>
                        {o.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(o.id, 'paid')}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #27ae60',
                              background: '#eafaf1',
                              color: '#27ae60',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            Zaplaceno
                          </button>
                        )}
                        {o.status === 'paid' && (
                          <button
                            onClick={() => updateOrderStatus(o.id, 'sent')}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #1a6b4a',
                              background: '#e8f5ee',
                              color: '#1a6b4a',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            Odesláno
                          </button>
                        )}
                        <button
                          onClick={() => deleteOrder(o.id)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid #c0392b',
                            background: '#fdf2f2',
                            color: '#c0392b',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Smazat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Drawer Detail Panel */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              height: '100%',
              background: '#fff',
              padding: '32px 28px',
              boxSizing: 'border-box',
              overflowY: 'auto',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#012B12' }}>Detail objednávky</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div><strong>Variabilní symbol:</strong> {selectedOrder.vs}</div>
              <div><strong>Jméno / firma:</strong> {selectedOrder.name}</div>
              <div><strong>Typ:</strong> {selectedOrder.investorType === 'SRO' ? 'Firemní investor' : 'Fyzická osoba'}</div>
              <div><strong>Adresa:</strong> {selectedOrder.street}, {selectedOrder.city}</div>
              <div><strong>Datum narození:</strong> {selectedOrder.dob}</div>
              <div><strong>E-mail:</strong> {selectedOrder.email}</div>
              <div><strong>Telefon:</strong> {selectedOrder.phone || '—'}</div>
              <div><strong>Obmyšlená osoba:</strong> {selectedOrder.beneficiary || '—'} ({selectedOrder.beneficiaryYear || '—'})</div>
              <div><strong>Emise:</strong> {selectedOrder.tier === 'vip' ? '👑 VIP zóna (od 1 mil. Kč — 7,0 % p.a.)' : 'Standard'}</div>
              <div><strong>Částka:</strong> {formatCZK(selectedOrder.amount)}</div>
              <div><strong>Délka:</strong> {selectedOrder.years} let</div>
              <div><strong>Úroková sazba:</strong> {formatPercent(selectedOrder.rate)} p.a.</div>
              <div><strong>Stav:</strong> {selectedOrder.status}</div>
              <div><strong>Datum:</strong> {new Date(selectedOrder.timestamp).toLocaleString('cs-CZ')}</div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => printCertificate(selectedOrder)}
                style={{
                  padding: '12px',
                  background: '#1a4a6b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📄 Tisknout / Uložit PDF certifikát
              </button>
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'paid')}
                  style={{
                    padding: '12px',
                    background: '#27ae60',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ✅ Označit jako zaplaceno
                </button>
              )}
              {selectedOrder.status === 'paid' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'sent')}
                  style={{
                    padding: '12px',
                    background: '#1a6b4a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  📨 Označit jako odesláno
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#012B12',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 9999,
            borderLeft: '4px solid #C8A96E',
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}