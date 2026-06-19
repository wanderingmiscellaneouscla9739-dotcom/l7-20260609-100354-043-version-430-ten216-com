(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobileNav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('active', position === current);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('active', position === current);
      dot.setAttribute('aria-current', position === current ? 'true' : 'false');
    });
  }

  function restartHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    restartHero();

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restartHero();
      });
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var empty = document.querySelector('[data-empty]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardMatches(card, query, typeValue, yearValue, regionValue) {
    var haystack = [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();

    if (query && haystack.indexOf(query) === -1) {
      return false;
    }

    if (typeValue && card.getAttribute('data-type') !== typeValue) {
      return false;
    }

    if (yearValue && card.getAttribute('data-year') !== yearValue) {
      return false;
    }

    if (regionValue && card.getAttribute('data-region') !== regionValue) {
      return false;
    }

    return true;
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput && filterInput.value);
    var typeValue = typeSelect ? typeSelect.value : '';
    var yearValue = yearSelect ? yearSelect.value : '';
    var regionValue = regionSelect ? regionSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var matched = cardMatches(card, query, typeValue, yearValue, regionValue);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');

  if (filterInput && q) {
    filterInput.value = q;
  }

  [filterInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });

  applyFilter();
})();
