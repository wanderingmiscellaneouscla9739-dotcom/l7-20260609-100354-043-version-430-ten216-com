(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var overlay = shell.querySelector('[data-player-overlay]');
      var status = document.querySelector('[data-player-status]');

      if (!video) {
        return;
      }

      var source = video.getAttribute('data-source');
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }

      function attachSource() {
        if (!source) {
          setStatus('播放源暂不可用');
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('已启用原生 HLS 播放');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放线路已就绪');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
              setStatus('网络波动，正在重新连接');
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
              setStatus('媒体解码恢复中');
            } else {
              hlsInstance.destroy();
              setStatus('当前浏览器暂时无法播放该线路');
            }
          });
          return;
        }

        video.src = source;
        setStatus('浏览器将尝试直接播放该线路');
      }

      function playVideo() {
        hideOverlay();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setStatus('请再次点击播放器开始播放');
          });
        }
      }

      attachSource();

      if (button) {
        button.addEventListener('click', playVideo);
      }

      video.addEventListener('play', hideOverlay);
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
