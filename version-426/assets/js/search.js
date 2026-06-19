
(function () {
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var title = document.getElementById('searchResultTitle');

  if (input) {
    input.value = query;
  }

  if (!results || !Array.isArray(window.SITE_MOVIES) && typeof SITE_MOVIES === 'undefined') {
    return;
  }

  var movies = typeof SITE_MOVIES !== 'undefined' ? SITE_MOVIES : window.SITE_MOVIES;
  var keyword = query.trim().toLowerCase();
  var matched = keyword ? movies.filter(function (movie) {
    return [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.category,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase().indexOf(keyword) !== -1;
  }) : movies.slice(0, 48);

  if (title) {
    title.textContent = keyword ? '搜索结果：' + query : '推荐内容';
  }

  if (!matched.length) {
    results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
    return;
  }

  results.innerHTML = matched.slice(0, 120).map(function (movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</p>',
      '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }).join('');

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
