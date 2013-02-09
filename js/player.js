// I think this ensures the reading of the whole chunk 
// of code before it gets executed.
(function(window) {
  var w = window;
  w.youTubeTools = ( typeof x != 'undefined' && x instanceof Object ) ? x : {};
  w.YouTubeTool = function() {
    this.makePlayer = function(containerId, screenId, setDefaultActions) {
      this.containerId = containerId;
      this.seekTime = 0;  
      this.ytScreenId = screenId;
      var videoIds = w.getVideoIdsFromAddressBar();
      this.currentVideoId = (videoIds.length > 0) ? videoIds[0] : null;
      this.resetScreen();
      this.playlist = {};

      if (setDefaultActions == true) {
        this.setDefaultActions();
      }
      w.youTubeTools[this.ytScreenId] = this;

      for (index in videoIds) {
        this.addVideoIdToPlaylist(videoIds[index]);
      };
      w.updateAddressBar(this.playlist);
    }
    
    this.setDefaultActions = function() {
      // Setup buttons      
      this.playButton = document.getElementById(this.containerId).getElementsByClassName('PlayButton')[0];
      this.pauseButton = document.getElementById(this.containerId).getElementsByClassName('PauseButton')[0];
      this.playButton.setAttribute('onClick', "play('"+this.ytScreenId+"')");
      this.pauseButton.setAttribute('onClick', "play('"+this.ytScreenId+"')");
      
      this.progressBar = document.getElementById(this.containerId).getElementsByClassName('ProgressBar')[0];
      this.progressBar.setAttribute('onClick', "setPlaybackTo('"+this.ytScreenId+"')");

      this.progressSoFar = document.getElementById(this.containerId).getElementsByClassName('ProgressSoFar')[0];
      this.timePassed = document.getElementById(this.containerId).getElementsByClassName('TimePassed')[0];

      this.fullScreenButton = document.getElementById(this.containerId).getElementsByClassName('FullScreenButton')[0];
      this.fullScreenButton.setAttribute('onClick', "fullScreen('"+this.ytScreenId+"')");
      
      this.addVideoButton = document.getElementById(this.containerId).getElementsByClassName('AddVideoButton')[0];
      this.addVideoButton.setAttribute('onClick', "addVideoToPlaylist('"+this.ytScreenId+"')");
    }

    this.highlightCurrentVideo = function() {
      if (this.currentVideoId != null) {
        for (videoId in this.playlist) {
          this.playlist[videoId].element.className = 'ListElement';
        }
        this.playlist[this.currentVideoId].element.className = 'ListElement Playing';
      }
    }

    this.resetScreen = function() {
      swfobject.embedSWF(
        'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid='+this.ytScreenId,
        this.ytScreenId, "640", "360", "9", null,  null, 
        { allowScriptAccess: "always", allowFullScreen: 'true' }, 
        { id: this.ytScreenId, name: this.ytScreenId }
      );      
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

    this.addVideoIdToPlaylist = function(videoId) {
      var retval = false;
      if (this.playlist[videoId] == null) {
        var newItem = document.createElement('div');
        newItem.className = 'ListElement';
        newItem.draggable = true;
        newItem.innerHTML = '<span>'+videoId+'</span>\n' +
          '<input type="hidden" name="playerId" class="PlayerId" value="'+this.ytScreenId+'" />\n' +
          '<input type="hidden" name="videoId" class="VideoId" value="'+videoId+'" />\n' +
          '<a href="javascript:void(0);" class="RemoveButton"><img src="images/btnRemove.png" /></a>\n' +
          '<a href="javascript:void(0);" class="DragButton"><img src="images/btnDrag.png" /></a>';
        var list = document.getElementById(this.containerId).getElementsByClassName('List')[0];
        list.appendChild(newItem);
        
        this.playlist[videoId] = {
          'id': videoId,
          'element': newItem
        };

        this.setupPlaylistControlsForVideoId(videoId);
        this.replaceVideoIdWithTitle(videoId);
        retval = true;
      }
      return retval;
    }

    this.replaceVideoIdWithTitle = function(videoId) {
      var url = 'https://gdata.youtube.com/feeds/api/videos/'+videoId+'?v=2&alt=json';
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", url, false );
      xmlHttp.send( null );
      var response = xmlHttp.responseText;
      var videoFunc = new Function('return '+response);
      this.playlist[videoId].element.getElementsByTagName('span')[0].innerHTML = videoFunc().entry.title['$t'];
    }


    this.setupPlaylistControlsForVideoId = function(videoId) {
      var item = this.playlist[videoId].element;
      var removeButton = item.getElementsByClassName('RemoveButton')[0];
      var dragButton = item.getElementsByClassName('DragButton')[0];

      item.addEventListener('dblclick', handleDoubleClick, false);
      item.addEventListener('click', handleClick, false);

      item.addEventListener('dragstart', handleDragStart, false);
      item.addEventListener('dragenter', handleDragEnter, false);
      item.addEventListener('dragover', handleDragOver, false);
      item.addEventListener('dragleave', handleDragLeave, false);
      item.addEventListener('drop', handleDrop, false);
      item.addEventListener('dragend', handleDragEnd, false);
      removeButton.setAttribute('onClick', "removeFromPlaylist('"+this.ytScreenId+"', '"+videoId+"')");
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

    w.setPlaybackTo = function(playerId) {
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

    w.resetPlaybackForPlayer = function(ytplayer, ytt) {
      // Attach class attribute to the video screen after
      // it gets removed by swfobject.
      ytplayer.setAttribute('class', 'YouTubePlayerScreen');

      ytplayer.loadVideoById(ytt.currentVideoId);
      ytt.highlightCurrentVideo();

      // We call stopVideo() after loading it because,
      // for some reason we can't seekTo a different time
      // unless the video is stopped when we switch between
      // regular and fullscreen.
      ytplayer.stopVideo();
      ytplayer.seekTo(ytt.seekTime, true);
    }

    w.registerStateChanges = function(ytplayer, ytt) {
      STOPPED = 5;
      ENDED = 0;
      UNSTARTED = -1;
      PLAYING = 1;
      PAUSED = 2;
      BUFFERING = 3;
      // If the video state changes, update the UI accordingly
      w["playerStateChanged"+ytplayer.id] = function(newState) {
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
      ytplayer.addEventListener('onStateChange', 'playerStateChanged'+ytplayer.id);
    }

    w.setupKeyboardControlsForPlayer = function(ytplayer) {
      ytplayer.onkeydown = function(event) {
        if (event.keyCode == 32) {
          w.play(ytplayer.id);
        }
      }
    }

    // onYouTubePlayerReady() gets called each time the player is readied
    // including situations when the player enters or
    // exits fullscreen mode.
    w.onYouTubePlayerReady = function(playerId) {
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];

      registerStateChanges(ytplayer, ytt)
      resetPlaybackForPlayer(ytplayer, ytt);
      setupKeyboardControlsForPlayer(ytplayer);
    }

    w.getVideoIdsFromAddress = function(address) {
      var match = address.match(/([?\&]v\=)([\w-]+)/gi);
      var videoIds = [];
      for (index in match) {
        videoIds.push(match[index].substr(3));
      }
      return videoIds;
    }

    w.addVideoToPlaylist = function(playerId) {
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];
      var videoInput = document.getElementById(ytt.containerId).getElementsByClassName('VideoUrl')[0];
      var videoIds = getVideoIdsFromAddress(videoInput.value);
      if (videoIds.length > 0) {
        if (ytt.addVideoIdToPlaylist(videoIds[0])) {
          if (ytt.playlist.length == 1) {
            ytt.currentVideoId = videoIds[0];
            resetPlaybackForPlayer(ytplayer, ytt);
          }
          updateAddressBar(ytt.playlist);
          videoInput.value = '';
        }
      } else {
        alert('not ok');
      }
    }

    w.updateAddressBar = function(playlist) {
      var playlistQueryString = '?';
      for (index in playlist) {
        playlistQueryString += 'v='+index+'&';
      }
      playlistQueryString = playlistQueryString.substr(0, playlistQueryString.length - 1);
      window.history.replaceState('Object', 'Video Player', playlistQueryString);
    }

    w.getVideoIdsFromAddressBar = function() {
      return getVideoIdsFromAddress(window.location.toString());
    }
    
    var dragSourceElement = null;
    w.handleDragStart = function(e) {
      this.style.opacity = '0.8';  // this / e.target is the source node.
      dragSourceElement = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
      e.dataTransfer.setData('classes', this.className);
    }

    w.handleDragEnter = function(e) {
      this.classList.add('over');
    }

    w.handleDragOver = function(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }
      e.dataTransfer.dropEffect = 'move';
      return false;
    }

    w.handleDragLeave = function(e) {
      this.classList.remove('over');
    }
    
    w.handleDrop = function(e) {
      if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
      }
      // Don't do anything if dropping the same column we're dragging.
      if (dragSourceElement != this) {
        var playerId = this.getElementsByClassName('PlayerId')[0].value;
        var ytt = w.youTubeTools[playerId];

        // Set the source column's HTML to the HTML of the column we dropped on.
        dragSourceElement.innerHTML = this.innerHTML;
        dragSourceElement.className = this.className;
        var dragSourceVideoId = dragSourceElement.getElementsByClassName('VideoId')[0].value;
        ytt.playlist[dragSourceVideoId].element = dragSourceElement;
        ytt.playlist[dragSourceVideoId].id = dragSourceVideoId;

        this.innerHTML = e.dataTransfer.getData('text/html');
        this.className = e.dataTransfer.getData('classes');
        var videoId = this.getElementsByClassName('VideoId')[0].value;
        ytt.playlist[videoId].element = this;
        ytt.playlist[videoId].id = videoId;
      }
      return false;
    }

    w.handleDragEnd = function(e) {
      this.style.opacity = '1.0';  // this / e.target is the source node.
      this.classList.remove('over');
    }

    w.handleDoubleClick = function(e) {
      this.classList.remove('over');
      var playerId = this.getElementsByClassName('PlayerId')[0].value;
      var videoId = this.getElementsByClassName('VideoId')[0].value;
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];
      ytt.currentVideoId = videoId;
      ytt.seekTime = 0.0;
      w.resetPlaybackForPlayer(ytplayer, ytt);
    }

    w.handleClick = function(e) {
      this.classList.toggle('over');
    }
    
    w.removeFromPlaylist = function(playerId, videoId) {
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];
      if (ytt.currentVideoId == videoId) {
        ytplayer.pauseVideo();
        ytt.currentVideoId = null;
        ytt.resetScreen();
      }
      ytt.playlist[videoId].element.parentNode.removeChild(ytt.playlist[videoId].element);
      delete(ytt.playlist[videoId]);
      updateAddressBar(ytt.playlist);
    }
  };
})(window);
