---
trigger: always_on
---
# Prinsip UI
- Mobile-first, satu kolom, whitespace lega, satu warna aksen.
- Gunakan token desain (CSS variables) untuk warna, radius, spacing; dilarang hardcode.
- Tombol dan target sentuh minimal 44px. Kontras minimal AA.
- Angka uang pakai tabular-nums dan format `Intl.NumberFormat('id-ID')`.
- Setiap layar punya state loading, kosong, dan error.
- Animasi 150-250ms, hormati prefers-reduced-motion.
- Microcopy singkat, ramah, tanpa jargon teknis.
