import $ from "jquery";

class BundlePage extends HTMLElement {
	constructor() {
        super()
        this.accessToken = 'e4285229c9b8efd6e170205fb5472019'
        this.graphUrl = 'https://animalpak-uk.myshopify.com/api/2022-10/graphql.json'
        this.numProducts = 10
        this.cursor = null
        this.hasNextPage = false
        this.collection = $(this).find('.collection-tab.active').data('handle')
        this.grid = $(this).find('#products-grid')
        this.selectedProducts = []
        this.selectedProductsQty = 0
        this.bundleKeys = []
        this.subscription = true
        this.originalPrice = '$0.00'
        this.subscriptionPrice = '$0.00'
	}
	
	connectedCallback() {
        this.fetchProducts() 
        this.pagination()
        this.changeCollection()
        this.selectProduct()
        this.adjustQauntity()
        this.changePurchaseOption()
        this.submitBundle()

        $('.bundle-cart__header').on('click', function() {
            $(this).toggleClass('active')
            $('.bundle-cart').toggleClass('active')
        })


        // check bundle items in cart
        let self = this

        $.ajax({
            type: 'GET',
            url: '/cart.js',
            dataType: 'json',
            success: function (cart) {
                let items = cart.items.filter(item => item.properties?.bundleData)
                // items = items.sort((a,b) => a.properties.bundleIndex - b.properties.bundleIndex)
                if(items.length) {
                    self.bundleKeys = []
                    self.selectedProducts = []
                    self.selectedProductsQty = 0

                    items.forEach(function(item) {
                        self.bundleKeys.push(item.key)

                        if(self.selectedProductsQty < 4) {
                            self.selectedProductsQty += item.quantity
                        } else {
                            self.selectedProductsQty = 4
                        }

                        let itemObj = JSON.parse(item.properties.bundleData)
                        self.selectedProducts.push(itemObj)
                    })

                    self.fetchProducts()
                    return
                }
               
                // // get state from session storage
                // let bundleStorage = JSON.parse(sessionStorage.getItem('bundle'))
                // if(bundleStorage?.length) {
                //     self.selectedProducts = bundleStorage
                //     self.fetchProducts()
                // }
            },
        });
    }

    productQuery () { 
        let arg = this.cursor ? `first: ${this.numProducts} after: "${this.cursor}"` : `first: ${this.numProducts}`
        return (
            `query {
                collectionByHandle(handle: "${this.collection}") {
                    products(${arg}) {
                        edges {
                            cursor
                            node{
                                handle
                                title
                                id
                                metafield(key:"subtitle" namespace:"custom") {
                                    value
                                }
                                featuredImage {
                                    url
                                }
                            }
                        }
                        pageInfo {
                            hasNextPage
                        }
                    }
                }
            }`
        )
    }

    renderGrid (products) {
        const self = this
        this.cursor = `${products[products.length - 1]?.cursor}`
        products.forEach(function(product) {
            if(!product.node.handle.includes('stack')) {
                self.grid.append(self.renderTemplate(product))
            }
            
        })
    }

    renderTemplate (product) {
        let self = this

        let item = product.node
        let btnText = $(window).width() > 1024 ? 'add to bundle' : 'add'
        $.get(`https://api-cdn.yotpo.com/v1/widget/N5IazRa6pWNEh0w8i5y8s9cPJ1TKxVu9yoaZ5uyT/products/${self.decodeId(item.id)}/reviews.json`, function(data, status){
            let score = data.response.bottomline.average_score
            let totalReview = data.response.bottomline.total_review

            let html = `<div class="yotpo flex items-center"><div class="yotpo-bottomline">`

            let stars = score > 4.8 ? 5 : 4
            for (let i = 0; i < stars; i++) {
                html += `<span class="yotpo-icon yotpo-icon-star rating-star pull-left"></span>`
            }
            if(stars == 4) {
                html += `<span class="yotpo-icon yotpo-icon-half-star rating-star pull-left"></span>`
            }
            html += `</div><span class="hidden lg:block">${totalReview} Reviews</span></div>`
            if(+totalReview > 0) {
                setTimeout(function() {
                    $(`.bundle-product__reviews[data-handle="${item.handle}"]`).append(html)
                })
            }
           
            
        });
        return (
            `<div class="bundle-product relative mb-8" data-handle="${item.handle}">
                <span class="absolute bundle-product__check !hidden">
                    <svg class="pointer-events-none" width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.3337 2L5.00033 9.33333L1.66699 6" stroke="#212121" stroke-width="2" stroke-linecap="square"/>
                    </svg>
                </span>
                <img src="${item.featuredImage?.url}" class="bundle-product__trigger" alt="${item.title}" />
                <div class="block bundle-product__title bundle-product__trigger font-compacta uppercase text-primary font-bold mt-2">${item.title}</div>
                <div class="bundle-product__reviews flex justify-center text-[14px]" data-handle="${item.handle}"></div>
                <div class="bundle-product__type font-sans font-light">${item.metafield?.value}</div>
                <button class="bundle-product__btn bundle-product__trigger w-full bg-white font-sans font-bold" data-handle="${item.handle}">${btnText}</button>
                <div class="quantity !hidden">
                    <button class="quantity__button bundle-product__quantity bundle-product__quantity-remove no-js-hidden" name="minus" type="button">-</button>
                    <label for="quantity-${item.handle}" class="sr-only">Qty</label>
                    <input class="quantity__input" disabled type="number" name="quantity" id="quantity-${item.handle}" min="1" value="1">
                    <button class="quantity__button bundle-product__quantity bundle-product__trigger no-js-hidden" name="plus" type="button">+</button>
                </div>
            </div>`
        )
    }

    fetchProducts () {
        fetch(this.graphUrl, {
            'async': true,
            'crossDomain': true,
            'method': 'POST',
            'headers': {
                'X-Shopify-Storefront-Access-Token': this.accessToken,
                'Content-Type': 'application/graphql',
            },
            'body': this.productQuery()
            
        }).then(res => res.json())
        .then(res => {
            let response = res.data.collectionByHandle.products

            this.renderGrid(response.edges)
            this.hasNextPage = response.pageInfo.hasNextPage
            this.grid.removeClass('loading')
            this.renderBundleCart()
        })
    }

    changeCollection () {
        const self = this

        $('.collection-tab').on('click', function () {

            $('.collection-tab').removeClass('active')
            $(this).addClass('active')

            self.collection = $(this).data('handle')
            self.cursor = null
            self.hasNextPage = false
            self.grid.empty()
            self.fetchProducts()
        })

        $('.collection-select').on('change', function() {
            self.collection = $('.collection-select .collection-tab:selected').data('handle')
            self.cursor = null
            self.hasNextPage = false
            self.grid.empty()
            self.fetchProducts()
        })
    }

    pagination () {
        const self = this

        $(window).on('scroll', function() {
            if(self.hasNextPage) {
                let pos = self.grid.offset().top + self.grid.height() - $(window).scrollTop()

                if (pos <= 1150) {
                    self.hasNextPage = false
                    self.grid.addClass('loading')
                    self.fetchProducts()
                }
            }
        })
    }

    selectedProductQuery (handle) {
        return (
            `query {
                product(handle: "${handle}") {
                    handle
                    title
                    productType
                    id
                    metafield_0: metafield(key:"short_description_extra" namespace:"custom") {
                        value
                    }
                    metafield_1: metafield(key:"subtitle" namespace:"custom") {
                        value
                    }
                    featuredImage {
                        url
                    }
                    sellingPlanGroups(first: 10) {
                        edges {
                            node {
                                sellingPlans(first: 10) {
                                    edges {
                                        node {
                                            id
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                    variants(first: 100) {
                        edges {
                            node {
                                id
                                price{
                                    amount
                                }
                                title
                                availableForSale
                                quantityAvailable
                            }
                        }
                    }
                    options {
                        name
                        values
                    }
                }
            }`
        )
    }

    selectedProductDrawer (product) {
        
        let html = 
            `<div class="selected_product__drawer">
                <div class="selected_product__drawer-inner bg-white relative">
                <div class="close-product__drawer selected_product__drawer-mobile"></div>
                <div class="bg-white relative selected_product__drawer-mobile-inner">
                <div class="absolute close-product__drawer cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none" aria-hidden="true" focusable="false" role="presentation" class="icon icon-close" fill="none" viewBox="0 0 18 17" style="width: 20px;">
                        <path d="M.865 15.978a.5.5 0 00.707.707l7.433-7.431 7.579 7.282a.501.501 0 00.846-.37.5.5 0 00-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 10-.707-.708L8.991 7.853 1.413.573a.5.5 0 10-.693.72l7.563 7.268-7.418 7.417z" fill="black"></path>
                    </svg>
                </div>
                <div class="lg:flex items-center">
                    <a href="/products/${product.handle}">
                        <img src="${product.featuredImage?.url}" class="selected_product__img object-contain" /> 
                    </a>
                    <div>
                        <a href="/products/${product.handle}" class="block selected_product__title font-compacta upperase text-primary font-bold">${product.title}</a>
                        <div class="selected_product__type mt-1 font-sans text-primary">${product.metafield_1?.value}</div>
                        <div class="selected_product__reviews mt-1 font-sans text-primary"></div>
                    </div>
                </div>
                <div class="selected_product-bullet-points">
                ${product.metafield_0?.value}
                </div>
                <div class="lg:flex lg:space-x-4 mt-6 mb-[18px]">`

                product.options.forEach(function(option) {
                    if(option.name !== 'Title') {
                        html += 
                        `<div class="product-form__input product-form__input--dropdown w-full lg:w-6/12">
                            <div class="product-select">
                                <select name="options-${option.name}"
                                    class="select__select text-[13.9px] mt-2 lg:mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-0  h-[56px] border border-solid border-[#DBDBDB]">`
                                    if(option.values.length > 1) {
                                        html += `<option value="" selected disabled hidden>Choose ${option.name}</option>`
                                    }
                                    
                                    option.values.forEach(function(value) {
                                        html += `<option value="${value}">${value}</option>`
                                    })
                              
                        html += 
                                `</select>
                            </div>
                            
                        </div>`
                    }
                   
                })

            html += 
                `</div>
                <div class="flex mt-4">
                    <quantity-input class="quantity">
                        <button class="quantity__button drawer-quantity__button no-js-hidden" name="minus" type="button">-</button>
                        <input class="quantity__input drawer-quantity__input" disabled type="number" name="quantity" id="quantity-${product.handle}" min="1" value="1">
                        <button class="quantity__button drawer-quantity__button no-js-hidden" name="plus" type="button">+</button>
                    </quantity-input>
                    <button class="block bundle-form__submit tracking-[1px] w-full border border-solid border-yellow hover:bg-white hover:border-primary transition duration-500 bg-yellow uppercase w-full text-center py-[18px] transition duration-500 text-primary text-[13.9px] font-sans font-bold leading-[18.07px] ${product.variants.edges.length > 1 && 'disabled'}">${product.variants.edges.length > 1 ? 'make selection' : 'add to bundle'}</button>
                </div>
                </div>
                </div>
            </div>`

        return html
    }
    
    decodeId (id) {
        // const decoded = atob(id)
        const shopifyId = id.split("/").pop()
        return parseInt(shopifyId)
    }

    selectProduct () {
        const self = this

        $(document).on('click', function(e) {
            if($(e.target).hasClass('bundle-product__trigger') && self.selectedProductsQty < 4) {
                let handle = $(e.target).closest('.bundle-product').data('handle')
                
                fetch(self.graphUrl, {
                    'async': true,
                    'crossDomain': true,
                    'method': 'POST',
                    'headers': {
                        'X-Shopify-Storefront-Access-Token': self.accessToken,
                        'Content-Type': 'application/graphql',
                    },
                    'body': self.selectedProductQuery(handle)
                    
                }).then(res => res.json())
                .then(res => {
                    let product = res.data.product
                    let variants = product.variants.edges

                    $('body').append(self.selectedProductDrawer(product))
                    setTimeout(() => {
                        $('.selected_product__drawer-inner').addClass('active')
                    });

                     $.get(`https://api-cdn.yotpo.com/v1/widget/N5IazRa6pWNEh0w8i5y8s9cPJ1TKxVu9yoaZ5uyT/products/${self.decodeId(product.id)}/reviews.json`, function(data, status){
                        let score = data.response.bottomline.average_score
                        let totalReview = data.response.bottomline.total_review

                        let html = `<div class="yotpo flex items-center"><div class="yotpo-bottomline">`

                        let stars = score > 4.8 ? 5 : 4
                        for (let i = 0; i < stars; i++) {
                            html += `<span class="yotpo-icon yotpo-icon-star rating-star pull-left"></span>`
                        }
                        if(stars == 4) {
                            html += `<span class="yotpo-icon yotpo-icon-half-star rating-star pull-left"></span>`
                        }
                        html += `</div><span class="hidden lg:block">${totalReview} Reviews</span></div>`

                        if(+totalReview > 0) {
                            $('.selected_product__reviews').append(html)
                        }
                    });
    
                    let selectedvariant = variants.filter(variant => variant.node.availableForSale)[0]?.node
                    if(!selectedvariant) {
                        $('.bundle-form__submit').text('sold out')
                    }
                    let maxValue = 4 - self.selectedProductsQty
                    $('.drawer-quantity__input').prop('max', maxValue)
                    
                    $('.drawer-quantity__input').on('change', function () {
                        if($(this).val() > maxValue) {
                            $(this).val(maxValue)
                        }
                    })

                    $('.product-select select').on('change', function() {
                        let options = variants

                        if($('.product-select option[value=""]:selected').length) {
                            return
                        }
                        
                        $('.product-select select').each(function(i) {
                            let option = $(this).find('option:selected').val()
                            options = options.filter(variant => variant.node.title.split('/')[i].trim() == option)
                            selectedvariant = options[0]?.node
                        })
                        
                        $('.bundle-form__submit').removeClass('disabled')

                        if(!selectedvariant?.availableForSale) {
                            $('.bundle-form__submit').addClass('disabled')
                            $('.bundle-form__submit').text('sold out')
                            return
                        }

                        $('.bundle-form__submit').removeClass('disabled')
                        $('.bundle-form__submit').text('add to bundle')
                        $('.drawer-quantity__input').prop('max', maxValue)

                        $('.drawer-quantity__input').on('change', function () {
                            if($(this).val() > maxValue) {
                                $(this).val(maxValue)
                            }
                        })

                    }) 

                    $('.bundle-form__submit').on('click', function() {
                        selectedvariant.handle = product.handle
                        selectedvariant.id = self.decodeId(selectedvariant.id)
                        selectedvariant.sellingPlans = product.sellingPlanGroups?.edges[0]?.node?.sellingPlans?.edges || null
                        selectedvariant.img = product.featuredImage?.url || null
                        selectedvariant.selectedQuantity = +($(this).closest('.selected_product__drawer').find('.quantity__input').val())
                        
                        if(self.selectedProductsQty < 4) {
                            if((self.selectedProducts.filter(item => item.id == selectedvariant.id)).length) {
                                let index = self.selectedProducts.findIndex((obj => obj.id == selectedvariant.id))
                                self.selectedProducts[index].selectedQuantity += selectedvariant.selectedQuantity
                            } else {
                                self.selectedProducts.push(selectedvariant)
                            }
                        }
                
                        self.selectedProductsQty += selectedvariant.selectedQuantity
                        self.renderBundleCart()
                        removeDrawer()
                    })


                    // remove drawer
                    function removeDrawer () {
                        $('.selected_product__drawer-inner').removeClass('active')
                        setTimeout(() => {
                            $('.selected_product__drawer').remove()
                        }, 300);
                    }

                    document.addEventListener('click', function(e) {
                        if(e.target.classList.contains('selected_product__drawer') || e.target.classList.contains('close-product__drawer')) {
                            removeDrawer()
                        }
                    })
                })
            }
        })
    }
    adjustQauntity () {
        const self = this

        $(document).on('click', function(e) {

            // change quantity
            // if($(e.target).hasClass('bundle-product__quantity')) {
            //     let parent = $(e.target).closest('.bundle-product')
            //     let handle = parent.data('handle')
            //     let quantity = parent.find('.quantity__input').val()
            //     let item = self.selectedProducts.findIndex((obj => obj.handle == handle))
            //     self.selectedProducts[item].selectedQuantity = +quantity
            //     self.renderBundleCart()
            // }

            if($(e.target).hasClass('bundle-product__quantity-remove')) {
                let parent = $(e.target).closest('.bundle-product')
                let handle = parent.data('handle')

                self.selectedProducts.forEach(function(item) {
                    if(item.handle == handle) {
                        self.selectedProductsQty -= item.selectedQuantity
                    }
                })
                
                let updateSelectedProducts = self.selectedProducts.filter(item => item.handle !== handle)
                self.selectedProducts = updateSelectedProducts
                self.renderBundleCart()
            }
    
            // remove item
            if($(e.target).hasClass('bundle-cart__remove')) {
                let handle = $(e.target).data('handle')
                let index = self.selectedProducts.findIndex((obj => obj.handle + obj.id == handle))
  
                self.selectedProducts[index].selectedQuantity -= 1
                self.selectedProductsQty -= 1
                 
                if(self.selectedProducts[index].selectedQuantity <= 0) {
                    let updateSelectedProducts = self.selectedProducts.filter(item => item.handle + item.id !== handle)
                    self.selectedProducts = updateSelectedProducts
                }
               
                self.renderBundleCart()
            }
        })
    }

    changePurchaseOption () {
        const self = this

        $('input[type=radio][name=purchase]').on('change', function() {
            self.subscription = $(this).val() == 'subscribe'
            self.renderBundleCart()

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

    renderBundleCart () {
        this.clear()
        let self = this
        let products = this.selectedProducts
        let originalPrice = 0
        let totalPrice = 0
        let subsPrice = 0
        let counter = 0
   
        products.forEach(function(product, i) {
            let price = product.price.amount * product.selectedQuantity
            let subsDiscountedPrice = +(price - (price * 0.10))
            subsDiscountedPrice = Math.ceil(subsDiscountedPrice * 100) / 100
            originalPrice += price
            if(self.selectedProductsQty == 1) {
                totalPrice = +(price)
                subsPrice = subsDiscountedPrice
            }
            if(self.selectedProductsQty == 2) {
                totalPrice += +(price - (price * 0.1))
                subsPrice += +(subsDiscountedPrice - (subsDiscountedPrice * 0.05))
            }
            if(self.selectedProductsQty == 3) {
                totalPrice += +(price - (price * 0.15))
                subsPrice += +(subsDiscountedPrice - (subsDiscountedPrice * 0.10))
            }
            if(self.selectedProductsQty >= 4) {
                totalPrice += +(price - (price * 0.2))
                subsPrice += +(subsDiscountedPrice - (subsDiscountedPrice * 0.15))
            }

            // totalPrice += i == 0 ? +(price) : +(price - (price * (i * 0.1)))

            let parent = $(`.bundle-product[data-handle="${product.handle}"]`)
            parent.find('.bundle-product__btn').addClass('!hidden')
            parent.find('.quantity').removeClass('!hidden')

            let productQty = 0
            products.forEach(function(item) {
                if(item.handle == product.handle) {
                    parent.find('.quantity__input').val(productQty += item.selectedQuantity)
                }
            })
            parent.find('.quantity__input').prop('max', product.quantityAvailable)
            parent.find('.bundle-product__check').removeClass('!hidden')

            // bundle cart
            for (let i = counter; i < counter + product.selectedQuantity; i++) {
                $(`.bundle-item__placeholder[data-index="${i}"]`).addClass('!hidden')
                $(`.bundle-item__selected[data-index="${i}"]`).attr("src", product.img)
                $(`.bundle-item__selected[data-index="${i}"]`).removeClass('!hidden')
                $(`.bundle-cart__remove[data-index="${i}"]`).removeClass('!hidden')
                $(`.bundle-cart__remove[data-index="${i}"]`).attr('data-handle', product.handle + product.id) 
            }
            
            counter += product.selectedQuantity
        })

        this.selectedProductsQty >= 4 && $('.bundle-product__btn').addClass('disabled')

        // products amount
        this.selectedProductsQty == 1 ? $('.bundle-cart__amount').text(this.selectedProductsQty + ' product added') : $('.bundle-cart__amount').text(this.selectedProductsQty + ' products added')
        
        if( this.selectedProductsQty <= 0) {
            $('.bundle-cart__amount').text('0 products added')
        }
        // cart price
        this.originalPrice = totalPrice.toLocaleString("en-US", {style:"currency", currency:"USD"})

        subsPrice = Math.ceil(subsPrice * 100) / 100
        this.subscriptionPrice = subsPrice.toLocaleString("en-US", {style:"currency", currency:"USD"})
        
        this.subscription ? $('.bundle-cart__price').text(this.subscriptionPrice) : $('.bundle-cart__price').text(this.originalPrice)
        $('.one-time-price').text(this.originalPrice)
        $('.subscribe-price').text(this.subscriptionPrice)
        $('.original-price').text(originalPrice.toLocaleString("en-US", {style:"currency", currency:"USD"}))
        
        // submit bundle button
        this.selectedProductsQty == 0 ? $('.bundle__submit').text('add products') : this.selectedProductsQty == 1 ? $('.bundle__submit').text('add 1 more product') : $('.bundle__submit').text('add bundle to cart')
        this.selectedProductsQty >= 2 ? $('.bundle__submit').removeClass('disabled') : $('.bundle__submit').addClass('disabled')

        // discount applied text
        $('.discount-applied').text(this.selectedProductsQty == 2 ? '10% discount applied' : this.selectedProductsQty == 3 ? '15% discount applied' : this.selectedProductsQty >= 4 ? '20% discount applied' : '')
        if(this.subscription) {
            $('.discount-applied').text(this.selectedProductsQty == 0 ? '' : this.selectedProductsQty == 1 ? '10% discount applied' : this.selectedProductsQty == 2 ? '15% discount applied' : this.selectedProductsQty == 3 ? '20% discount applied' : '25% discount applied')
        }

        // save to sessionStorage
        sessionStorage.setItem('bundle', JSON.stringify(this.selectedProducts))
    }

    clear () {
        $('.bundle-item__placeholder').removeClass('!hidden')
        $('.bundle-item__selected').addClass('!hidden')
        $('.bundle-product__check').addClass('!hidden')
        $(this).find('.quantity').addClass('!hidden')
        $('.bundle-product__btn').removeClass('!hidden')
        $('.bundle-cart__remove').addClass('!hidden')
        $('.bundle-cart__remove').removeData( "handle" )
        $('.bundle-product__btn').removeClass('disabled')
    }

    submitBundle () {
        const self = this
        
        $('.bundle__submit').on('click', function() {
            let time = (new Date()).getTime()
            let data = []
            let subscriptionName = $('.subscription-option:selected').data('name') || $('.subscription-option').eq(0).data('name')

            self.selectedProducts.forEach(function(item, i) {
                let obj = {
                    id: item.id,
                    quantity: item.selectedQuantity,
                    properties: {
                        isBundleProduct: true,
                        bundleId: time,
                        bundleIndex: i,
                        bundleData: JSON.stringify(item)
                    }
                }

                if (self.subscription) {
                    obj.selling_plan = self.decodeId(item.sellingPlans.filter(item => item.node.name == subscriptionName)[0].node.id)
                    obj.properties.subscription = true
                }

                data.push(obj)
            })

            let formData = {
                'items': data
            };
         
            function cartAdd() {
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
            }
            if(self.bundleKeys.length) {
                self.bundleKeys.forEach(function(key, i) {                 
                    if (i == 0) {
                        data = `updates[${key}]=0`
                    } else {
                        data += `&updates[${key}]=0`
                    }
                })
            
                
                $.post('/cart/update.js', data)
                    .done( function() { 
                        cartAdd()
                    })
                return
            }

            cartAdd()
        })
    }
}
customElements.define('bundle-page', BundlePage);