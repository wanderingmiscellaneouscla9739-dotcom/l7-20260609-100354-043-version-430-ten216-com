(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function getQuery() {
        return new URLSearchParams(window.location.search).get("q") || "";
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"movie-card-link\" href=\"" + escapeHtml(movie.path) + "\">" +
            "<span class=\"movie-thumb\">" +
            "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"movie-shade\"></span>" +
            "<span class=\"play-badge\">▶</span>" +
            "<span class=\"corner-badge\">" + escapeHtml(movie.type) + "</span>" +
            "</span>" +
            "<span class=\"movie-card-body\">" +
            "<strong>" + escapeHtml(movie.title) + "</strong>" +
            "<span class=\"movie-line\">" + escapeHtml(movie.oneLine) + "</span>" +
            "<span class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.views) + "热度</span></span>" +
            "<span class=\"tag-row\">" + tags + "</span>" +
            "</span>" +
            "</a>" +
            "</article>";
    }

    function run() {
        var input = document.querySelector("[data-search-page-input]");
        var results = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        var movies = window.SEARCH_MOVIES || [];
        if (!input || !results) {
            return;
        }
        var initial = getQuery();
        input.value = initial;

        function apply() {
            var keyword = normalize(input.value);
            var list;
            if (keyword) {
                list = movies.filter(function (movie) {
                    return normalize([
                        movie.title,
                        movie.year,
                        movie.region,
                        movie.type,
                        movie.genre,
                        movie.oneLine,
                        (movie.tags || []).join(" ")
                    ].join(" ")).indexOf(keyword) !== -1;
                }).slice(0, 120);
            } else {
                list = movies.slice(0, 60);
            }
            results.innerHTML = list.map(renderCard).join("");
            if (title) {
                title.textContent = keyword ? "搜索结果：" + input.value : "热门影片";
            }
        }

        input.addEventListener("input", apply);
        apply();
    }

    ready(run);
})();
