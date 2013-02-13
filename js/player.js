// I think this ensures the reading of the whole chunk 
// of code before it gets executed.
(function(window) {
  var w = window;
  w.youTubeTools = ( typeof x != 'undefined' && x instanceof Object ) ? x : {};
  w.YouTubeTool = function() {
    this.makePlayer = function(containerId, screenId, setDefaultStateToPlay) {
      this.defaultToPlay = setDefaultStateToPlay;
      this.containerId = containerId;
      this.seekTime = 0;  
      this.ytScreenId = screenId;
      var videoIds = w.getVideoIdsFromAddressBar();

      if (videoIds.length == 0) { videoIds = ['8bqKXN3-cY4'] }; // Set default video.
      this.currentVideoId = videoIds[0];
      this.resetScreen();
      this.playlist = {};
      this.videoIndexes = [];
      this.resetPlayOrder();
      
      this.playMode = w.getPlayMode();
      this.setDefaultActions();

      w.youTubeTools[this.ytScreenId] = this;
      this.setPlayOrderButton();

      for (index in videoIds) {
        this.addVideoIdToPlaylist(videoIds[index]);
      };
      w.updateAddressBar(this.videoIndexes);
    }
    
    this.setDefaultActions = function() {
      // Setup buttons      
      this.playButton = document.getElementById(this.containerId).getElementsByClassName('PlayButton')[0];
      this.pauseButton = document.getElementById(this.containerId).getElementsByClassName('PauseButton')[0];
      this.playButton.setAttribute('onClick', "play('"+this.ytScreenId+"')");
      this.pauseButton.setAttribute('onClick', "play('"+this.ytScreenId+"')");
      
      this.progressBar = document.getElementById(this.containerId).getElementsByClassName('ProgressBar')[0];
      this.progressBar.setAttribute('onClick', "setPlaybackTo(event, '"+this.ytScreenId+"')");

      this.progressSoFar = document.getElementById(this.containerId).getElementsByClassName('ProgressSoFar')[0];
      this.timePassed = document.getElementById(this.containerId).getElementsByClassName('TimePassed')[0];

      this.fullScreenButton = document.getElementById(this.containerId).getElementsByClassName('FullScreenButton')[0];
      this.fullScreenButton.setAttribute('onClick', "goFullScreen('"+this.ytScreenId+"')");
      
      this.addVideoButton = document.getElementById(this.containerId).getElementsByClassName('AddVideoButton')[0];
      this.addVideoButton.setAttribute('onClick', "addVideoToPlaylist('"+this.ytScreenId+"')");
      
      this.embedButton = document.getElementById(this.containerId).getElementsByClassName('EmbedVideoButton')[0];
      this.embedButton.setAttribute('onClick', "embed('"+this.ytScreenId+"')");

      this.switchPlayOrderButton = document.getElementById(this.containerId).getElementsByClassName('RandomizeButton')[0];
      this.switchPlayOrderButton.setAttribute('onClick', "switchPlayOrder('"+this.ytScreenId+"')");
    }

    this.highlightCurrentVideo = function() {
      if (this.currentVideoId != null) {
        for (videoId in this.playlist) {
          this.playlist[videoId].element.className = 'ListElement';
        }
        this.playlist[this.currentVideoId].element.className = 'ListElement Playing';
        this.playlist[this.currentVideoId].element.scrollIntoView();
      }
    }

    this.resetScreen = function() {
      swfobject.embedSWF(
        'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid='+this.ytScreenId,
        this.ytScreenId, "560", "315", "9", null,  null, 
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
      this.setUIToPaused();
    }

    this.setUIToStopped = function() {
      this.setUIToPaused();
    }

    this.getNewVideoNode = function(videoId) {
        var newItem = document.createElement('div');
        newItem.className = 'ListElement';
        newItem.draggable = true;
        newItem.innerHTML = '<span>'+videoId+'</span>\n' +
          '<input type="hidden" name="playerId" class="PlayerId" value="'+this.ytScreenId+'" />\n' +
          '<input type="hidden" name="videoId" class="VideoId" value="'+videoId+'" />\n' +
          '<a href="javascript:void(0);" class="RemoveButton"><img src="images/btnRemove.png" /></a>\n' +
          '<a href="javascript:void(0);" class="DragButton"><img src="images/btnDrag.png" /></a>';
        return newItem;
    }

    this.addVideoIdToPlaylist = function(videoId) {
      var retval = false;
      if (this.playlist[videoId] == null) {
        var newItem = this.getNewVideoNode(videoId);
        var list = document.getElementById(this.containerId).getElementsByClassName('List')[0];
        list.appendChild(newItem);
        
        if (this.videoIndexes.indexOf(videoId) == -1) {
          this.playlist[videoId] = {
            'id': videoId,
            'element': newItem,
            'title': null
          };

          this.videoIndexes.push(videoId);
          this.playlist[videoId]['index'] = this.videoIndexes.length; 

          this.setupPlaylistControlsForVideoId(videoId);
          this.setTitle(videoId);
        }

        retval = true;
      }
      return retval;
    }

    this.getTitleFromSource = function(videoId) {
      var url = 'https://gdata.youtube.com/feeds/api/videos/'+videoId+'?v=2&alt=json';
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", url, false );
      xmlHttp.send( null );
      var response = xmlHttp.responseText;
      var videoFunc = new Function('return '+response);
      return videoFunc().entry.title['$t'];
    }

    this.setTitle = function(videoId) {
      if (this.playlist[videoId].title == null) {
        this.playlist[videoId].title = this.getTitleFromSource(videoId);
      }
      this.playlist[videoId].element.getElementsByTagName('span')[0].innerHTML = this.playlist[videoId]['index'] +' - ' + this.playlist[videoId].title;
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

    this.updateVideoOrder = function(videoId) {
      var startIndex = this.videoIndexes.indexOf(videoId);
      startIndex = startIndex > 0 ? startIndex : 0;
      for (var i = startIndex; i < this.videoIndexes.length; i++) {
        var videoId = this.videoIndexes[i];
        this.playlist[videoId].index = i+1;
        this.setTitle(videoId);
      }
    }

    this.setPlayOrderButton = function() {
      if (this.playMode == 'Continuous') {
        this.switchPlayOrderButton.innerHTML = '<img src="images/btnContinuous.png">';
      } else {
        this.switchPlayOrderButton.innerHTML = '<img src="images/btnRandom.png">';
      }
    }

    this.resetPlayOrder = function() {
      this.playedSoFar = [this.currentVideoId];
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

    w.getMousePositionX = function(e) {
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

    w.getMousePositionY = function(e) {
      // Mouse position
      var y = 0;
      if(!e){ e = window.event; }
      if (e.pageY) {
        x = e.pageY;
      } else if (e.clientY) {
        x = e.clientY;
      }
      return x;
    }

    w.setPlaybackTo = function(event, playerId) {
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];
      var seekToSeconds = ((getMousePositionX(event) - ytt.progressBar.offsetLeft) / ytt.progressBar.offsetWidth) * ytplayer.getDuration();
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

    w.arrayDiff = function(outside, inside) {
      return outside.filter(function(i) {return !(inside.indexOf(i) > -1);});
    };

    w.arrayGetRandom = function(a) {
      return a[Math.floor(Math.random() * a.length)];
    };


    w.playNext = function(ytplayer, ytt) {
      var currentVideoIndex = ytt.videoIndexes.indexOf(ytt.currentVideoId);
      if ((ytt.playMode == 'Continuous') && (currentVideoIndex < (ytt.videoIndexes.length - 1))) {
        ytt.currentVideoId = ytt.videoIndexes[currentVideoIndex + 1];
        ytt.seekTime = 0.0;
        w.resetPlaybackForPlayer(ytplayer, ytt);
      } else if (ytt.playMode == 'Random') {
        if (ytt.playedSoFar.length == ytt.videoIndexes.length) {
          ytt.resetPlayOrder();
        }
        ytt.currentVideoId = arrayGetRandom(arrayDiff(ytt.videoIndexes, ytt.playedSoFar));
        ytt.playedSoFar.push(ytt.currentVideoId);
        ytt.seekTime = 0.0;
        w.resetPlaybackForPlayer(ytplayer, ytt);
      }
    }

    w.goFullScreen = function(playerId) {
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
          if (ytplayer.getDuration() == ytplayer.getCurrentTime()) {
            w.playNext(ytplayer, ytt);
          }
        } else if (newState == STOPPED) {
          ytt.setUIToStopped();
        } else if (newState == ENDED) {
          ytt.setUIToEnded();
          if (ytplayer.getDuration() == ytplayer.getCurrentTime()) {
            w.playNext(ytplayer, ytt);
          }
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
      document.onkeydown = function(event) {
        if ((window.event) && (event.keyCode == 32)) {
          w.play(ytplayer.id);
        } else if (event.which == 32) {
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
      if (! ytt.defaultToPlay) {
        ytplayer.pauseVideo();
      }
      setupKeyboardControlsForPlayer(ytplayer);
    }

    w.getVideoIdsFromAddress = function(address) {
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
          updateAddressBar(ytt.videoIndexes);
          videoInput.value = '';
        }
      } else {
        alert('not ok');
      }
    }

    w.getPlaylistQueryString = function(videoIndexes) {
      var playlistQueryString = '?v=';
      for (index in videoIndexes) {
        playlistQueryString += videoIndexes[index]+',';
      }
      return playlistQueryString.substr(0, playlistQueryString.length - 1);
    }

    w.updateAddressBar = function(videoIndexes) {
      window.history.replaceState('Object', 'Video Player', getPlaylistQueryString(videoIndexes));
    }

    w.getVideoIdsFromAddressBar = function() {
      return getVideoIdsFromAddress(window.location.toString());
    }
    
    var dragSourceElement = null;
    w.handleDragStart = function(e) {
      this.style.opacity = '0.8';  // this / e.target is the source node.
      dragSourceElement = this;
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

        var videoId = this.getElementsByClassName('VideoId')[0].value;
        var dragSourceVideoId = dragSourceElement.getElementsByClassName('VideoId')[0].value;
        this.parentNode.insertBefore(dragSourceElement, this);
        
        ytt.videoIndexes.splice(ytt.videoIndexes.indexOf(dragSourceVideoId), 1);
        ytt.videoIndexes.splice(ytt.videoIndexes.indexOf(videoId), 0, dragSourceVideoId);
        ytt.updateVideoOrder(dragSourceVideoId);
        w.updateAddressBar(ytt.videoIndexes);
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
      ytt.videoIndexes.splice(ytt.videoIndexes.indexOf(videoId), 1);
      if (ytt.indexOf(videoId) != -1) { 
        ytt.playedSoFar.splice(ytt.playedSoFar.indexOf(videoId), 1) 
      };

      updateAddressBar(ytt.videoIndexes);
    }

    w.embed = function(playerId) {
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];
      var videoInput = document.getElementById(ytt.containerId).getElementsByClassName('VideoUrl')[0];
      videoInput.value = '<iframe width="560" height="560" src="http://'+window.location.hostname+window.location.pathname+'e.php'+
        getPlaylistQueryString(ytt.videoIndexes)+'"></iframe>';
    }

    w.getPlayMode = function() {
      var retval = 'Continuous';
      var match = window.location.toString().match(/([?\&]mode\=)(Continuous|Random)/gi);
      var videoIds = [];
      if (match != null) {
        var playMode = match[0].substr(6); 
        alert(playMode);
      }
      return retval;
    }

    w.switchPlayOrder = function(playerId) {
      var ytplayer = document.getElementById(playerId);
      var ytt = w.youTubeTools[playerId];
      
      if (ytt.playMode == 'Random') {
        ytt.playMode = 'Continuous';
      } else {
        ytt.playMode = 'Random';
        ytt.resetPlayOrder();
      }
      ytt.setPlayOrderButton();
    }
  };
})(window);
