var playr = {
  videoStates: {
    UNSTARTED : -1,
    ENDED : 0,
    PLAYING : 1,
    PAUSED : 2,
    BUFFERING : 3,
    QUEUED : 5
  },
  status: 'off',
  defaultVideoId: 'QcvjoWOwnn4',
  videoId: null,
  playerId: null,
  player: null,
  stateChanged: new CustomEvent(
    "playrStatusChanged",
    {
      detail: {
        status: 'Status changed'
      },
      bubbles: true,
      cancelable: false
    }
  ),
  handleStatusChange: function(e) {
    switch(playr.status) {
      case 'PLAYR STARTED':
        playr.loadYouTubeObject();
        break;
      case 'YOUTUBE PLUGIN LOADED':
        break;
      case 'FULLSCREEN REQUESTED':
        playr.makeFullScreen();
        break;
      case 'END FULLSCREEN REQUESTED':
        playr.endFullScreen();
        break;
      case 'BROWSER NOW IN FULLSCREEN MODE':
        playr.setUIToFullScreen();
      case 'FULLSCREEN ENDED':
        playr.setUIToNormalScreen();
    };
    return true;
  },
  setUIToFullScreen: function() {
    playr.player.classList.add('FullScreen');
  },
  setUIToNormalScreen: function() {
    playr.player.classList.remove('FullScreen');
  },
  switchBetweenNormalAndFullScreen: function(e) {
    isFullScreen = false;

    if (playr.player.requestFullScreen) {
      isFullScreen = document.fullscreen;
    } else if (playr.player.mozRequestFullScreen) {
      isFullScreen = document.mozFullScreen;
    } else if (playr.player.webkitRequestFullScreen) {
      isFullScreen = document.webkitIsFullScreen;
    }
    if (isFullScreen) {
      playr.updateStatus('BROWSER NOW IN FULLSCREEN MODE');
    } else {
      playr.updateStatus('FULSCREEN ENDED');
    }
  },
  makeFullScreen: function() {
    if (playr.player.requestFullScreen) {
      document.addEventListener("fullscreenchange", playr.switchBetweenNormalAndFullScreen);
      playr.player.requestFullScreen();
    } else if (playr.player.mozRequestFullScreen) {
      document.addEventListener("fullscreenchange", playr.switchBetweenNormalAndFullScreen);
      playr.player.mozRequestFullScreen();
    } else if (playr.player.webkitRequestFullScreen) {
      document.addEventListener("webkitfullscreenchange", playr.switchBetweenNormalAndFullScreen);
      playr.player.webkitRequestFullScreen();
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
  updateStatus: function(newStatus) {
    playr.status = newStatus;
    document.dispatchEvent(playr.stateChanged);
  },
  playerStateChanged: function(newState) {
    switch (newState) {
      case playr.videoStates.PLAYING:
        playr.updateStatus('VIDEO IS PLAYING');
        break;
      case playr.videoStates.PAUSED:
        playr.updateStatus('VIDEO HAS PAUSED');
        break;
      case playr.videoStates.STOPPED:
        playr.updateStatus('VIDEO HAS PAUSED');
        break;
      case playr.videoStates.ENDED:
        playr.updateStatus('VIDEO HAS ENDED');
        break;
      case playr.videoStates.UNSTARTED:
        setUIToPaused();
        break;
      case playr.videoStates.BUFFERING:
        // Show busy signal
        break;
      case playr.videoStates.QUEUED:
        alert('queued');
        break;
    }
  },
  youTubeIsReady: function(playerId) {
    playr.playerId = playerId;
    playr.player = getElement(playerId);
    playr.player.addEventListener('onStateChange', 'playr.playerStateChanged');
    playr.updateStatus('YOUTUBE PLUGIN LOADED');
  },
  loadYouTubeObject: function() {
    onYouTubePlayerReady = playr.youTubeIsReady;
    swfobject.embedSWF(
      'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=playerScreen',
      'playerScreen', "100%", "100%", "9", null,  null, 
      { allowScriptAccess: "always", allowFullScreen: 'true' }, 
      { id: 'playerScreen', name: 'playerScreen' }
    );
  },
  start: function() {
    document.addEventListener("playrStatusChanged", playr.handleStatusChange);
    playr.updateStatus('PLAYR STARTED');
  },
  pauseOrPlay: function() {
    if (playr.player.getPlayerState() == playr.videoStates.PLAYING) {
      playr.pause();
    } else {
      playr.play();
    }
  },
  play: function() {
    playr.player.playVideo();
  },
  pause: function() {
    playr.player.pauseVideo();
  }
};
