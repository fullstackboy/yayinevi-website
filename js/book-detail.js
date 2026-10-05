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
          '<button type="button" class="btn btn-primary" id="detail-add-cart">' +
            '<svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' +
            '<span id="detail-add-cart-label">Sepete Ekle</span>' +
          "</button>" +
          '<a class="btn btn-ghost" href="cart.html">Sepete Git</a>' +
          '<a class="btn btn-ghost" href="index.html">Kitaplara Dön</a>' +
        "</div>" +
      "</div>";

    root.hidden = false;
    updateDocumentMeta(book);

    document.getElementById("detail-add-cart").addEventListener("click", function () {
      api.addToCart(currentBook);
      var label = document.getElementById("detail-add-cart-label");
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
