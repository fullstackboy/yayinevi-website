/**
 * Ana sayfa — kitap kartları + kategori filtresi
 */
(function () {
  "use strict";

  var api = window.DarulHidaye;
  var allBooks = [];
  var activeCategory = "all";

  function createBookCard(book) {
    var title = api.escapeHtml(book.title);
    var author = api.escapeHtml(book.author);
    var category = api.escapeHtml(book.category || "");
    var excerpt = api.escapeHtml(api.truncate(book.description, 140));
    var cover = api.escapeHtml(book.cover);
    var id = api.escapeHtml(book.id);
    var priceValue = api.escapeHtml(String(book.price));
    var pages = api.escapeHtml(String(book.pages));
    var categoryLabel = category
      ? '<p class="book-category">' + category + "</p>"
      : "";
    var cartIcon =
      '<svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true" focusable="false">' +
        '<path d="M5 8h14l1 13H4L5 8zM9 8V6a3 3 0 0 1 6 0v2"/>' +
      "</svg>";

    return (
      '<article class="book-card" data-book-id="' + id + '">' +
        '<div class="book-cover">' +
          '<img src="' + cover + '" alt="' + title + ' kapak görseli" width="400" height="600" loading="lazy" decoding="async">' +
        "</div>" +
        '<div class="book-body">' +
          categoryLabel +
          '<h3><a class="book-title-link" href="book.html?id=' + id + '">' + title + "</a></h3>" +
          '<p class="book-author">' + author + "</p>" +
          '<p class="book-excerpt">' + excerpt + "</p>" +
          '<p class="book-pages">' + pages + " sayfa</p>" +
          '<div class="book-footer">' +
            '<div class="book-price">' +
              '<strong class="price-value">' + priceValue + " TL</strong>" +
            "</div>" +
            '<button type="button" class="btn btn-primary btn-cart js-add-cart" data-id="' + id + '">' +
              cartIcon +
              '<span class="btn-label">Sepete Ekle</span>' +
            "</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function getCategories(books) {
    var seen = {};
    var list = [];
    books.forEach(function (book) {
      var cat = (book.category || "").trim();
      if (cat && !seen[cat]) {
        seen[cat] = true;
        list.push(cat);
      }
    });
    list.sort(function (a, b) {
      return a.localeCompare(b, "tr");
    });
    return list;
  }

  function filterBooks() {
    if (activeCategory === "all") return allBooks.slice();
    return allBooks.filter(function (book) {
      return book.category === activeCategory;
    });
  }

  function renderCategoryNav(categories) {
    var nav = document.getElementById("category-nav");
    if (!nav) return;

    var items = [{ value: "all", label: "Tümü" }].concat(
      categories.map(function (cat) {
        return { value: cat, label: cat };
      })
    );

    nav.innerHTML = items.map(function (item) {
      var isActive = item.value === activeCategory;
      return (
        '<button type="button" class="category-btn' + (isActive ? " is-active" : "") + '"' +
        ' data-category="' + api.escapeHtml(item.value) + '"' +
        (isActive ? ' aria-current="true"' : "") +
        ">" + api.escapeHtml(item.label) + "</button>"
      );
    }).join("");

    nav.querySelectorAll(".category-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCategory = btn.getAttribute("data-category") || "all";
        renderCategoryNav(categories);
        renderBooks(filterBooks());
      });
    });
  }

  function bindAddToCart(root) {
    root.querySelectorAll(".js-add-cart").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var book = api.findBookById(allBooks, id);
        if (!book) return;
        api.addToCart(book);
        var label = btn.querySelector(".btn-label");
        var original = label ? label.textContent : btn.textContent;
        if (label) {
          label.textContent = "Eklendi";
        } else {
          btn.textContent = "Eklendi";
        }
        btn.disabled = true;
        setTimeout(function () {
          if (label) {
            label.textContent = original;
          } else {
            btn.textContent = original;
          }
          btn.disabled = false;
        }, 900);
      });
    });
  }

  function bindBookCards(root) {
    root.querySelectorAll(".book-card").forEach(function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest("a, button")) return;
        window.location.href = "book.html?id=" + encodeURIComponent(card.getAttribute("data-book-id"));
      });
    });
  }

  function renderBooks(books) {
    var grid = document.getElementById("books-grid");
    var errorEl = document.getElementById("books-error");
    if (!grid) return;

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    if (!books.length) {
      grid.innerHTML = '<p class="empty-filter">Bu kategoride henüz kitap yok.</p>';
      return;
    }

    grid.innerHTML = books.map(createBookCard).join("");
    bindBookCards(grid);
    bindAddToCart(grid);
  }

  function showError(message) {
    var errorEl = document.getElementById("books-error");
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function hideLoading() {
    var loading = document.getElementById("books-loading");
    if (loading) loading.hidden = true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("books-grid")) return;

    api.fetchBooks()
      .then(function (books) {
        hideLoading();
        allBooks = books;
        var layout = document.getElementById("books-layout");
        if (layout) layout.hidden = false;
        renderCategoryNav(getCategories(books));
        renderBooks(filterBooks());
      })
      .catch(function (err) {
        hideLoading();
        console.error(err);
        showError("Kitaplar şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.");
      });
  });
})();
