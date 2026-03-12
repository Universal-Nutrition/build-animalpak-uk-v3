// --- sticky-header.js ---

class StickyHeader extends HTMLElement {
    constructor() {
        super()
        this.transparentHeader = this.classList.contains('transparent-header')
    }

    connectedCallback() {
        [...this.querySelectorAll('.mm-close')].forEach((element) => {
            element.addEventListener('click', () => {
                this.closeMenu()
            })
        })

        this.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                this.closeMenu()
            })
        })

        if (this.transparentHeader) {
            //if the header is transparent, then add the blurred class when the user scrolls down
            window.addEventListener('scroll', () => {
                if (document.documentElement.scrollTop >= 330) {
                    this.classList.add('blurred')
                } else {
                    this.classList.remove('blurred')
                }
            })
        }

        this.addEventListener('mouseleave', () => {
            this.classList.remove('active')
        })

        this.addEventListener('mouseover', () => {
            this.classList.add('active')
        })
    }

    closeMenu() {
        document.body.classList.remove('overflow-hidden')
        const menu = this.querySelector('mobile-menu')
        menu.classList.remove('mm-open')
        this.classList.remove('active')
    }
}

if (!customElements.get('sticky-header')) customElements.define('sticky-header', StickyHeader);


// --- mobile-menu.js ---

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
                this.classList.remove('active')
                this.classList.remove('mm-open');
                document.querySelector('body').classList.remove('overflow-hidden');
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
            // this.classList.remove('active');
        }, 300);
    }

    openMenu() {
        this.style.display = 'flex';
        this.classList.add('will-animate');

        setTimeout(() => {
            this.classList.remove('will-animate');
            this.classList.add('mm-open');
            // this.classList.add('active');
            document.body.classList.add('overflow-hidden');
        }, 0);

    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.debouncedResize);
    }
}

if (!customElements.get('mobile-menu')) customElements.define('mobile-menu', MobileMenu);

// --- header.js ---

function debounce(fn, delay = 200) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

class Header extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.search()
        this.countrySelector()
        this.toggleExpanded()

        this.addEventListener(
            'mouseover',
            debounce(function (e) {
                var targetName = e.target.id
                var indexValue = e.target.getAttribute('meganav_heading_index')

                ;[...document.querySelectorAll('.mega-nav__item')].forEach((element) =>
                    element.classList.remove('active')
                )

                if (
                    (targetName && targetName.includes('meganav')) ||
                    indexValue !== null
                ) {
                    document
                        .getElementById('desktop-menu-overlay')
                        .classList.remove('hidden')
                } else if (e.target.getAttribute('data-item-index')) {
                    document
                        .getElementById('desktop-menu-overlay')
                        .classList.add('hidden')
                }

                if (
                    e.target.closest('.mega-nav__dropdown') !== null &&
                    e.target.closest('.mega-nav__dropdown').style.display === 'block'
                ) {
                    const parentItemIndex = e.target
                        .closest('.mega-nav__dropdown')
                        .getAttribute('meganav_index')
                    const parentItem = document.querySelector(
                        `[meganav_heading_index="${parentItemIndex}"]`
                    )
                    parentItem.classList.add('active')
                    console.log('parnt item', parentItem)
                }
            }, 200)
        )

        this.addEventListener(
            'mouseleave',
            debounce(this.mouseLeaveEvent.bind(this), 300)
        )
    }

    mouseLeaveEvent() {
        ;[...document.querySelectorAll('.mega-nav__item')].forEach((element) =>
            element.classList.remove('active')
        )
        this.querySelectorAll('[meganav_index]').forEach((element) => {
            document.getElementById('desktop-menu-overlay').classList.add('hidden')
        })
    }

    toggleExpanded() {
        const elements = document.querySelectorAll('[data-item-index]');
        elements.forEach(element => {
            element.addEventListener('focusin', () => {
                var indexValue = element.getAttribute('data-item-index');
                if (element.getAttribute('data-item-index') == indexValue) {
                    element.setAttribute('aria-expanded', 'true');
                    element.closest('div').querySelector('.mega-nav__dropdown').classList.add('active');
                }
            });
            // element.addEventListener('focusout', () => {
            //     const expanded = element.getAttribute('aria-expanded');
            //     if (expanded !== null) {
            //         element.setAttribute('aria-expanded', 'false');
            //         element.closest('div').querySelector('.mega-nav__dropdown').classList.remove('active');
            //     }
            // });
            element.addEventListener('mouseover', () => {
                element.setAttribute('aria-expanded', 'true');
                element.closest('div').querySelector('.mega-nav__dropdown').classList.add('active');
            });
            element.addEventListener('mouseout', () => {
                const expanded = element.getAttribute('aria-expanded');
                if (expanded !== null) {
                    element.setAttribute('aria-expanded', 'false');
                    element.closest('div').querySelector('.mega-nav__dropdown').classList.remove('active');
                }
            });
        });
    }

    search() {
        let searchTrigger = document.querySelectorAll('.trigger-search'),
            searchWrapper = this.querySelector('.search-wrapper'),
            searchInput = this.querySelector('.search-input'),
            searchResults = this.querySelector('.search-results')

        let mobile_trending_search = document
            .querySelector('.trending-searches')
            .cloneNode(true)
        mobile_trending_search.classList.add('trending-searches-mobile')
        document.body.appendChild(mobile_trending_search)

        document.addEventListener('input', function (e) {
            if (e.target.classList.contains('aa-Input')) {
                e.target.value.trim()
                    ? mobile_trending_search.classList.add('hide')
                    : mobile_trending_search.classList.remove('hide')
            }
        })

        document.addEventListener('click', function (e) {
            if (e.target.closest('.aa-ClearButton')) {
                mobile_trending_search.classList.remove('hide')
            }
        })

        function addHiddenLabel() {
            let labels = document.querySelectorAll('#autocomplete-0-label, #autocomplete-1-label');

            // Check if label exists and span is not already there
            labels.forEach((label) => {
                if (label && !label.querySelector(".visually-hidden")) {
                    let span = document.createElement("span");
                    span.className = "visually-hidden";
                    span.textContent = "Search"; // Accessible label text
                    label.prepend(span); // Insert at the beginning of the label
                }
            });
        }

        // Helper function to check if the label is available
        function checkLabelExistence() {
            let labels = document.querySelectorAll('#autocomplete-0-label, #autocomplete-1-label');
            labels.forEach((label) => {
                if (label) {
                    addHiddenLabel();
                } else {
                    // Retry after a short delay if label is not found
                    setTimeout(checkLabelExistence, 100);
                }
            });
        }

        // Run on page load
        document.addEventListener("DOMContentLoaded", function() {
            checkLabelExistence(); // Check if label exists on page load
        });

        // Run again when screen is resized and 768px or smaller
        window.addEventListener("resize", function () {
            if (window.innerWidth <= 768) {
                // After resizing, check if the label exists (because it's dynamically loaded)
                checkLabelExistence();
            }
        });

        function addFormLabel() {
            let input = document.querySelector('.ais-SearchBox-input');

            // Check if input exists and label is not already there
            if (input && !input.querySelector(".visually-hidden")) {
                let span = document.createElement("label");
                span.className = "visually-hidden";
                span.setAttribute("for", "productsearch");
                span.textContent = "Search"; // Accessible input text
                input.setAttribute("id", "productsearch"); // Add id to input
                input.parentElement.prepend(span); // Insert before the input
            }
        }

        // Helper function to check if the input is available
        function checkFormLabelExistence() {
            let input = document.querySelector('.ais-SearchBox-input');
            if (input) {
                addFormLabel();
            } else {
                // Retry after a short delay if input is not found
                setTimeout(checkFormLabelExistence, 100);
            }
        }

        // Run on page load
        document.addEventListener("DOMContentLoaded", function() {
            checkFormLabelExistence(); // Check if label exists on page load
        });

        // Run again when screen is resized and 768px or smaller
        window.addEventListener("resize", function () {
            if (window.innerWidth <= 768) {
                // After resizing, check if the label exists (because it's dynamically loaded)
                checkFormLabelExistence();
            }
        });

        searchTrigger.forEach(function (trigger) {
            trigger.addEventListener('click', function (e) {
                // Open on mobile
                if (trigger.classList.contains('mobile-trigger-search')) {
                    document
                        .querySelector('.aa-MainContainer button')
                        .dispatchEvent(new Event('click'))

                    // Focus on input
                    let inputElement = document.getElementById('autocomplete-0-input');

                    if (inputElement) {
                        inputElement.focus();
                    }
                    // Open on desktop
                } else {
                    console.log('open search')
                    searchWrapper?.classList.remove('!hidden')
                    searchInput.focus()

                    // Focus on input
                    let inputElement = document.getElementById('autocomplete-0-input');

                    if (inputElement) {
                        inputElement.focus();
                    }

                }
            })
        })

        searchInput.addEventListener('keyup', function (e) {
            e.target.value.length
                ? searchResults?.classList.remove('!hidden')
                : searchResults?.classList.add('!hidden')
        })

        // close search
        document.addEventListener('click', function (e) {
            if (
                e.target.classList.contains('close-search') ||
                e.target.classList.contains('search-wrapper')
            ) {
                searchWrapper?.classList.add('!hidden')
                searchResults?.classList.add('!hidden')
                searchInput.value = ''
            }
        })
    }


    countrySelector() {
        setTimeout(() => {
            if(document.getElementById('md-footer-selector__form__id')) {
                document.querySelector('.custom-orbe').addEventListener('click', function() {
                    document.getElementById('md-form__select__country--footer').click()
                })

                document.querySelector(".custom-orbe-wrap").addEventListener('click', function() {
                    if(document.getElementById('md-form__select__country--footer').getAttribute('aria-expanded') === 'true') {
                        document.querySelector('.custom-orbe-arrow').classList.add('active')
                    } else {
                        document.querySelector('.custom-orbe-arrow').classList.remove('active')
                    }
                })

                if(window.innerWidth < 1110) {
                    const selector = document.querySelector(".custom-orbe-wrap");
                    const mobileMenu = document.querySelector(".mobile-menu_header-wrap");

                    if(selector) {
                        // mobileMenu.prepend(selector);
                        //selector.classList.remove('hidden')
                    }
                }

                //document.querySelector('.custom-orbe-wrap').classList.remove('hidden')
            }
        }, 100);
    }
}

if (!customElements.get('main-header')) customElements.define('main-header', Header);


// --------------------------------------------------------
// Accordion (for mobile menu footer)
// --------------------------------------------------------
class Accordion extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        let links = document.querySelectorAll('.accordion-title');
        links.forEach(function(link) {
            link.addEventListener('click', function() {
                link.classList.toggle('active');
                link.closest('div').querySelector('ul').classList.toggle('hidden');
            });
        });
    }
}

if (!customElements.get('accordion-block')) {
    customElements.define('accordion-block', Accordion);
}
