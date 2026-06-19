(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function activateSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activateSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activateSlide(activeIndex + 1);
      }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      if (!filterForm || !cards.length) {
        return;
      }
      var query = normalize(filterForm.querySelector('[name="q"]') && filterForm.querySelector('[name="q"]').value);
      var type = normalize(filterForm.querySelector('[name="type"]') && filterForm.querySelector('[name="type"]').value);
      var year = normalize(filterForm.querySelector('[name="year"]') && filterForm.querySelector('[name="year"]').value);
      var category = normalize(filterForm.querySelector('[name="category"]') && filterForm.querySelector('[name="category"]').value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-keywords'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    if (filterForm) {
      var params = new URLSearchParams(window.location.search);
      ['q', 'type', 'year', 'category'].forEach(function (name) {
        var field = filterForm.querySelector('[name="' + name + '"]');
        var value = params.get(name);
        if (field && value) {
          field.value = value;
        }
      });
      filterForm.addEventListener('input', applyFilters);
      filterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilters();
      });
      applyFilters();
    }
  });
})();
