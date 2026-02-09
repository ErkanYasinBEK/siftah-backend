// --- GENEL AYARLAR ---
const API_BASE_URL_GLOBAL = "http://localhost:5000"; // İhtiyaç olursa diye global değişken

// Resim Yolu Düzeltici (Tüm Sayfalar İçin)
function fixImageUrlGlobal(dbPath) {
  if (!dbPath || dbPath === "undefined" || dbPath === "null") return null;
  let cleanPath = dbPath.replace(/\\/g, "/");
  if (cleanPath.startsWith("http")) return cleanPath;
  const uploadsIndex = cleanPath.toLowerCase().indexOf("uploads/");
  if (uploadsIndex !== -1) {
    cleanPath = cleanPath.substring(uploadsIndex);
  } else {
    if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);
    if (!cleanPath.startsWith("uploads")) cleanPath = "uploads/" + cleanPath;
  }
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);
  return `${API_BASE_URL_GLOBAL}/${cleanPath}`;
}

document.addEventListener("DOMContentLoaded", function () {
  // 1. NAVBAR YÜKLEME
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;
      initNavbar();
      checkLoginStatus(); // Yüklendikten sonra kontrol et
    });

  // 2. FOOTER YÜKLEME
  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    });
});

function checkLoginStatus() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  const guestMenu = document.getElementById("guest-menu");
  const userMenu = document.getElementById("user-menu");

  if (!guestMenu || !userMenu) return;

  if (token && userStr) {
    // --- KULLANICI GİRİŞ YAPMIŞ ---
    const user = JSON.parse(userStr);

    guestMenu.style.display = "none";
    userMenu.style.display = "block";

    // 1. İsim ve Resim Güncelleme
    const nameSpan = userMenu.querySelector(".nav-user-name");
    const imgTag = userMenu.querySelector(".nav-user-img");

    if (nameSpan) nameSpan.textContent = user.name || "Kullanıcı";

    // Profil resmi varsa onu kullan, yoksa avatar servisi
    if (imgTag) {
      const profileImg = user.logoUrl || user.profileImage;
      if (profileImg) {
        imgTag.src = fixImageUrlGlobal(profileImg);
      } else {
        imgTag.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name
        )}&background=0099D2&color=fff`;
      }
    }

    // 2. MENÜYÜ ROLE GÖRE AYARLAMA
    const dropdownList = userMenu.querySelector(".dropdown-menu");

    if (user.role === "seller") {
      dropdownList.innerHTML = `
                <li><a href="satici-paneli.html" class="dropdown-item"><i class="fa-solid fa-gauge"></i> Mağaza Paneli</a></li>
                <li><a href="satici-paneli.html" onclick="localStorage.setItem('activeTab', 'products-list')" class="dropdown-item"><i class="fa-solid fa-box-open"></i> Ürünlerim</a></li>
                <li><a href="satici-paneli.html" onclick="localStorage.setItem('activeTab', 'messages')" class="dropdown-item"><i class="fa-regular fa-envelope"></i> Mesajlar</a></li>
                <li><a href="magaza-detay.html?sellerId=${user.id}" class="dropdown-item"><i class="fa-solid fa-store"></i> Mağazamı Gör</a></li>
                <hr class="dropdown-divider" />
                <li><button class="dropdown-item text-danger" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Çıkış Yap</button></li>
            `;
    } else {
      dropdownList.innerHTML = `
                <li><a href="buyer-orders.html" class="dropdown-item"><i class="fa-solid fa-bag-shopping"></i> Siparişlerim</a></li>
                <li><a href="favorilerim.html" class="dropdown-item"><i class="fa-regular fa-heart"></i> Favorilerim</a></li>
                <li><a href="mesajlarim.html" class="dropdown-item"><i class="fa-regular fa-envelope"></i> Mesajlarım</a></li>
                <li><a href="hesabim.html" class="dropdown-item"><i class="fa-solid fa-user-gear"></i> Hesap Ayarları</a></li>
                <hr class="dropdown-divider" />
                <li><button class="dropdown-item text-danger" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Çıkış Yap</button></li>
            `;
    }
  } else {
    // --- MİSAFİR (GİRİŞ YOK) ---
    guestMenu.style.display = "block";
    userMenu.style.display = "none";
  }
}

// Çıkış Yapma
window.logout = function () {
  localStorage.clear(); // Token dahil her şeyi temizle
  window.location.href = "/";
};

// Mobil Menü Başlatıcı
function initNavbar() {
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".menu-close");
  const mobileMenu = document.querySelector(".mobile-menu");
  const overlay = document.querySelector(".mobile-menu-overlay");

  // Masaüstü linklerini mob ile kopyala
  const desktopLinks = document.querySelector(".nav-links");
  const mobileLinksContainer = document.querySelector(".mobile-links");

  if (
    desktopLinks &&
    mobileLinksContainer &&
    mobileLinksContainer.innerHTML.trim() === ""
  ) {
    mobileLinksContainer.innerHTML = desktopLinks.innerHTML;
  }

  function openMenu() {
    if (mobileMenu) mobileMenu.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (mobileMenu) mobileMenu.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (menuToggle) menuToggle.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);
}
