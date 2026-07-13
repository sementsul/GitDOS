# GitDOS — DOS в браузере, диск из GitHub

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/sementsul/GitDOS?style=flat-square&logo=github)](https://github.com/sementsul/GitDOS/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Website sementsul.github.io/GitDOS](https://img.shields.io/website?down_color=red&down_message=offline&label=Live%20Demo&style=flat-square&up_color=success&up_message=online&url=https%3A%2F%2Fsementsul.github.io%2FGitDOS)](https://sementsul.github.io/GitDOS)

**Автор:** Sementsul Maxim  
**Сайт:** [https://sementsul.github.io/GitDOS](https://sementsul.github.io/GitDOS)  
**Репозиторий:** [https://github.com/sementsul/GitDOS](https://github.com/sementsul/GitDOS)  
**Клиент для Windows:** [Скачать .exe (.zip)](https://github.com/sementsul/GitDOS/releases/download/1.0.0/GitDOS.zip)

> **Важно:** Ссылки на скачивание клиента и API-ключи необходимо заменить на актуальные перед публикацией.

---

📖 **О проекте**

GitDOS — это браузерный Git-клиент на основе DOSBox (движок js-dos v8), где диск `C:` — это ваш GitHub-репозиторий. Поддерживаются чтение, запись и автосохранение прямо в git. Дополнительные репозитории подключаются как папки `C:\DISKS\<буква>`.

Интерфейс выполнен в стиле установщика Windows 98, поддерживаются русский и английский языки.

---

## 📥 Скачать клиент

| Платформа | Инструкция |
|---|---|
| **Windows (готовый .exe)** | ⬇️ [Скачать GitDOS-win32-x64.zip](https://github.com/sementsul/GitDOS/releases/download/1.0.0/GitDOS.zip) |
| **macOS / Linux** | Собрать самостоятельно с помощью Nativefier:        ```bash npm install -g @gwicho38/nativefier             nativefier "https://sementsul.github.io/GitDOS" --platform mac   # или linux<br>``` |

---

## 🚀 Возможности

### 💾 Диски и Git

| Функция | Описание |
|---|---|
| **Диск = репозиторий** | Монтирование `C:` из публичного или приватного репозитория. Доп. диски `D:`, `E:`… |
| **Автосохранение** | Автоматический пуш новых/изменённых файлов в GitHub (по git-sha). Удаления тоже синхронизируются. |
| **Большие файлы (до 100 МБ)** | Через Git Data API (blob → tree → commit). Публичные файлы читаются через `raw.githubusercontent.com` (не тратят лимит API). |
| **Файлы >100 МБ** | Опционально — через GitHub Release. |
| **Профили подключения** | Наборы «главный репо + доп. диски». Переключение и дублирование. |
| **История диска** | «Машина времени»: просмотр снимков прошлых версий (только чтение), восстановление файлов. |
| **`.gitdos.json`** | Манифест: имя диска, автозапуск (`run`), скорость CPU (`cycles`). |

### 🖥️ Интерфейс и управление

| Функция | Описание |
|---|---|
| **Лаунчер** | Список программ (`.EXE`, `.COM`, `.BAT`) — запуск по клику. |
| **Выборочное монтирование** | Загрузка только нужных папок — быстрый старт больших дисков. |
| **Загрузка файлов** | Загрузка файлов и `.zip` (архивы распаковываются в выбранную папку). |
| **Экспорт/импорт** | Экспорт всего диска в `.zip` и импорт из `.zip`. |
| **Редактор автозагрузки** | Прямое редактирование `AUTOEXEC.BAT` / `CONFIG.SYS` в браузере. |
| **Поделиться ссылкой** | `?repo=owner/name` + QR-код. Публичные диски открываются одним кликом. |
| **Индикатор API** | Отображение оставшегося лимита GitHub API. |
| **Настройки DOSBox** | Управление `cycles`, звуком и другими параметрами. |
| **Сброс данных** | Очистка локальных данных (репозитории на GitHub не трогаются). |

### ⌨️ DOS-утилита GITDOS

Полноценный Git из командной строки DOS:

```bash
GITDOS              # Текущий статус
GITDOS SAVE         # Сохранить диск
GITDOS COMMIT "msg" # Сохранить с сообщением
GITDOS PULL         # Подтянуть изменения
GITDOS LOG          # Последние коммиты
GITDOS DIFF         # Несохранённые изменения
GITDOS BRANCHES     # Список веток
GITDOS BRANCH name  # Создать/переключить ветку
GITDOS MERGE branch # Слить ветку
GITDOS CHECKOUT sha # Снимок коммита (чтение)
GITDOS RESTORE file sha # Восстановить файл
GITDOS WHO          # Аккаунт GitHub + видимость репо
GITDOS HELP         # Полный список команд
