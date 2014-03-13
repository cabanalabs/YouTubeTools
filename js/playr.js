var playr = {
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
    };
    return true;
  },
  updateStatus: function(newStatus) {
    playr.status = newStatus;
    document.dispatchEvent(playr.stateChanged);
  },
  playerStateChanged: function(newState) {
    var videoStates = {
        UNSTARTED : -1,
        ENDED : 0,
        PLAYING : 1,
        PAUSED : 2,
        BUFFERING : 3,
        QUEUED : 5
    };
    switch (newState) {
      case videoStates.PLAYING:
        playr.updateStatus('VIDEO IS PLAYING');
        break;
      case videoStates.PAUSED:
        playr.updateStatus('VIDEO HAS PAUSED');
        break;
      case videoStates.STOPPED:
        playr.updateStatus('VIDEO HAS PAUSED');
        break;
      case videoStates.ENDED:
        playr.updateStatus('VIDEO HAS ENDED');
        break;
      case videoStates.UNSTARTED:
        setUIToPaused();
        break;
      case videoStates.BUFFERING:
        // Show busy signal
        break;
      case videoStates.QUEUED:
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
  play: function() {
    playr.player.playVideo();
  },
  pause: function() {
    playr.player.pauseVideo();
  }
};
