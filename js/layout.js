// layout.js — Siftah Layout Controller 💫

// Navbar ve Footer yükleme
document.addEventListener("DOMContentLoaded", async () => {
  const [nav, foot] = await Promise.all([
    loadHTML("#navbar", "navbar.html", initNavbar),
    loadHTML("#footer", "footer.html")
  ]);
});


// Reusable HTML yükleyici
async function loadHTML(selector, file, callback) {
  const container = document.querySelector(selector);
  if (!container) return;

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`${file} yüklenemedi`);
    container.innerHTML = await res.text();

    if (callback) callback(); // içerik yüklendikten sonra script çalıştır
  } catch (err) {
    console.error(`Hata: ${err.message}`);
  }
}

// Navbar fonksiyonları
function initNavbar() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const dropdowns = document.querySelectorAll('.dropdown');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    document.addEventListener('click', e => {
      if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }

  // Dropdown menü hover
  dropdowns.forEach(drop => {
    drop.addEventListener('mouseenter', () => drop.classList.add('open'));
    drop.addEventListener('mouseleave', () => drop.classList.remove('open'));
  });

  console.log("✅ Navbar başarıyla yüklendi");
}
