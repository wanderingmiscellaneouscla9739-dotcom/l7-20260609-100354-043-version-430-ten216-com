
(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-nav-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
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

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var next = parseInt(dot.getAttribute('data-hero-dot'), 10);
      showSlide(next);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var filterYear = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyFilters() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var category = filterCategory ? filterCategory.value : '';
    var year = filterYear ? filterYear.value : '';

    cards.forEach(function (card) {
      var textValue = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchedQuery = !query || textValue.indexOf(query) !== -1;
      var matchedCategory = !category || cardCategory === category;
      var matchedYear = !year || cardYear === year;
      card.classList.toggle('is-filtered-out', !(matchedQuery && matchedCategory && matchedYear));
    });
  }

  [filterInput, filterCategory, filterYear].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });
})();
