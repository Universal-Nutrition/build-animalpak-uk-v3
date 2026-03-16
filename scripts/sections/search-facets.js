class Facets extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
        document.addEventListener('DOMContentLoaded', function () {
          document.querySelectorAll('.facets__disclosure').forEach((button) => {
            button.addEventListener('click',function (e){
              switchContent();
            });
            window.addEventListener('click',function (e){
              switchContent();
            });
          });
        });
        
        function switchContent() {
          $('.facets__disclosure').each(function(index, obj) {
            var x = obj.getAttribute("open"); 
            if (x == "") {
              x = "false";
            }
            else {
              obj.removeAttribute("open");
          }
          obj.removeAttribute("open");
          });
        
        }
    }
}

if (!customElements.get('main-search')) customElements.define('main-search', Facets);