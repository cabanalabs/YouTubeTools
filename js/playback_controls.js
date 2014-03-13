var playbackControls = {
  btnPlay: getElement('btnPlay'),
  btnPause: getElement('btnPause'),
  progressBar: getElement('progressBar'),
  progressSoFar: getElement('progressSoFar'),
  timePassed: getElement('timePassed'),
  volumeControl: getElement('volumeControl'),
  initialize: function() {
    btnPlay.onclick = function() { playr.play(); };
    btnPause.onclick = function() { playr.pause(); };
    progressBar.onclick = playbackControls.seek;
    volumeControl.onclick = playbackControls.setVolume;
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
      case 'PLAYR STARTED':
        pbc.initialize();;
        break;
      case 'VIDEO IS PLAYING':
        pbc.switchControlsToPlay();
        break;
      case 'VIDEO HAS PAUSED':
        pbc.switchControlsToPaused();
        break;
      case 'VIDEO HAS ENDED':
        alert('ended!');
        break;
    };
  }
};

document.addEventListener("playrStatusChanged", playbackControls.handleStatusChange);
