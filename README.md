# BDSMARTMALL — Ready-to-Upload GitHub & Cloudflare Package (v2)

আপনার আসল Cloudflare D1 (`bd-smartmall`: `8c1787a3-7483-4c56-ba7e-d6c399c30fc3`) এবং KV (`bd_smartmall`: `d249328b3050412ab446dee0448c00f2`) আইডি বসানো এবং **ডুয়াল কাস্টমাইজেশন (ড্র্যাগ-অ্যান্ড-ড্রপ + কাস্টম HTML/CSS/JS)** যুক্ত করা সম্পূর্ণ প্যাকেজ।

## দ্রুত লাইভ করার ধাপ
1. এই ফোল্ডারের সব ফাইল আপনার `snake74205-pixel/bdsmartmall` GitHub রিপোজিটরিতে আপলোড করুন।
2. GitHub Repository **Settings > Secrets and variables > Actions**-এ নিচের দুটি Secret যুক্ত করুন:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. `main` ব্রাঞ্চে পুশ/আপলোড করলেই D1 স্কিমা রান হয়ে Worker এবং Pages অটোমেটিক লাইভ হয়ে যাবে।
