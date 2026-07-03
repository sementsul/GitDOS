/*! GitDOS embed SDK — вставь GitDOS (DOS-терминал с диском из GitHub-репозитория) на свой сайт.
 *
 *  Публичный репозиторий (только чтение, без токена):
 *      <div id="dos"></div>
 *      <script src="https://<host>/embed.js"></script>
 *      <script>GitDOS.mount('#dos', { repo:'owner/name', run:'GAME.EXE' });</script>
 *
 *  Приватный репозиторий или запись назад (нужен токен):
 *      GitDOS.mount('#dos', { repo:'owner/name', token:'github_pat_...', run:'GAME.EXE' });
 *
 *  🔴 БЕЗОПАСНОСТЬ: токен даёт доступ к репозиторию. Он передаётся в iframe через postMessage
 *  (в URL/историю НЕ попадает), но всё равно присутствует в JS твоей страницы — поэтому
 *  вставляй GitDOS с токеном ТОЛЬКО на доверенной/закрытой странице. Для публичных данных
 *  токен не нужен вовсе. Используй fine-grained токен с минимальными правами на один репозиторий.
 *
 *  Опции mount(target, opts) — те же настройки, что в интерфейсе GitDOS:
 *    repo (обяз.) 'owner/name' · token · branch (по умолч. main) · path · run (автозапуск, напр. 'GAME.EXE')
 *    disks  — доп. диски D:/E:…: [{ letter:'D', repo, branch, path, token, exclude }]
 *    cmds   — массив DOS-команд, выполнить после старта · exclude — не монтировать эти папки/файлы C:
 *    cycles — скорость CPU ('auto'|'max'|число|'fixed 3000') · muted — звук выкл (true/false) · lang — 'ru'|'en'
 *    net    — сеть IPX: { on:true, room:'myroom', backend:'wss://…' } · programs/programsToken — каталог Store
 *    src    — URL index.html GitDOS (по умолч. рядом с embed.js) · width/height ('100%'/'480px')
 *    bar    — false: спрятать панель кнопок и командную строку (только экран)
 *    allowOrigin — принимать команды только с этого origin (доп. защита)
 *  Возвращает handle:
 *    .on('ready'|'mounted'|'error'|'configured', cb) · .reconfigure({...}) · .destroy()
 *    .run(program) · .type(cmd) · .setLang(l) · .setCycles(v) · .setMute(b) · .setNet(n) · .getConfig()
 *    .saveHardware({machine,memsize,core,cputype,cycles,sbtype,pcspeaker}) · .getHardware()
 *    .call(method, ...args) — вызвать любой метод window.GitDOS внутри iframe (возвращает Promise)
 */
(function (global) {
  // куда указывает GitDOS (index.html) — по умолчанию рядом с этим скриптом
  var DEFAULT_SRC = (function () {
    try {
      var s = document.currentScript && document.currentScript.src;
      if (s) return s.replace(/embed\.js(\?.*)?$/, 'index.html');
    } catch (_) {}
    return 'index.html';
  })();

  function mount(target, opts) {
    opts = opts || {};
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) throw new Error('GitDOS.mount: контейнер не найден: ' + target);
    if (!opts.repo) throw new Error('GitDOS.mount: не задан repo (owner/name)');

    var u = new URL(opts.src || DEFAULT_SRC, location.href);
    u.searchParams.set('embed', '1');
    if (opts.bar === false) u.searchParams.set('bar', '0');
    if (opts.allowOrigin) u.searchParams.set('origin', opts.allowOrigin);
    // весь конфиг (включая репо/токен) доставляем через postMessage после 'ready' — в URL ничего не кладём
    // (токен не должен попадать в историю/referrer/логи; репо тоже шлём сообщением — единый путь, без двойного монтирования).

    var iframe = document.createElement('iframe');
    iframe.src = u.toString();
    iframe.style.border = '0';
    iframe.style.width = opts.width || '100%';
    iframe.style.height = opts.height || '480px';
    iframe.setAttribute('title', 'GitDOS');
    iframe.setAttribute('allow', 'clipboard-write; fullscreen; microphone');
    el.appendChild(iframe);

    var targetOrigin = u.origin;                 // куда безопасно слать токен (не '*')
    var handlers = { ready: [], mounted: [], error: [], configured: [] };
    function emit(name, data) { (handlers[name] || []).forEach(function (f) { try { f(data); } catch (_) {} }); }
    // передаём ПОЛНЫЙ конфиг (те же поля, что настраиваются в UI)
    function cfgFromOpts() {
      return { repo: opts.repo, branch: opts.branch, path: opts.path, token: opts.token, run: opts.run,
        disks: opts.disks, cmds: opts.cmds, exclude: opts.exclude, cycles: opts.cycles, muted: opts.muted,
        lang: opts.lang, net: opts.net, hardware: opts.hardware, ai: opts.ai, programs: opts.programs, programsToken: opts.programsToken, settings: opts.settings };
    }
    function send(cfg) {
      iframe.contentWindow.postMessage({ source: 'gitdos-host', type: 'gitdos:config',
        config: cfg || cfgFromOpts() }, targetOrigin);
    }
    // RPC: вызвать метод window.GitDOS внутри iframe, получить результат промисом
    var rpcId = 0, rpcWaiters = {};
    function call(method) {
      var args = Array.prototype.slice.call(arguments, 1);
      var id = ++rpcId;
      return new Promise(function (resolve, reject) {
        rpcWaiters[id] = { resolve: resolve, reject: reject };
        iframe.contentWindow.postMessage({ source: 'gitdos-host', type: 'gitdos:call', id: id, method: method, args: args }, targetOrigin);
      });
    }

    window.addEventListener('message', function (ev) {
      if (ev.source !== iframe.contentWindow) return;         // только от нашего iframe
      var d = ev.data; if (!d || d.source !== 'gitdos') return;
      if (d.type === 'gitdos:ready') { emit('ready', d); send(); }          // доставляем конфиг (включая токен) после ready
      else if (d.type === 'gitdos:mounted') emit('mounted', d);
      else if (d.type === 'gitdos:configured') emit('configured', d);
      else if (d.type === 'gitdos:error') emit('error', d);
      else if (d.type === 'gitdos:result') { var w = rpcWaiters[d.id]; if (w) { delete rpcWaiters[d.id];
        d.ok ? w.resolve(d.value) : w.reject(new Error(d.error || 'gitdos rpc error')); } }
    });

    return {
      iframe: iframe,
      on: function (name, cb) { (handlers[name] || (handlers[name] = [])).push(cb); return this; },
      reconfigure: function (cfg) { opts = Object.assign(opts, cfg || {}); send(); return this; },
      call: call,
      run: function (program) { return call('run', program); },
      type: function (cmd) { return call('type', cmd); },
      setLang: function (l) { return call('setLang', l); },
      setCycles: function (v) { return call('setCycles', v); },
      setMute: function (b) { return call('setMute', b); },
      setNet: function (n) { return call('setNet', n); },
      setAi: function (ai) { return call('setAi', ai); },                 // 🔴 ключ/модель ассистента Claude (секрет!)
      publishProgram: function (spec) { return call('publishProgram', spec); },  // опубликовать программу в Store своего каталога
      saveHardware: function (hw) { return call('saveHardware', hw); },   // сохранить «железо» (локально + репо при токене)
      getHardware: function () { return call('getHardware'); },
      getConfig: function () { return call('getConfig'); },
      stop: function () { return call('stop'); },
      destroy: function () { try { el.removeChild(iframe); } catch (_) {} }
    };
  }

  global.GitDOS = Object.assign(global.GitDOS || {}, { mount: mount });
})(window);
