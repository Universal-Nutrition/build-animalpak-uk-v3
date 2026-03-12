class MobileMenu extends HTMLElement {
    constructor() {
        super();
        this.eventListeners();
    }

    connectedCallback() {
        document.querySelector('[js-trigger="mobile-menu-button"]').addEventListener('click', () => {
            this.openMenu();
        });

        this.addEventListener('click', (e) => {
            if (e.target.classList == this.classList || e.target.id == "mobile-menu-button-close") {
                this.closeMenu();
            }
        })


        const childItems = document.querySelectorAll('.mobile-nav__child-item');

        childItems.forEach(function (item) {
            item.addEventListener('click', function () {
                const grandchildContainers = document.querySelectorAll('.mobile-nav__grandchild-container');
                const grandchildContainer = this.nextElementSibling;

                grandchildContainers.forEach(function (container) {
                    if (container !== grandchildContainer) {
                        container.classList.add('hidden');
                        container.style.maxHeight = '0';
                    }
                });

                grandchildContainer.classList.toggle('hidden');

                if (grandchildContainer.classList.contains('hidden')) {
                    grandchildContainer.style.maxHeight = '0';
                } else {
                    grandchildContainer.style.maxHeight = grandchildContainer.scrollHeight + 'px';
                }

                childItems.forEach(function (otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove('opened');
                    }
                });
                this.classList.toggle('opened');
            });
        });


        this.debouncedResize = this.debounce(this.handleResize.bind(this));
        window.addEventListener('resize', this.debouncedResize);
    }

    handleResize() {
        const isDesktop = window.innerWidth > 1024;
        if (isDesktop && this.classList.contains('mm-open')) {
            this.closeMenu();
        }
    }

    subMenuOpen(e) {
        e.preventDefault();
        e.stopPropagation();
        const subMenu = e.target.closest('[data-trigger-menu]').getAttribute('data-trigger-menu');
        const subMenuElement = document.querySelector(`[data-menu="${subMenu}"]`);

        subMenuElement.classList.remove('translate-x-full');
        subMenuElement.classList.add('translate-x-0');
    }

    subMenuClose(e) {
        e.preventDefault();
        e.stopPropagation();

        const subMenu = e.target.closest('[data-close-menu]').getAttribute('data-close-menu');
        const subMenuElement = document.querySelector(`[data-menu="${subMenu}"]`);

        subMenuElement.classList.add('translate-x-full');
        subMenuElement.classList.remove('translate-x-0');
    }

    eventListeners() {
        [...document.querySelectorAll('[data-trigger-menu]')].forEach((element) => {
            element.addEventListener('click', this.subMenuOpen);
        });
        [...document.querySelectorAll('[data-close-menu]')].forEach((element) => {
            element.addEventListener('click', this.subMenuClose);
        });
    }

    debounce(fn, delay = 150) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    closeMenu() {
        this.classList.add('mm-closing');
        this.classList.remove('mm-open');
        document.querySelector('body').classList.remove('overflow-hidden');

        setTimeout(() => {
            this.style.display = 'none';
            this.classList.remove('mm-closing');
        }, 300);
    }

    openMenu() {
        this.style.display = 'flex';
        this.classList.add('will-animate');

        setTimeout(() => {
            this.classList.remove('will-animate');
            this.classList.add('mm-open');
            document.body.classList.add('overflow-hidden');
        }, 0);
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.debouncedResize);
    }
}

customElements.define('mobile-menu', MobileMenu);
