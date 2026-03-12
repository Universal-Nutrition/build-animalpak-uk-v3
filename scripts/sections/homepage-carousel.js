import Swiper, { Pagination, Autoplay, EffectFade, Navigation } from 'swiper';

class HomepageCarousel extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.init();
    }

    init() {
        const slideDelay = this.dataset.slideDelay || 0;

        const swiper = new Swiper(this, {
            slidesPerView: 1,
            loop: true,
            modules: [
                Pagination,
                Autoplay,
                EffectFade,
                Navigation,
            ],
            pagination: {
                el: '.hero-pagination',
                clickable: true,
            },
            ...(slideDelay ? {
                autoplay: {
                    delay: slideDelay || 0,
                    disableOnInteraction: false,
                },
            } : {}),
            effect: 'fade',
            fadeEffect: {
                crossFade: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                slideChange() {
                    const bullets = document.querySelectorAll('.swiper-bullets');
                    if (!bullets) {
                        return;
                    }

                    if (!bullets?.length) {
                        return;
                    }

                    setTimeout(() => {
                        bullets?.forEach((bullet) => {
                            bullet?.classList?.remove('prev');
                        });
                    }, 5300);

                    const activeBullets = document.querySelectorAll('.swiper-pagination-bullet-active');
                    if (!activeBullets) {
                        return;
                    }

                    if (!activeBullets?.length) {
                        return;
                    }

                    activeBullets?.forEach((bullet) => {
                        let prev = bullet?.previousElementSibling;
                        while (prev) {
                            prev?.classList?.add('prev');

                            prev = prev.previousElementSibling;
                        }
                    });
                },
            }
        });
    }
}

customElements.define('homepage-carousel', HomepageCarousel)
