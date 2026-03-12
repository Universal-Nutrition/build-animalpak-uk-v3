if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector("form");
        this.form.querySelector("[name=id]").disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        // this.cartNotification = document.querySelector('cart-notification');
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        const submitButton = this.querySelector('[type="submit"]');
        if (submitButton.classList.contains("loading")) return;

        this.handleErrorMessage();
        // this.cartNotification.setActiveElement(document.activeElement);

        submitButton.setAttribute("aria-disabled", true);
        submitButton.classList.add("loading");

        const config = fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];

        const formData = new FormData(this.form);
        // formData.append('items[1]id', 42812633350359);
        // formData.append('items[1]quantity', 1)
        // formData.append('properties[Accessories]', 'Catalytic Converter')
        // formData.append('sections', this.cartNotification.getSectionsToRender().map((section) => section.id));
        formData.append("sections_url", window.location.pathname);
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            console.log(response);
            if (response.status) {
              this.handleErrorMessage(response.description);
              return;
            }
            // crossOriginIsolated.log(response)
            // this.cartNotification.renderContents(response);
          })

          .then(() => { })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            submitButton.classList.remove("loading");
            submitButton.removeAttribute("aria-disabled");

            let sidecart = document.querySelector("side-cart");
            sidecart?.renderCart();
            sidecart?.openCart();
          });
      }

      handleErrorMessage(errorMessage = false) {
        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  );
}
