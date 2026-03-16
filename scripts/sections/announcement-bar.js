import Swiper, {
	Autoplay,
} from 'swiper';
import 'swiper/css';
import 'swiper/css/autoplay';

class AnnouncementBar extends HTMLElement {
	constructor() {
		super();
		this.autoplayValue = this.getAttribute('data-autoplay');
		if (this.autoplayValue !== 0) {
			this.autoplayValue = this.autoplayValue * 1000;
		}
		this.swiperOptions = {
			modules: [Autoplay],
			slidesPerView: 'auto',
			speed: this.autoplayValue,
			initialSlide: 0,
			maxBackfaceHiddenSlides: 0,
			loop: true,
			loopedSlides: 4,
			loopPreventsSlide: true,
			loopedSlidesLimit: false,
			centeredSlides: true,
			autoplay: {
				delay: 1,
				disableOnInteraction: false,
				waitForTransition: true,
			}
		};
		document.addEventListener('DOMContentLoaded', () => {
				this.initSwiper();
		});
	}
	initSwiper() {
		const swiper = new Swiper(this, this.swiperOptions);

	}

	connectedCallback() {}
}
if (!customElements.get('announcement-bar')) customElements.define('announcement-bar', AnnouncementBar);