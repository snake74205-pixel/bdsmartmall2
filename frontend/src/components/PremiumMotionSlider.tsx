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
    tag: '🧥 মেগা ফ্যাশন ও উইন্টার',
    title: 'জেন্টস, লেডিস ও কিডস কালেকশন',
    desc: 'হুডি, জ্যাকেট, শাড়ি, থ্রিপিস, পাঞ্জাবি ও ব্যাগ কালেকশন এক ছাদের নিচে।',
    metric: '13 Categories',
  },
  {
    tag: '🚀 স্মার্ট অর্ডার ও সাপোর্ট',
    title: 'দ্রুত অর্ডার ও হোয়াটসঅ্যাপ সহায়তা',
    desc: 'হোয়াটসঅ্যাপ ০১৬৮৭৯২০৮৬০ — পণ্য হাতে পেয়ে চেক করে পেমেন্ট করুন।',
    metric: 'Open-Box COD',
  },
];

const AI_PRESET_SLIDES: SlideItem[][] = [
  [
    {
      tag: '🔥 ফ্ল্যাশ উইন্টার সেল',
      title: 'হুডি, জ্যাকেট ও সোয়েটারে ধামাকা কালেকশন',
      desc: 'ওপেন-বক্স COD সুবিধা — পছন্দ না হলে ডেলিভারি চার্জে সমাধান।',
      metric: 'ঢাকা ৳70',
    },
    {
      tag: '👗 ফেস্টিভ ওয়্যার',
      title: 'শাড়ি, থ্রিপিস, বোরকা ও পাঞ্জাবির নতুন লট',
      desc: 'সারা দেশে হোম ডেলিভারি — ঢাকার বাইরে ডেলিভারি চার্জ মাত্র ১২০ টাকা।',
      metric: 'বাইরে ৳120',
    },
    {
      tag: '📱 সরাসরি হোয়াটসঅ্যাপ',
      title: 'যেকোনো প্রয়োজনে ০১৬৮৭৯২০৮৬০',
      desc: 'কাস্টমাইজড ক্যাটালগ ও দ্রুত অর্ডার ট্র্যাকিং।',
      metric: 'Live Store',
    },
  ],
];

interface SliderProps {
  showAiButton?: boolean;
}

export const PremiumMotionSlider: React.FC<SliderProps> = ({ showAiButton = true }) => {
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
      if (data.ok && Array.isArray(data.slides) && data.slides.length) {
        setSlides(data.slides);
        setIndex(0);
        setMsg('AI থেকে নতুন স্লাইড লোড হয়েছে');
        return;
      }
      throw new Error('fallback');
    } catch {
      const nextSet = AI_PRESET_SLIDES[0];
      setSlides(nextSet);
      setIndex(0);
      setMsg('নতুন প্রোমোশনাল স্লাইড আপডেট হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const current = slides[index] || DEFAULT_SLIDES[0];

  return (
    <div
      className="bd-motion-card"
      onTouchStart={(e) => { touchX.current = e.changedTouches[0].screenX; }}
      onTouchEnd={(e) => {
        const diff = touchX.current - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 40) {
          setIndex((prev) => (diff > 0 ? (prev + 1) % slides.length : (prev - 1 + slides.length) % slides.length));
        }
      }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '22px',
        padding: '24px 20px',
        background: 'linear-gradient(135deg, rgba(14,165,233,0.24), rgba(15,23,42,0.96) 52%, rgba(168,85,247,0.24))',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 22px 55px rgba(0,0,0,0.45)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', fontSize: '0.82rem', fontWeight: 600 }}>
          {current.tag}
        </span>
        <span style={{ fontWeight: 800, color: '#7dd3fc', fontSize: '0.9rem' }}>{current.metric}</span>
      </div>

      <h2 style={{ margin: '12px 0 8px', fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 800, lineHeight: 1.25 }}>
        {current.title}
      </h2>
      <p style={{ margin: '0 0 18px', color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.94rem' }}>
        {current.desc}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        {showAiButton && (
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
            {loading ? '⏳ জেনারেট হচ্ছে...' : '🤖 AI স্লাইড জেনারেট'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.04)',
            color: '#f8fafc',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          পরবর্তী →
        </button>

        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? '22px' : '8px',
                height: '8px',
                borderRadius: '999px',
                border: 'none',
                background: i === index ? '#38bdf8' : 'rgba(255,255,255,0.28)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>
      </div>
      {msg && <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#7dd3fc' }}>{msg}</div>}
    </div>
  );
};

export default PremiumMotionSlider;
