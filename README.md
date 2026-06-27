# GitDOS — DOS в браузере с диском из GitHub

**Автор: Sementsul Maxim.** Репозиторий: https://github.com/sementsul/GitDOS
Страница проекта тут: https://sementsul.github.io/GitDOS/
Браузерный клиент DOSBox (**js-dos v8**, локально), где диск C: — это GitHub-репозиторий
(чтение/запись/автосохранение). Доп. репозитории подключаются как папки `C:\DISKS\<буква>`.
Дизайн — в стиле установщика Windows 98. Лицензии движка — см. `THIRD-PARTY.md`.

## Запуск локально
```
python3 serve.py        # http://localhost:3000 (no-cache)
# или: python3 -m http.server 5173 --bind 0.0.0.0
```
Открой http://localhost:5173

## Статус (фазы)
- **Фаза 1 (есть):** загрузка диска из GitHub-репо / по ссылке → запуск в DOSBox.
- **Фаза 2 (частично):** выгрузка изменённой ФС → «Скачать ZIP». Push в GitHub — TODO.
- **Фаза 3 (под ревью ПМ):** Google Drive / Yandex Disk по OAuth — секреты, красная зона.

## Безопасность
GitHub-токен и любые секреты вводит пользователь в браузере; в код/репозиторий не попадают.
OAuth (Google/Yandex) — только после согласования с ПМ.

Подробности и грабли — `docs/project-notes.md`.
