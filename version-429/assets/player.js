(function() {
  function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-video");
    var startButton = document.getElementById("player-start");
    var overlay = document.querySelector(".player-overlay");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !startButton || !overlay || !streamUrl) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      loaded = true;
    }

    function hideOverlay() {
      overlay.classList.add("is-hidden");
    }

    function showOverlay() {
      if (!video.ended) {
        overlay.classList.remove("is-hidden");
      }
    }

    function beginPlayback() {
      loadStream();
      hideOverlay();

      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function() {
          showOverlay();
        });
      }
    }

    startButton.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      beginPlayback();
    });

    overlay.addEventListener("click", function(event) {
      event.preventDefault();
      beginPlayback();
    });

    video.addEventListener("click", function() {
      if (video.paused) {
        beginPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
