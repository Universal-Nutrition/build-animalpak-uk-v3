import Swiper, { Navigation, Pagination, Scrollbar } from 'swiper';

class SwiperSlider extends HTMLElement {
    constructor() {
        super();
        this.swiper = this.querySelector('.swiper');
        this.expandedSlider = this.querySelector('.expanding-slider');
        this.swiperInstance = null;

        const raw = this.getAttribute('data-swiper-options') || '{}';
        const userOptions = JSON.parse(raw);

        const nextButton = this.querySelector('.swiper-button-next');
        const prevButton = this.querySelector('.swiper-button-prev');
        const scrollbar = this.querySelector('.swiper-scrollbar');

        this.swiperOptions = {
            modules: [Navigation, Pagination, Scrollbar],
            ...userOptions,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: nextButton,
                prevEl: prevButton,
            },
            observeChildren: true,
            observer: true,
            resize: true,
        };

        if (scrollbar) {
            this.swiperOptions.scrollbar = {
                el: scrollbar,
            };
        }

        this.initSwiper();
    }

    initSwiper() {
        this.swiperInstance = new Swiper(this.swiper, this.swiperOptions);

        if (this.expandedSlider) {
            this.setupExpandedSlider();
        }
    }

    connectedCallback() {}

    setupExpandedSlider() {
        const slides = this.expandedSlider.querySelectorAll('.swiper-slide');

        slides.forEach(slide => {
            slide.addEventListener('click', (e) => {
                if (slide.classList.contains('swiper-slide-active')) {
                    return;
                }

                if (slide.classList.contains('swiper-slide-next')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.swiperInstance.slideNext();
                }

                if (slide.classList.contains('swiper-slide-prev')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.swiperInstance.slidePrev();
                }
            });
        });
    }
}

if (!customElements.get('swiper-slider')) customElements.define('swiper-slider', SwiperSlider);
