// Theme picker: cycles auto -> light -> dark and remembers the choice.
// "auto" follows the OS (prefers-color-scheme); light/dark set data-theme on
// <html> to override it. Pairs with the theme-token mixins in style.scss and
// the anti-flash inline script in _layouts/default.html.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  var ORDER = ['auto', 'light', 'dark'];
  var LABEL = { auto: '◐ Auto', light: '☀︎ Light', dark: '☾︎ Dark' };

  function current() {
    try {
      var t = localStorage.getItem('theme');
      return (t === 'light' || t === 'dark') ? t : 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function apply(mode) {
    if (mode === 'light' || mode === 'dark') {
      root.setAttribute('data-theme', mode);
    } else {
      root.removeAttribute('data-theme');
    }
    try {
      if (mode === 'auto') {
        localStorage.removeItem('theme');
      } else {
        localStorage.setItem('theme', mode);
      }
    } catch (e) {}
    btn.textContent = LABEL[mode];
    btn.setAttribute('aria-label', 'Color theme: ' + LABEL[mode] + ' (click to change)');
  }

  apply(current());

  btn.addEventListener('click', function () {
    var next = ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length];
    apply(next);
  });
})();
