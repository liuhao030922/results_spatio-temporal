window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "https://homes.cs.washington.edu/~kpar/nerfies/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  var wrapper = document.getElementById('interpolation-image-wrapper');
  if (!wrapper) {
    return;
  }
  wrapper.innerHTML = '';
  wrapper.appendChild(image);
}

function initializeComparisonVideos() {
  var videos = Array.from(document.querySelectorAll('.comparison-video'));
  if (!videos.length) {
    return;
  }

  var readyVideos = new Set();
  var completedVideos = new Set();
  var hasStarted = false;
  var isRestarting = false;

  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {});
    }
  }

  function restartCycle() {
    completedVideos.clear();
    isRestarting = false;

    videos.forEach(function(video) {
      video.pause();
      video.currentTime = 0;
    });

    requestAnimationFrame(function() {
      videos.forEach(playVideo);
    });
  }

  function maybeCompleteCycle(video) {
    if (completedVideos.has(video)) {
      return;
    }

    var duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    if (video.ended || duration - video.currentTime <= 0.12) {
      completedVideos.add(video);
      video.pause();

      if (completedVideos.size === videos.length && !isRestarting) {
        isRestarting = true;
        window.setTimeout(restartCycle, 120);
      }
    }
  }

  videos.forEach(function(video) {
    video.muted = true;
    video.playsInline = true;
    video.loop = false;

    var onReady = function() {
      readyVideos.add(video);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('loadedmetadata', onReady);

      if (!hasStarted && readyVideos.size === videos.length) {
        hasStarted = true;
        restartCycle();
      }
    };

    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('timeupdate', function() {
      maybeCompleteCycle(video);
    });
    video.addEventListener('ended', function() {
      maybeCompleteCycle(video);
    });

    if (video.readyState >= 1) {
      onReady();
    } else {
      video.load();
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var burgers = document.querySelectorAll('.navbar-burger');
  var menus = document.querySelectorAll('.navbar-menu');
  burgers.forEach(function(burger) {
    burger.addEventListener('click', function() {
      burgers.forEach(function(node) {
        node.classList.toggle('is-active');
      });
      menus.forEach(function(node) {
        node.classList.toggle('is-active');
      });
    });
  });

  var options = {
    slidesToScroll: 1,
    slidesToShow: 3,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  };

  var carousels = [];
  if (window.bulmaCarousel) {
    carousels = bulmaCarousel.attach('.carousel', options);
  }

  for (var i = 0; i < carousels.length; i++) {
    carousels[i].on('before:show', function(state) {
      console.log(state);
    });
  }

  var element = document.querySelector('#my-element');
  if (element && element.bulmaCarousel) {
    element.bulmaCarousel.on('before-show', function(state) {
      console.log(state);
    });
  }

  var interpolationSlider = document.getElementById('interpolation-slider');
  var interpolationWrapper = document.getElementById('interpolation-image-wrapper');
  if (interpolationSlider && interpolationWrapper) {
    preloadInterpolationImages();
    interpolationSlider.addEventListener('input', function() {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    interpolationSlider.max = NUM_INTERP_FRAMES - 1;
  }

  if (window.bulmaSlider) {
    bulmaSlider.attach();
  }

  initializeComparisonVideos();
});
