/* =========================================================
   MAIN.JS
   Runs on every page. Handles:
   - HEADER  (solid background after scroll, back-to-top button)
   - NAVIGATION (full-screen mobile menu)
   - FAQ ACCORDION (Hajj & Umrah / Visa pages)
   - TESTIMONIALS (auto-rotating slider on Home)
   - NEWSLETTER (footer form -> php/newsletter.php)
   - FOOTER (current year)
   ========================================================= */
(function () {
  'use strict';
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- HEADER ---------- */
  var header = $('header');
  var topBtn = $('#top');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('s', y > 60);
    if (topBtn) topBtn.classList.toggle('s', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (topBtn) topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- NAVIGATION (mobile) ---------- */
  var nav = $('#nav');
  var burger = $('.burger');
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('o', open);
    if (burger) burger.setAttribute('aria-expanded', open);
    document.body.classList.toggle('lock', open);
  }
  if (burger) burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('o'));
  });
  $$('#nav a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- FAQ ACCORDION ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.acc > button') : null;
    if (!btn) return;
    var acc = btn.parentNode;
    var open = acc.classList.toggle('o');
    btn.setAttribute('aria-expanded', open);
  });

  /* ---------- TESTIMONIALS ---------- */
  var quotes = $$('.testimonial-slider blockquote');
  var dots = $$('#testimonial-dots .chip');
  var current = 0;
  function showQuote(i) {
    current = i;
    quotes.forEach(function (q, j) { q.classList.toggle('on', i === j); });
    dots.forEach(function (d, j) { d.classList.toggle('on', i === j); });
  }
  if (quotes.length) {
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { showQuote(i); });
    });
    setInterval(function () { showQuote((current + 1) % quotes.length); }, 5000);
  }

  /* ---------- CONTACT PAGE ENQUIRY FORM ---------- */
  var contactForm = $('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var errorBox = $('.field-error', contactForm);
      var successBox = $('.form-success', contactForm);
      errorBox.textContent = '';
      successBox.style.display = 'none';

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      fetch(contactForm.getAttribute('action'), { method: 'POST', body: new FormData(contactForm) })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          if (data.ok) {
            successBox.textContent = data.message;
            successBox.style.display = 'block';
            contactForm.reset();
          } else {
            errorBox.textContent = data.message || 'Something went wrong. Please try again.';
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          errorBox.textContent = 'This form needs a PHP-enabled server to send. It will work once uploaded to hosting — meanwhile, please WhatsApp us.';
        });
    });
  }

  /* ---------- NEWSLETTER FORM ---------- */
  var nlForm = $('#newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('#newsletter-message');
      msg.style.color = '';
      msg.textContent = 'Sending…';
      fetch(nlForm.getAttribute('action'), { method: 'POST', body: new FormData(nlForm) })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          msg.textContent = data.message;
          msg.style.color = data.ok ? 'var(--gold)' : '#ff8a8a';
          if (data.ok) nlForm.reset();
        })
        .catch(function () {
          msg.style.color = '#ff8a8a';
          msg.textContent = 'This form needs a PHP-enabled server to send. It will work once uploaded to hosting.';
        });
    });
  }

  /* ---------- FOOTER YEAR ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
