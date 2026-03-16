import Swiper, { Navigation, Pagination, Scrollbar } from 'swiper';
import 'swiper/css/bundle';

class SwiperSlider extends HTMLElement {
    connectedCallback() {
        const swiperEl = this.querySelector('.swiper');
        const expandedSlider = this.querySelector('.expanding-slider');

        const raw = this.getAttribute('data-swiper-options') || '{}';
        const userOptions = JSON.parse(raw);

        const nextButton = this.querySelector('.swiper-button-next');
        const prevButton = this.querySelector('.swiper-button-prev');
        const scrollbar = this.querySelector('.swiper-scrollbar');

        const swiperOptions = {
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
            swiperOptions.scrollbar = { el: scrollbar };
        }

        if (expandedSlider) {
            swiperOptions.on = {
                slideChange() {
                    const swiper = this;
                    requestAnimationFrame(() => {
                        const wrapper = swiper.wrapperEl;
                        const duration = parseInt(wrapper.style.transitionDuration) || 0;
                        if (!duration) return;

                        // Force reflow so offsetWidth reflects the new active class (45% width)
                        void wrapper.offsetWidth;

                        const containerWidth = swiper.width;
                        const slides = swiper.slides;
                        const activeIdx = swiper.activeIndex;

                        let offset = 0;
                        for (let j = 0; j < activeIdx; j++) {
                            offset += (slides[j] ? slides[j].offsetWidth : 0) + swiper.params.spaceBetween;
                        }

                        const activeWidth = slides[activeIdx] ? slides[activeIdx].offsetWidth : 0;
                        const correctTranslate = -offset + (containerWidth - activeWidth) / 2;

                        // Apply correct translate while keeping Swiper's transition duration
                        swiper.setTranslate(correctTranslate);
                    });
                },
            };
        }

        const swiperInstance = new Swiper(swiperEl, swiperOptions);

        if (expandedSlider) {
            expandedSlider.addEventListener('click', (e) => {
                const slide = e.target.closest('.swiper-slide');
                if (!slide) return;
                if (slide.classList.contains('swiper-slide-active')) return;

                if (slide.classList.contains('swiper-slide-next')) {
                    e.preventDefault();
                    e.stopPropagation();
                    swiperInstance.slideNext();
                } else if (slide.classList.contains('swiper-slide-prev')) {
                    e.preventDefault();
                    e.stopPropagation();
                    swiperInstance.slidePrev();
                }
            });
        }
    }
}

if (!customElements.get('swiper-slider')) customElements.define('swiper-slider', SwiperSlider);
