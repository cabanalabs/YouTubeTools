var playbackControls = {
  btnPlay: getElement('btnPlay'),
  btnPause: getElement('btnPause'),
  progressBar: getElement('progressBar'),
  progressSoFar: getElement('progressSoFar'),
  timePassed: getElement('timePassed'),
  volumeControl: getElement('volumeControl'),
  btnRandom: getElement('btnRandom'),
  btnContinuous: getElement('btnContinuous'),
  btnFullScreen: getElement('btnFullScreen'),
  btnEndFullScreen: getElement('btnEndFullScreen'),
  initialize: function() {
    var pbc = playbackControls;
    btnPlay.onclick = function() { playr.play(); };
    btnPause.onclick = function() { playr.pause(); };
    progressBar.onclick = pbc.seek;
    volumeControl.onclick = pbc.setVolume;
    btnContinuous.onclick = pbc.setPlayToRandom;
    btnRandom.onclick = pbc.setPlayToContinuous;
    playbackControls.addFullScreenEvents();
  },
  setUIToFullScreen: function() {
    playr.player.classList.add('FullScreen');
    playbackControls.btnFullScreen.style.display = 'none';
    playbackControls.btnEndFullScreen.style.display = 'inline';
  },
  setUIToNormalScreen: function() {
    player.classList.remove('FullScreen');
    playbackControls.btnFullScreen.style.display = 'inline';
    playbackControls.btnEndFullScreen.style.display = 'none';    
  },
  addFullScreenEvents: function() {
    if (playr.player.requestFullScreen) {
      document.addEventListener("fullscreenchange", playbackControls.switchBetweenNormalAndFullScreen);
    } else if (playr.player.mozRequestFullScreen) {
      document.addEventListener("mozfullscreenchange", playbackControls.switchBetweenNormalAndFullScreen);
    } else if (playr.player.webkitRequestFullScreen) {
      document.addEventListener("webkitfullscreenchange", playbackControls.switchBetweenNormalAndFullScreen);
    }
    
    playbackControls.btnFullScreen.onclick = playbackControls.fullscreen;
    playbackControls.btnEndFullScreen.onclick = playbackControls.endFullScreen;
  },
  switchBetweenNormalAndFullScreen: function(e) {
    //pause();
    //storeCurrentTime();    
    isFullScreen = false;

    if (playr.player.requestFullScreen) {
      isFullScreen = document.fullscreen;
    } else if (playr.player.mozRequestFullScreen) {
      isFullScreen = document.mozFullScreen;
    } else if (playr.player.webkitRequestFullScreen) {
      isFullScreen = document.webkitIsFullScreen;
    }
    if (isFullScreen) {
      playbackControls.setUIToFullScreen();
    } else {
      playbackControls.setUIToNormalScreen();
    }
  },
  endFullScreen: function() {
    if (playr.player.requestFullScreen) {
      document.canceltFullScreen();
    } else if (playr.player.mozRequestFullScreen) {
      document.mozCancelFullScreen();
    } else if (playr.player.webkitRequestFullScreen) {
      document.webkitCancelFullScreen();
    }
  },
  fullscreen: function() {
    if (playr.player.requestFullScreen) {
      playr.player.requestFullScreen();
    } else if (playr.player.mozRequestFullScreen) {
      playr.player.mozRequestFullScreen();
    } else if (playr.player.webkitRequestFullScreen) {
      playr.player.webkitRequestFullScreen();
    }
  },
  setPlayToRandom: function () {    
    btnRandom.style.display = 'inline-block';
    btnContinuous.style.display = 'none';
    playr.updateStatus('PLAYBACK SET TO RANDOM');
  },
  setPlayToContinuous: function() {
    btnRandom.style.display = 'none';
    btnContinuous.style.display = 'inline-block';    
    playr.updateStatus('PLAYBACK SET TO CONTINUOUS');
  },
  getMousePositionX: function(e) {
    // Mouse position
    var x = 0;
    if(!e){ e = window.event; }
    if (e.pageX) {
      x = e.pageX;
    } else if (e.clientX) {
      x = e.clientX;
    }
    return x;
  },
  seekToSeconds: function(seekTime) {
    playbackControls.updateProgressTo(seekTime, playr.player.getDuration());
    playr.player.seekTo(seekTime, true);
  },
  seek: function(event) {
    var pbc = playbackControls;
    var seekTime = ((pbc.getMousePositionX(event) - pbc.progressBar.offsetLeft) / pbc.progressBar.offsetWidth) * playr.player.getDuration();
    pbc.seekToSeconds(seekTime);
  },
  updateProgressTo: function(seekTime, totalTime) {
    var pbc = playbackControls;
    var le_width = ((seekTime / totalTime)*progressBar.offsetWidth) || 0;
    progressSoFar.style.width = le_width+'px';
    pbc.timePassed.innerHTML = convertSecondsToTime(seekTime);
  },
  updateProgressBar: function() {
    playbackControls.updateProgressTo(playr.player.getCurrentTime(), playr.player.getDuration());
  },
  switchControlsToPaused: function() {
    var pbc = playbackControls;
    pbc.btnPlay.style.display = 'inline';
    pbc.btnPause.style.display = 'none';
    pbc.updateProgressBar();
    window.clearInterval(window.timer);
    window.timer = undefined;    
  },
  switchControlsToPlay: function() {
    var pbc = playbackControls;
    pbc.btnPlay.style.display = 'none';
    pbc.btnPause.style.display = 'inline';
    if (typeof window.timer == 'undefined') {
      window.timer = setInterval(function() {
        pbc.updateProgressBar();
      },1000);
    }

    //if (pbc.storedTime > 0.0) {
    //  pbc.seekToSeconds(pbc.storedTime);
    //  pbc.storedTime = 0.0;
    //}
  },
  setVolume: function(event) {
    var pbc = playbackControls;
    var newVolume = (pbc.getMousePositionX(event) - pbc.volumeControl.offsetLeft);
    newVolume = newVolume > 100 ? 100 : newVolume;
    getElement('slider').style.left = newVolume+'px';
    playr.player.setVolume(newVolume);
  },
  handleStatusChange: function(e) {
    var pbc = playbackControls;
    switch (playr.status) {
      case 'YOUTUBE PLUGIN LOADED':
        pbc.initialize();;
        break;
      case 'VIDEO IS PLAYING':
        pbc.switchControlsToPlay();
        break;
      case 'VIDEO HAS PAUSED':
        pbc.switchControlsToPaused();
        break;
      case 'VIDEO HAS ENDED':
        pbc.switchControlsToPaused();
        break;
    };
  }
};

document.addEventListener("playrStatusChanged", playbackControls.handleStatusChange);
