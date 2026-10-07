/**
 * Darül Hidaye — ortak yardımcılar, config ve sepet
 */
(function (global) {
  "use strict";

  var CONFIG = {
    WHATSAPP_NUMBER: "905XXXXXXXXX",
    CART_KEY: "darulHidayeCart"
  };

  function buildWhatsAppUrl(message) {
    var text = encodeURIComponent(message || "");
    return "https://wa.me/" + CONFIG.WHATSAPP_NUMBER + "?text=" + text;
  }

  function orderMessage(bookTitle) {
    return "Merhaba, " + bookTitle + " kitabını satın almak istiyorum.";
  }

  function cartOrderMessage(items) {
    var lines = ["Merhaba, aşağıdaki kitapları sipariş etmek istiyorum:", ""];
    var total = 0;
    items.forEach(function (item, index) {
      var qty = item.qty || 1;
      var lineTotal = item.price * qty;
      total += lineTotal;
      lines.push(
        (index + 1) + ". " + item.title +
        (qty > 1 ? " (x" + qty + ")" : "") +
        " — " + lineTotal + " " + (item.currency || "TL")
      );
    });
    lines.push("");
    lines.push("Toplam: " + total + " TL");
    return lines.join("\n");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatPrice(price, currency) {
    return price + " " + (currency || "TL");
  }

  function truncate(text, maxLength) {
    var clean = String(text || "").trim();
    if (clean.length <= maxLength) return clean;
    return clean.slice(0, maxLength - 1).trimEnd() + "…";
  }

  function fetchBooks() {
    if (!Array.isArray(global.BOOKS_DATA)) {
      return Promise.reject(new Error("Kitap verileri yüklenemedi. data/books.js eksik olabilir."));
    }
    return Promise.resolve(global.BOOKS_DATA);
  }

  function findBookById(books, id) {
    for (var i = 0; i < books.length; i++) {
      if (books[i].id === id) return books[i];
    }
    return null;
  }

  function getCart() {
    try {
      var raw = localStorage.getItem(CONFIG.CART_KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(items));
    updateCartCount();
  }

  function cartCount() {
    return getCart().reduce(function (sum, item) {
      return sum + (item.qty || 1);
    }, 0);
  }

  function updateCartCount() {
    var el = document.getElementById("cart-count");
    if (!el) return;
    var count = cartCount();
    el.textContent = String(count);
    el.hidden = count === 0;
  }

  function addToCart(book) {
    if (!book || !book.id) return;
    var cart = getCart();
    var found = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === book.id) {
        found = cart[i];
        break;
      }
    }
    if (found) {
      found.qty = (found.qty || 1) + 1;
    } else {
      cart.push({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        currency: book.currency || "TL",
        cover: book.cover,
        qty: 1
      });
    }
    saveCart(cart);
  }

  function removeFromCart(id) {
    saveCart(getCart().filter(function (item) {
      return item.id !== id;
    }));
  }

  function setCartQty(id, qty) {
    var cart = getCart();
    cart.forEach(function (item) {
      if (item.id === id) item.qty = Math.max(1, qty);
    });
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Menüyü aç" : "Menüyü kapat");
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Menüyü aç");
        nav.classList.remove("is-open");
      });
    });
  }

  function initSocialLinks() {
    document.querySelectorAll(".footer-socials a[href='dummy']").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });
  }

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initSocialLinks();
    initYear();
    updateCartCount();
  });

  global.DarulHidaye = {
    CONFIG: CONFIG,
    buildWhatsAppUrl: buildWhatsAppUrl,
    orderMessage: orderMessage,
    cartOrderMessage: cartOrderMessage,
    escapeHtml: escapeHtml,
    formatPrice: formatPrice,
    truncate: truncate,
    fetchBooks: fetchBooks,
    findBookById: findBookById,
    getCart: getCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    setCartQty: setCartQty,
    clearCart: clearCart,
    updateCartCount: updateCartCount
  };
})(window);
