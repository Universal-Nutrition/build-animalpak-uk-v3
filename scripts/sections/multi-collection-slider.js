import Swiper, { Navigation, Pagination } from 'swiper';
import 'swiper/css/bundle';

class MultiCollectionSlider extends HTMLElement {
    connectedCallback() {
        this.init();
    }

    init() {
        const swiperEl = this.querySelector('.swiper');
        const nextButton = this.querySelector('.swiper-button-next');
        const prevButton = this.querySelector('.swiper-button-prev');

        const raw = this.getAttribute('data-swiper-options') || '{}';
        let userOptions = {};
        try { userOptions = JSON.parse(raw); } catch (e) { console.error('multi-collection-slider: invalid swiper options', e); }

        this.swiperInstance = new Swiper(swiperEl, {
            modules: [Navigation, Pagination],
            ...userOptions,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: nextButton,
                prevEl: prevButton,
            },
            observer: true,
            observeChildren: true,
        });

        this.initTabs();
        this.initTabScroll();
    }

    initTabs() {
        if (!this.querySelector('[data-tab-trigger-container]')) return;

        this.querySelectorAll('[data-tab-trigger]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const handle = e.currentTarget.dataset.collectionHandle;

                this.querySelectorAll('[data-tab-trigger]').forEach(el => {
                    el.classList.remove('active');
                });
                trigger.classList.add('active');

                this.fetchCollection(handle);
            });
        });
    }

    initTabScroll() {
        const container = this.querySelector('[data-tab-trigger-container-scrollable]');
        const nextBtn = this.querySelector('[data-tab-scroll-button-next]');
        const prevBtn = this.querySelector('[data-tab-scroll-button-prev]');

        if (!container || !nextBtn || !prevBtn) return;

        const scroll_amount = 100;

        const checkOverflow = () => {
            const scrollLeft = container.scrollLeft;
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            prevBtn.style.display = scrollLeft > 0 ? 'flex' : 'none';
            nextBtn.style.display = scrollLeft < maxScrollLeft ? 'flex' : 'none';
        };

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            container.scrollBy({ left: scroll_amount, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            container.scrollBy({ left: -scroll_amount, behavior: 'smooth' });
        });

        container.addEventListener('scroll', checkOverflow, { passive: true });
        window.addEventListener('resize', checkOverflow, { passive: true });

        checkOverflow();
    }

    async fetchCollection(handle) {
        try {
            const res = await fetch(`/collections/${handle}?view=collection-tab-slider&limit=24`);
            const html = await res.text();
            const wrapper = this.querySelector('[data-swiper-wrapper]');
            wrapper.innerHTML = html;
            this.swiperInstance.slideTo(0, false);
            this.swiperInstance.update();
        } catch (err) {
            console.error('Failed to fetch collection:', err);
        }
    }
}

if (!customElements.get('multi-collection-slider')) customElements.define('multi-collection-slider', MultiCollectionSlider);
