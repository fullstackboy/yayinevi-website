# Darül Hidaye Yayınevi Sitesi

Statik yayınevi kataloğu. Kitaplar tek kaynaktan okunur: `data/books.js`

Bu yapı sayesinde HTML dosyasını doğrudan açsanız da (`file://`) kitaplar yüklenir. GitHub Pages ile de çalışır.

## Google arama görünürlüğü

SEO dosyaları (`robots.txt`, `sitemap.xml` ve `favicon.svg`) sitenin kök dizininde sunulmalıdır. Yeni bir kitap eklendiğinde, Google'ın ürün detay sayfasını keşfedebilmesi için `sitemap.xml` dosyasına `book.html?id=<kitap-id>` adresini de ekleyin. Sepet sayfası arama sonuçlarına dahil edilmez.

Yayına aldıktan sonra Google Search Console'da `https://darulhidayeyayinlari.com/` alan adını doğrulayın ve `https://darulhidayeyayinlari.com/sitemap.xml` site haritasını gönderin.

## Açma

`index.html` dosyasına çift tıklayın veya:

```bash
cd darul-hidaye-website
python3 -m http.server 8080
```

## WhatsApp numarası

`js/main.js` içinde:

```js
WHATSAPP_NUMBER: "905XXXXXXXXX"
```

## Yeni kitap ekleme

Yalnızca `data/books.js` içindeki `window.BOOKS_DATA` dizisine yeni bir nesne ekleyin. Kapağı `images/books/` altına koyun.
