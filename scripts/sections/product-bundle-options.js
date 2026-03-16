class ProductBundleOptions extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("overlay") ||
        e.target.classList.contains("close")
      ) {
        this.classList.add("hidden");
      }

      if (e.target.classList.contains("option-update")) {
        let productBundle = document.querySelector(
          "#product-bundle-" + this.getAttribute("index")
        );
        productBundle.querySelector(".add-to-bundle").innerHTML =
          "Add - " + this.querySelector(".price").innerHTML;
        productBundle
          .querySelector(".add-to-bundle")
          .setAttribute(
            "product-price",
            this.querySelector(".price").getAttribute("product-price")
          );
        productBundle
          .querySelector(".add-to-bundle")
          .setAttribute(
            "product-id",
            this.querySelector(".price").getAttribute("product-id")
          );
        productBundle
          .querySelector(".add-to-bundle")
          .setAttribute(
            "product-title",
            this.querySelector(".price").getAttribute("product-title")
          );
        productBundle.querySelector(".product-bundle-image").src =
          this.querySelector(".option-image").src;
        productBundle.querySelector(".product-bundle-image").srcset =
          this.querySelector(".option-image").srcset;
        productBundle.querySelector(".product-bundle-title").innerHTML =
          this.querySelector(".option-title").innerHTML;
        this.classList.add("hidden");
      }
    });

    this.querySelector("select").addEventListener("change", (e) => {
      fetch("/products/" + e.target.value + ".js")
        .then((response) => response.json())
        .then((data) => {
          this.querySelector(".option-image").src = data.featured_image;
          this.querySelector(".option-image").srcset = data.featured_image;
          this.querySelector(".option-title").innerHTML = data.title;
          this.querySelector(".price").innerHTML =
            "$" + data.variants[0].price / 100.0;
          this.querySelector(".price").setAttribute(
            "product-price",
            data.variants[0].price
          );
          this.querySelector(".price").setAttribute(
            "product-id",
            data.variants[0].id
          );
          this.querySelector(".price").setAttribute(
            "product-title",
            data.title
          );
        });
    });
  }
}

if (!customElements.get("product-bundle-options")) customElements.define("product-bundle-options", ProductBundleOptions);
