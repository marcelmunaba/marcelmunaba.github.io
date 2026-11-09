// Custom controls for the demo video. Without JS the native controls stay on.
(function () {
    var root = document.querySelector("[data-player]");
    if (!root) return;
    var video = root.querySelector("video");
    var bar = root.querySelector(".player__bar");
    var playBtn = root.querySelector("[data-play]");
    var bigBtn = root.querySelector("[data-big-play]");
    var muteBtn = root.querySelector("[data-mute]");
    var fsBtn = root.querySelector("[data-fullscreen]");
    var track = root.querySelector("[data-track]");
    var fill = root.querySelector("[data-fill]");
    var time = root.querySelector("[data-time]");

    video.controls = false;
    root.classList.add("is-enhanced");

    function fmt(s) {
        s = Math.max(0, Math.floor(s || 0));
        return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    }

    function render() {
        var d = video.duration || 0;
        var p = d ? video.currentTime / d : 0;
        fill.style.transform = "scaleX(" + p + ")";
        track.setAttribute("aria-valuenow", Math.round(p * 100));
        track.setAttribute("aria-valuetext", fmt(video.currentTime) + " of " + fmt(d));
        time.textContent = fmt(video.currentTime) + " / " + fmt(d);
    }

    function syncState() {
        var playing = !video.paused;
        root.classList.toggle("is-paused", !playing);
        playBtn.textContent = playing ? "Pause" : "Play";
        playBtn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
        muteBtn.textContent = video.muted ? "Sound off" : "Sound on";
        muteBtn.setAttribute("aria-pressed", String(!video.muted));
    }

    function toggle() {
        if (video.paused) {
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
        } else {
            video.pause();
        }
    }

    playBtn.addEventListener("click", toggle);
    bigBtn.addEventListener("click", toggle);
    video.addEventListener("click", toggle);
    muteBtn.addEventListener("click", function () {
        video.muted = !video.muted;
        syncState();
    });

    if (document.fullscreenEnabled || video.webkitEnterFullscreen) {
        fsBtn.addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (root.requestFullscreen) {
                root.requestFullscreen();
            } else if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen();
            }
        });
    } else {
        fsBtn.hidden = true;
    }

    function seekTo(clientX) {
        var r = track.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
        if (video.duration) video.currentTime = p * video.duration;
        render();
    }
    var dragging = false;
    track.addEventListener("pointerdown", function (e) {
        dragging = true;
        track.setPointerCapture(e.pointerId);
        seekTo(e.clientX);
    });
    track.addEventListener("pointermove", function (e) { if (dragging) seekTo(e.clientX); });
    track.addEventListener("pointerup", function () { dragging = false; });
    track.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowRight" ? 2 : e.key === "ArrowLeft" ? -2 : 0;
        if (!step) return;
        e.preventDefault();
        video.currentTime = Math.min(video.duration || 0, Math.max(0, video.currentTime + step));
    });

    root.addEventListener("keydown", function (e) {
        if (e.target !== root && e.target !== video) return;
        if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
        if (e.key === "m") { video.muted = !video.muted; syncState(); }
    });

    ["play", "pause", "volumechange"].forEach(function (ev) { video.addEventListener(ev, syncState); });
    ["timeupdate", "loadedmetadata", "seeked"].forEach(function (ev) { video.addEventListener(ev, render); });

    // smooth progress while playing
    (function loop() {
        if (!video.paused) render();
        requestAnimationFrame(loop);
    })();

    bar.hidden = false;
    syncState();
    render();
})();
