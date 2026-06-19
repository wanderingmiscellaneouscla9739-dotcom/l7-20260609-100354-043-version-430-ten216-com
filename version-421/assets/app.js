(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var minis = Array.prototype.slice.call(hero.querySelectorAll('.hero-mini'));
        var index = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === index);
            });
            minis.forEach(function (mini, position) {
                mini.classList.toggle('active', position === index);
            });
        }

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-target') || 0));
                startHero();
            });
        });

        minis.forEach(function (mini) {
            mini.addEventListener('mouseenter', function () {
                showSlide(Number(mini.getAttribute('data-target') || 0));
                startHero();
            });
        });

        startHero();
    }

    var searchInput = document.getElementById('searchInput');
    var filterType = document.getElementById('filterType');
    var filterYear = document.getElementById('filterYear');
    var filterCategory = document.getElementById('filterCategory');
    var searchCards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
    var searchEmpty = document.getElementById('searchEmpty');

    if (searchInput && searchCards.length) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        searchInput.value = initial;

        function matchCard(card) {
            var keyword = searchInput.value.trim().toLowerCase();
            var typeValue = filterType ? filterType.value : '';
            var yearValue = filterYear ? filterYear.value : '';
            var categoryValue = filterCategory ? filterCategory.value : '';
            var text = card.getAttribute('data-keywords') || '';
            var okKeyword = !keyword || text.indexOf(keyword) !== -1;
            var okType = !typeValue || card.getAttribute('data-type') === typeValue;
            var okYear = !yearValue || card.getAttribute('data-year') === yearValue;
            var okCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
            return okKeyword && okType && okYear && okCategory;
        }

        function applySearch() {
            var visible = 0;
            searchCards.forEach(function (card) {
                var match = matchCard(card);
                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });
            if (searchEmpty) {
                searchEmpty.classList.toggle('show', visible === 0);
            }
        }

        [searchInput, filterType, filterYear, filterCategory].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applySearch);
                element.addEventListener('change', applySearch);
            }
        });

        applySearch();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var source = player.querySelector('source');
        var cover = player.querySelector('.player-cover');
        var ready = false;
        var hls = null;

        function prepare() {
            if (!video || !source || ready) {
                return;
            }
            var src = source.getAttribute('src');
            if (!src) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
            ready = true;
        }

        function play() {
            prepare();
            if (cover) {
                cover.classList.add('hide');
            }
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('hide');
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
