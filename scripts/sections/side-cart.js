import $ from "jquery";
import { Swiper } from "swiper";
import "swiper/css/bundle";
class SideCart extends HTMLElement {
  constructor() {
    super();
    this.accessToken = "e4285229c9b8efd6e170205fb5472019";
    this.graphUrl =
      "https://animalpak-uk.myshopify.com/api/2022-10/graphql.json";
    this.progress = $(this).find(".progress");
    this.totalPrice = $(this).find("#side-cart__total-price");
    this.totalAmount = $(this).find("#side-cart__amount");
    this.bundle = document.querySelector("bundle-page");
    this.renderCart();
    let self = this;

    this.recommendedProducts();

    $(".trigger-cart-open").on("click", function() {
      self.openCart();
    });
  }

  openCart() {
    $(".side-cart-wrap").removeClass("!hidden");

    $("body").addClass("cart-is-open");

    setTimeout(() => {
      $(".side-cart").addClass("active");
    });

    document.addEventListener("click", function(e) {
      if (
        e.target.classList.contains("side-cart-wrap") ||
        e.target.classList.contains("close-side-cart")
      ) {
        $(".side-cart").removeClass("active");
        $("body").removeClass("cart-is-open");

        setTimeout(() => {
          $(".side-cart-wrap").addClass("!hidden");
        }, 300);
      }
    });
  }

  itemTemplate(item, discount, cart) {
    let price = item.discounted_price;
    let originalPrice = null;
    if (item?.selling_plan_allocation?.compare_at_price) {
      originalPrice = item?.selling_plan_allocation?.compare_at_price;
    }
    if (item.price > price) {
      originalPrice = item.price;
    }
    if (item.price < item.original_price) {
      originalPrice = item.original_price;
    }

    if (item?.properties?.isStackParent) {
      price = item.properties.totalPrice;
      originalPrice = item.properties.originalPrice;
    }
    let html = `<div class="cart-item__wrap flex items-center mb-8 ${item.properties?.giftItem && "gift-item"
      }">
        <div class="cart-item__img relative flex justify-center items-center">
            <a href="${item.url}">
                <img src='${item.featured_image.url}' class="object-contain" />
            </a>
        </div>
        <div class="ml-4 lg:ml-8 w-full">
            <a href="${item.url
      }" class="block cart-item__title text-primary font-anton uppercase font-bold">${item.product_title
      }</a>
            <div class="${!item.handle.includes("stack") && "lg:flex"}">`;

    item.options_with_values.forEach(function(option) {
      html += `<div class="cart-item__option font-bebasNeue ${option.name == "Title" && "hidden"
        }">${option.name}: ${option.value}</div>`;
    });

    cart.items.forEach(function(stack) {
      if (
        stack.properties &&
        stack.properties?.bundleId == item.properties?.bundleId
      ) {
        if (
          item.properties?.isStackParent &&
          !stack.properties?.isStackParent
        ) {
          html += `<div class="cart-item__option">1 x ${stack.product_title}${stack.variant_title ? " - " + stack.variant_title : ""
            }</div>`;
        }
      }
    });

    html += `</div>`;

    if (item.properties?.giftItem) {
      if (
        window.giftProducts.filter(
          (product) => product.handle == item.handle
        )[0]?.variants?.length
      ) {
        let variants = window.giftProducts.filter(
          (product) => product.handle == item.handle
        )[0]?.variants;

        let hideOptions =
          variants?.length === 1 && variants[0].title === "Default Title"
            ? "hidden"
            : "";

        html += `<select class="cart-item__variants !ring-0 !outline-0 ${hideOptions}" data-key="${item.key}">`;
        variants?.forEach(function(variant) {
          html += `<option ${variant.id == item.id ? "selected" : ""
            } data-id="${variant.id}">${variant.title}</option>`;
        });

        html += `</select>`;
      }
    }

    if (item.selling_plan_allocation?.selling_plan?.options[0]?.value) {
      html += `<span class="cart-item__subscription text-primary font-semibold mt-1">Delivery frequency: <span class="font-light">${item.selling_plan_allocation?.selling_plan?.options[0]?.value}</span></span>`;
    }

    html += `<div class="text-primary mt-1 text-xs font-bebasNeue">SKU: ${item.sku || item.product_title
      }</div>
            <div class="cart-item__price mt-1 lg:mt-2 font-anton text-xl flex items-center text-primary">
            <span class="${!originalPrice && "hidden"
      } mr-1 line-through opacity-50">${this.formatMoney(
        originalPrice
      )}</span>
            ${item.properties?.giftItem ? "Free Gift" : this.formatMoney(price)
      }
            </div>`;
    if (!item.properties?.giftItem) {
      html += `<div class="hidden lg:flex quantity-js">
                    <quantity-input class="quantity cart-item__quantity rounded-none">
                        <button class="quantity__button cart-item__quantity-btn cart-item__adjust-qty no-js-hidden ${item.properties?.isStackParent && "stack-quantity"
        }" name="minus" type="button">-</button>
                        <input class="quantity__input" type="number" name="quantity" id="quantity-${item.key
        }" min="1" ${item.properties["Gift id"]
          ? `data-product-with-gift="${item.properties["Gift id"]}"`
          : ""
        } ${item.properties["Gift product"] ? "disabled" : ""
        } value="${item.quantity}">
                        <button class="quantity__button cart-item__quantity-btn cart-item__adjust-qty no-js-hidden ${item.properties?.isStackParent && "stack-quantity"
        }" ${item.properties["Gift product"] ? "disabled" : ""
        } name="plus" type="button">+</button>
                    </quantity-input>
                    <button type="button" ${item.properties["Gift product"] ? "disabled" : ""
        } id="remove-${item.key}" class="${item.properties?.isStackParent && "hidden"
        } ${item.properties["Gift product"]
          ? "pointer-events-none"
          : ""
        } cart-item__remove cart-item__adjust-qty flex justify-center items-center uppercase font-bold font-sans text-primary cursor-pointer">remove</button>
                    <button type="button" id="${item.properties?.bundleId
        }" class="${!item.properties?.isStackParent && "hidden"
        } stack-item__remove cart-item__adjust-qty flex justify-center items-center uppercase font-bold font-sans text-primary cursor-pointer">remove</button>
                    </div>`;
    }

    html += `</div>
    </div>`;
    if (!item.properties?.giftItem) {
      html += `<div class="flex lg:hidden pb-6 quantity-js">
                    <quantity-input class="quantity cart-item__quantity rounded-none">
                        <button class="quantity__button cart-item__quantity-btn cart-item__adjust-qty no-js-hidden ${item.properties?.isStackParent && "stack-quantity"
        }" name="minus" type="button">-</button>
                        <input class="quantity__input" type="number" name="quantity" id="quantity-${item.key
        }" ${item.properties["Gift id"]
          ? `data-product-with-gift="${item.properties["Gift id"]}"`
          : ""
        } ${item.properties["Gift product"] ? "disabled" : ""
        } min="1" value="${item.quantity}">
                        <button class="quantity__button cart-item__quantity-btn cart-item__adjust-qty no-js-hidden ${item.properties?.isStackParent && "stack-quantity"
        }" ${item.properties["Gift product"] ? "disabled" : ""
        } name="plus" type="button">+</button>
                    </quantity-input>
                    <button type="button" id="remove-${item.key}" ${item.properties["Gift product"] ? "disabled" : ""
        } class="${item.properties?.isStackParent && "hidden"} ${item.properties["Gift product"]
          ? "pointer-events-none"
          : ""
        } cart-item__adjust-qty cart-item__remove flex justify-center items-center uppercase font-bold font-sans text-primary cursor-pointer">remove</button>
                    <button type="button" id="${item.properties?.bundleId
        }" class="${!item.properties?.isStackParent && "hidden"
        } stack-item__remove flex justify-center items-center uppercase font-bold font-sans text-primary cursor-pointer">remove</button>
                </div>`;
    }
    return html;
  }

  changeVariant() {
    const self = this;

    document
      .querySelectorAll(".cart-item__variants")
      .forEach(function(select) {
        select.addEventListener("change", function() {
          let id = this.options[this.selectedIndex].dataset.id;
          let key = this.dataset.key;

          $.post("/cart/update.js", `updates[${key}]=0`).done(function() {
            let formData = {
              items: [
                {
                  id,
                  quantity: 1,
                  properties: {
                    giftItem: true,
                  },
                },
              ],
            };

            fetch(window.Shopify.routes.root + "cart/add.js", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            })
              .then((response) => {
                self.renderCart();
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          });
        });
      });
  }

  renderCart() {
    let self = this;

    $.ajax({
      type: "GET",
      url: "/cart.js",
      dataType: "json",
      success: function(cart) {
        let bundleWidget = self.cartWidget(cart);

        if (bundleWidget === false) {
          return;
        }

        self.giftProducts(cart);

        let bundleItems = cart.items.filter(
          (item) =>
            item?.properties?.isBundleProduct && !item?.selling_plan_allocation
        );
        let subsBundleItems = cart.items.filter(
          (item) =>
            item?.properties?.isBundleProduct && item?.selling_plan_allocation
        );
        let discount,
          oneTimeCount = 0,
          subsCount = 0;

        bundleItems.forEach(function(item) {
          oneTimeCount += item.quantity;
        });
        subsBundleItems.forEach(function(item) {
          subsCount += item.quantity;
        });

        $(".cart-items").empty();
        cart.items.forEach(function(item) {
          if (
            item?.properties?.isBundleProduct &&
            !item?.selling_plan_allocation
          ) {
            discount =
              oneTimeCount == 2
                ? 10
                : oneTimeCount == 3
                  ? 15
                  : oneTimeCount >= 4
                    ? 20
                    : null;
          }
          if (
            item?.properties?.isBundleProduct &&
            item?.selling_plan_allocation
          ) {
            discount =
              subsCount == 2
                ? 5
                : subsCount == 3
                  ? 10
                  : subsCount >= 4
                    ? 15
                    : null;
          }
          if (!item.properties?.isStackProduct && !item.properties?.giftItem) {
            $(".cart-items").append(self.itemTemplate(item, discount, cart));
          }
        });
        let giftItems = cart.items.filter((item) => item.properties?.giftItem);

        giftItems.sort(function(a, b) {
          let titleA = a.title.toLowerCase();
          let titleB = b.title.toLowerCase();
          return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
        });

        giftItems.forEach(function(item) {
          $(".cart-items").append(self.itemTemplate(item, null, cart));
        });

        self.changeVariant();

        // free shipping progress bar
        if (document.querySelector("#bfcm_prices").value == "true") {
          self.freeShipping(
            cart.total_price,
            cart.items.filter((item) => item?.selling_plan_allocation).length
          );

          $(".cart__subs-shipping").addClass("hidden");
          $(".cart__free-shipping").removeClass("hidden");
          $(".progress-wrap").removeClass("hidden");
        } else {
          self.freeShipping(cart.total_price);

          if (
            cart.items.filter((item) => item?.selling_plan_allocation).length
          ) {
            $(".cart__subs-shipping").removeClass("hidden");
            $(".cart__free-shipping").addClass("hidden");
            $(".progress-wrap").addClass("hidden");
          } else {
            $(".cart__subs-shipping").addClass("hidden");
            $(".cart__free-shipping").removeClass("hidden");
            $(".progress-wrap").removeClass("hidden");
          }
        }

        // cart total price
        let totalPrice = 0;
        cart.items.forEach(function(item) {
          let price = item.price;
          if (
            item?.properties?.isBundleProduct &&
            !item?.selling_plan_allocation
          ) {
            discount =
              oneTimeCount == 2
                ? 10
                : oneTimeCount == 3
                  ? 15
                  : oneTimeCount >= 4
                    ? 20
                    : null;
            price = item.price - (discount * item.price) / 100;
          }
          if (
            item?.properties?.isBundleProduct &&
            item?.selling_plan_allocation
          ) {
            discount =
              subsCount == 2
                ? 5
                : subsCount == 3
                  ? 10
                  : subsCount >= 4
                    ? 15
                    : null;
            price = item.price - (discount * item.price) / 100;
          }

          if (!item?.properties?.giftItem) {
            totalPrice += price * item.quantity;
          }
        });

        totalPrice = Math.ceil(totalPrice);
        self.totalPrice.text(self.formatMoney(totalPrice));

        $(".side-cart__clearpay").text(self.formatMoney(totalPrice / 4));

        // cart total amount
        self.totalAmount.text(cart.item_count);

        //set cart count
        document.querySelector(".cart-count").innerText = cart.item_count;

        // adjust item quantity

        $(".cart-item__adjust-qty").on("click", function() {
          if ($(this).hasClass("stack-quantity")) {
            self.removeStack(this, cart, "adjust");
          } else {
            self.changeQuantity(this);
          }
        });

        // checkout redirect
        self.checkoutRedirect(cart);

        $(".stack-item__remove").on("click", function() {
          self.removeStack(this, cart, "remove");
        });

        // remove gift
        if (
          cart.items.length == 1 &&
          cart.items[0].properties["Gift product"]
        ) {
          $.post("/cart/clear.js").then(() => {
            self.renderCart();
          });
        }
      },
    });
  }

  cartWidget(cart) {
    const self = this;

    $(".widget-title").text(
      cart.item_count == 0 ? "recommended products" : "ADD AN ITEM & SAVE"
    );

    // check for added bundle via bundle page
    let bundleSubs = cart.items.filter(
      (item) => item?.properties?.bundleData && item?.properties?.subscription
    ).length;
    let recommendedSubs = cart.items.filter(
      (item) =>
        item?.properties?.enableDiscount && item?.properties?.subscription
    ).length;

    if (
      cart.items.filter((item) => item?.properties?.bundleData).length &&
      cart.items.filter((item) => item?.properties?.enableDiscount).length &&
      !!bundleSubs !== !!recommendedSubs
    ) {
      let data = "";
      let allItems = cart.items.filter(
        (item) => item.properties?.enableDiscount
      );

      allItems.forEach(function(item, i) {
        if (i == 0) {
          data = `updates[${item.key}]=0`;
        } else {
          data += `&updates[${item.key}]=0`;
        }
      });

      $.post("/cart/update.js", data).done(function() {
        let updatedItems = [];

        allItems.forEach(function(item) {
          delete item.properties["isBundleProduct"];
          delete item.properties["enableDiscount"];

          let itemObj = {
            id: item.id,
            quantity: item.quantity,
            properties: item.properties,
          };

          if (item.selling_plan_allocation) {
            itemObj.selling_plan = item.selling_plan_allocation.selling_plan.id;
          }
          updatedItems.push(itemObj);
        });

        let formData = {
          items: updatedItems,
        };
        fetch(window.Shopify.routes.root + "cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
          .then((response) => {
            let sidecart = document.querySelector("side-cart");
            sidecart?.renderCart();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
      return false;
    }

    // add bundle discount
    let hasRecommended = cart.items.filter(
      (item) => item.properties?.enableDiscount || item.properties?._quiz_kit_id
    ).length;
    let subsDiscount = cart.items.filter(
      (item) =>
        item?.properties?.isBundleProduct && item?.properties?.subscription
    ).length;
    let oneTimeDiscount = cart.items.filter(
      (item) =>
        item?.properties?.isBundleProduct && !item?.properties?.subscription
    ).length;

    let allItems = null;

    // one-time items discount
    if (
      !subsDiscount &&
      (cart.items.filter(
        (item) => !item.selling_plan_allocation && !item.properties?.giftItem
      ).length > 1 ||
        cart.items.filter(
          (item) =>
            !item.selling_plan_allocation &&
            !item.properties?.giftItem &&
            item.quantity > 1
        ).length)
    ) {
      allItems = cart.items.filter(
        (item) =>
          !item.properties?.isBundleProduct &&
          !item.properties?.gear &&
          !item.properties?.giftItem &&
          !item.selling_plan_allocation &&
          !item.properties?.isStackParent &&
          !item.properties?.isStackProduct
      );
    }

    // subs items discount
    if (
      !oneTimeDiscount &&
      (cart.items.filter(
        (item) => item.selling_plan_allocation && !item.properties?.giftItem
      ).length > 1 ||
        cart.items.filter(
          (item) =>
            item.selling_plan_allocation &&
            !item.properties?.giftItem &&
            item.quantity > 1
        ).length)
    ) {
      allItems = cart.items.filter(
        (item) =>
          !item.properties?.isBundleProduct &&
          !item.properties?.gear &&
          !item.properties?.giftItem &&
          item.selling_plan_allocation &&
          !item.properties?.isStackParent &&
          !item.properties?.isStackProduct
      );
    }

    if (hasRecommended && allItems?.length) {
      let data = "";
      allItems.forEach(function(item, i) {
        if (i == 0) {
          data = `updates[${item.key}]=0`;
        } else {
          data += `&updates[${item.key}]=0`;
        }
      });

      $.post("/cart/update.js", data).done(function() {
        let updatedItems = [];

        allItems.forEach(function(item) {
          item.properties.isBundleProduct = true;
          item.properties.enableDiscount = true;

          let itemObj = {
            id: item.id,
            quantity: item.quantity,
            properties: item.properties,
          };

          if (item.selling_plan_allocation) {
            itemObj.selling_plan = item.selling_plan_allocation.selling_plan.id;
            itemObj.properties.subscription = true;
          }
          updatedItems.push(itemObj);
        });

        let formData = {
          items: updatedItems,
        };

        fetch(window.Shopify.routes.root + "cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
          .then((response) => {
            let sidecart = document.querySelector("side-cart");
            sidecart?.renderCart();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
      return false;
    }
  }

  giftProducts(cart) {
    const self = this;
    let products = window.giftProducts;
    let addItems = [];
    let removeItems = [];
    let item_count = cart.items.filter(
      (item) => !item.properties?.giftItem
    ).length;

    products.forEach(function(gift) {
      if (gift.available) {
        let itemInCart = cart.items.filter(
          (item) => item.handle == gift.handle && item.properties?.giftItem
        );

        let subPresent = cart.items.filter(
          (item) =>
            item.selling_plan_allocation &&
            item.selling_plan_allocation.selling_plan.id
        );

        if (
          cart.total_price / 100 >= gift.orderValue &&
          !itemInCart.length &&
          item_count > 0
        ) {
          if (gift.subscription_only && subPresent.length) {
            addItems.push(gift.id);
          } else if (!gift.subscription_only) {
            addItems.push(gift.id);
          }
        }

        if (
          cart.total_price / 100 < gift.orderValue &&
          itemInCart.length &&
          item_count > 0
        ) {
          removeItems.push(
            cart.items.filter(
              (item) => item.handle == gift.handle && item.properties?.giftItem
            )[0]?.key
          );
        }

        if (item_count == 0 && itemInCart.length) {
          removeItems.push(
            cart.items.filter(
              (item) => item.handle == gift.handle && item.properties?.giftItem
            )[0]?.key
          );
        }

        if (gift.subscription_only && subPresent.length <= 0) {
          removeItems.push(
            cart.items.filter(
              (item) => item.handle == gift.handle && item.properties?.giftItem
            )[0]?.key
          );
        }
      }
    });

    cart.items.forEach(function(item) {
      if (
        item.properties?.giftItem &&
        !products.filter((product) => product.handle == item.handle).length
      ) {
        removeItems.push(item.key);
      }
    });

    const addGifts = async (data) => {
      try {
        const response = await fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: data,
          }),
        });

        self.renderCart();
      } catch (error) {
        console.error(error);
      }
    };

    if (addItems.length) {
      let data = [];

      addItems.forEach(function(id) {
        data.push({
          id: id,
          quantity: 1,
          properties: {
            giftItem: true,
          },
        });
      });

      addGifts(data);
      return;
    }

    // remove items
    if (removeItems.length) {
      let data;
      removeItems.forEach(function(key) {
        if (!data) {
          data = `updates[${key}]=0`;
        } else {
          data += `&updates[${key}]=0`;
        }
      });
      $.post("/cart/update.js", data).done(function() {
        self.renderCart();
      });
    }
  }

  checkoutRedirect(cart) {
    let bundleItems = cart.items.filter(
      (item) =>
        item?.properties?.isBundleProduct && item?.selling_plan_allocation
    );
    let bundleItemsCounter = 0;
    let isSubscription = cart.items.filter(
      (item) =>
        item?.properties?.isBundleProduct && item?.selling_plan_allocation
    ).length;

    bundleItems.forEach(function(item) {
      bundleItemsCounter += item.quantity;
    });

    localStorage.removeItem("discount");

    if (bundleItemsCounter && bundleItemsCounter >= 2 && isSubscription) {
      let discount;

      if (isSubscription) {
        discount =
          bundleItemsCounter == 2
            ? subsDiscountCodes.bundle10
            : bundleItemsCounter == 3
              ? subsDiscountCodes.bundle20
              : subsDiscountCodes.bundle30;
      }
      let link = `/checkout?myshopify_domain=animalpak-uk.myshopify.com&cart_token=${cart.token}&discount=${discount}`;
      $(".checkout-cta").attr("href", link);

      localStorage.setItem("discount", link);
      // $('.checkout-cta').on('click', function (e) {
      //   e.preventDefault()

      //   window.location.href = link
      //   localStorage.setItem('discount', link)
      // })
    } else {
      $(".checkout-cta").attr("href", "/checkout");
    }
  }

  changeQuantity(item) {
    let self = this;
    let input = $(item).closest(".quantity").find(".quantity__input"),
      quantity = input?.val() || 0,
      key =
        input?.attr("id")?.split("quantity-")[1] ||
        $(item).attr("id").split("remove-")[1];

    $.post("/cart/update.js", `updates[${key}]=${quantity}`).done(function() {
      self.renderCart();
    });
  }

  freeShipping(price, subsription_present) {
    let amount = +this.progress.data("amount");
    if (document.querySelector("#bfcm_prices").value == "true") {
      if (subsription_present) {
        amount = 0;
      }

      let free_gift_amount = parseInt($("#free_gift_price_bfcm").val()) * 100;

      if (price >= amount) {
        if (price < free_gift_amount) {
          //Free shipping but not reached gift amount
          this.progress.css("width", (price * 100) / free_gift_amount + "%");
          let gift_price_left = this.formatMoney(free_gift_amount - price);
          if (subsription_present) {
            $(".cart__free-shipping").text(
              $("#sub_pre_free_gift")
                .val()
                .replace("{gift_price_left}", gift_price_left)
            );
          } else {
            $(".cart__free-shipping").text(
              $("#ot_pre_free_gift")
                .val()
                .replace("{gift_price_left}", gift_price_left)
            );
          }
        } else {
          //Free shipping and reached free gift amount
          this.progress.css("width", "100%");
          $(".cart__free-shipping").text($("#free_shipping_free_gift").val());
        }
        return;
      }

      this.progress.css("width", (price * 100) / amount + "%");
      let free_shipping_left = this.formatMoney(amount - price);
      $(".cart__free-shipping").text(
        $("#ot_pre_free_ship")
          .val()
          .replace("{shipping_price_left}", free_shipping_left)
      );
    } else {
      if (price >= amount) {
        this.progress.css("width", "100%");
        $(".cart__free-shipping").text("free shipping");
        return;
      }

      this.progress.css("width", (price * 100) / amount + "%");
      $(".cart__free-shipping").text(
        `Spend ${this.formatMoney(amount - price)} more for free shipping`
      );
    }
  }

  formatMoney(price) {
    return (price / 100).toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
    });
  }

  removeStack(item, cart, action) {
    const self = this;
    let id =
      $(item).attr("id") ||
      $(item)
        .closest(".cart-item__wrap")
        .find(".stack-item__remove")
        .attr("id"),
      data,
      quantity =
        action == "remove"
          ? 0
          : $(item).closest(".quantity").find(".quantity__input").val();

    function getCart(id) {
      let arr = [],
        data = "";

      $.ajax({
        type: "GET",
        url: "/cart.js",
        dataType: "json",
        success: function(cart) {
          cart.items.forEach(function(item) {
            if (item.properties?.bundleId == id) {
              arr.push(item.key);
            }
          });

          if (arr.length) {
            arr.forEach(function(key, i) {
              if (i == 0) {
                data = `updates[${key}]=0`;
              } else {
                data += `&updates[${key}]=0`;
              }
            });

            $.post("/cart/update.js", data).done(function() {
              getCart(id);
            });
          } else {
            self.renderCart();
          }
        },
      });
    }

    cart.items.forEach(function(item) {
      if (item.properties?.bundleId == id) {
        if (!data) {
          data = `updates[${item.key}]=${quantity}`;
        } else {
          data += `&updates[${item.key}]=${quantity}`;
        }
      }
    });
    $.post("/cart/update.js", data).done(function() {
      if (quantity) {
        self.renderCart();
      } else {
        getCart(id);
      }
    });
  }

  selectedProductQuery(handle) {
    return `query {
                product(handle: "${handle}") {
                    handle
                    title
                    productType
                    tags
                    metafield(key:"short_description_extra" namespace:"custom") {
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
                                metafield(key: "variant_color", namespace: "custom") {
                                  value
                                }
                            }
                        }
                    }
                    options {
                        name
                        values
                    }
                }
            }`;
  }

  selectedProductDrawer(product) {
    const self = this;

    let html = `<div class="cart-selected_product__drawer">
                <div class="selected_product__drawer-inner bg-white relative">
                <div class="close-product__drawer selected_product__drawer-mobile"></div>
                <div class="absolute close-product__drawer cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none" aria-hidden="true" focusable="false" role="presentation" class="icon icon-close" fill="none" viewBox="0 0 18 17" style="width: 20px;">
                        <path d="M.865 15.978a.5.5 0 00.707.707l7.433-7.431 7.579 7.282a.501.501 0 00.846-.37.5.5 0 00-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 10-.707-.708L8.991 7.853 1.413.573a.5.5 0 10-.693.72l7.563 7.268-7.418 7.417z" fill="black"></path>
                    </svg>
                </div>
                <div class="bg-white relative selected_product__drawer-mobile-inner">
                
                <div class="lg:flex items-center">
                    <img src="${product.featuredImage?.url
      }" class="selected_product__img object-contain" /> 
                    <div>
                        <div class="selected_product__title font-compacta upperase text-primary font-bold">${product.title
      }</div>
                        <div class="selected_product__type mt-1 font-sans text-primary">${product.productType
      }</div>
                        <div class="selected_product__price mt-1 font-sans text-primary">$${product.variants.edges[0].node.price.amount
      }</div>
                    </div>
                </div>
                <div class="cart-purchase-type hidden mt-4 ${!product.sellingPlanGroups.edges.length && "!hidden"
      }">
                    <div class="flex items-center">
                        <input type="radio" name="cart-purchase" id="cart-subscribe" class="hidden cursor-pointer" value="subscribe">
                        <label for="cart-subscribe"
                            class="relative flex items-center text-[13.91px] text-primary capitalize font-sans font-semibold leading-[22.26px] cursor-pointer">Subscribe
                            & save</label>
                    </div>
                    <select class="${!product.sellingPlanGroups?.edges.length && "!hidden"
      } hidden select__select text-[13.9px] mt-3 mb-3 block pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-0  h-[56px] border border-solid border-[#DBDBDB]">`;

    if (product.sellingPlanGroups?.edges) {
      product.sellingPlanGroups?.edges[0]?.node?.sellingPlans?.edges.forEach(
        function(plan) {
          html += `<option data-id="${self.decodeId(plan.node.id)}">${plan.node.name
            }</option>`;
        }
      );
    }

    html += `</select>
                    <div class="flex items-center mt-1">
                        <input type="radio" name="cart-purchase" id="cart-one-time" class="hidden cursor-pointer" checked value="one-time">
                        <label for="cart-one-time"
                            class="relative flex items-center text-[13.91px] text-primary capitalize font-sans font-semibold leading-[22.26px] cursor-pointer">One-time
                            purchase</label>
                    </div>
                </div>
                <div class="lg:flex lg:space-x-4 mt-6 mb-[18px]">`;

    product.options.forEach(function(option) {
      if (option.name !== "Title") {
        html += `<div class="product-form__input product-form__input--dropdown w-full lg:w-6/12">
            <div class="product-select"> 
              <div class="cart-custom-select-block custom-select-arrow relative">
                <select name="options-${option.name}"
                  class="option_select select__select  mt-2 lg:mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-0 h-[56px] border border-solid border-[#DBDBDB]">
                  <option value="" selected disabled hidden>
                  Choose ${option.name}
                  </option>`;

        option.values.forEach(function(value) {
          // Find the corresponding variant based on the value
          const variant = product.variants.edges.find(
            (edge) => edge.node.title === value
          );

          // Check if the variant has a metafield
          const metafieldValue = variant?.node?.metafield?.value || "#fff";

          html += `<option value="${value}" data-color="${metafieldValue}">
              <span class="color-circle"></span>
              ${value}
            </option>`;
        });

        html += `   </select>
              </div>
            </div>
          </div>`;
      }
    });

    html += `</div>
                <div class="flex mt-4">
                    <button class="block cart-item_submit tracking-[1px] w-full border border-solid border-yellow hover:bg-white hover:border-primary transition duration-500 bg-yellow uppercase w-full text-center py-[18px] transition duration-500 text-primary text-[13.9px] font-sans font-bold leading-[18.07px] ${product.variants.edges.length > 1 && "disabled"
      }" >${product.variants.edges.length > 1
        ? "make selection"
        : "add"
      }</button>
                </div>
                </div>
                </div>
            </div>`;

    return html;
  }

  generateCustomSelect() {
    const selects = document.querySelectorAll('select[name="options-Flavor"]');
    selects.forEach(function(select) {
      const customSelect = document.createElement("div");
      customSelect.classList.add("cart-custom-select");

      const selectedValue = document.createElement("div");
      selectedValue.classList.add("selected-value");
      selectedValue.textContent =
        select.options[select.selectedIndex].textContent;

      // Create the color circle span for the selected option
      const colorCircle = document.createElement("span");
      colorCircle.classList.add("color-circle");
      colorCircle.style.backgroundColor =
        select.options[select.selectedIndex].getAttribute("data-color");
      selectedValue.appendChild(colorCircle);

      customSelect.appendChild(selectedValue);

      const optionsList = document.createElement("ul");
      optionsList.classList.add("options-list");

      for (let i = 0; i < select.options.length; i++) {
        const option = select.options[i];
        if (option.value !== "") {
          // Exclude the "Choose Flavor" option
          const optionItem = document.createElement("li");

          const colorCircle = document.createElement("span");
          colorCircle.classList.add("color-circle");
          colorCircle.style.backgroundColor = option.getAttribute("data-color");

          optionItem.appendChild(colorCircle);

          const optionText = document.createElement("span");
          optionText.textContent = option.textContent.trim();
          optionItem.appendChild(optionText);

          optionItem.addEventListener("click", function() {
            const clickedOption = option;

            selectedValue.textContent = clickedOption.textContent;

            // Remove the existing colorCircle element
            const existingColorCircle =
              selectedValue.querySelector(".color-circle");
            if (existingColorCircle) {
              selectedValue.removeChild(existingColorCircle);
            }

            // Create a new colorCircle element and add it to selectedValue
            const newColorCircle = document.createElement("span");
            newColorCircle.classList.add("color-circle");
            newColorCircle.style.backgroundColor =
              clickedOption.getAttribute("data-color");
            selectedValue.appendChild(newColorCircle);

            select.selectedIndex = i;
            customSelect.classList.remove("open");

            // Manually trigger the change event on the original select element
            const changeEvent = new Event("change", { bubbles: true });
            select.dispatchEvent(changeEvent);
          });

          optionsList.appendChild(optionItem);
        }
      }

      customSelect.appendChild(optionsList);

      selectedValue.addEventListener("click", function() {
        customSelect.classList.toggle("open");
      });

      // Insert the custom select before the original select
      select.parentNode.insertBefore(customSelect, select);

      // Hide the original select
      select.style.display = "none";
    });
  }

  decodeId(id) {
    // const decoded = atob(id)
    const shopifyId = id.split("/").pop();
    return parseInt(shopifyId);
  }

  recommendedProducts() {
    const self = this;

    var CartSlider = new Swiper(
      document.querySelector(".recommended-products-slider"),
      {
        loop: true,
        spaceBetween: 40,
        slidesPerView: 1.3,
      }
    );

    $(document).on("click", function(e) {
      if ($(e.target).hasClass("recommended-add")) {
        let handle = $(e.target).data("handle");
        let properties = {};

        if ($(".cart-item__wrap").length) {
          properties.isBundleProduct = true;
          properties.enableDiscount = true;
        }

        fetch(self.graphUrl, {
          async: true,
          crossDomain: true,
          method: "POST",
          headers: {
            "X-Shopify-Storefront-Access-Token": self.accessToken,
            "Content-Type": "application/graphql",
          },
          body: self.selectedProductQuery(handle),
        })
          .then((res) => res.json())
          .then((res) => {
            let product = res.data.product;
            let variants = product.variants.edges;
            console.log(product);
            $("body").append(self.selectedProductDrawer(product));
            self.generateCustomSelect();

            $.ajax({
              type: "GET",
              url: "/cart.js",
              dataType: "json",
              success: function(cart) {
                let bundleItems = cart.items.filter(
                  (item) =>
                    item?.properties?.isBundleProduct &&
                    item?.selling_plan_allocation
                ).length;

                if (
                  bundleItems ||
                  (cart.items.length == 1 &&
                    cart.items.filter((item) => item?.selling_plan_allocation)
                      .length)
                ) {
                  $(".cart-purchase-type").removeClass("hidden");
                  $("input#cart-subscribe").attr("checked", true);
                  $(".cart-purchase-type select").removeClass("hidden");
                  $("#cart-one-time").parent().addClass("hidden");
                } else {
                  $(".cart-purchase-type").addClass("hidden");
                }

                if (!cart.items.length) {
                  $(".cart-purchase-type").removeClass("hidden");
                  $("#cart-one-time").parent().removeClass("hidden");
                  $(".cart-purchase-type select").addClass("hidden");
                  $("input#cart-one-time").attr("checked", true);
                }
              },
            });

            setTimeout(() => {
              $(".selected_product__drawer-inner").addClass("active");
            });

            $(".cart-purchase-type input").on("change", function() {
              if ($(this).val() == "subscribe") {
                $(".cart-purchase-type select").removeClass("hidden");
              } else {
                $(".cart-purchase-type select").addClass("hidden");
              }
            });

            let selectedvariant = variants.filter(
              (variant) => variant.node.availableForSale
            )[0]?.node;
            if (!selectedvariant) {
              $(".cart-item_submit").text("sold out");
            }
            $(".quantity__input").prop(
              "max",
              selectedvariant.quantityAvailable
            );

            $(".product-select select").on("change", function() {
              let options = variants;

              if ($('.product-select option[value=""]:selected').length) {
                return;
              }

              $(".product-select select").each(function(i) {
                let option = $(this).find("option:selected").val();
                options = options.filter(
                  (variant) => variant.node.title.split("/")[i].trim() == option
                );
                selectedvariant = options[0].node;
              });

              $(".cart-item_submit").removeClass("disabled");

              if (!selectedvariant.availableForSale) {
                $(".cart-item_submit").addClass("disabled");
                $(".cart-item_submit").text("sold out");
                return;
              }

              $(".cart-item_submit").removeClass("disabled");
              $(".cart-item_submit").text("add");
              $(".quantity__input").prop(
                "max",
                selectedvariant.quantityAvailable
              );
              $(".selected_product__price").text(
                `$${selectedvariant.price.amount}`
              );
            });

            $(".cart-item_submit").on("click", function() {
              let id = self.decodeId(selectedvariant.id);
              let obj = {
                id: id,
                quantity: 1,
                properties: {},
              };

              obj.properties.enableDiscount = true;

              if ($("#cart-subscribe").is(":checked")) {
                obj.selling_plan = $(
                  ".cart-purchase-type select option:selected"
                ).data("id");
                obj.properties.subscription = true;
              }

              let formData = {
                items: [obj],
              };
              fetch(window.Shopify.routes.root + "cart/add.js", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
              })
                .then((response) => {
                  let sidecart = document.querySelector("side-cart");
                  sidecart?.renderCart();
                  removeDrawer();
                })
                .catch((error) => {
                  console.error("Error:", error);
                });
            });

            // remove drawer
            function removeDrawer() {
              $(".selected_product__drawer-inner").removeClass("active");
              setTimeout(() => {
                $(".cart-selected_product__drawer").remove();
              }, 300);
            }

            document.addEventListener("click", function(e) {
              if (
                e.target.classList.contains("cart-selected_product__drawer") ||
                e.target.classList.contains("close-product__drawer")
              ) {
                removeDrawer();
              }
            });
          });
      }
    });
  }
}

if (!customElements.get("side-cart")) customElements.define("side-cart", SideCart);
