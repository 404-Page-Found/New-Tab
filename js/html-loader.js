// js/html-loader.js - Loads HTML components from separate files, then initializes scripts

(async function () {
  var components = [
    { id: 'corner-buttons-placeholder', file: 'html/components/corner-buttons.html' },
    { id: 'search-bar-placeholder', file: 'html/components/search-bar.html' },
    { id: 'app-grid-placeholder', file: 'html/components/app-grid.html' },
    { id: 'todo-section-placeholder', file: 'html/components/todo-section.html' },
    { id: 'settings-modal-placeholder', file: 'html/components/settings-modal.html' },
    { id: 'add-app-modal-placeholder', file: 'html/components/add-app-modal.html' },
    { id: 'motto-placeholder', file: 'html/components/motto.html' },
    { id: 'footer-placeholder', file: 'html/components/footer.html' },
  ];

  await Promise.all(components.map(async function (comp) {
    var el = document.getElementById(comp.id);
    if (!el) return;
    try {
      var resp = await fetch(comp.file);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var html = await resp.text();
      var temp = document.createElement('div');
      temp.innerHTML = html.trim();
      el.replaceWith.apply(el, Array.from(temp.childNodes));
    } catch (e) {
      console.warn('Failed to load component ' + comp.file + ':', e);
    }
  }));

  var scripts = [
    'js/utils.js',
    'js/main.js',
    'js/app-manager.js',
    'js/search-engine.js',
    'js/drag-drop.js',
    'js/add-app.js',
    'js/color-picker.js',
    'js/languages.js',
    'js/settings.js',
    'js/context-menu.js',
    'js/update-checker.js',
    'js/onboarding.js',
    'js/todo.js',
  ];

  for (var i = 0; i < scripts.length; i++) {
    await (function (src) {
      return new Promise(function (resolve) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = function () {
          console.warn('Failed to load script: ' + src);
          resolve();
        };
        document.body.appendChild(script);
      });
    })(scripts[i]);
  }

  // Programmatically focus search input since autofocus doesn't work on dynamically loaded elements
  var searchInput = document.querySelector('.search-bar input');
  if (searchInput) searchInput.focus();
})();
