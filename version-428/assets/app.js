(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        showSlide(idx);
      });
    });
    setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var searchInput = document.querySelector("[data-search-input]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var typeFilter = document.querySelector("[data-type-filter]");
  var noResult = document.querySelector("[data-no-result]");

  var normalize = function (value) {
    return String(value || "").toLowerCase().trim();
  };

  var applyFilter = function () {
    if (!cards.length) {
      return;
    }
    var q = normalize(searchInput && searchInput.value);
    var y = normalize(yearFilter && yearFilter.value);
    var t = normalize(typeFilter && typeFilter.value);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-year")
      ].join(" "));
      var matchQuery = !q || haystack.indexOf(q) !== -1;
      var matchYear = !y || normalize(card.getAttribute("data-year")) === y;
      var matchType = !t || normalize(card.getAttribute("data-type")) === t;
      var show = matchQuery && matchYear && matchType;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });
    if (noResult) {
      noResult.classList.toggle("show", visible === 0);
    }
  };

  [searchInput, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilter);
      control.addEventListener("change", applyFilter);
    }
  });
}());

function initMoviePlayer(source) {
  var video = document.getElementById("movieVideo");
  var button = document.getElementById("playButton");
  if (!video || !button || !source) {
    return;
  }

  var attached = false;
  var requested = false;
  var hls = null;

  var tryPlay = function () {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (!video.paused) {
          return;
        }
        button.classList.remove("is-hidden");
      });
    }
  };

  var attachSource = function () {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (requested) {
          tryPlay();
        }
      });
      return;
    }
    video.src = source;
  };

  var start = function () {
    requested = true;
    attachSource();
    button.classList.add("is-hidden");
    tryPlay();
  };

  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended && video.currentTime === 0) {
      button.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
