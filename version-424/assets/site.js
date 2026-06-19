(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startSlider() {
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startSlider();
            });
        });

        if (slides.length > 1) {
            startSlider();
        }
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var typeSelect = root.querySelector('[data-filter-type]');
        var list = document.querySelector('[data-filter-list]');

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || cardYear === year;
                var matchType = !type || cardType === type;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
            });
        }

        [input, yearSelect, typeSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        var streamUrl = video.getAttribute('data-video-url');
        var isReady = false;

        function attachStream() {
            if (isReady || !streamUrl) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                isReady = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                isReady = true;
                return;
            }

            video.src = streamUrl;
            isReady = true;
        }

        function startPlayback() {
            attachStream();
            player.classList.add('is-playing');
            video.controls = true;
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    });

    var searchResults = document.querySelector('[data-search-results]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchForm = document.querySelector('[data-search-form]');

    if (searchResults && searchInput && window.MOVIE_INDEX) {
        var params = new URLSearchParams(window.location.search);
        searchInput.value = params.get('q') || '';

        function createResultCard(item) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-wrap" href="./' + item.file + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
                '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '        <span class="poster-glow"></span>',
                '        <span class="play-chip">立即观看</span>',
                '    </a>',
                '    <div class="card-body">',
                '        <div class="card-meta">',
                '            <a href="./category-' + item.category + '.html">' + escapeHtml(item.categoryName) + '</a>',
                '            <span>' + escapeHtml(item.year) + '</span>',
                '        </div>',
                '        <h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>',
                '        <p>' + escapeHtml(item.oneLine) + '</p>',
                '        <div class="tag-row"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderResults() {
            var keyword = searchInput.value.trim().toLowerCase();
            var items = window.MOVIE_INDEX.filter(function (item) {
                if (!keyword) {
                    return true;
                }
                return item.searchText.indexOf(keyword) !== -1;
            }).slice(0, 120);

            searchResults.innerHTML = items.map(createResultCard).join('');
        }

        searchInput.addEventListener('input', renderResults);

        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var url = new URL(window.location.href);
                url.searchParams.set('q', searchInput.value.trim());
                window.history.replaceState({}, '', url.toString());
                renderResults();
            });
        }

        renderResults();
    }
})();
