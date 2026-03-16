class Footer extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        let links = document.querySelectorAll('.footer-link-title')
        links.forEach(function(link) {
            link.addEventListener('click', function() {
                link.classList.toggle('active')
                link.closest('div').querySelector('ul').classList.toggle('hidden')
            })
        })
    }
}
if (!customElements.get('footer-block')) customElements.define('footer-block', Footer);