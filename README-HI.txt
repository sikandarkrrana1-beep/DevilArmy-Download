DEVILARMY DOWNLOAD — FREE STARTER
=================================

Is ZIP mein mobile-friendly frontend aur Cloudflare Worker backend ka starter hai.

IMPORTANT:
- Ye sample original/authorized files ke liye hai. Copyrighted songs/movies ko bina permission upload/share na karein.
- GitHub Pages sirf frontend host karega. Upload/download backend ke liye Cloudflare Worker aur R2 bucket chahiye.
- Admin token ko kabhi index.html/script.js mein na daalein.

STEP 1 — GitHub Pages
1. GitHub par naya repository banayein: DevilArmy-Download
2. index.html, style.css, script.js ko repository ke root mein upload karein.
3. Settings > Pages > Deploy from branch > main / root select karke Save karein.
4. Site URL kuch aisa hoga: https://YOUR-USERNAME.github.io/DevilArmy-Download/

STEP 2 — Cloudflare Worker
1. Cloudflare Dashboard > Workers & Pages > Create > Worker.
2. worker.js ka poora code paste karke Deploy karein.
3. Worker Settings > Bindings > R2 bucket binding add karein:
   Variable name: FILES
   Bucket: apna R2 bucket
4. Worker Settings > Variables and Secrets mein secret add karein:
   Name: ADMIN_TOKEN
   Value: apna strong random password/token
5. Plain text variable add karein:
   Name: ALLOWED_ORIGIN
   Value: https://YOUR-USERNAME.github.io
   (custom domain ho to uska exact origin use karein; URL ke end mein path/slash na ho.)
6. Worker redeploy karein agar dashboard kahe.

STEP 3 — Frontend API URL
1. script.js kholein.
2. const API_BASE = "PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE";
   ko apne Worker URL se replace karein, jaise:
   const API_BASE = "https://devilarmy-api.YOUR-SUBDOMAIN.workers.dev";
3. Commit changes karein. Website reload karein.

LIMITS / SAFETY
- Starter upload size 25 MB per file set hai.
- R2 storage/operations aur Worker usage ki current pricing/free limits Cloudflare dashboard mein verify karein.
- Ye basic starter hai, production use se pehle abuse protection, rate limiting, moderation, privacy policy aur backup add karein.
- Admin upload form public page par dikhta hai, lekin upload ke liye ADMIN_TOKEN chahiye. Behtar security ke liye future mein separate protected admin page banayein.
