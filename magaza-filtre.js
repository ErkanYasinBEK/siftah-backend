document.addEventListener("DOMContentLoaded", async () => {
    const productGrid = document.querySelector('.product-grid');

    try {
        // 1. Backend'den ürünleri iste
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();

        // 2. Eğer ürün yoksa mesaj göster
        if (products.length === 0) {
            productGrid.innerHTML = '<p style="text-align:center; width:100%;">Henüz hiç ürün eklenmemiş.</p>';
            return;
        }

        // 3. Ürünleri tek tek oluştur ve ekle
        productGrid.innerHTML = products.map(product => {
            // Resim yolunu düzelt (Windows ters slash sorunu olabilir, replace yapıyoruz)
            // Eğer resim yoksa varsayılan bir resim koyuyoruz.
            const imageUrl = product.image 
                ? `http://localhost:5000/${product.image.replace(/\\/g, '/')}` 
                : 'https://via.placeholder.com/300x400?text=Resim+Yok';

            const sellerName = product.User ? (product.User.brandName || product.User.name) : 'Bilinmeyen Satıcı';

            return `
                <article class="product-card" data-category="${product.category}">
                    <a href="urun-detay.html?id=${product.id}" class="product-media ratio-4x5" 
                       style="background-image:url('${imageUrl}')">
                    </a>
                    <div class="product-body">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span class="product-tag" style="font-size:0.75rem; color:#888;">${sellerName}</span>
                            <span class="product-tag" style="font-size:0.75rem; color:#0099d2;">${product.category}</span>
                        </div>
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-sub clamp">${product.description.substring(0, 50)}...</p>
                        <div class="product-row">
                            <span class="price">₺${product.price}</span>
                            <button class="btn btn--ghost" onclick="window.location.href='urun-detay.html?id=${product.id}'">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

    } catch (error) {
        console.error("Hata:", error);
        productGrid.innerHTML = '<p style="color:red; text-align:center;">Ürünler yüklenirken bir hata oluştu.</p>';
    }
});




document.addEventListener("DOMContentLoaded", () => {
    
    /* --- 1. ÜRÜN FİLTRELEME SİSTEMİ --- */
    const filterBtns = document.querySelectorAll(".filter-btn");
    const searchInput = document.getElementById("searchInput");
    const products = document.querySelectorAll(".product-grid .product-card"); // Seçiciyi düzelttim

    let activeTag = "all";

    // Butonla Filtreleme
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Aktif sınıfını güncelle
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            // Tag'i al ve filtrele
            activeTag = btn.dataset.tag;
            applyFilters();
        });
    });

    // Arama Kutusu ile Filtreleme
    if(searchInput) {
        searchInput.addEventListener("input", () => {
            applyFilters();
        });
    }

    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

        products.forEach(product => {
            const productTag = product.dataset.tag;
            const title = product.querySelector(".product-title").textContent.toLowerCase();
            const desc = product.querySelector(".product-sub") ? product.querySelector(".product-sub").textContent.toLowerCase() : "";

            // Kategori Eşleşiyor mu?
            const matchesTag = activeTag === "all" || productTag === activeTag;
            // Arama Kelimesi Eşleşiyor mu?
            const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);

            if (matchesTag && matchesSearch) {
                product.style.display = "block";
                // Animasyon ekleyelim (isteğe bağlı)
                product.style.animation = "fadeIn 0.3s ease-in-out";
            } else {
                product.style.display = "none";
            }
        });
    }

    /* --- 2. CSS SCROLL SNAP SLIDER KONTROLÜ --- */
    const track = document.getElementById('featuredTrack');
    const prevBtn = document.getElementById('slideLeft');
    const nextBtn = document.getElementById('slideRight');

    if (track && prevBtn && nextBtn) {
        // Butona basınca ne kadar kayacak? (Kart genişliği + boşluk)
        // Mobilde yaklaşık 280px, desktopta 300px civarı
        const scrollAmount = 300; 

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    /* --- 3. CSS ANIMATION KEYFRAMES (JS ile CSS ekleme) --- */
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleSheet);
});



document.addEventListener("DOMContentLoaded", async () => {
        // 1. URL'den ID'yi al (?id=5 gibi)
        // const params = new URLSearchParams(window.location.search);
        // const productId = params.get('id');

        // if (!productId) {
        //     alert("Ürün bulunamadı! Mağazaya yönlendiriliyorsunuz.");
        //     window.location.href = "magaza.html";
        //     return;
        // }

        try {
            // 2. Backend'den veriyi çek
            const response = await fetch(`http://localhost:5000/api/products/${productId}`);
            
            if (!response.ok) throw new Error("Ürün verisi alınamadı");

            const product = await response.json();

            // 3. Sayfadaki Alanları Doldur
            
            // Başlık
            document.querySelector('.product-details h2').textContent = product.title;
            
            // Fiyat
            document.querySelector('.price-box h3').textContent = product.price + "₺";
            
            // Açıklama
            document.querySelector('.product-desc p').textContent = product.description;
            
            // Resim (Varsa backend'den, yoksa placeholder)
            const imgElement = document.querySelector('.product-gallery img');
            if (product.image) {
                // Ters slash düzeltmesi ve sunucu adresi ekleme
                imgElement.src = `http://localhost:5000/${product.image.replace(/\\/g, '/')}`;
            }

            // Satıcı Bilgisi (Marka Adı veya İsim)
            const sellerName = product.User.brandName || product.User.name;
            const sellerLink = document.querySelector('.seller-info a');
            if(sellerLink) {
                sellerLink.textContent = sellerName;
                // İleride satıcı profiline link verebiliriz
                // sellerLink.href = `seller-profile.html?id=${product.User.id}`;
            }

            // Satıcı Kartı (Alttaki detaylı kutu)
            const cardSellerName = document.querySelector('.seller-info-box h4');
            if(cardSellerName) cardSellerName.textContent = sellerName;

            console.log("Ürün yüklendi:", product.title);

        } catch (error) {
            console.error(error);
            document.querySelector('.product-details').innerHTML = "<h2>Ürün yüklenirken bir hata oluştu :(</h2>";
        }
    });