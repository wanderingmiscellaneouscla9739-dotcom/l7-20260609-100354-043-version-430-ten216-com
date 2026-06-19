
(function () {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-play-button]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('src');
  var prepared = false;
  var hlsInstance = null;

  function preparePlayer() {
    if (prepared || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      prepared = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      prepared = true;
    }
  }

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function startPlayback() {
    preparePlayer();
    hideButton();
    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', hideButton);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
