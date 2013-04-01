// I think this ensures the reading of the whole chunk 
// of code before it gets executed.
(function(window) {
  var getElement = function(id) {
    return document.getElementById(id);
  }
  
  var getVideoIdsFromAddress = function(address) {
    var match = address.match(/([?\&]v\=)([\w-,]+)/gi);
    var videoIds = [];
    if (match != null) {
      var videoIds = match[0].substr(3).split(',');
      for (index in videoIds) {
        videoIds.push(videoIds[index]);
      }
    }
    return videoIds;
  }

  var getVideoIdsFromAddressBar = function() {
    return getVideoIdsFromAddress(window.location.toString());
  }

  var player = getElement('player');
  var video = getElement('playerScreen');
  var btnPlay = getElement('btnPlay');
  var btnPause = getElement('btnPause');
  var btnFullScreen = getElement('btnFullScreen');
  var btnEndFullScreen = getElement('btnEndFullScreen');
  var txtVideoUrl = getElement('txtVideoUrl');

  var progressBar = getElement('progressBar');
  var progressSoFar = getElement('progressSoFar');
  var timePassed = getElement('timePassed');

  var btnAddVideo = getElement('btnAddVideo');
  var btnRandom = getElement('btnRandom');
  var btnContinuous = getElement('btnContinuous');
  var videoIds = getVideoIdsFromAddressBar();
  var videoStates = {
      UNSTARTED : -1,
      ENDED : 0,
      PLAYING : 1,
      PAUSED : 2,
      BUFFERING : 3,
      QUEUED : 5
  };
  var continuousPlayback = true;
  
  if (videoIds.length == 0) { videoIds = ['8bqKXN3-cY4'] }; // Default video.

  play = function() {
    video.playVideo();
  }

  pause = function() {
    video.pauseVideo();
  }

  addVideoId = function(id) {
  }

  addVideo = function() {
    alert('add to playlist');
  }

  setPlayToRandom = function () {    
    btnRandom.style.display = 'inline-block';
    btnContinuous.style.display = 'none';
    continuousPlayback = false;
  }

  setPlayToContinuous = function() {
    btnRandom.style.display = 'none';
    btnContinuous.style.display = 'inline-block';    
    continuousPlayback = true;
  }

  seek = function() {
    var seekToSeconds = ((getMousePositionX(event) - progressBar.offsetLeft) / progressBar.offsetWidth) * video.getDuration();
    refreshWidthTo(seekToSeconds, video.getDuration());    
    video.seekTo(seekToSeconds, true);    
  }

  var getMousePositionX = function(e) {
    // Mouse position
    var x = 0;
    if(!e){ e = window.event; }
    if (e.pageX) {
      x = e.pageX;
    } else if (e.clientX) {
      x = e.clientX;
    }
    return x;
  }  

  var zeroPad = function(number) {
    return (number > 9 ? number : '0'+number);
  }  

  var convertSecondsToTime = function(secs) {
    var hours = Math.floor(secs / (60 * 60));
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
    return zeroPad(hours)+':'+zeroPad(minutes)+':'+zeroPad(seconds);
  }

  var refreshWidthToCurrent = function() {
    refreshWidthTo(video.getCurrentTime(), video.getDuration());
  }

  var refreshWidthTo = function(seekTime, totalTime) {    
    progressSoFar.style.width = ((seekTime / totalTime)*progressBar.offsetWidth)+'px';
    timePassed.innerHTML = convertSecondsToTime(seekTime);
  }  

  var setUIToPlaying = function() {
    btnPlay.style.display = 'none';
    btnPause.style.display = 'inline';
    if (typeof window.timer == 'undefined') {
      window.timer = setInterval(function() {
        refreshWidthToCurrent();
      },1000);
    }    
  }

  var setUIToPaused = function() {
    btnPlay.style.display = 'inline';
    btnPause.style.display = 'none';
    refreshWidthToCurrent();
    clearInterval(window.timer);
    window.timer = undefined;    
  }

  var setUIToFullScreen = function() {
    player.classList.add('FullScreen');
    btnFullScreen.style.display = 'none';
    btnEndFullScreen.style.display = 'inline';
  }

  var setUIToNormalScreen = function() {
    player.classList.remove('FullScreen');
    btnFullScreen.style.display = 'inline';
    btnEndFullScreen.style.display = 'none';    
  }

  var playNext = function() {

  }

  window.playerStateChanged = function(newState) {
    if (newState == videoStates.PLAYING) {
      setUIToPlaying();
    } else if (newState == videoStates.PAUSED) {
      setUIToPaused();
    } else if (newState == videoStates.STOPPED) {
      setUIToPaused();
    } else if (newState == videoStates.ENDED) {
      setUIToPaused();      
      if (video.getDuration() == video.getCurrentTime()) {
        playNext();
      }      
    } else if (newState == videoStates.UNSTARTED) {
      setUIToPaused();          
    } else if (newState == videoStates.BUFFERING) {
      // Show busy signal
    } else if (newState == videoStates.QUEUED) {
      alert('queued');
    } else {
      alert('Please handle state: '+newState);
    }
  }

  window.checkFullScreen = function(event) {
    alert('screen change');    
  }

  var addFullScreenEvents = function() {
    fullScreenChange = function(e) {
      isFullScreen = false;
      if (player.requestFullScreen) {
        isFullScreen = document.fullscreen;
      } else if (player.mozRequestFullScreen) {
        isFullScreen = document.mozFullScreen;
      } else if (player.webkitRequestFullScreen) {
        isFullScreen = document.webkitIsFullScreen;
      }
      if (isFullScreen) {
        setUIToFullScreen();        
      } else {
        setUIToNormalScreen();
        
      }
    }

    endFullScreen = function() {
      if (player.requestFullScreen) {
        document.canceltFullScreen();      
      } else if (player.mozRequestFullScreen) {
        document.mozCancelFullScreen();      
      } else if (player.webkitRequestFullScreen) {
        document.webkitCancelFullScreen();      
      }    
    }

    fullscreen = function() {    
      if (player.requestFullScreen) {
        player.requestFullScreen();
      } else if (player.mozRequestFullScreen) {
        player.mozRequestFullScreen();      
      } else if (player.webkitRequestFullScreen) {
        player.webkitRequestFullScreen();      
      }
    }

    if (player.requestFullScreen) {
      document.addEventListener("fullscreenchange", fullScreenChange);
    } else if (player.mozRequestFullScreen) {
      document.addEventListener("mozfullscreenchange", fullScreenChange);
    } else if (player.webkitRequestFullScreen) {
      document.addEventListener("webkitfullscreenchange", fullScreenChange);
    }

    btnFullScreen.setAttribute('onClick', "fullscreen();");
    btnEndFullScreen.setAttribute('onClick', "endFullScreen();");
  }
  
  var setButtons = function() {
    btnPlay.setAttribute('onClick', "play();");
    btnPause.setAttribute('onClick', "pause();");
    player.addEventListener ('DOMAttrModified', 'checkFullScreen', false); 
    video.addEventListener('onStateChange', 'playerStateChanged');
    btnAddVideo.setAttribute('onClick', "addVideo();");
    btnContinuous.setAttribute('onClick', "setPlayToRandom();");
    btnRandom.setAttribute('onClick', "setPlayToContinuous();");
    progressBar.setAttribute('onClick', "seek();");
    addFullScreenEvents();
  }

  var resetScreen = function() {
    swfobject.embedSWF(
      'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=playerScreen',
      'playerScreen', "100%", "100%", "9", null,  null, 
      { allowScriptAccess: "always", allowFullScreen: 'true' }, 
      { id: 'playerScreen', name: 'playerScreen' }
    );
  }

  onYouTubePlayerReady = function(playerId) {
    video = document.getElementById(playerId);
    setButtons();
    video.loadVideoById(videoIds[0])
    video.playVideo();
  }

  resetScreen();
})(window);