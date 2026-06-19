(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.hasAttribute('hidden');
      if (isOpen) {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.textContent = '×';
      } else {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = '☰';
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var filterInput = document.querySelector('.page-filter-input');
  var yearFilter = document.querySelector('.page-year-filter');
  var filterList = document.querySelector('.filter-list');

  if (filterInput && filterInput.dataset.queryParam) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get(filterInput.dataset.queryParam);
    if (queryValue) {
      filterInput.value = queryValue;
    }
  }

  function applyFilter() {
    if (!filterList) {
      return;
    }
    var keyword = normalize(filterInput ? filterInput.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.category,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.year
      ].join(' '));
      var matchText = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = !year || card.dataset.year === year;
      card.classList.toggle('is-hidden', !(matchText && matchYear));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilter);
  }

  applyFilter();

  function preparePlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');

    if (!video || !button) {
      return;
    }

    function startPlayback() {
      var stream = video.dataset.stream;
      if (!stream) {
        return;
      }

      if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.dataset.ready = 'native';
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.dataset.ready = 'hls';
        } else {
          video.src = stream;
          video.dataset.ready = 'fallback';
        }
      }

      player.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(preparePlayer);
})();
