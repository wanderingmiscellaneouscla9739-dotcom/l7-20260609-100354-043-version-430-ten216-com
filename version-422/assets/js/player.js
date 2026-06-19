(function () {
    var hlsPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function attachStream(video, url) {
        if (video.getAttribute("data-ready") === "1") {
            return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.setAttribute("data-ready", "1");
            return Promise.resolve();
        }
        return loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
                video.setAttribute("data-ready", "1");
                return new Promise(function (resolve) {
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    setTimeout(resolve, 1200);
                });
            }
            video.src = url;
            video.setAttribute("data-ready", "1");
            return Promise.resolve();
        });
    }

    function start(shell) {
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");
        var url = shell.getAttribute("data-stream");
        if (!video || !url) {
            return;
        }
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        attachStream(video, url).then(function () {
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }).catch(function () {
            video.src = url;
            var retry = video.play();
            if (retry && typeof retry.catch === "function") {
                retry.catch(function () {});
            }
        });
    }

    function setup() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (shell) {
            var overlay = shell.querySelector(".player-overlay");
            var video = shell.querySelector("video");
            if (overlay) {
                overlay.addEventListener("click", function () {
                    start(shell);
                });
            }
            if (video) {
                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start(shell);
                    }
                });
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup);
    } else {
        setup();
    }
})();
