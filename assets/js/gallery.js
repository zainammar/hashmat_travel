/* =========================================================
   GALLERY.JS
   Loaded on: International Tours, Domestic Tours, Gallery.
   Handles:
   - Category filter chips ([data-filter] + .item[data-category])
   - Gallery lightbox (click an image -> full view + caption)
   ========================================================= */
(function () {
  'use strict';
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- FILTER CHIPS ---------- */
  $$('[data-filter-group]').forEach(function (group) {
    var targetSelector = group.getAttribute('data-filter-group');
    $$('.chip', group).forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.chip', group).forEach(function (c) { c.classList.toggle('on', c === chip); });
        var key = chip.getAttribute('data-key');
        $$(targetSelector).forEach(function (item) {
          var show = key === 'all' || item.getAttribute('data-category') === key;
          item.style.opacity = 0;
          item.style.transform = 'scale(.96)';
          setTimeout(function () {
            item.classList.toggle('hide', !show);
            requestAnimationFrame(function () {
              item.style.opacity = 1;
              item.style.transform = '';
            });
          }, 200);
        });
      });
    });
  });

  /* ---------- LIGHTBOX ---------- */
  var lightbox = $('#lightbox');
  if (lightbox) {
    var lbImg = $('#lightbox-image');
    var lbCaption = $('#lightbox-caption');

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest ? e.target.closest('[data-lightbox]') : null;
      if (trigger) {
        var img = trigger.querySelector('img');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCaption.textContent = trigger.getAttribute('data-caption') || img.alt;
        lightbox.classList.add('open');
      }
      if (e.target.closest('#lightbox-close') || e.target === lightbox) {
        lightbox.classList.remove('open');
      }
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') lightbox.classList.remove('open');
    });
  }
})();
