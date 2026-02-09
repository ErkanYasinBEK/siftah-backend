// document.addEventListener('DOMContentLoaded', () => {

//     let currentStep = 1;
//     const forms = {
//         1: document.querySelector('.login-container'),
//         2: document.querySelector('.brand-container')
//     };

//     // Form state saklama
//     const formState = {
//         user: {},
//         brand: {}
//     };

//     function showStep(step) {
//         Object.values(forms).forEach(f => f.style.display = 'none');
//         if(forms[step]) forms[step].style.display = 'block';

//         // Geri dönüşlerde state'i doldur
//         if(step === 1) {
//             const user = formState.user;
//             if(user.name) document.getElementById('name').value = user.name;
//             if(user.surname) document.getElementById('surname').value = user.surname;
//             if(user.brandEmail) document.getElementById('brandEmail').value = user.brandEmail;
//             if(user.password) document.getElementById('password').value = user.password;
//             if(user.confirmPassword) document.getElementById('confirmPassword').value = user.confirmPassword;
//             if(user.number) document.getElementById('number').value = user.number;
//             if(user.date) document.getElementById('date').value = user.date;
//             if(user.username) document.getElementById('username').value = user.username;
//         } else if(step === 2) {
//             const brand = formState.brand;
//             if(brand.brandName) document.getElementById('brandName').value = brand.brandName;
//             if(brand.category) document.getElementById('category').value = brand.category;
//             if(brand.type) document.getElementById('type').value = brand.type;
//             if(brand.brandExperience) document.getElementById('brandExperience').value = brand.brandExperience;
//             if(brand.email) document.getElementById('email').value = brand.email;
//         }
//     }

//     showStep(currentStep);

//     // --------------------------
//     // 1️⃣ Üye Formu
//     // --------------------------
//     const userForm = document.getElementById('userFormStep1');

//     userForm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         // State güncelle
//         formState.user = {
//             name: document.getElementById('name').value.trim(),
//             surname: document.getElementById('surname').value.trim(),
//             brandEmail: document.getElementById('brandEmail').value.trim(),
//             password: document.getElementById('password').value,
//             confirmPassword: document.getElementById('confirmPassword').value,
//             number: document.getElementById('number').value.trim(),
//             date: document.getElementById('date').value,
//             username: document.getElementById('username').value.trim()
//         };

//         if(formState.user.password !== formState.user.confirmPassword){
//             return alert("Şifreler eşleşmiyor!");
//         }

//         try {
//             const res = await fetch('/api/user-register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formState.user)
//             });

//             const data = await res.json();
//             if(!res.ok) return alert(data.message || "Bir hata oluştu!");

//             alert(data.message || "Üye kaydı başarılı!");

//             currentStep = 2;
//             showStep(currentStep);

//         } catch(err) {
//             console.error(err);
//             alert("Sunucuya bağlanırken hata oluştu!");
//         }
//     });

//     // --------------------------
//     // 1️⃣ -> 2️⃣ Adım Butonu
//     // --------------------------
//     const nextToBrandBtn = document.getElementById('nextToBrand');
//     if(nextToBrandBtn) {
//         nextToBrandBtn.addEventListener('click', () => {
//             // State kaydet
//             formState.user = {
//                 name: document.getElementById('name').value.trim(),
//                 surname: document.getElementById('surname').value.trim(),
//                 brandEmail: document.getElementById('brandEmail').value.trim(),
//                 password: document.getElementById('password').value,
//                 confirmPassword: document.getElementById('confirmPassword').value,
//                 number: document.getElementById('number').value.trim(),
//                 date: document.getElementById('date').value,
//                 username: document.getElementById('username').value.trim()
//             };

//             if(!formState.user.name || !formState.user.surname || !formState.user.brandEmail || !formState.user.password || !formState.user.confirmPassword) {
//                 return alert("Lütfen zorunlu alanları doldurun!");
//             }

//             if(formState.user.password !== formState.user.confirmPassword) {
//                 return alert("Şifreler eşleşmiyor!");
//             }

//             currentStep = 2;
//             showStep(currentStep);
//         });
//     }

//     // --------------------------
//     // 2️⃣ -> 1️⃣ Geri Dön Butonu
//     // --------------------------
//     const backToUserBtn = document.querySelector('.brand-container .left button');
//     if(backToUserBtn) {
//         backToUserBtn.addEventListener('click', () => {
//             // Marka state'i kaydet
//             formState.brand = {
//                 brandName: document.getElementById('brandName').value.trim(),
//                 category: document.getElementById('category').value.trim(),
//                 type: document.getElementById('type').value.trim(),
//                 brandExperience: document.getElementById('brandExperience').value.trim(),
//                 email: document.getElementById('email').value.trim()
//             };

//             currentStep = 1;
//             showStep(currentStep);
//         });
//     }

//     // --------------------------
//     // 2️⃣ Marka Formu Submit
//     // --------------------------
//     const brandForm = document.getElementById('userFormStep2');

//     brandForm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         formState.brand = {
//             brandName: document.getElementById('brandName').value.trim(),
//             category: document.getElementById('category').value.trim(),
//             type: document.getElementById('type').value.trim(),
//             brandExperience: document.getElementById('brandExperience').value.trim(),
//             email: document.getElementById('email').value.trim()
//         };

//         if(!formState.brand.brandName || !formState.brand.category || !formState.brand.type || !formState.brand.brandExperience || !formState.brand.email) {
//             return alert("Lütfen tüm alanları doldurun!");
//         }

//         try {
//             const res = await fetch('/api/brand-register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formState.brand)
//             });

//             const data = await res.json();
//             if(!res.ok) return alert(data.message || "Bir hata oluştu!");

//             alert(data.message || "Marka kaydı başarılı!");
//             window.location.href = '/seller/dashboard.html';

//         } catch(err) {
//             console.error(err);
//             alert("Sunucuya bağlanırken hata oluştu!");
//         }
//     });

//     // --------------------------
//     // Marka logosu önizleme
//     // --------------------------
//     const logoInput = document.getElementById('file-input');
//     if(logoInput) {
//         logoInput.addEventListener('change', function(event) {
//             const file = event.target.files[0];
//             if(file) {
//                 const reader = new FileReader();
//                 reader.onload = function(e) {
//                     document.getElementById('preview').src = e.target.result;
//                 };
//                 reader.readAsDataURL(file);
//             }
//         });
//     }

// });

// document.addEventListener('DOMContentLoaded', () => {

//     const step1Form = document.getElementById('userFormStep1');
//     const step2Form = document.getElementById('userFormStep2');
//     const nextToBrandBtn = document.getElementById('nextToBrand');

//     // Adım 1'den Adım 2'ye geçiş
//     nextToBrandBtn.addEventListener('click', () => {
//         document.querySelector('.login-container').style.display = 'none';
//         document.querySelector('.brand-container').style.display = 'block';
//     });

//     // Adım 2 form submit
//     step2Form.addEventListener('submit', async (e) => {
//         e.preventDefault();
    
//         // Step1 verilerini al
//         const name = document.getElementById('name').value.trim();
//         const surname = document.getElementById('surname').value.trim();
//         const brandEmail = document.getElementById('brandEmail').value.trim();
//         const password = document.getElementById('password').value;
//         const confirmPassword = document.getElementById('confirmPassword').value;
//         const number = document.getElementById('number').value.trim();
//         const date = document.getElementById('date').value;
//         const username = document.getElementById('username').value.trim();
    
//         // Step2 verilerini al
//         const brandName = document.getElementById('brandName').value.trim();
//         const category = document.getElementById('category').value.trim();
//         const type = document.getElementById('type').value.trim();
//         const brandExperience = document.getElementById('brandExperience').value.trim();
//         const brandEmailStep2 = document.getElementById('email').value.trim();
    
//         // Brand email Step2 boşsa Step1’den al
//         const finalBrandEmail = brandEmailStep2 || brandEmail;
    
//         try {
//             const res = await fetch('http://localhost:3000/api/user-register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     name,
//                     surname,
//                     brandEmail,
//                     password,
//                     confirmPassword,
//                     number: phone,
//                     date: birthdate,
//                     username,
//                     brandName,
//                     category,
//                     type,
//                     brandExperience,
//                     brandEmailStep2
//                 })
//             });
    
//             const data = await res.json();
    
//             if (!res.ok) {
//                 alert(data.message || 'Kayıt yapılamadı!');
//                 return;
//             }
    
//             // localStorage’a kaydet
//             localStorage.setItem('id', data.userId);
    
//             // Dashboard’a yönlendir
//             window.location.href = 'dashboard.html';
    
//         } catch (err) {
//             console.error('Kayıt sırasında hata:', err);
//             alert('Sunucuya bağlanırken hata oluştu!');
//         }
//     });
    
// });


// localStorage.setItem('userId', result.userId);












// document.addEventListener('DOMContentLoaded', () => {

//     let currentStep = 1;
//     const forms = {
//         1: document.querySelector('.login-container'),
//         2: document.querySelector('.brand-container')
//     };

//     const formState = { user: {}, brand: {} };

//     function showStep(step) {
//         Object.values(forms).forEach(f => f.style.display = 'none');
//         if(forms[step]) forms[step].style.display = 'block';

//         if(step === 1) {
//             const user = formState.user;
//             if(user.name) document.getElementById('name').value = user.name;
//             if(user.surname) document.getElementById('surname').value = user.surname;
//             if(user.brandEmail) document.getElementById('brandEmail').value = user.brandEmail;
//             if(user.password) document.getElementById('password').value = user.password;
//             if(user.confirmPassword) document.getElementById('confirmPassword').value = user.confirmPassword;
//             if(user.number) document.getElementById('number').value = user.number;
//             if(user.date) document.getElementById('date').value = user.date;
//             if(user.username) document.getElementById('username').value = user.username;
//         } else if(step === 2) {
//             const brand = formState.brand;
//             if(brand.brandName) document.getElementById('brandName').value = brand.brandName;
//             if(brand.category) document.getElementById('category').value = brand.category;
//             if(brand.type) document.getElementById('type').value = brand.type;
//             if(brand.brandExperience) document.getElementById('brandExperience').value = brand.brandExperience;
//             if(brand.email) document.getElementById('email').value = brand.email;
//         }
//     }

//     showStep(currentStep);

//     // ---------------- Step 1 -> Next ----------------
//     document.getElementById('nextToBrand').addEventListener('click', () => {
//         formState.user = {
//             name: document.getElementById('name').value.trim(),
//             surname: document.getElementById('surname').value.trim(),
//             brandEmail: document.getElementById('brandEmail').value.trim(),
//             password: document.getElementById('password').value,
//             confirmPassword: document.getElementById('confirmPassword').value,
//             number: document.getElementById('number').value.trim(),
//             date: document.getElementById('date').value,
//             username: document.getElementById('username').value.trim()
//         };

//         if(!formState.user.name || !formState.user.surname || !formState.user.brandEmail || !formState.user.password || !formState.user.confirmPassword) {
//             return alert("Lütfen zorunlu alanları doldurun!");
//         }

//         if(formState.user.password !== formState.user.confirmPassword) {
//             return alert("Şifreler eşleşmiyor!");
//         }

//         currentStep = 2;
//         showStep(currentStep);
//     });

//     // ---------------- Step 2 -> Back ----------------
//     document.querySelector('.brand-container .left button').addEventListener('click', () => {
//         formState.brand = {
//             brandName: document.getElementById('brandName').value.trim(),
//             category: document.getElementById('category').value.trim(),
//             type: document.getElementById('type').value.trim(),
//             brandExperience: document.getElementById('brandExperience').value.trim(),
//             email: document.getElementById('email').value.trim()
//         };
//         currentStep = 1;
//         showStep(currentStep);
//     });

//     // ---------------- Step 2 -> Submit ----------------
//     document.getElementById('userFormStep2').addEventListener('submit', async (e) => {
//         e.preventDefault();

//         formState.brand = {
//             brandName: document.getElementById('brandName').value.trim(),
//             category: document.getElementById('category').value.trim(),
//             type: document.getElementById('type').value.trim(),
//             brandExperience: document.getElementById('brandExperience').value.trim(),
//             email: document.getElementById('email').value.trim()
//         };

//         if(!formState.brand.brandName || !formState.brand.category || !formState.brand.type || !formState.brand.brandExperience || !formState.brand.email) {
//             return alert("Lütfen tüm alanları doldurun!");
//         }

//         try {
//             const res = await fetch('http://localhost:3000/api/user-register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     ...formState.user,
//                     ...formState.brand
//                 })
//             });

//             const data = await res.json();
//             if(!res.ok) return alert(data.message || 'Kayıt yapılamadı!');

//             localStorage.setItem('id', data.userId);
//             alert('Kayıt başarılı! Dashboard’a yönlendiriliyorsunuz...');
//             window.location.href = '/seller/dashboard.html';

//         } catch(err) {
//             console.error(err);
//             alert('Sunucuya bağlanırken hata oluştu!');
//         }
//     });

//     // ---------------- Logo preview ----------------
//     document.getElementById('file-input')?.addEventListener('change', function(e) {
//         const file = e.target.files[0];
//         if(file) {
//             const reader = new FileReader();
//             reader.onload = function(ev) {
//                 document.getElementById('preview').src = ev.target.result;
//             };
//             reader.readAsDataURL(file);
//         }
//     });

// });














// document.addEventListener('DOMContentLoaded', () => {

//     let currentStep = 1;
//     const forms = {
//         1: document.querySelector('.login-container'),
//         2: document.querySelector('.brand-container')
//     };

//     const formState = { user: {}, brand: {} };

//     function showStep(step) {
//         Object.values(forms).forEach(f => f.style.display = 'none');
//         if(forms[step]) forms[step].style.display = 'block';

//         if(step === 1) {
//             const user = formState.user;
//             if(user.name) document.getElementById('name').value = user.name;
//             if(user.surname) document.getElementById('surname').value = user.surname;
//             if(user.brandEmail) document.getElementById('brandEmail').value = user.brandEmail;
//             if(user.password) document.getElementById('password').value = user.password;
//             if(user.confirmPassword) document.getElementById('confirmPassword').value = user.confirmPassword;
//             if(user.number) document.getElementById('number').value = user.number;
//             if(user.date) document.getElementById('date').value = user.date;
//             if(user.username) document.getElementById('username').value = user.username;
//         } else if(step === 2) {
//             const brand = formState.brand;
//             if(brand.brandName) document.getElementById('brandName').value = brand.brandName;
//             if(brand.category) document.getElementById('category').value = brand.category;
//             if(brand.type) document.getElementById('type').value = brand.type;
//             if(brand.brandExperience) document.getElementById('brandExperience').value = brand.brandExperience;
//             if(brand.email) document.getElementById('email').value = brand.email;
//         }
//     }

//     showStep(currentStep);

//     // ---------------- Step 1 -> Next ----------------
//     document.getElementById('nextToBrand').addEventListener('click', () => {
//         formState.user = {
//             name: document.getElementById('name').value.trim(),
//             surname: document.getElementById('surname').value.trim(),
//             brandEmail: document.getElementById('brandEmail').value.trim(),
//             password: document.getElementById('password').value,
//             confirmPassword: document.getElementById('confirmPassword').value,
//             number: document.getElementById('number').value.trim(),
//             date: document.getElementById('date').value,
//             username: document.getElementById('username').value.trim()
//         };

//         if(!formState.user.name || !formState.user.surname || !formState.user.brandEmail || !formState.user.password || !formState.user.confirmPassword) {
//             return alert("Lütfen zorunlu alanları doldurun!");
//         }

//         if(formState.user.password !== formState.user.confirmPassword) {
//             return alert("Şifreler eşleşmiyor!");
//         }

//         currentStep = 2;
//         showStep(currentStep);
//     });

//     // ---------------- Step 2 -> Back ----------------
//     document.querySelector('.brand-container .left button').addEventListener('click', () => {
//         formState.brand = {
//             brandName: document.getElementById('brandName').value.trim(),
//             category: document.getElementById('category').value.trim(),
//             type: document.getElementById('type').value.trim(),
//             brandExperience: document.getElementById('brandExperience').value.trim(),
//             email: document.getElementById('email').value.trim()
//         };
//         currentStep = 1;
//         showStep(currentStep);
//     });

//     // ---------------- Step 2 -> Submit ----------------
//     document.getElementById('userFormStep2').addEventListener('submit', async (e) => {
//         e.preventDefault();

//         formState.brand = {
//             brandName: document.getElementById('brandName').value.trim(),
//             category: document.getElementById('category').value.trim(),
//             type: document.getElementById('type').value.trim(),
//             brandExperience: document.getElementById('brandExperience').value.trim(),
//             email: document.getElementById('email').value.trim()
//         };

//         if(!formState.brand.brandName || !formState.brand.category || !formState.brand.type || !formState.brand.brandExperience || !formState.brand.email) {
//             return alert("Lütfen tüm alanları doldurun!");
//         }

//         try {
//             const res = await fetch('http://localhost:3000/api/user-register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     ...formState.user,
//                     ...formState.brand
//                 })
//             });

//             const data = await res.json();
//             if(!res.ok) return alert(data.message || 'Kayıt yapılamadı!');

//             localStorage.setItem('id', data.userId);
//             alert('Kayıt başarılı! Dashboard’a yönlendiriliyorsunuz...');
//             window.location.href = '/seller/dashboard.html';

//         } catch(err) {
//             console.error(err);
//             alert('Sunucuya bağlanırken hata oluştu!');
//         }
//     });

//     // ---------------- Logo preview ----------------
//     document.getElementById('file-input')?.addEventListener('change', function(e) {
//         const file = e.target.files[0];
//         if(file) {
//             const reader = new FileReader();
//             reader.onload = function(ev) {
//                 document.getElementById('preview').src = ev.target.result;
//             };
//             reader.readAsDataURL(file);
//         }
//     });

// });





document.addEventListener('DOMContentLoaded', () => {
    const formState = { user: {}, brand: {} };

    // Step 1 -> Next
    document.getElementById('nextToBrand').addEventListener('click', () => {
        formState.user = {
            name: document.getElementById('name').value.trim(),
            surname: document.getElementById('surname').value.trim(),
            brandEmail: document.getElementById('brandEmail').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            number: document.getElementById('number').value.trim(),
            date: document.getElementById('date').value,
            username: document.getElementById('username').value.trim()
        };
        if (!formState.user.name || !formState.user.surname || !formState.user.brandEmail || !formState.user.password || !formState.user.confirmPassword) {
            return alert("Lütfen zorunlu alanları doldurun!");
        }
        if (formState.user.password !== formState.user.confirmPassword) {
            return alert("Şifreler eşleşmiyor!");
        }

        document.querySelector('.login-container').style.display = 'none';
        document.querySelector('.brand-container').style.display = 'block';
    });

    // Step 2 -> Back
    document.querySelector('.brand-container .left').addEventListener('click', () => {
        document.querySelector('.login-container').style.display = 'block';
        document.querySelector('.brand-container').style.display = 'none';
    });

    // Step 2 -> Submit
    document.getElementById('userFormStep2').addEventListener('submit', async (e) => {
        e.preventDefault();

        formState.brand = {
            brandName: document.getElementById('brandName').value.trim(),
            category: document.getElementById('category').value.trim(),
            type: document.getElementById('type').value.trim(),
            brandExperience: document.getElementById('brandExperience').value.trim(),
            email: document.getElementById('email').value.trim()
        };

        try {
            const res = await fetch('http://localhost:3000/api/user-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formState.user, ...formState.brand })
            });
            const data = await res.json();
            if (!res.ok) return alert(data.message || 'Kayıt yapılamadı!');

            localStorage.setItem('id', data.userId);
            alert('Kayıt başarılı! Dashboard’a yönlendiriliyorsunuz...');
            window.location.href = '/seller/dashboard.html';

        } catch (err) {
            console.error(err);
            alert('Sunucuya bağlanırken hata oluştu!');
        }
    });

    // Logo preview
    document.getElementById('file-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (ev) => document.getElementById('preview').src = ev.target.result;
            reader.readAsDataURL(file);
        }
    });
});
