(function() {
  function toggleMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    if (slides.length) {
      show(0);
      start();
    }
  }

  function setupCardFilter() {
    var panel = document.querySelector(".filter-panel");
    if (!panel) {
      return;
    }

    var input = panel.querySelector("[data-filter-input]");
    var select = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));

    function filter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      cards.forEach(function(card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("hidden-card", !(matchesKeyword && matchesYear));
      });
    }

    if (input) {
      input.addEventListener("input", filter);
    }
    if (select) {
      select.addEventListener("change", filter);
    }
  }

  function setupSearchPage() {
    var results = document.getElementById("search-results");
    var input = document.getElementById("site-search-input");
    if (!results || !input || !window.MovieIndex) {
      return;
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function buildCard(movie) {
      var article = document.createElement("article");
      article.className = "movie-card";
      article.innerHTML =
        '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="card-year">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '</div>';
      return article;
    }

    function search() {
      var keyword = input.value.trim().toLowerCase();
      var matched = window.MovieIndex.filter(function(movie) {
        if (!keyword) {
          return true;
        }
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          movie.tags.join(" ")
        ].join(" ").toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      results.innerHTML = "";
      if (!matched.length) {
        var empty = document.createElement("div");
        empty.className = "search-results-empty";
        empty.textContent = "没有找到匹配内容";
        results.appendChild(empty);
        return;
      }

      matched.forEach(function(movie) {
        results.appendChild(buildCard(movie));
      });
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    var form = document.getElementById("site-search-form");
    if (form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var query = input.value.trim();
        window.history.replaceState(null, "", "./search.html" + (query ? "?q=" + encodeURIComponent(query) : ""));
        search();
      });
    }

    input.addEventListener("input", search);
    search();
  }

  document.addEventListener("DOMContentLoaded", function() {
    toggleMobileMenu();
    setupHero();
    setupCardFilter();
    setupSearchPage();
  });
})();
