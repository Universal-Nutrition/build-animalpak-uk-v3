import $ from 'jquery'

class StackProducts extends HTMLElement {
    constructor() {
        super();
        this.shellId = $(this).data('shell-id')
        this.selectedProductsId = []
        this.productsQuantity = $(this).data('products-quantity')
        this.subscription = true
        this.originalPrice = 0 
        this.price = 0
        this.subsPrice = 0
        this.sellingPlanDiscount = $('.subscription-option').eq(0).data('discount')
    }
    connectedCallback() {
        const self = this
        this.selectProducts()
        this.changePurchaseOption()

        $('.stack-product-select').on('change', function () {
            self.selectProducts()
        })
    }
    selectProducts () {
        const self = this
        let price, subsDiscountedPrice

        self.originalPrice = 0
        self.price = 0
        self.subsPrice = 0
        self.selectedProductsId = []

        $('.stack-single-variant').each(function() {
            self.selectedProductsId.push({
                productId: $(this).data('product-id'),
                id: $(this).data('id')
            })

            price = +($(this).data('price'))
            self.originalPrice += price
            subsDiscountedPrice = +(price - (price * 0.10))

            if(self.productsQuantity == 2) {
                self.price += +(price - (price * 0.1))
                self.subsPrice += +(subsDiscountedPrice - (subsDiscountedPrice * 0.05))
            }
            if(self.productsQuantity >= 3) {
                self.price += +(price - (price * 0.15))
                self.subsPrice += +(subsDiscountedPrice - (subsDiscountedPrice * 0.1))
            }

        })

        $('.stack-product-select').each(function() {
            if($(this).find('option:selected').val()) {
                self.selectedProductsId.push({
                    productId: $(this).find('option:selected').data('product-id'),
                    id: $(this).find('option:selected').val()
                })

                price = +($(this).find('option:selected').data('price'))
                self.originalPrice += price
                subsDiscountedPrice = +(price - (price * 0.10))

                if(self.productsQuantity == 2) {
                    self.price += +(price - (price * 0.1))
                    self.subsPrice += +(subsDiscountedPrice - (subsDiscountedPrice * 0.05))
                }
                if(self.productsQuantity >= 3) {
                    self.price += +(price - (price * 0.15))
                    self.subsPrice += +(subsDiscountedPrice - (subsDiscountedPrice * 0.1))
                }
            }
        })

        if(self.selectedProductsId.length == self.productsQuantity) {
            self.submitStack()
        } 

        $('.original-price').text(self.formatMoney(self.originalPrice))
        $('.one-time-price').text(self.formatMoney(self.price))
        $('.subscribe-price').text(self.formatMoney(self.subsPrice))
    }

    formatMoney (price) {
        return ((price) / 100).toLocaleString("en-US", {style:"currency", currency:"USD"})
    }

    changePurchaseOption () {
        const self = this

        $('input[type=radio][name=purchase]').on('change', function() {
            self.subscription = $(this).val() == 'subscribe'

            $('input[type=radio][name=purchase]').closest('.subscription').toggleClass('active')
            if(self.subscription) {
                $('.subscription-wrapper').addClass('active')
                $('.one-time-discount').addClass('!hidden')
                $('.subs-discount').removeClass('!hidden')
            } else {
                $('.subscription-wrapper').removeClass('active')
                $('.one-time-discount').removeClass('!hidden')
                $('.subs-discount').addClass('!hidden')
            }
        })

    }

    submitStack () {
        const self = this

        $('.stack__submit').removeClass('disabled')
        $('.stack__submit').on('click', function() {
            let time = (new Date()).getTime()
            let data = []
            let subscriptionName = $('.subscription-option:selected').data('name') || $('.subscription-option').eq(0).data('name')
            let quantity = $(self).find('.quantity__input').val()


            let shell = {
                id: self.shellId,
                quantity: quantity,
                properties: {

                    isStackParent: true,
                    bundleId: time,
                    totalPrice: self.price,
                    originalPrice: self.originalPrice
                }
            }
            if (self.subscription) {
                shell.selling_plan = $('.subscription-select option:selected').data('id') || $('.subscription-option').eq(0).data('id')
                shell.properties.totalPrice = self.subsPrice 
                shell.properties.subscription = true
            }

            data.push(shell)

            self.selectedProductsId.forEach(function(item, i) {
                let obj = {
                    id: item.id,
                    quantity: quantity,
                    properties: {
                        isStackProduct: true,
                        isBundleProduct: true,
                        bundleId: time
                    }
                }

                if (self.subscription) {
                    obj.selling_plan = productsJson.filter(product => product.id == item.productId)[0].subs.filter(sub => sub.name == subscriptionName)[0].id
                    obj.properties.subscription = true
                }

                data.push(obj)
            })

            let formData = {
                'items': data
            };
         
            
            fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
              let sidecart = document.querySelector('side-cart');
              sidecart?.renderCart()
              sidecart?.openCart()
            })
            .catch((error) => {
                console.error('Error:', error);
            });
            
        })
    }
}
customElements.define('stack-products',  StackProducts);
