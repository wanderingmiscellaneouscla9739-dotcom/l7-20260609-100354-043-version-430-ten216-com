(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-target]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-target')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var input = panel.querySelector('[data-page-search]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var region = panel.querySelector('[data-filter-region]');
    var empty = panel.querySelector('[data-empty-result]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }
    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }
    function apply() {
      var keyword = normalize(input ? input.value : '');
      var selectedYear = normalize(year ? year.value : '');
      var selectedType = normalize(type ? type.value : '');
      var selectedRegion = normalize(region ? region.value : '');
      var visibleCount = 0;
      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matched = true;
        if (keyword && search.indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        if (selectedType && cardType !== selectedType) {
          matched = false;
        }
        if (selectedRegion && cardRegion !== selectedRegion) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visibleCount === 0);
      }
    }
    [input, year, type, region].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (window.__hlsLoadingPromise) {
      return window.__hlsLoadingPromise;
    }
    window.__hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window.__hlsLoadingPromise;
  }

  function attachSource(video, source) {
    if (!source) {
      return Promise.reject(new Error('empty source'));
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }
    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.__hlsInstance = hls;
        return new Promise(function (resolve) {
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 1800);
        });
      }
      video.src = source;
      return Promise.resolve();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video[data-src]');
      var button = player.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      function start() {
        var source = video.getAttribute('data-src');
        button.classList.add('hidden');
        if (video.getAttribute('data-ready') === 'true') {
          video.play().catch(function () {});
          return;
        }
        attachSource(video, source).then(function () {
          video.setAttribute('data-ready', 'true');
          video.controls = true;
          video.play().catch(function () {
            button.classList.remove('hidden');
          });
        }).catch(function () {
          button.classList.remove('hidden');
        });
      }
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== 'true') {
          start();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
