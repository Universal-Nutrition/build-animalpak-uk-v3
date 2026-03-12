$(".footer-wrapper").find("ul").hide();
$(".footer-wrapper h3").click(function () {
  $(this).toggleClass("active");
  $(this).next("ul").slideToggle();
});

let searchTrigger = document.querySelectorAll(".trigger-search"),
  searchWrapper = document.querySelector(".search-wrapper"),
  searchInput = document.querySelector(".search-input"),
  searchResults = document.querySelector(".search-results");

//   searchTrigger.forEach(function (trigger) {
//   $(searchTrigger).off("click");
//   trigger.addEventListener("click", function () {
//    $('.aa-DetachedOverlay').remove();
//      $('.aa-DetachedSearchButton').click();
//      setTimeout(function() {  
//       $('.aa-InputWrapper').find('.aa-Input').focus().setSelectionRange(0, 999);;
//        openIosKeyboard();
//     }, 500); 
//   });
// });


document.addEventListener("click", function (e) {
  if (
    e.target.classList.contains("close-search") ||
    e.target.classList.contains("search-wrapper")
  ) {
    searchWrapper.classList.add("!hidden");
  }
});

// class Header extends HTMLElement {
//   constructor() {
//     super();
//   }

//   connectedCallback() {
//     this.addEventListener(
//       "mouseover",
//       function (e) {
//         var targetName = e.target.id;
//         var indexValue = e.target.getAttribute("meganav_heading_index");
//         [...document.querySelectorAll(".mega-nav__item")].forEach((element) =>
//           element.classList.remove("active")
//         );

//         if (
//           (targetName && targetName.includes("meganav")) ||
//           indexValue !== null
//         ) {
//           document
//             .getElementById("desktop-menu-overlay")
//             .classList.remove("hidden");
//           this.querySelectorAll("[meganav_index]").forEach((element) => {
//             if (element.getAttribute("meganav_index") != indexValue) {
//               element.style.display = "none";
//             } else {
//               element.style.display = "block";
//               e.target.classList.add("active");
//             }
//           });
//         } else if (e.target.getAttribute("data-item-index")) {
//           [...document.querySelectorAll("[meganav_index]")].forEach(
//             (element) => {
//               element.style.display = "none";
//             }
//           );
//           document
//             .getElementById("desktop-menu-overlay")
//             .classList.add("hidden");
//         }

//         if (
//           e.target.closest(".mega-nav__dropdown") !== null &&
//           e.target.closest(".mega-nav__dropdown").style.display === "block"
//         ) {
//           const parentItemIndex = e.target
//             .closest(".mega-nav__dropdown")
//             .getAttribute("meganav_index");
//           const parentItem = document.querySelector(
//             `[meganav_heading_index="${parentItemIndex}"]`
//           );
//           parentItem.classList.add("active");
//         }
//       },
//       200
//     );
//     this.addEventListener("mouseleave", this.mouseLeaveEvent.bind(this), 200);
//   }

//   mouseLeaveEvent() {
//     [...document.querySelectorAll(".mega-nav__item")].forEach((element) =>
//       element.classList.remove("active")
//     );
//     this.querySelectorAll("[meganav_index]").forEach((element) => {
//       element.style.display = "none";
//       document.getElementById("desktop-menu-overlay").classList.add("hidden");
//     });
//   }
// }

// customElements.define("main-header", Header);
 function openIosKeyboard() {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("style", "position: fixed; top: -100px; left: -100px;");
    document.body.appendChild(input);
    input.focus();
    // it's safe to remove the fake input after a 30s timeout
    setTimeout(() => {
        document.body.removeChild(input);
    }, 30 * 1000);
}