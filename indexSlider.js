$(document).ready(function () {
            $(".persons-product").owlCarousel({
                loop: false,
                margin: 20,
                nav: true,
                dots: false,
                navText: [
                    "<i class='fa-solid fa-angle-left'></i>",
                    "<i class='fa-solid fa-angle-right'></i>"
                ],
                responsive: {
                    0: { items: 2, margin: 6 },   
                    480: { items: 2, margin: 12 },
                    768: { items: 2, margin: 15 }, 
                    992: { items: 3, margin: 20 },    
                    1200: { items: 4, margin: 24 }    
                }
            });
        });

// const sellerSliders = document.querySelectorAll('.owl-carousel');

// sellerSliders.forEach(slider => {
//     const items = slider.querySelectorAll('.item');
//     if (items.length >= 9) {
//         items[8].classList.add('special-card');
//     }
// });
