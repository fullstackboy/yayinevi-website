/**
 * Kitap detay — book.html?id=...
 */
(function () {
  "use strict";

  var api = window.DarulHidaye;
  var currentBook = null;

  function getBookIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function updateDocumentMeta(book) {
    document.title = book.title + " — Darül Hidaye";

    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute("content", api.truncate(book.description, 155));
    }

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", book.title + " — Darül Hidaye");
    }

    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", api.truncate(book.description, 155));
    }
  }

  function renderBook(book) {
    var root = document.getElementById("book-detail");
    if (!root) return;

    currentBook = book;
    var title = api.escapeHtml(book.title);
    var author = api.escapeHtml(book.author);
    var category = api.escapeHtml(book.category || "");
    var description = api.escapeHtml(book.description);
    var cover = api.escapeHtml(book.cover);
    var pages = api.escapeHtml(String(book.pages));
    var isbn = api.escapeHtml(book.isbn || "—");
    var price = api.escapeHtml(api.formatPrice(book.price, book.currency));
    var cartIcon =
      '<svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14h9.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 21.08 5H5.21L4.27 2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L7.16 14z"/>' +
      "</svg>";

    root.innerHTML =
      '<div class="book-detail-cover">' +
        '<img src="' + cover + '" alt="' + title + ' kapak görseli" width="400" height="600" decoding="async">' +
      "</div>" +
      '<div class="book-detail-info">' +
        "<h1>" + title + "</h1>" +
        '<p class="book-detail-author">' + author + "</p>" +
        '<p class="book-detail-desc">' + description + "</p>" +
        '<ul class="book-detail-list">' +
          (category ? "<li><span>Kategori</span><strong>" + category + "</strong></li>" : "") +
          "<li><span>Sayfa</span><strong>" + pages + "</strong></li>" +
          "<li><span>ISBN</span><strong>" + isbn + "</strong></li>" +
          "<li><span>Fiyat</span><strong>" + price + "</strong></li>" +
        "</ul>" +
        '<div class="book-detail-actions">' +
          '<a class="btn btn-ghost book-return-link" href="index.html">' +
            '<svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6M9 12h12"/></svg>' +
            '<span>Kitaplara Dön</span>' +
          "</a>" +
          '<button type="button" class="btn btn-primary btn-cart" id="detail-add-cart">' +
            cartIcon +
            '<span class="btn-label">Sepete Ekle</span>' +
          "</button>" +
        "</div>" +
      "</div>";

    root.hidden = false;
    updateDocumentMeta(book);

    document.getElementById("detail-add-cart").addEventListener("click", function () {
      api.addToCart(currentBook);
      var btn = document.getElementById("detail-add-cart");
      var label = btn.querySelector(".btn-label");
      label.textContent = "Eklendi";
      setTimeout(function () {
        label.textContent = "Sepete Ekle";
      }, 900);
    });
  }

  function showError(message) {
    var errorEl = document.getElementById("book-error");
    if (!errorEl) return;
    errorEl.innerHTML =
      "<p>" + api.escapeHtml(message) + "</p>" +
      '<p class="page-actions"><a class="btn btn-ghost" href="index.html">Kitaplara geri dön</a></p>';
    errorEl.hidden = false;
  }

  function hideLoading() {
    var loading = document.getElementById("book-loading");
    if (loading) loading.hidden = true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("book-detail")) return;

    var id = getBookIdFromUrl();
    if (!id) {
      hideLoading();
      showError("Aradığınız kitap bulunamadı.");
      return;
    }

    api.fetchBooks()
      .then(function (books) {
        hideLoading();
        var book = api.findBookById(books, id);
        if (!book) {
          showError("Aradığınız kitap bulunamadı.");
          return;
        }
        renderBook(book);
      })
      .catch(function (err) {
        hideLoading();
        console.error(err);
        showError("Kitap bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      });
  });
})();
