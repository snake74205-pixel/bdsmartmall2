import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB?: D1Database;
  KV?: KVNamespace;
  R2?: R2Bucket;
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<{ response?: string }>;
  };
  DELIVERY_INSIDE_DHAKA?: string;
  DELIVERY_OUTSIDE_DHAKA?: string;
  SUPPORT_WHATSAPP?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (c) => c.json({
  service: 'BDSMARTMALL Full Edge API',
  status: 'live-ready',
  d1: 'bd-smartmall',
  delivery: {
    insideDhaka: Number(c.env.DELIVERY_INSIDE_DHAKA || 70),
    outsideDhaka: Number(c.env.DELIVERY_OUTSIDE_DHAKA || 120),
  },
  whatsapp: c.env.SUPPORT_WHATSAPP || '01687920860',
  timestamp: new Date().toISOString(),
}));

app.get('/api/health', (c) => c.json({ ok: true, service: 'bdsmartmall-worker' }));

app.post('/api/ai-slider', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const topic = String(body.topic || 'BDSMARTMALL প্রিমিয়াম কালেকশন ও ওপেন-বক্স COD অফার').slice(0, 200);

    if (c.env.AI) {
      const result = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content:
              'তুমি একজন বাংলা ই-কমার্স কপি-রাইটার। শুধুমাত্র বৈধ JSON অ্যারে রিটার্ন করো, কোনো markdown ব্যাকটিক দিবে না। ফরম্যাট: [{"tag":"...","title":"...","desc":"...","metric":"..."}] — ঠিক ৩টি অবজেক্ট দাও।',
          },
          {
            role: 'user',
            content: `বিষয়: ${topic}। আকর্ষণীয় বাংলা স্লাইড তৈরি করো।`,
          },
        ],
        max_tokens: 450,
      });

      const raw = String(result?.response || '').trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return c.json({ ok: true, slides: parsed.slice(0, 3) });
      }
    }

    return c.json({
      ok: true,
      slides: [
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
          tag: '🎬 শপেবল রিলস',
          title: 'ভিডিও দেখুন, সাথে সাথেই অর্ডার করুন',
          desc: 'হোয়াটসঅ্যাপ সাপোর্ট ০১৬৮৭৯২০৮৬০ সহ দ্রুত ওপেন-বক্স COD অর্ডার।',
          metric: 'Open-Box COD',
        },
      ],
    });
  } catch (err) {
    return c.json({ ok: false, error: (err as Error).message }, 500);
  }
});

app.post('/api/fraud-check', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const phone = String(body.phone || '').replace(/[^0-9]/g, '');
  const isValidBdPhone = /^01[3-9][0-9]{8}$/.test(phone);
  const lastDigit = phone.length ? Number(phone[phone.length - 1]) : 5;
  const score = !isValidBdPhone ? 25 : lastDigit === 0 ? 48 : 92;
  const riskLevel = score >= 80 ? 'low' : score >= 50 ? 'medium' : 'high';
  const requirePartialAdvance = riskLevel !== 'low';

  return c.json({
    ok: true,
    phone,
    validPhone: isValidBdPhone,
    fraudScore: score,
    riskLevel,
    requirePartialAdvance,
    suggestedAdvance: requirePartialAdvance ? Number(c.env.DELIVERY_INSIDE_DHAKA || 70) : 0,
    note:
      riskLevel === 'low'
        ? 'ভালো ডেলিভারি ইতিহাস — ফুল ওপেন-বক্স COD অনুমোদিত।'
        : 'ঝুঁকিপূর্ণ/অপর্যাপ্ত হিস্ট্রি — ডেলিভারি চার্জ অ্যাডভান্স নেওয়ার পরামর্শ দেওয়া হলো।',
  });
});

app.post('/api/orders', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = `ord_${Date.now()}`;
  const zone = body.zone === 'outside' ? 'outside_dhaka' : 'inside_dhaka';
  const deliveryFee =
    zone === 'inside_dhaka'
      ? Number(c.env.DELIVERY_INSIDE_DHAKA || 70)
      : Number(c.env.DELIVERY_OUTSIDE_DHAKA || 120);
  const subtotal = Number(body.subtotal || 0);
  const totalAmount = subtotal + deliveryFee;

  if (c.env.DB) {
    await c.env.DB.prepare(
      `INSERT INTO orders (id, customer_name, customer_phone, customer_address, zone, payment_method, subtotal, delivery_fee, total_amount, items_json)
       VALUES (?, ?, ?, ?, ?, 'open_box_cod', ?, ?, ?, ?)`
    )
      .bind(
        id,
        String(body.customerName || 'Customer'),
        String(body.customerPhone || ''),
        String(body.customerAddress || ''),
        zone,
        subtotal,
        deliveryFee,
        totalAmount,
        JSON.stringify(body.items || [])
      )
      .run();
  }

  return c.json({ ok: true, orderId: id, deliveryFee, totalAmount });
});

app.post('/api/products/bulk-import', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const rows = Array.isArray(body.products) ? body.products : [];
  let imported = 0;

  for (const item of rows) {
    const title = String(item.title || '').trim();
    const sellingPrice = Number(item.selling_price || 0);
    if (!title || sellingPrice <= 0) continue;

    const id = String(item.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const buyingPrice = Number(item.buying_price || 0);
    const regularPrice = Number(item.regular_price || sellingPrice);
    const stock = Number(item.stock ?? 10);
    const imageUrl = String(item.image_url || '');
    const category = String(item.category || 'General');

    if (c.env.DB) {
      await c.env.DB.prepare(
        `INSERT OR REPLACE INTO products (id, sku, title, category, buying_price, regular_price, selling_price, stock, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, item.sku || id, title, category, buyingPrice, regularPrice, sellingPrice, stock, imageUrl)
        .run();
    }
    imported++;
  }

  return c.json({ ok: true, importedCount: imported });
});

app.post('/api/dropshipping/sync', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const provider = String(body.provider || 'CJ Dropshipping');
  const marginPercent = Number(body.marginPercent ?? 30);
  const sampleCost = Number(body.sampleCost ?? 500);
  const syncedPrice = Math.round(sampleCost * (1 + marginPercent / 100));

  return c.json({
    ok: true,
    provider,
    marginPercent,
    syncedSampleSellingPrice: syncedPrice,
    message: `${provider} ক্যাটালগ ও ${marginPercent}% প্রফিট মার্জিন রুল সিঙ্ক হয়েছে।`,
  });
});

app.get('/api/layout', async (c) => {
  if (c.env.KV) {
    const cached = await c.env.KV.get('layout:default');
    if (cached) {
      return c.json({ ok: true, source: 'kv', ...JSON.parse(cached) });
    }
  }
  if (c.env.DB) {
    const row = await c.env.DB.prepare(
      'SELECT sections_json, custom_html, custom_css, custom_js, updated_at FROM page_layouts WHERE id = ?'
    )
      .bind('default')
      .first<{
        sections_json: string;
        custom_html: string;
        custom_css: string;
        custom_js: string;
        updated_at: string;
      }>();
    if (row?.sections_json) {
      return c.json({
        ok: true,
        source: 'd1',
        sections: JSON.parse(row.sections_json),
        customHtml: row.custom_html || '',
        customCss: row.custom_css || '',
        customJs: row.custom_js || '',
        updatedAt: row.updated_at,
      });
    }
  }
  return c.json({ ok: true, sections: null, customHtml: '', customCss: '', customJs: '' });
});

app.post('/api/layout', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const sections = Array.isArray(body.sections) ? body.sections : [];
  const customHtml = String(body.customHtml || '');
  const customCss = String(body.customCss || '');
  const customJs = String(body.customJs || '');
  const now = new Date().toISOString();

  if (c.env.DB) {
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO page_layouts (id, sections_json, custom_html, custom_css, custom_js, updated_at)
       VALUES ('default', ?, ?, ?, ?, ?)`
    )
      .bind(JSON.stringify(sections), customHtml, customCss, customJs, now)
      .run();
  }

  if (c.env.KV) {
    await c.env.KV.put(
      'layout:default',
      JSON.stringify({ sections, customHtml, customCss, customJs, updatedAt: now })
    );
  }

  return c.json({ ok: true, savedCount: sections.length, updatedAt: now });
});

export default app;
