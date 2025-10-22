(function(){
  function init() {
    const video = document.getElementById('video');
    if(!video) return;
    const url = window.__STREAM_URL__ || video.currentSrc || video.querySelector('source')?.src;
    if(!url) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && Hls.isSupported && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else init();
})();
