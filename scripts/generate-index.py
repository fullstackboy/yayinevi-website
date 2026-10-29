#!/usr/bin/env python3
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS_PATH = ROOT / "data" / "books.js"
INDEX_PATH = ROOT / "index.html"


def escape(value):
    return html.escape(str(value), quote=True).replace("&#x27;", "&#39;")


def truncate(text, max_length):
    clean = str(text or "").strip()
    if len(clean) <= max_length:
        return clean
    return clean[: max_length - 1].rstrip() + "…"


def create_book_card(book):
    title = escape(book["title"])
    author = escape(book["author"])
    category = escape(book.get("category", ""))
    excerpt = escape(truncate(book.get("description", ""), 140))
    cover = escape(book.get("cardCover") or book["cover"])
    book_id = escape(book["id"])
    price = escape(book["price"])
    return "\n".join(
        [
            '            <article class="book-card">',
            f'              <a class="book-cover book-cover-link" href="book.html?id={book_id}" aria-label="{title} kitabının detaylarını görüntüle">',
            f'                <img src="{cover}" alt="{title} kapak görseli" width="400" height="600" loading="lazy" decoding="async">',
            "              </a>",
            '              <div class="book-body">',
            *(
                [f'                <p class="book-category">{category}</p>']
                if category
                else []
            ),
            f'                <h3><a class="book-title-link" href="book.html?id={book_id}">{title}</a></h3>',
            f'                <p class="book-author">{author}</p>',
            f'                <a class="book-excerpt-link" href="book.html?id={book_id}"><p class="book-excerpt">{excerpt}</p></a>',
            '                <div class="book-footer">',
            f'                  <div class="book-price"><strong class="price-value">{price} TL</strong></div>',
            f'                  <button type="button" class="btn btn-primary btn-cart js-add-cart" data-id="{book_id}">',
            '                    <svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true" focusable="false"><path d="M5 8h14l1 13H4L5 8zM9 8V6a3 3 0 0 1 6 0v2"/></svg>',
            '                    <span class="btn-label">Sepete Ekle</span>',
            "                  </button>",
            "                </div>",
            "              </div>",
            "            </article>",
        ]
    )


def main():
    source = BOOKS_PATH.read_text(encoding="utf-8")
    data_start = source.index("window.BOOKS_DATA")
    array_start = source.index("[", data_start)
    books, _ = json.JSONDecoder().raw_decode(source[array_start:])
    if not isinstance(books, list):
        raise ValueError("data/books.js must define window.BOOKS_DATA as an array.")

    catalog = "\n".join(
        [
            "        <h1>Kitaplarımız</h1>",
            '        <div id="books-error" class="state-box state-error" hidden role="alert"></div>',
            '        <div id="books-layout" class="books-layout">',
            '          <aside class="category-sidebar" aria-label="Kategoriler">',
            '            <h2 class="category-title">Kategoriler</h2>',
            '            <nav id="category-nav" class="category-nav"></nav>',
            "          </aside>",
            '          <div id="books-grid" class="books-grid">',
            "\n".join(create_book_card(book) for book in books),
            "          </div>",
            "        </div>",
        ]
    )

    index_html = INDEX_PATH.read_text(encoding="utf-8")
    pattern = re.compile(
        r"        <!-- BEGIN GENERATED BOOK CATALOG -->.*?"
        r"        <!-- END GENERATED BOOK CATALOG -->",
        re.DOTALL,
    )
    if not pattern.search(index_html):
        raise ValueError("Could not find the generated catalog markers in index.html.")

    updated_html = pattern.sub(
        lambda _: "        <!-- BEGIN GENERATED BOOK CATALOG -->\n"
        + catalog
        + "\n        <!-- END GENERATED BOOK CATALOG -->",
        index_html,
        count=1,
    )
    INDEX_PATH.write_text(updated_html, encoding="utf-8")


if __name__ == "__main__":
    main()
