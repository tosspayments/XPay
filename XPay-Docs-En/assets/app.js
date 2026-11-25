(function () {
  'use strict';

  // ── Copy code ──────────────────────────────────────────────
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.closest('.code').querySelector('code');
      if (!code) return;

      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('done');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('done');
        }, 1600);
      };

      // With file://, the clipboard API is unavailable, so fall back to the legacy method.
      var fallback = function () {
        var ta = document.createElement('textarea');
        ta.value = code.textContent;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = 'Copy failed'; }
        document.body.removeChild(ta);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code.textContent).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  // ── Mobile table of contents toggle ────────────────────────
  var menu = document.querySelector('.menu');
  var side = document.getElementById('side');
  if (menu && side) {
    var openLabel = menu.textContent;
    var openAria = menu.getAttribute('aria-label') || '';
    var closeLabel = menu.getAttribute('data-label-close') || openLabel;
    var setMenu = function (open) {
      side.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-label', open ? closeLabel : openAria);
      menu.classList.toggle('on', open);
    };
    menu.addEventListener('click', function () {
      setMenu(!side.classList.contains('open'));
    });
    // Close the menu after choosing a page (including anchors on the same page).
    side.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && side.classList.contains('open')) { setMenu(false); menu.focus(); }
    });
    // Reset when the window grows back to desktop width.
    var mqDesk = window.matchMedia('(min-width: 821px)');
    var onDesk = function () { if (mqDesk.matches) setMenu(false); };
    if (mqDesk.addEventListener) mqDesk.addEventListener('change', onDesk); else mqDesk.addListener(onDesk);
  }

  // Shorter search placeholder on small screens.
  var qInput = document.getElementById('q');
  if (qInput && qInput.getAttribute('data-placeholder-short')) {
    var longPh = qInput.getAttribute('placeholder');
    var shortPh = qInput.getAttribute('data-placeholder-short');
    var mqSmall = window.matchMedia('(max-width: 820px)');
    var applyPh = function () { qInput.setAttribute('placeholder', mqSmall.matches ? shortPh : longPh); };
    applyPh();
    if (mqSmall.addEventListener) mqSmall.addEventListener('change', applyPh); else mqSmall.addListener(applyPh);
  }

  // "On this page" as a collapsible block at the top of the page when the right-hand TOC is hidden.
  var tocAside = document.querySelector('.toc');
  var tocList = tocAside && tocAside.querySelector('ul');
  var article = document.querySelector('.prose');
  if (tocList && article) {
    var details = document.createElement('details');
    details.className = 'toc-mobile';
    var summary = document.createElement('summary');
    var titleEl = tocAside.querySelector('.toc-title');
    summary.textContent = titleEl ? titleEl.textContent : 'On this page';
    details.appendChild(summary);
    details.appendChild(tocList.cloneNode(true));
    var h1 = article.querySelector('h1');
    var after = h1 ? h1.nextElementSibling : article.firstElementChild;
    article.insertBefore(details, after);
    details.addEventListener('click', function (e) {
      if (e.target.closest('a')) details.open = false;
    });
  }

  // ── Search ─────────────────────────────────────────────────
  var q = document.getElementById('q');
  var box = document.getElementById('results');
  var index = window.__INDEX__ || [];
  var isStatic = !!window.__STATIC__;
  var root = document.body.getAttribute('data-root') || '';

  function pageHref(page) {
    return isStatic ? root + page + '.html' : 'index.php?p=' + encodeURIComponent(page);
  }
  var hits = [];
  var cursor = -1;

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function mark(text, term) {
    var i = text.toLowerCase().indexOf(term.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + term.length))
      + '</mark>' + esc(text.slice(i + term.length));
  }

  function search(term) {
    var t = term.trim();
    if (t.length < 1) return [];
    var lower = t.toLowerCase();
    var out = [];

    index.forEach(function (doc) {
      // Prioritize title matches.
      if (doc.title.toLowerCase().indexOf(lower) >= 0) {
        out.push({ doc: doc, kind: 'title', label: doc.title, score: 0 });
        return;
      }
      // Parameter matches
      var m = doc.params.filter(function (p) {
        return p.toLowerCase().indexOf(lower) >= 0;
      });
      if (m.length) {
        out.push({ doc: doc, kind: 'param', label: m.slice(0, 3).join(', '), score: 1, count: m.length });
      }
    });

    out.sort(function (a, b) { return a.score - b.score; });
    return out.slice(0, 12);
  }

  function draw() {
    if (!hits.length) {
      box.innerHTML = '<div class="r-empty">No results. Try a parameter name or page title.</div>';
      box.hidden = false;
      return;
    }
    var term = q.value.trim();
    box.innerHTML = hits.map(function (h, i) {
      var sub = h.kind === 'title'
        ? h.doc.page
        : 'Parameters: ' + mark(h.label, term) + (h.count > 3 ? ' and ' + (h.count - 3) + ' more' : '');
      var title = h.kind === 'title' ? mark(h.doc.title, term) : esc(h.doc.title);
      return '<a href="' + pageHref(h.doc.page) + '"'
        + (i === cursor ? ' class="on"' : '') + '>'
        + '<div class="r-title">' + title + '</div>'
        + '<div class="r-sub">' + sub + '</div></a>';
    }).join('');
    box.hidden = false;
  }

  if (q && box) {
    q.addEventListener('input', function () {
      hits = search(q.value);
      cursor = -1;
      if (q.value.trim() === '') { box.hidden = true; return; }
      draw();
    });

    q.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        cursor += e.key === 'ArrowDown' ? 1 : -1;
        if (cursor < 0) cursor = hits.length - 1;
        if (cursor >= hits.length) cursor = 0;
        draw();
      } else if (e.key === 'Enter' && cursor >= 0) {
        e.preventDefault();
        location.href = pageHref(hits[cursor].doc.page);
      } else if (e.key === 'Escape') {
        box.hidden = true;
        q.blur();
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search')) box.hidden = true;
    });

    // Press slash to focus the search box
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== q) {
        e.preventDefault();
        q.focus();
      }
    });
  }

  // ── Highlight the current section in the right-hand TOC ────
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (links.length) {
    var targets = links.map(function (a) {
      return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    });

    var tick = function () {
      var y = window.scrollY + 120;
      var active = -1;
      targets.forEach(function (el, i) {
        if (el && el.offsetTop <= y) active = i;
      });
      links.forEach(function (a, i) {
        a.classList.toggle('on', i === active);
      });
    };

    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { tick(); queued = false; });
    }, { passive: true });
    tick();
  }
})();
