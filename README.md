# Kate birthday

Статический сайт на HTML, CSS и JavaScript для GitHub Pages. Сборка не нужна.

## Структура

```text
.
├── index.html
├── 404.html
├── css/style.css
├── js/config.js
├── js/main.js
├── assets/images/
└── .github/workflows/deploy-pages.yml
```

Тексты, пожелания и список фото меняются в `js/config.js`.

## Локальный запуск

Откройте `index.html` в браузере или поднимите простой сервер из корня репозитория:

```bash
python3 -m http.server 8080
```

Сайт будет на [http://localhost:8080](http://localhost:8080).

Пути к CSS, JS и картинкам относительные, поэтому страница работает и локально, и по адресу `https://<user>.github.io/kate/`.

## Публикация на GitHub Pages

1. Settings → Pages.
2. Source: **GitHub Actions**.
3. После мержа в `main` workflow `Deploy GitHub Pages` выложит сайт.

Либо без Actions: Source → **Deploy from a branch**, branch `main`, folder `/ (root)`.
