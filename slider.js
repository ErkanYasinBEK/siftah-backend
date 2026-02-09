function relatedScore(current, candidate) {
  let score = 0;

  if (!current || !candidate) return score;

  // Kategori eşleşmesi (en yüksek ağırlık)
  if (current.category && candidate.category && current.category === candidate.category) {
    score += 50;
  }

  // Marka eşleşmesi
  if (current.brand && candidate.brand && current.brand === candidate.brand) {
    score += 25;
  }

  // Ortak tag sayısı
  const ct = Array.isArray(current.tags) ? current.tags : [];
  const tt = Array.isArray(candidate.tags) ? candidate.tags : [];
  const common = tt.filter(t => ct.includes(t)).length;
  score += common * 8; // her ortak etiket 8 puan

  // Fiyat yakınlığı (ne kadar yakınsa o kadar puan)
  if (Number.isFinite(current.price) && Number.isFinite(candidate.price)) {
    const diff = Math.abs(current.price - candidate.price);
    if (diff <= 50) score += 15;
    else if (diff <= 150) score += 8;
    else if (diff <= 300) score += 4;
  }

  return score;
}

document.addEventListener("DOMContentLoaded", () => {
  // === 1) MEVCUT ÜRÜN VERİSİ (data-current-product) ===
  const midProduct = document.querySelector(".mid-product");
  let current = null;

  if (midProduct) {
    try {
      const raw = midProduct.getAttribute("data-current-product");
      current = raw ? JSON.parse(raw) : null;

      if (current && typeof current.price === "string") {
        current.price = parseFloat(current.price.toString().replace(",", "."));
      }
    } catch (e) {
      console.warn("current product parse error:", e);
    }
  }

  // === 2) BENZER ÜRÜN KARTLARINI OKU & SKORLA ===
  const carousel = document.getElementById("related-carousel");

  if (carousel) {
    const cards = Array.from(
      carousel.querySelectorAll(".same-product-detail.item")
    );

    const scored = cards.map(card => {
      const data = {
        id: card.getAttribute("data-product-id") || "",
        category: card.getAttribute("data-category") || "",
        brand: card.getAttribute("data-brand") || "",
        tags: [],
        price: undefined
      };

      // tags
      const rawTags = card.getAttribute("data-tags");
      if (rawTags) {
        try {
          const parsed = JSON.parse(rawTags);
          data.tags = Array.isArray(parsed) ? parsed : [];
        } catch {
          data.tags = rawTags.split(",").map(s => s.trim()).filter(Boolean);
        }
      }

      // price
      const rawPrice = card.getAttribute("data-price");
      if (rawPrice) {
        const num = parseFloat(rawPrice.toString().replace(",", "."));
        if (Number.isFinite(num)) data.price = num;
      }

      const score = relatedScore(current, data);
      return { card, score };
    });

    // Skora göre sırala (yüksekten düşüğe)
    scored.sort((a, b) => b.score - a.score);

    // DOM'da yeniden sırala (Owl'dan önce!)
    const frag = document.createDocumentFragment();
    scored.forEach(({ card }) => frag.appendChild(card));
    carousel.appendChild(frag);





    // === 3) OWL CAROUSEL (sadece ilgili slider için) ===
    $("#related-carousel").owlCarousel({
      loop: false,
      margin: 20,
      nav: true,
      dots: false,
      autoplay: true,
      autoplayTimeout: 3500,
      autoplayHoverPause: true, 
      smartSpeed: 700, 
      navText: [
        "<i class='fa-solid fa-angle-left'></i>",
        "<i class='fa-solid fa-angle-right'></i>"
      ],
      responsive: {
        0: { items: 2 },
        400: { items: 2 },
        600: { items: 2 },
        760: { items: 3 },
        900: { items: 3 },
        1200: { items: 4 },
        1500: { items: 4 }
      }
    });
  }

  // === 4) FADE-IN ANİMASYONU (TEK KOPYA) ===
  const fadeEls = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.15 });

  fadeEls.forEach((el, i) => {
    el.style.setProperty("--order", i);
    observer.observe(el);
  });
});
