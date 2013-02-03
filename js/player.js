// I think this ensures the reading of the whole chunk 
// of code before it gets executed.
(function(window) {
  var w = window;
  w.youTubeTools = ( typeof x != 'undefined' && x instanceof Object ) ? x : {};
  //w['YouTubeTools'] = new Object()
  w.YouTubeTool = function() {
    this.makePlayer = function(containerId, screenId, currentVideoId, setDefaultActions) {
      this.containerId = containerId;
      this.seekTime = 0;  
      this.ytScreenId = screenId;
      this.currentVideoId = currentVideoId;
      this.setupScreen();
      this.bookmarks = [];

      if (setDefaultActions == true) {
        this.setDefaultActions();
      }
      
      w.youTubeTools[this.ytScreenId] = this;
    }

    this.setupScreen = function() {
      swfobject.embedSWF(
        'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid='+this.ytScreenId,
        this.ytScreenId, "640", "360", "9", null,  null, 
        { allowScriptAccess: "always", allowFullScreen: 'true' }, 
        { id: this.ytScreenId, name: this.ytScreenId }
      );      
    }

    this.setDefaultActions = function() {
      // Setup buttons      
      this.playButton = document.getElementById(this.containerId).getElementsByClassName('PlayButton')[0];
      this.pauseButton = document.getElementById(this.containerId).getElementsByClassName('PauseButton')[0];
      this.playButton.setAttribute('onClick', "play('"+this.ytScreenId+"')");
      this.pauseButton.setAttribute('onClick', "play('"+this.ytScreenId+"')");
      
      this.progressBar = document.getElementById(this.containerId).getElementsByClassName('ProgressBar')[0];
      this.progressBar.setAttribute('onClick', "setPlayBackTo('"+this.ytScreenId+"')");

      this.progressSoFar = document.getElementById(this.containerId).getElementsByClassName('ProgressSoFar')[0];
      this.timePassed = document.getElementById(this.containerId).getElementsByClassName('TimePassed')[0];


      this.bookmarkButton = document.getElementById(this.containerId).getElementsByClassName('BookmarkButton')[0];
      this.bookmarkButton.setAttribute('onClick', "bookmark('"+this.ytScreenId+"')");

      this.nextButton = document.getElementById(this.containerId).getElementsByClassName('NextButton')[0];
      this.nextButton.setAttribute('onClick', "gotoBookmark('"+this.ytScreenId+"', 'next')");

      this.previousButton = document.getElementById(this.containerId).getElementsByClassName('PreviousButton')[0];
      this.previousButton.setAttribute('onClick', "gotoBookmark('"+this.ytScreenId+"', 'previous')");
      
      this.fullScreenButton = document.getElementById(this.containerId).getElementsByClassName('FullScreenButton')[0];
      this.fullScreenButton.setAttribute('onClick', "fullScreen('"+this.ytScreenId+"')");
    }

    this.setUIToPlaying = function() {
      this.playButton.style.display = 'none';
      this.pauseButton.style.display = 'inline';
      var func = function () {};
      var ytplayer = document.getElementById(this.ytScreenId);
      var parent = this;
      if (typeof this.timer == 'undefined') {
        this.timer = setInterval(function() {
          parent.refreshWidthTo(ytplayer.getCurrentTime(), ytplayer.getDuration());
        },1000);
      }
    }

    this.refreshWidthTo = function(seekTime, totalTime) {
      this.seekTime = seekTime;
      this.progressSoFar.style.width = ((seekTime / totalTime)*this.progressBar.offsetWidth)+'px';
      this.timePassed.innerHTML = convertSecondsToTime(seekTime);
    }

    this.bookmark = function() {
      var ytplayer = document.getElementById(this.ytScreenId);
      var currentTime = ytplayer.getCurrentTime();
      if (this.bookmarks.indexOf(currentTime) == -1) {
        this.bookmarks[this.bookmarks.length] = currentTime;
        var newBookmark = document.createElement('div');
        newBookmark.setAttribute('class', 'Bookmark');
        newBookmark.style.top = this.progressSoFar.offsetTop+'px';
        newBookmark.style.left = ((currentTime / ytplayer.getDuration())*this.progressBar.offsetWidth)+this.progressBar.offsetLeft+'px';
        this.progressBar.appendChild(newBookmark);
        this.bookmarks.sort();
      }
    }

    this.findBookmarkNear = function(p_currentTime, nextPrevious) {      
      var currentTime = p_currentTime;
      var elements = [];
      if (nextPrevious === 'next') {
        elements = this.bookmarks.filter(function(element, index, array) {
          return (element > currentTime);
        });
        if (elements.length > 0)
          elements.sort(function(a,b){return a - b});        
      } if (nextPrevious === 'previous') {
        elements = this.bookmarks.filter(function(element, index, array) {
          return (element < currentTime);
        });
        if (elements.length > 0) 
          elements.sort(function(a,b){return b - a});        
      }
      return elements.length > 0 ? elements[0] : false;
    }

    this.setUIToPaused = function() {
      this.playButton.style.display = 'inline';      
      this.pauseButton.style.display = 'none';      
      clearInterval(this.timer);
      this.timer = undefined;
    }

    this.setUIToEnded = function() {
      this.setToPause();
    }

    this.setUIToStopped = function() {
      this.setToPause();
    }

    w.zeroPad = function(number) {
      return (number > 9 ? number : '0'+number);
    }

    w.convertSecondsToTime = function(secs) {
      var hours = Math.floor(secs / (60 * 60));
      var divisor_for_minutes = secs % (60 * 60);
      var minutes = Math.floor(divisor_for_minutes / 60);
      var divisor_for_seconds = divisor_for_minutes % 60;
      var seconds = Math.ceil(divisor_for_seconds);
      return zeroPad(hours)+':'+zeroPad(minutes)+':'+zeroPad(seconds);
    }

    w.getMousePositionX = function() {
      // Mouse position
      var x = 0;
      var e = window.event;
      if (e.pageX) {
        x = e.pageX;
      } else if (e.clientX) {
        x = e.clientX;
      }
      return x;
    }

    w.getMousePositionY = function() {
      // Mouse position
      var y = 0;
      var e = window.event;
      if (e.pageY) {
        x = e.pageY;
      } else if (e.clientY) {
        x = e.clientY;
      }
      return x;
    }

    w.setPlayBackTo = function(playerId) {
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];
      var seekToSeconds = ((getMousePositionX() - ytt.progressBar.offsetLeft) / ytt.progressBar.offsetWidth) * ytplayer.getDuration();
      ytplayer.seekTo(seekToSeconds, true);
      ytt.refreshWidthTo(seekToSeconds, ytplayer.getDuration());      
    }

    w.moveOut = function(playerId) {
      var ytt = w.youTubeTools[playerId];
      ytt.moveOut();
    }

    w.play = function(playerId) {
      var ytplayer = document.getElementById(playerId);
      if (ytplayer) {
        if ([BUFFERING, PLAYING].indexOf(ytplayer.getPlayerState()) != -1) {
          ytplayer.pauseVideo();
        } else {
          ytplayer.playVideo();
        }
      }
    }

    w.bookmark = function(playerId) {
      var ytt = w.youTubeTools[playerId];
      ytt.bookmark();
    }

    w.gotoBookmark = function(playerId, prevOrNext) {
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];
      var bookMarkTime = ytt.findBookmarkNear(ytplayer.getCurrentTime(), prevOrNext);
      if (bookMarkTime) {
        ytplayer.seekTo(bookMarkTime, true);
        ytt.refreshWidthTo(bookMarkTime, ytplayer.getDuration());        
      } else {
        // Do nothing
      }
    }

    w.fullScreen = function(playerId) {
      var ytt = w.youTubeTools[playerId];
      var c = document.getElementById(ytt.containerId);
      if (c.requestFullScreen) {
        c.requestFullScreen();
      } else if (c.mozRequestFullScreen) {
        c.mozRequestFullScreen();
      } else if (c.webkitRequestFullScreen) {
        c.webkitRequestFullScreen();
      }
      return false;
    }

    w.onYouTubePlayerReady = function(playerId) {
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];

      ytplayer.setAttribute('class', 'YouTubePlayerScreen');
      ytplayer.loadVideoById(ytt.currentVideoId);
      ytplayer.stopVideo();
      ytplayer.seekTo(ytt.seekTime, true);
      ytplayer.onkeydown = function(event) {
        if (event.keyCode == 32) {
          w.play(playerId);
        }
      }

      STOPPED = 5;
      ENDED = 0;
      UNSTARTED = -1;
      PLAYING = 1;
      PAUSED = 2;
      BUFFERING = 3;

      // If the video state changes, update the UI accordingly
      w["playerStateChanged"+playerId] = function(newState) {
        if (newState == PLAYING) {
          ytt.setUIToPlaying();
        } else if (newState == PAUSED) {          
          ytt.setUIToPaused();
        } else if (newState == STOPPED) {
          ytt.setUIToStopped();
        } else if (newState == ENDED) {
          ytt.setUIToEnded();
        } else if (newState == UNSTARTED) {
          ytt.setUIToEnded();          
        } else if (newState == BUFFERING) {
          // Show busy signal
        } else {
          alert('Please handle state: '+newState);
        }
      }
      ytplayer.addEventListener('onStateChange', 'playerStateChanged'+playerId);
    }
  };
})(window);
