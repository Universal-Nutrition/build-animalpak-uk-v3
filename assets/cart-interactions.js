// Cart and DOM interaction handlers
// This script handles cart opening, side cart interactions, and jQuery-based DOM manipulation

document.addEventListener('DOMContentLoaded', function () {
  // Handle ?opencart query parameter to auto-open cart
  if (window.location.href.includes('?opencart')) {
    let sidecart = document.querySelector('side-cart');
    setTimeout(function () {
      sidecart?.renderCart();
      sidecart?.openCart();
      window.history.replaceState(null, null, window.location.pathname);
    }, 1000);
  }

  // Handle quiz page cart interactions with XMLHttpRequest monitoring
  if (window.location.href.includes('/pages/quiz')) {
    let sidecart2 = document.querySelector('side-cart');
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
      this.addEventListener('load', function () {
        if (this._url.includes('/add.js') && this.status > 199 && this.status < 350) {
          sidecart2?.renderCart();
          sidecart2?.openCart();
        }
      });
      origOpen.apply(this, arguments);
    };
  }

  // jQuery-based cart icon and close button handlers
  if (window.jQuery) {
    jQuery('#cart-icon-bubble').click(function () {
      jQuery('body').addClass('fixed-body chathide');
    });
    jQuery('.close-side-cart').click(function () {
      jQuery('body').removeClass('fixed-body chathide');
    });
  } else {
    console.warn('jQuery not loaded for cart interactions.');
  }
});
