var playbackControls = pbc = {
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
    btnPlay.onclick = function() { playr.play(); };
    btnPause.onclick = function() { playr.pause(); };
    progressBar.onclick = pbc.seek;
    volumeControl.onclick = pbc.setVolume;
    btnContinuous.onclick = pbc.setPlayToRandom;
    btnRandom.onclick = pbc.setPlayToContinuous;
    playbackControls.btnFullScreen.onclick = playbackControls.fullscreen;
    playbackControls.btnEndFullScreen.onclick = playbackControls.endFullScreen;
  },
  setUIToFullScreen: function() {
    playbackControls.btnFullScreen.style.display = 'none';
    playbackControls.btnEndFullScreen.style.display = 'inline';
  },
  setUIToNormalScreen: function() {
    playbackControls.btnFullScreen.style.display = 'inline';
    playbackControls.btnEndFullScreen.style.display = 'none';    
  },
  endFullScreen: function() {
    playr.updateStatus('END FULLSCREEN REQUESTED');
  },
  fullscreen: function() {
    playr.updateStatus('FULLSCREEN REQUESTED');
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
    var seekTime = ((pbc.getMousePositionX(event) - pbc.progressBar.offsetLeft) / pbc.progressBar.offsetWidth) * playr.player.getDuration();
    pbc.seekToSeconds(seekTime);
  },
  updateProgressTo: function(seekTime, totalTime) {
    var le_width = ((seekTime / totalTime)*progressBar.offsetWidth) || 0;
    progressSoFar.style.width = le_width+'px';
    pbc.timePassed.innerHTML = convertSecondsToTime(seekTime);
  },
  updateProgressBar: function() {
    playbackControls.updateProgressTo(playr.player.getCurrentTime(), playr.player.getDuration());
  },
  switchControlsToPaused: function() {
    pbc.btnPlay.style.display = 'inline';
    pbc.btnPause.style.display = 'none';
    pbc.updateProgressBar();
    window.clearInterval(window.timer);
    window.timer = undefined;    
  },
  switchControlsToPlay: function() {
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
    var newVolume = (pbc.getMousePositionX(event) - pbc.volumeControl.offsetLeft);
    newVolume = newVolume > 100 ? 100 : newVolume;
    getElement('slider').style.left = newVolume+'px';
    playr.player.setVolume(newVolume);
  },
  handleStatusChange: function(e) {
    switch (playr.status) {
      case 'YOUTUBE PLUGIN LOADED':
        pbc.initialize();
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
      case 'BROWSER NOW IN FULLSCREEN MODE':
        pbc.setUIToFullScreen();
      case 'FULLSCREEN ENDED':
        pbc.setUIToNormalScreen();
    };
  }
};

document.addEventListener("playrStatusChanged", playbackControls.handleStatusChange);
