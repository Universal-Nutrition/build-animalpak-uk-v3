document.addEventListener('alpine:init', () => {
    Alpine.data('addToCart', (selectedVariantId) => ({
        selectedVariantId: selectedVariantId,
        selectedVariant: {},
        productObject: {},
        price: 0,
        description: '',
        image: '',
        sideCart: document.querySelector('side-cart'),

        init() {
            const raw = this.$refs.productObject.textContent.trim();
            this.productObject = JSON.parse(raw);
            this.selectedVariant = this.productObject.variants[String(this.selectedVariantId)];
            this.updateUi();
        },

        changeVariant() {
            this.selectedVariantId = this.$refs.variant.value;
            this.selectedVariant = this.productObject.variants[String(this.selectedVariantId)];
            this.updateUi();
        },

        updateUi() {
            this.price = this.selectedVariant?.price;
            this.description = this.selectedVariant?.description;
            this.image = this.selectedVariant?.image || this.productObject.featured_image;
        },

        addToCart(event) {
            event.preventDefault();

            const formData = {
                items: [
                    {
                        id: this.selectedVariantId,
                        quantity: 1,
                    },
                ],
            };

            fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(() => {
                this.sideCart.renderCart();
                this.sideCart.openCart();
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
    }));
});
