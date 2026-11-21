import React, { useEffect, useRef, useState } from 'react';

export interface SlideItem {
  tag: string;
  title: string;
  desc: string;
  metric: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    tag: '✨ ওপেন-বক্স COD',
    title: 'দেখে বুঝে নিন আপনার পছন্দের পণ্য',
    desc: 'ঢাকায় ৭০ টাকা এবং ঢাকার বাইরে ১২০ টাকা ডেলিভারি চার্জে নির্ভরযোগ্য সার্ভিস।',
    metric: '৳70 / ৳120',
  },
  {
    tag: '🎬 শপেবল রিলস',
    title: 'ভিডিও দেখুন, সাথে সাথেই অর্ডার করুন',
    desc: 'ফেইসবুক ও ইউটিউব রিলস স্টাইলের ফিড থেকে সরাসরি প্রোডাক্ট কিনুন।',
    metric: 'Shoppable',
  },
  {
    tag: '🚀 Cloudflare AI',
    title: 'এক ক্লিকেই নতুন ক্যাম্পেইন স্লাইডার',
    desc: 'Workers AI দিয়ে তাৎক্ষণিক বাংলা প্রোমোশনাল স্লাইড তৈরি করুন।',
    metric: 'Live AI',
  },
];

export const PremiumMotionSlider: React.FC = () => {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const touchX = useRef(0);
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const generateAI = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${apiBase}/api/ai-slider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'BDSMARTMALL প্রিমিয়াম কালেকশন ও ওপেন-বক্স COD অফার' }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.slides)) {
        setSlides(data.slides);
        setIndex(0);
        setMsg('AI থেকে নতুন স্লাইড আপডেট হয়েছে');
      } else {
        setMsg(data.error || 'স্লাইড তৈরি করা যায়নি');
      }
    } catch (e) {
      setMsg(`ত্রুটি: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const current = slides[index] || DEFAULT_SLIDES[0];

  return (
    <div
      onTouchStart={(e) => { touchX.current = e.changedTouches[0].screenX; }}
      onTouchEnd={(e) => {
        const diff = touchX.current - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 40) {
          setIndex((prev) => (diff > 0 ? (prev + 1) % slides.length : (prev - 1 + slides.length) % slides.length));
        }
      }}
      style={{
        borderRadius: '20px',
        padding: '28px 24px',
        background: 'linear-gradient(135deg, rgba(14,165,233,0.22), rgba(15,23,42,0.96) 55%, rgba(168,85,247,0.2))',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
      }}
    >
      <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', fontSize: '0.82rem' }}>
        {current.tag}
      </span>
      <h2 style={{ margin: '12px 0 8px', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 800 }}>
        {current.title}
      </h2>
      <p style={{ margin: '0 0 18px', color: '#cbd5e1', lineHeight: 1.6 }}>
        {current.desc}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={generateAI}
          disabled={loading}
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            background: '#38bdf8',
            color: '#06101d',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {loading ? '⏳ AI তৈরি করছে...' : '🤖 AI স্লাইড জেনারেট'}
        </button>
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          পরবর্তী →
        </button>
        <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#7dd3fc' }}>{current.metric}</span>
      </div>
      {msg && <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#7dd3fc' }}>{msg}</div>}
    </div>
  );
};

export default PremiumMotionSlider;
