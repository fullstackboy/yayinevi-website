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
    var price = api.escapeHtml(api.formatPrice(book.price, book.currency));
    var pages = api.escapeHtml(String(book.pages));
    var categoryLabel = category
      ? '<p class="book-category">' + category + "</p>"
      : "";

    return (
      '<article class="book-card" data-book-id="' + id + '">' +
        '<div class="book-cover">' +
          '<img src="' + cover + '" alt="' + title + ' kapak görseli" width="400" height="600" loading="lazy" decoding="async">' +
        "</div>" +
        '<div class="book-body">' +
          categoryLabel +
          "<h3>" + title + "</h3>" +
          '<p class="book-author">' + author + "</p>" +
          '<p class="book-excerpt">' + excerpt + "</p>" +
          '<div class="book-meta">' +
            "<span>" + pages + " sayfa</span>" +
            "<strong>" + price + "</strong>" +
          "</div>" +
          '<div class="book-actions">' +
            '<a class="btn btn-ghost btn-block" href="book.html?id=' + id + '">Detayları Gör</a>' +
            '<button type="button" class="btn btn-primary btn-block js-add-cart" data-id="' + id + '">Sepete Ekle</button>' +
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
        var original = btn.textContent;
        btn.textContent = "Eklendi";
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
        }, 900);
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
