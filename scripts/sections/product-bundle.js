class ProductBundle extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      let selectedItems = [];
      let totalPrice = 0;
      let selectedProductNames = [];

      function makeUL(array) {
        // Create the list element:
        var list = document.createElement('ul');

        for (var i = 0; i < array.length; i++) {
            // Create the list item:
            var item = document.createElement('li');

            // Set its contents:
            item.appendChild(document.createTextNode(array[i]));
            item.classList.add('py-2','text-sm', 'font-light', 'italic', 'text-gray-100');

            // Add it to the list:
            list.appendChild(item);
        }

        // Finally, return the constructed list:
        return list;
    }

    const selectAdd = (e) => {
          let index = e.target.getAttribute('index');
          let productId = e.target.getAttribute('product-id')
          let productPrice = Number(e.target.getAttribute('product-price'));
          let productName = e.target.getAttribute('product-title');

          let arrayIndex = selectedItems.findIndex(selectedItems => selectedItems.id === Number(productId));
          if (arrayIndex == -1) {
            selectedItems.push({'id': Number(productId), 'quantity': 1});
            selectedProductNames.push("- " + productName)
            totalPrice += productPrice
            e.target.innerHTML = "Remove - $" + Number(e.target.getAttribute('product-price') / 100.00);
            e.target.classList.add('bg-gray-800');
            e.target.classList.remove('bg-primaryRed');
            document.getElementById('foo').innerHTML = "";
          } else {
            selectedItems.splice(arrayIndex, 1);
            selectedProductNames.splice(arrayIndex, 1)
            totalPrice -= productPrice;
            e.target.innerHTML = "Add - $" + Number(e.target.getAttribute('product-price') / 100.00);
            e.target.classList.remove('bg-gray-800');
            e.target.classList.add('bg-primaryRed');
            document.getElementById('foo').innerHTML = "";
          }
          document.getElementById('foo').appendChild(makeUL(selectedProductNames));
          document.getElementById('bundle-total').innerHTML = "Total: $" + (totalPrice / 100);
         
         //clear empty values
    }

    const addToCart = (selectedItems) => {
        fetch('/cart/add.js', {
        method: 'post',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: selectedItems})}).then(res => res.json()).then(res => location.href = "/cart");
    }



      this.addEventListener('click', function(e){
        if (e.target.classList.contains('add-to-bundle')){
          selectAdd(e);
        }
        if (e.target.id == "add-to-bundle") {
          addToCart(selectedItems);
         }  

        if (e.target.classList.contains('product-bundle-options')) {
          //toggle modal on click.
          //check if product is added to cart already
          let item = document.querySelector(`.add-to-bundle[index="${e.target.getAttribute('index')}"]`);
          let arrayIndex = selectedItems.findIndex(selectedItems => selectedItems.id === Number(item.getAttribute('product-id')));
          if (arrayIndex != -1) {
            selectedItems.splice(arrayIndex, 1);
            selectedProductNames.splice(arrayIndex, 1)
            totalPrice -= Number(item.getAttribute('product-price'));
            item.innerHTML = "Add - $" + Number(item.getAttribute('product-price') / 100.00);
            item.classList.remove('bg-gray-800');
            item.classList.add('bg-primaryRed');
            document.getElementById('foo').innerHTML = "";
            document.getElementById('foo').appendChild(makeUL(selectedProductNames));
            document.getElementById('bundle-total').innerHTML = "Total: $" + (totalPrice / 100);
          }


          this.querySelector('#product-bundle-options-' + e.target.getAttribute('index')).classList.remove('hidden');
        }
         
      });

  
    }  
    
  }
  
  customElements.define('product-bundle', ProductBundle);