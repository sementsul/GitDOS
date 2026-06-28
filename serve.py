#!/usr/bin/env python3
"""Локальный статический сервер для DOSDisk с отключённым кэшем (no-store).
Запуск: python3 serve.py [порт]  (по умолчанию 3000, host 0.0.0.0)."""
import http.server, socketserver, os, sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
    print(f'DOSDisk на http://0.0.0.0:{PORT} (no-cache)')
    httpd.serve_forever()
