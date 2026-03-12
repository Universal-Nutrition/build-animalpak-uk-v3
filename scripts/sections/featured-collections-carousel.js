


class FeaturedCollectionsCarousel extends HTMLElement {
	constructor() {
		super(); 
    this.init();
	}

  tabClick() {
    [...this.querySelectorAll('[data-tab]')].forEach((tab) => {
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        this.tabToggle(event.currentTarget);
      });
    }
    );
  }

  tabToggle(tab) {
    const tabId = tab.dataset.tab;
    const tabContent = this.querySelector(`[data-tab-content="${tabId}"]`);
    const tabContentActive = this.querySelector('[data-tab-content].active');
    const tabActive = this.querySelector('[data-tab].active');

    if (tabContentActive) {
      tabContentActive.classList.remove('active');
    }

    if (tabActive) {
      tabActive.classList.remove('active');
      tabActive.querySelector('div').classList.remove('active');
    }

    tabContent.classList.add('active');
    tab.classList.add('active');
    tab.querySelector('div').classList.add('active');

  }


  init() {
    this.tabClick();
  }

}


customElements.define('featured-collections-carousel', FeaturedCollectionsCarousel);

