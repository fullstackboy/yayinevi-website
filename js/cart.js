/**
 * Sepet onay sayfası — WhatsApp sipariş mesajı
 */
(function () {
  "use strict";

  var api = window.DarulHidaye;

  function renderCart() {
    var items = api.getCart();
    var emptyEl = document.getElementById("cart-empty");
    var contentEl = document.getElementById("cart-content");
    var listEl = document.getElementById("cart-list");
    var totalEl = document.getElementById("cart-total");
    var waLink = document.getElementById("cart-whatsapp");

    if (!listEl) return;

    if (!items.length) {
      emptyEl.hidden = false;
      contentEl.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    contentEl.hidden = false;

    var total = 0;
    listEl.innerHTML = items.map(function (item) {
      var qty = item.qty || 1;
      var lineTotal = item.price * qty;
      total += lineTotal;
      return (
        '<li class="cart-item" data-id="' + api.escapeHtml(item.id) + '">' +
          '<div class="cart-item-cover">' +
            '<img src="' + api.escapeHtml(item.cover) + '" alt="" width="80" height="120" loading="lazy">' +
          "</div>" +
          '<div class="cart-item-info">' +
            "<h2>" + api.escapeHtml(item.title) + "</h2>" +
            '<p class="cart-item-author">' + api.escapeHtml(item.author || "") + "</p>" +
            '<p class="cart-item-price">' + api.escapeHtml(api.formatPrice(lineTotal, item.currency)) + "</p>" +
            '<div class="cart-item-controls">' +
              '<label>Adet ' +
                '<input class="cart-qty" type="number" min="1" value="' + qty + '" data-id="' + api.escapeHtml(item.id) + '">' +
              "</label>" +
              '<button type="button" class="btn btn-ghost cart-remove" data-id="' + api.escapeHtml(item.id) + '"' +
                ' aria-label="Sepetten kaldır: ' + api.escapeHtml(item.title) + '" title="Sepetten kaldır">' +
                '<svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" focusable="false">' +
                  '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6m5 4v7m4-7v7"/>' +
                "</svg>" +
              "</button>" +
            "</div>" +
          "</div>" +
        "</li>"
      );
    }).join("");

    totalEl.textContent = total + " TL";
    waLink.href = api.buildWhatsAppUrl(api.cartOrderMessage(items));

    listEl.querySelectorAll(".cart-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        api.removeFromCart(btn.getAttribute("data-id"));
        renderCart();
      });
    });

    listEl.querySelectorAll(".cart-qty").forEach(function (input) {
      input.addEventListener("change", function () {
        var qty = parseInt(input.value, 10) || 1;
        api.setCartQty(input.getAttribute("data-id"), qty);
        renderCart();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("cart-list")) return;

    renderCart();

    var clearBtn = document.getElementById("cart-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        api.clearCart();
        renderCart();
      });
    }
  });
})();
