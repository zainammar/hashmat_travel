/* =========================================================
   BOOKING.JS
   Loaded only on pages that include the Travel Planner form
   (Home, Hajj & Umrah, International Tours, Domestic Tours,
   Contact Us). Handles:
   - Adults / Children +/- counters
   - Automatic "number of nights" calculation
   - Client-side validation (name, phone, arrival < departure)
   - Submission to php/submit-travel-plan.php via fetch
   NOTE: client-side validation is a convenience only.
   php/submit-travel-plan.php re-validates everything, because
   JavaScript validation alone is never trustworthy.
   ========================================================= */
(function () {
  'use strict';
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  $$('.planner-form').forEach(function (form) {
    /* Prevent selecting a past date */
    var today = new Date().toISOString().slice(0, 10);
    $$('input[type="date"]', form).forEach(function (input) { input.min = today; });

    /* Adults / Children counters */
    $$('[data-count-btn]', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var display = btn.parentNode.querySelector('[data-count-value]');
        var isAdults = btn.closest('.field').getAttribute('data-field') === 'adults';
        var min = isAdults ? 1 : 0;
        var val = parseInt(display.textContent, 10);
        var delta = parseInt(btn.getAttribute('data-count-btn'), 10);
        val = Math.max(min, Math.min(20, val + delta));
        display.textContent = val;
      });
    });

    /* Auto-calculate number of nights */
    var arrival = $('[name="arrival_date"]', form);
    var departure = $('[name="departure_date"]', form);
    var nights = $('[name="nights"]', form);
    function updateNights() {
      if (arrival && departure && arrival.value && departure.value && nights) {
        var diff = Math.round((new Date(departure.value) - new Date(arrival.value)) / 86400000);
        nights.value = diff > 0 ? diff : '';
      }
    }
    if (arrival) arrival.addEventListener('change', updateNights);
    if (departure) departure.addEventListener('change', updateNights);

    /* Submit handler */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errorBox = $('.field-error.form-level', form);
      var successBox = $('.form-success', form);
      $$('.field.bad', form).forEach(function (f) { f.classList.remove('bad'); });
      if (errorBox) errorBox.textContent = '';
      if (successBox) successBox.style.display = 'none';

      var name = $('[name="full_name"]', form);
      var phone = $('[name="phone"]', form);
      var invalid = false;

      if (!name.value.trim()) { name.closest('.field').classList.add('bad'); invalid = true; }
      if (!phone.value.trim()) { phone.closest('.field').classList.add('bad'); invalid = true; }
      if (invalid) {
        if (errorBox) errorBox.textContent = 'Please enter your name and phone number.';
        return;
      }
      if (arrival && departure && arrival.value && departure.value &&
          new Date(departure.value) <= new Date(arrival.value)) {
        departure.closest('.field').classList.add('bad');
        if (errorBox) errorBox.textContent = 'Departure date must be after the arrival date.';
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      fetch(form.getAttribute('action'), { method: 'POST', body: new FormData(form) })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          if (data.ok) {
            if (successBox) { successBox.textContent = data.message; successBox.style.display = 'block'; }
            form.reset();
            updateNights();
          } else if (errorBox) {
            errorBox.textContent = data.message || 'Something went wrong. Please try again or WhatsApp us directly.';
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          if (errorBox) errorBox.textContent = 'This form needs a PHP-enabled server to send. It will work once uploaded to hosting — meanwhile, please WhatsApp us.';
        });
    });
  });
})();
