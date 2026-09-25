/* =========================================================
   ANIMATIONS.JS
   Runs on every page. Handles:
   - PRELOADER   (branded logo intro, ~1.8s)
   - SPLIT TEXT  (word-by-word heading reveal, .split-text)
   - SCROLL REVEALS (.reveal fades/slides in on scroll)
   - PARALLAX    (hero background drifts on scroll, [data-parallax])
   - STAT COUNTERS ([data-count])
   - CUSTOM CURSOR (desktop pointer devices only)
   ========================================================= */
(function () {
  'use strict';
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- PRELOADER ---------- */
  var preloader = $('#preloader');
  if (preloader) {
    var hide = function () { preloader.classList.add('hide'); };
    if (reduceMotion) { hide(); }
    else {
      setTimeout(hide, 1900);
      window.addEventListener('load', function () { setTimeout(hide, 400); });
    }
  }

  /* ---------- SPLIT TEXT (word-by-word heading reveal) ---------- */
  $$('.split-text').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w, i) {
      return '<span style="transition-delay:' + (i * 0.05) + 's">' + w + '</span>';
    }).join(' ');
  });

  /* ---------- SCROLL REVEALS + SPLIT TEXT + STAT COUNTERS ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var current = 0;
    var step = Math.max(1, Math.round(target / 30));
    var timer = setInterval(function () {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = current;
    }, 40);
  }

  var revealTargets = $$('.reveal, .split-text, [data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        if (entry.target.hasAttribute('data-count')) animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    // No IntersectionObserver support, or reduced motion requested: show everything immediately
    revealTargets.forEach(function (el) {
      el.classList.add('in');
      if (el.hasAttribute('data-count')) el.textContent = el.getAttribute('data-count');
    });
  }

  /* Hero content should always be visible immediately (above the fold) */
  $$('.hero .reveal, .hero .split-text').forEach(function (el) { el.classList.add('in'); });

  /* ---------- PARALLAX (hero background) ---------- */
  if (!reduceMotion) {
    var parallaxEls = $$('[data-parallax]');
    if (parallaxEls.length) {
      window.addEventListener('scroll', function () {
        var y = window.scrollY;
        parallaxEls.forEach(function (el) {
          el.style.transform = 'translateY(' + (y * 0.18) + 'px)';
        });
      }, { passive: true });
    }
  }

  /* Magnetic button hover (desktop only) */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    $$('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.2;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* =========================================================
     CUSTOM CURSOR — small dot + fast-following ring.
     Automatically disabled on touch/coarse-pointer devices.
     ========================================================= */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.body.classList.add('custom-cursor');
    var dot = $('#cursor-dot');
    var ring = $('#cursor-ring');
    var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px)';

      var hoverTarget = e.target.closest ? e.target.closest('a, button, .chip, .acc > button, input, select, textarea, [data-lightbox]') : null;
      var viewTarget  = e.target.closest ? e.target.closest('[data-lightbox]') : null;
      ring.classList.toggle('hover', !!hoverTarget && !viewTarget);
      ring.classList.toggle('view', !!viewTarget);
      ring.textContent = viewTarget ? 'VIEW' : '';
    });

    (function loop() {
      ringX += (mouseX - ringX) * 0.4;
      ringY += (mouseY - ringY) * 0.4;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px)';
      requestAnimationFrame(loop);
    })();
  }
})();
