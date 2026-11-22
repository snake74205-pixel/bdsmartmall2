import React, { useEffect, useState } from 'react';
import PremiumMotionSlider from './components/PremiumMotionSlider';
import CategoryListingGrid from './components/CategoryListingGrid';
import { SubCategoryItem } from './data/categories';

export type SectionId = 'slider' | 'categories' | 'custom_code_block' | 'products' | 'reels' | 'fraud_and_pnl';

interface ProductItem {
  id: string;
  title: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  imageUrl: string;
  reelUrl: string;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    title: 'প্রিমিয়াম কটন পোলো শার্ট',
    category: 'পোলো শার্ট',
    buyingPrice: 420,
    sellingPrice: 790,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    reelUrl: '',
  },
  {
    id: 'p2',
    title: 'সলিড উইন্টার হুডি',
    category: 'সলিড হুডি',
    buyingPrice: 550,
    sellingPrice: 990,
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
    reelUrl: '',
  },
  {
    id: 'p3',
    title: 'রেডিমেড থ্রিপিস কালেকশন',
    category: 'রেডিমেড থ্রিপিস',
    buyingPrice: 720,
    sellingPrice: 1290,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=600&q=80',
    reelUrl: '',
  },
];

const DEFAULT_CUSTOM_HTML = `<div class="bd-custom-promo">
  <h3>🔥 স্পেশাল ফ্ল্যাশ ক্যাম্পেইন</h3>
  <p>ওপেন-বক্স ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে চেক করে পেমেন্ট করুন।</p>
</div>`;

const DEFAULT_CUSTOM_CSS = `.bd-custom-promo {
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(245,158,11,0.18), rgba(56,189,248,0.15));
  border: 1px solid rgba(251,191,36,0.35);
}
.bd-custom-promo h3 { margin: 0 0 6px; color: #fbbf24; }
.bd-custom-promo p { margin: 0; color: #e2e8f0; }
@keyframes bdPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.012); }
}
.bd-motion-card { animation: bdPulse 5s ease-in-out infinite; }`;

const DEFAULT_CUSTOM_JS = `console.log("BDSMARTMALL v4 Ready");`;

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [builderMode, setBuilderMode] = useState<'drag' | 'code' | 'preview'>('drag');
  const [sections, setSections] = useState<SectionId[]>([
    'slider',
    'categories',
    'custom_code_block',
    'products',
    'reels',
    'fraud_and_pnl',
  ]);
  const [draggedSection, setDraggedSection] = useState<SectionId | null>(null);
  const [layoutMsg, setLayoutMsg] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  const [customHtml, setCustomHtml] = useState(DEFAULT_CUSTOM_HTML);
  const [customCss, setCustomCss] = useState(DEFAULT_CUSTOM_CSS);
  const [customJs, setCustomJs] = useState(DEFAULT_CUSTOM_JS);

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('সলিড হুডি');
  const [newBuy, setNewBuy] = useState('');
  const [newSell, setNewSell] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newReelUrl, setNewReelUrl] = useState('');

  // Quick Order (Open-Box COD) modal state
  const [orderingProduct, setOrderingProduct] = useState<ProductItem | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotice, setOrderNotice] = useState('');

  const [zone, setZone] = useState<'inside' | 'outside'>('inside');
  const [phone, setPhone] = useState('01712345678');
  const [fraudResult, setFraudResult] = useState<string>('নম্বর লিখে চেক করুন');
  const [expenses, setExpenses] = useState<number>(650);
  const [csvStatus, setCsvStatus] = useState('');
  const [dropshipStatus, setDropshipStatus] = useState('');

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const deliveryCharge = zone === 'inside' ? 70 : 120;

  useEffect(() => {
    fetch(`${apiBase}/api/layout`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) {
          if (Array.isArray(data.sections) && data.sections.length) setSections(data.sections);
          if (typeof data.customHtml === 'string' && data.customHtml) setCustomHtml(data.customHtml);
          if (typeof data.customCss === 'string' && data.customCss) setCustomCss(data.customCss);
          if (typeof data.customJs === 'string' && data.customJs) setCustomJs(data.customJs);
        }
      })
      .catch(() => {});
  }, [apiBase]);

  const unlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'bd2026') {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPin('');
      setPinError('');
    } else {
      setPinError('ভুল পিন (ডিফল্ট পিন: bd2026)');
    }
  };

  const handleSelectSubCategory = (item: SubCategoryItem, groupTitle: string) => {
    setSelectedSubCategory(item.name);
    setNewCategory(item.name);
    setLayoutMsg(`${groupTitle} → ${item.name} (${item.count} আইটেম)`);
  };

  const runCustomJs = () => {
    try {
      const fn = new Function(customJs);
      fn();
      setLayoutMsg('Custom JS সফলভাবে রান হয়েছে!');
    } catch (err) {
      setLayoutMsg(`JS ত্রুটি: ${(err as Error).message}`);
    }
  };

  const moveSection = (fromId: SectionId, toId: SectionId) => {
    if (fromId === toId) return;
    setSections((prev) => {
      const copy = [...prev];
      const fromIdx = copy.indexOf(fromId);
      const toIdx = copy.indexOf(toId);
      copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, fromId);
      return copy;
    });
  };

  const saveAllCustomization = async () => {
    try {
      await fetch(`${apiBase}/api/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections, customHtml, customCss, customJs }),
      });
      setLayoutMsg('লেআউট ও কাস্টম কোড D1 + KV-তে সেভ হয়েছে!');
    } catch {
      setLayoutMsg('প্রিভিউ আপডেট হয়েছে (Worker লাইভ হলে D1 + KV-তে সেভ হবে)');
    }
  };

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const buy = Number(newBuy);
    const sell = Number(newSell);
    if (!newTitle.trim() || sell <= 0) return;
    setProducts((prev) => [
      {
        id: `p_${Date.now()}`,
        title: newTitle.trim(),
        category: newCategory.trim() || 'General',
        buyingPrice: buy,
        sellingPrice: sell,
        stock: Number(newStock) || 1,
        imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        reelUrl: newReelUrl.trim(),
      },
      ...prev,
    ]);
    setNewTitle('');
    setNewBuy('');
    setNewSell('');
    setNewImageUrl('');
    setNewReelUrl('');
  };

  const submitCodOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingProduct || !customerName.trim() || !customerPhone.trim()) return;
    const total = orderingProduct.sellingPrice + deliveryCharge;
    try {
      await fetch(`${apiBase}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          zone,
          subtotal: orderingProduct.sellingPrice,
          deliveryFee: deliveryCharge,
          totalAmount: total,
          items: [{ id: orderingProduct.id, title: orderingProduct.title, price: orderingProduct.sellingPrice }],
        }),
      });
    } catch {}
    setOrderNotice(
      `অর্ডার রিকোয়েস্ট রেডি! পণ্য: ${orderingProduct.title} | মোট: ৳${total} (ডেলিভারি ৳${deliveryCharge}, ওপেন-বক্স COD)। দ্রুত কনফার্মেশনে WhatsApp: 01687920860`
    );
    setOrderingProduct(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  const runFraudCheck = async () => {
    try {
      const res = await fetch(`${apiBase}/api/fraud-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setFraudResult(`স্কোর: ${data.fraudScore}/100 (${data.riskLevel}) — ${data.note}`);
    } catch {
      const valid = /^01[3-9][0-9]{8}$/.test(phone.replace(/[^0-9]/g, ''));
      setFraudResult(valid ? 'স্কোর: 90/100 (low) — ওপেন-বক্স COD উপযুক্ত' : 'স্কোর: 30/100 (high) — নম্বর যাচাই প্রয়োজন');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean).slice(1);
    const parsed = lines
      .map((line, i) => {
        const [title, buying, selling, stock, category, imageUrl] = line.split(',');
        return {
          id: `csv_${Date.now()}_${i}`,
          title: (title || '').trim(),
          buying_price: Number(buying || 0),
          selling_price: Number(selling || 0),
          stock: Number(stock || 10),
          category: (category || 'General').trim(),
          image_url: (imageUrl || '').trim(),
        };
      })
      .filter((p) => p.title && p.selling_price > 0);

    const chunkSize = 100;
    let totalSent = 0;
    for (let i = 0; i < parsed.length; i += chunkSize) {
      const chunk = parsed.slice(i, i + chunkSize);
      try {
        await fetch(`${apiBase}/api/products/bulk-import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: chunk }),
        });
      } catch {}
      setProducts((prev) => [
        ...chunk.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          buyingPrice: c.buying_price,
          sellingPrice: c.selling_price,
          stock: c.stock,
          imageUrl: c.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
          reelUrl: '',
        })),
        ...prev,
      ]);
      totalSent += chunk.length;
    }
    setCsvStatus(`${totalSent}টি প্রোডাক্ট ব্যাচ আকারে ইম্পোর্ট হয়েছে।`);
  };

  const syncDropshipping = async () => {
    try {
      const res = await fetch(`${apiBase}/api/dropshipping/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'CJ Dropshipping', marginPercent: 35, sampleCost: 600 }),
      });
      const data = await res.json();
      setDropshipStatus(data.message);
    } catch {
      setDropshipStatus('CJ Dropshipping 35% প্রফিট মার্জিন সিঙ্ক রেডি।');
    }
  };

  const shareProduct = (p: ProductItem) => {
    const shareText = `${p.title} (${p.category}) — ৳${p.sellingPrice} | ওপেন-বক্স COD (ঢাকা ৳70 / বাইরে ৳120) | WhatsApp: 01687920860`;
    navigator.clipboard?.writeText(shareText);
    alert(`শেয়ার কপি রেডি:
${shareText}`);
  };

  const visibleProducts = selectedSubCategory
    ? products.filter((p) => p.category.toLowerCase().includes(selectedSubCategory.toLowerCase()))
    : products;

  const totalSales = products.reduce((acc, p) => acc + p.sellingPrice, 0);
  const totalCost = products.reduce((acc, p) => acc + p.buyingPrice, 0);
  const netProfit = totalSales - totalCost - expenses;

  const visibleSections: SectionId[] = isAdmin
    ? sections
    : sections.filter((s) => s !== 'fraud_and_pnl');

  const sectionLabels: Record<SectionId, string> = {
    slider: 'হিরো মোশন গ্রাফিক্স ও স্লাইডার',
    categories: 'প্রোডাক্ট লিস্টিং ক্যাটাগরি (১৩ গ্রুপ)',
    custom_code_block: 'কাস্টম HTML / CSS / JS সেকশন',
    products: 'প্রোডাক্ট কার্ড, অর্ডার ও শেয়ার',
    reels: 'নেটিভ শপেবল রিলস ফিড',
    fraud_and_pnl: 'ফ্রড চেকার, CSV, ড্রপশিপিং ও লাভ-ক্ষতি',
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '18px 14px 64px' }}>
      <style>{customCss}</style>

      {/* Storefront / Admin Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800 }}>BDSMARTMALL</h1>
          <small style={{ color: '#94a3b8' }}>
            ঢাকা ডেলিভারি ৳70 | বাইরে ৳120 | ওপেন-বক্স COD | WhatsApp: 01687920860
          </small>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {!isAdmin ? (
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              🔐 অ্যাডমিন স্টুডিও
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setBuilderMode('drag')}
                style={{ padding: '7px 11px', borderRadius: '10px', border: '1px solid #38bdf8', background: builderMode === 'drag' ? '#38bdf8' : 'transparent', color: builderMode === 'drag' ? '#06101d' : '#38bdf8', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                ⠿ ড্র্যাগ-অ্যান্ড-ড্রপ
              </button>
              <button
                type="button"
                onClick={() => setBuilderMode('code')}
                style={{ padding: '7px 11px', borderRadius: '10px', border: '1px solid #c084fc', background: builderMode === 'code' ? '#c084fc' : 'transparent', color: builderMode === 'code' ? '#06101d' : '#c084fc', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                {'</>'} HTML/CSS/JS
              </button>
              <button
                type="button"
                onClick={saveAllCustomization}
                style={{ padding: '7px 12px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#052e16', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                💾 সেভ
              </button>
              <button
                type="button"
                onClick={() => setIsAdmin(false)}
                style={{ padding: '7px 10px', borderRadius: '10px', border: '1px solid #475569', background: 'transparent', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                স্টোর ভিউ
              </button>
            </>
          )}
        </div>
      </header>

      {/* Admin PIN Modal */}
      {showAdminModal && (
        <div style={{ marginBottom: '18px', padding: '14px', borderRadius: '16px', background: '#0b1220', border: '1px solid #38bdf8' }}>
          <form onSubmit={unlockAdmin} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="অ্যাডমিন পিন লিখুন (bd2026)"
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
            <button type="submit" style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: '#38bdf8', color: '#06101d', fontWeight: 700, cursor: 'pointer' }}>
              লগইন
            </button>
            <button type="button" onClick={() => setShowAdminModal(false)} style={{ padding: '8px 10px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
              বাতিল
            </button>
          </form>
          {pinError && <div style={{ marginTop: '6px', color: '#f87171', fontSize: '0.82rem' }}>{pinError}</div>}
        </div>
      )}

      {orderNotice && (
        <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac', fontSize: '0.9rem' }}>
          {orderNotice}
        </div>
      )}

      {layoutMsg && <div style={{ marginBottom: '14px', color: '#4ade80', fontSize: '0.88rem' }}>{layoutMsg}</div>}

      {/* COD Order Drawer/Card */}
      {orderingProduct && (
        <div style={{ marginBottom: '18px', padding: '16px', borderRadius: '18px', background: '#0b1220', border: '1px solid #22c55e' }}>
          <h3 style={{ marginTop: 0, color: '#4ade80' }}>ওপেন-বক্স COD অর্ডার: {orderingProduct.title}</h3>
          <form onSubmit={submitCodOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <input required placeholder="আপনার নাম" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            <input required placeholder="মোবাইল নম্বর (01XXXXXXXXX)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            <input required placeholder="সম্পূর্ণ ঠিকানা" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            <select value={zone} onChange={(e) => setZone(e.target.value as 'inside' | 'outside')} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
              <option value="inside">ঢাকার ভেতরে (৳70)</option>
              <option value="outside">ঢাকার বাইরে (৳120)</option>
            </select>
            <button type="submit" style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#052e16', fontWeight: 800, cursor: 'pointer' }}>
              অর্ডার কনফার্ম (৳{orderingProduct.sellingPrice + deliveryCharge})
            </button>
            <button type="button" onClick={() => setOrderingProduct(null)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #475569', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' }}>
              বন্ধ করুন
            </button>
          </form>
        </div>
      )}

      {/* Admin Custom HTML / CSS / JS Editor */}
      {isAdmin && builderMode === 'code' && (
        <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '18px', background: '#0b1220', border: '1px solid rgba(192,132,252,0.4)' }}>
          <h3 style={{ marginTop: 0, color: '#e9d5ff' }}>কাস্টম কোড এডিটর (HTML + CSS + JS)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Custom HTML</label>
              <textarea rows={5} value={customHtml} onChange={(e) => setCustomHtml(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '10px', background: '#070d19', color: '#f8fafc', border: '1px solid #334155', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Custom CSS</label>
              <textarea rows={5} value={customCss} onChange={(e) => setCustomCss(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '10px', background: '#070d19', color: '#7dd3fc', border: '1px solid #334155', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Custom JavaScript</label>
              <textarea rows={5} value={customJs} onChange={(e) => setCustomJs(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '10px', background: '#070d19', color: '#fde047', border: '1px solid #334155', fontFamily: 'monospace' }} />
              <button type="button" onClick={runCustomJs} style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#eab308', color: '#06101d', fontWeight: 700, cursor: 'pointer' }}>
                ▶ JS রান করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {visibleSections.map((secId, idx) => (
          <section
            key={secId}
            draggable={isAdmin && builderMode === 'drag'}
            onDragStart={() => setDraggedSection(secId)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedSection) moveSection(draggedSection, secId);
              setDraggedSection(null);
            }}
            style={{
              border: isAdmin && builderMode === 'drag' ? '1px dashed rgba(56,189,248,0.55)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '15px',
              background: 'rgba(15,23,42,0.75)',
            }}
          >
            {isAdmin && builderMode === 'drag' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.84rem', color: '#7dd3fc' }}>
                <span>⠿ {sectionLabels[secId]}</span>
                <span style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" disabled={idx === 0} onClick={() => moveSection(secId, visibleSections[idx - 1])} style={{ cursor: 'pointer' }}>↑</button>
                  <button type="button" disabled={idx === visibleSections.length - 1} onClick={() => moveSection(secId, visibleSections[idx + 1])} style={{ cursor: 'pointer' }}>↓</button>
                </span>
              </div>
            )}

            {secId === 'slider' && <PremiumMotionSlider showAiButton={isAdmin} />}

            {secId === 'categories' && (
              <CategoryListingGrid
                selectedSubCategory={selectedSubCategory}
                onSelectSubCategory={handleSelectSubCategory}
              />
            )}

            {secId === 'custom_code_block' && (
              <div dangerouslySetInnerHTML={{ __html: customHtml }} />
            )}

            {secId === 'products' && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0 }}>
                    প্রোডাক্ট কালেকশন {selectedSubCategory ? `(${selectedSubCategory})` : ''}
                  </h3>
                  {selectedSubCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedSubCategory('')}
                      style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      সব প্রোডাক্ট দেখুন
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <form onSubmit={addProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                    <input placeholder="পণ্যের নাম" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input placeholder="ক্যাটাগরি" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input placeholder="ইমেজ URL (https://...)" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input placeholder="রিল লিংক (ঐচ্ছিক)" value={newReelUrl} onChange={(e) => setNewReelUrl(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input type="number" placeholder="কেনা দাম (৳)" value={newBuy} onChange={(e) => setNewBuy(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input type="number" placeholder="বিক্রির দাম (৳)" value={newSell} onChange={(e) => setNewSell(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <input type="number" placeholder="স্টক" value={newStock} onChange={(e) => setNewStock(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <button type="submit" style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#38bdf8', color: '#06101d', fontWeight: 700, cursor: 'pointer' }}>+ যুক্ত করুন</button>
                  </form>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
                  {(visibleProducts.length ? visibleProducts : products).map((p) => {
                    const profitPerUnit = p.sellingPrice - p.buyingPrice;
                    return (
                      <div key={p.id} style={{ borderRadius: '16px', overflow: 'hidden', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          style={{ width: '100%', height: '165px', objectFit: 'cover', display: 'block', background: '#0f172a' }}
                        />
                        <div style={{ padding: '14px' }}>
                          <div style={{ fontSize: '0.76rem', color: '#c084fc', marginBottom: '4px' }}>{p.category}</div>
                          <div style={{ fontWeight: 700, fontSize: '1.02rem' }}>{p.title}</div>
                          <div style={{ marginTop: '6px', color: '#38bdf8', fontWeight: 800, fontSize: '1.05rem' }}>৳{p.sellingPrice}</div>
                          {isAdmin && (
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                              কেনা: ৳{p.buyingPrice} | লাভ: <strong style={{ color: profitPerUnit >= 0 ? '#4ade80' : '#f87171' }}>৳{profitPerUnit}</strong> | স্টক: {p.stock}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button
                              type="button"
                              onClick={() => setOrderingProduct(p)}
                              style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#052e16', fontWeight: 700, cursor: 'pointer', fontSize: '0.84rem' }}
                            >
                              অর্ডার করুন
                            </button>
                            <button
                              type="button"
                              onClick={() => shareProduct(p)}
                              style={{ padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', fontSize: '0.84rem' }}
                            >
                              🔗 শেয়ার
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {secId === 'reels' && (
              <div>
                <h3 style={{ marginTop: 0 }}>🎬 শপেবল রিলস (প্রোডাক্ট হাইলাইট)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
                  {products.map((p) => (
                    <div key={`reel_${p.id}`} style={{ borderRadius: '16px', overflow: 'hidden', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.76rem', color: '#a855f7' }}>
                            {p.reelUrl ? 'রিলস লিংক যুক্ত' : 'শপেবল ফিচার'}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{p.title}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOrderingProduct(p)}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#06101d', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          ৳{p.sellingPrice}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && secId === 'fraud_and_pnl' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '16px', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ marginTop: 0 }}>🛡️ ফ্রড চেকার ও ডেলিভারি চার্জ</h4>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    <button type="button" onClick={runFraudCheck} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#06101d', fontWeight: 700, cursor: 'pointer' }}>চেক</button>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '10px' }}>{fraudResult}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setZone('inside')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #38bdf8', background: zone === 'inside' ? '#38bdf8' : 'transparent', color: zone === 'inside' ? '#06101d' : '#fff', cursor: 'pointer' }}>ঢাকা (৳70)</button>
                    <button type="button" onClick={() => setZone('outside')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #38bdf8', background: zone === 'outside' ? '#38bdf8' : 'transparent', color: zone === 'outside' ? '#06101d' : '#fff', cursor: 'pointer' }}>বাইরে (৳120)</button>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#7dd3fc' }}>বর্তমান ডেলিভারি চার্জ: ৳{deliveryCharge}</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '16px', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ marginTop: 0 }}>📦 আনলিমিটেড CSV ও ড্রপশিপিং API</h4>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>CSV (title,buying,selling,stock,category,imageUrl):</label>
                  <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} style={{ fontSize: '0.82rem', marginBottom: '8px' }} />
                  {csvStatus && <div style={{ fontSize: '0.82rem', color: '#4ade80', marginBottom: '8px' }}>{csvStatus}</div>}
                  <button type="button" onClick={syncDropshipping} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#a855f7', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                    🔄 ড্রপশিপিং API সিঙ্ক
                  </button>
                  {dropshipStatus && <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#e9d5ff' }}>{dropshipStatus}</div>}
                </div>

                <div style={{ padding: '16px', borderRadius: '16px', background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ marginTop: 0 }}>📊 সেলিং ও লাভ-ক্ষতি ড্যাশবোর্ড</h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                    <div>মোট বিক্রয়: <strong>৳{totalSales}</strong></div>
                    <div>মোট কেনা দাম: <strong>৳{totalCost}</strong></div>
                    <div>অন্যান্য খরচ (অ্যাড/অপস): <strong>৳{expenses}</strong></div>
                    <div style={{ marginTop: '6px', fontSize: '1.05rem', color: netProfit >= 0 ? '#4ade80' : '#f87171', fontWeight: 800 }}>
                      {netProfit >= 0 ? `নেট লাভ: ৳${netProfit}` : `নেট ক্ষতি: ৳${Math.abs(netProfit)}`}
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>খরচ (৳):</span>
                    <input type="number" value={expenses} onChange={(e) => setExpenses(Number(e.target.value) || 0)} style={{ width: '100px', padding: '6px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                  </div>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
