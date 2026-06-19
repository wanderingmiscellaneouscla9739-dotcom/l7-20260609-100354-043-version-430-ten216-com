(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });
        show(0);
        play();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement;
            var list = scope.querySelector("[data-filter-list]");
            var empty = scope.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var keywordInput = panel.querySelector("[data-filter-keyword]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(list.children);

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(keywordInput && keywordInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var okYear = !year || normalize(card.getAttribute("data-year")) === year;
                    var okType = !type || normalize(card.getAttribute("data-type")) === type;
                    var ok = okKeyword && okYear && okType;
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keywordInput, yearSelect, typeSelect].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", apply);
                    field.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
