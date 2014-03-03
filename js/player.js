// I think this ensures the reading of the whole chunk 
// of code before it gets executed.
(function(window) {
  var videoIndexes = [];
  var playlist = {};
  var defaultVideoId = 'QcvjoWOwnn4';
  var playedSoFar = [];
  var lastKeywords = '';

  play = function() {
    video.playVideo();
  }

  pause = function() {
    video.pauseVideo();
  }

  addVideo = function() {
    var videoIds = getVideoIdsFromAddress(txtVideoUrl.value);
    if (videoIds.length > 0) {
      addVideoIds(videoIds);
      txtVideoUrl.value = '';
      updateAddressBar('add');
    } else {
      alert('not ok');
    }
  }

  setVolume = function(event) {
    var newVolume = (getMousePositionX(event) - volumeControl.offsetLeft);
    newVolume = newVolume > 100 ? 100 : newVolume;
    slider.style.left = newVolume+'px';
    video.setVolume(newVolume);
  }

  addSearchResult = function(id) {
    addVideoIds([id]);
    updateAddressBar('add');
  }

  playPreview = function(playButton, id) {
    playr.videoId = id;
    playVideoId(id);
    scrollToTop();
  }

  setPlayToRandom = function () {    
    btnRandom.style.display = 'inline-block';
    btnContinuous.style.display = 'none';
    continuousPlayback = false;
    resetPlayOrder();
  }

  setPlayToContinuous = function() {
    btnRandom.style.display = 'none';
    btnContinuous.style.display = 'inline-block';    
    continuousPlayback = true;
  }

  seek = function(event) {
    var seekTime = ((getMousePositionX(event) - progressBar.offsetLeft) / progressBar.offsetWidth) * video.getDuration();
    seekToSeconds(seekTime);
  }

    
  removeFromPlaylist = function(videoId) {
    if (playr.videoId == videoId) {
      video.pauseVideo();
      playr.videoId = null;
      resetScreen();
    }

    playlist[videoId].element.parentNode.removeChild(playlist[videoId].element);
    delete(playlist[videoId]);
    videoIndexes.splice(videoIndexes.indexOf(videoId), 1);
    if (videoIndexes.indexOf(videoId) != -1) { 
      playedSoFar.splice(playedSoFar.indexOf(videoId), 1) 
    };

    updateVideoOrder();
    updateAddressBar('remove');
  }  

  var dragSourceElement = null;
  handleDragStart = function(e) {
    this.style.opacity = '0.8';  // this / e.target is the source node.
    dragSourceElement = this;
  }

  handleDragEnter = function(e) {
    this.classList.add('over');
  }

  handleDragOver = function(e) {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  handleDragLeave = function(e) {
    this.classList.remove('over');
  }
    
  handleDrop = function(e) {
    if (e.stopPropagation) {
      e.stopPropagation(); // Stops some browsers from redirecting.
    }
    // Don't do anything if dropping the same column we're dragging.
    if (dragSourceElement != this) {
      var videoId = this.getElementsByClassName('VideoId')[0].value;
      var dragSourceVideoId = dragSourceElement.getElementsByClassName('VideoId')[0].value;
      this.parentNode.insertBefore(dragSourceElement, this);
      
      videoIndexes.splice(videoIndexes.indexOf(dragSourceVideoId), 1);
      videoIndexes.splice(videoIndexes.indexOf(videoId), 0, dragSourceVideoId);
      updateVideoOrder(dragSourceVideoId);
      updateAddressBar('reorder', [videoId, dragSourceVideoId]);
    }
    return false;
  }

  handleDragEnd = function(e) {
    this.style.opacity = '1.0';  // this / e.target is the source node.
    this.classList.remove('over');
  }

  handleDoubleClick = function(e) {
    this.classList.remove('over');
    var videoId = this.getElementsByClassName('VideoId')[0].value;
    playVideoId(videoId);
    scrollToTop();
  }

  handleClick = function(e) {
    this.classList.toggle('over');
  }

  switchBetweenNormalAndFullScreen = function(e) {
    pause();
    storeCurrentTime();    
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

  restartPressTimer = function() {
    window.clearTimeout(window.keyDownTimer);
    window.keyDownTimer = window.setTimeout(searchYouTube, 350);
  }

  searchYouTube = function() {
    var keywords = encodeURIComponent(txtVideoSearch.value.trim());
    if (keywords.length == 0) {
      resultsBox.innerHTML = '';
      lastKeywords = '';
      adjustPlaylistSize(8);
    } else if (keywords != lastKeywords) {
      resultsBox.innerHTML = '';
      lastKeywords = keywords;
      var yt_url='https://gdata.youtube.com/feeds/api/videos?q='+keywords+'&format=5&max-results=15&v=2';
      var httpRequest;

      if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
      }

      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          showResults(httpRequest.responseXML);
        }
      };

      httpRequest.open('GET', yt_url);
      httpRequest.send();
    }
  }

  var adjustPlaylistSize = function(offset) {
    list.style.marginRight = player.offsetWidth - progressBar.offsetLeft - progressBar.offsetWidth + offset + 'px';
  }

  var createResult = function(info) {
    var newItem = document.createElement('div');
    newItem.className = 'SearchResult';
    newItem.innerHTML = '<div class="PreviewTitle" id="video_title_'+info['videoId']+'">'+info['title']+'<br />'+info['duration']+'</div>' +
        '<img class="videoPreview" src="'+info['thumbnail']+'" />\n'+
        '<a href="javascript:void(0);" class="SearchResultAddButton" title="Add to Playlist" onClick="addSearchResult(\''+info['videoId']+'\');"><img src="images/btnAddToPlaylist.png" /></a>' +
        '<a href="javascript:void(0);" class="SearchResultPlayButton" title="Preview" onClick="playPreview(this, \''+info['videoId']+'\');"><img src="images/btnPlay.png" /></a>';
    resultsBox.appendChild(newItem);
  }

  var showResults = function(response) {
    if (response.getElementsByTagName) {
      // Firefox needs the colon syntax, but everyone else
      // seems to be able to live without it.
      var resultSets = response.getElementsByTagName('group');
      var name = null;
      if (resultSets.length > 0) {
        names = {
          title: 'title',
          thumbnail: 'thumbnail',
          videoId: 'videoid',
          duration: 'duration'
        };
      } else {
        resultSets = response.getElementsByTagName('media:group');
        if (resultSets.length > 0) {
          names = {
            title: 'media:title',
            thumbnail: 'media:thumbnail',
            videoId: 'yt:videoid',
            duration: 'yt:duration'
          };
        }
      }
            
      if (resultSets.length >= 4) {
        adjustPlaylistSize(0);
      }
      for(var i = 0; i < resultSets.length; i++) {
        createResult ({ 
          title : resultSets[i].getElementsByTagName(names.title)[0].childNodes[0].nodeValue,
          thumbnail : resultSets[i].getElementsByTagName(names.thumbnail)[0].attributes['url'].value,
          videoId : resultSets[i].getElementsByTagName(names.videoId)[0].childNodes[0].nodeValue,
          duration : convertSecondsToTime(resultSets[i].getElementsByTagName(names.duration)[0].attributes.getNamedItem('seconds').value)
        });
      }
    } else {
      alert('no go');
    }
  }

  var storeCurrentTime = function() {
    storedTime = video.getCurrentTime();
  }

  var seekToSeconds = function(seekTime) {
    refreshWidthTo(seekTime, video.getDuration());
    video.seekTo(seekTime, true);
  }

  var getElement = function(id) {
    return document.getElementById(id);
  }
  
  var getVideoIdsFromAddress = function(address) {
    var match = address.match(/([?\&]v\=)([\w-,]+)/gi);
    var videoIds = [];
    if (match != null) {
      videoIds = match[0].substr(3).split(',');
    }
    return videoIds;
  }

  var getVideoIdsFromAddressBar = function() {
    return getVideoIdsFromAddress(window.location.toString());
  }

  var getNewVideoNode = function(videoId) {
    var newItem = document.createElement('div');
    newItem.className = 'ListElement';
    newItem.draggable = true;
    newItem.innerHTML = '<span>'+videoId+'</span>\n' +
      '<input type="hidden" name="videoId" class="VideoId" value="'+videoId+'" />\n' +
      '<a href="javascript:void(0);" class="RemoveButton" title="Remove from Playlist"><img src="images/btnRemove.png" /></a>\n' +
      '<a href="javascript:void(0);" class="DragButton" title="Click And Drag to Rearrange the Playlist"><img src="images/btnDrag.png" /></a>';
    return newItem;
  }

  var getTitleFromSource = function(videoId) {
    var url = 'https://gdata.youtube.com/feeds/api/videos/'+videoId+'?v=2&alt=json';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    var response = xmlHttp.responseText;
    var videoFunc = new Function('return '+response);
    return videoFunc().entry.title['$t'];
  }  

  var setTitleForPlaylistItem = function(videoId) {
    if (playlist[videoId].title == null) {
      playlist[videoId].title = getTitleFromSource(videoId);
    }
    playlist[videoId].element.getElementsByTagName('span')[0].innerHTML = playlist[videoId]['index'] +' - ' + playlist[videoId].title;
  }

  var addVideoIds = function(ids) {
    var retval = false;
    for (var key in ids) {
      retval = addVideoId(ids[key]) || retval;
    }
    return retval;
  }

  var scrollToTop = function() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  var addVideoId = function(id) {    
    var retval = false;
    if (playlist[id] == null) {
      var newItem = getNewVideoNode(id);
      list.appendChild(newItem);
      
      if (videoIndexes.indexOf(id) == -1) {
        playlist[id] = {
          'id': id,
          'element': newItem,
          'title': null
        };

        videoIndexes.push(id);
        playlist[id]['index'] = videoIndexes.length;

        setupPlaylistControlsForVideoId(id);
        setTitleForPlaylistItem(id);
      }
      
      if (videoIndexes.length == 1) {
        playVideoId(id);
        scrollToTop();
      }
      retval = true;
    }
    return retval;
  }

  var setupPlaylistControlsForVideoId = function(videoId) {
    var item = playlist[videoId].element;
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
    removeButton.setAttribute('onClick', "removeFromPlaylist('"+videoId+"')");
  }

  var player = getElement('player');
  var video = getElement('playerScreen');
  var videoContainer = getElement('screenContainer');
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
  var volumeControl = getElement('volumeControl');
  var slider = getElement('slider');
  var list = getElement('list');
  var videoStates = {
      UNSTARTED : -1,
      ENDED : 0,
      PLAYING : 1,
      PAUSED : 2,
      BUFFERING : 3,
      QUEUED : 5
  };
  var continuousPlayback = true;
  var storedTime = 0.0;

  var txtVideoSearch = getElement('txtVideoSearch');
  var resultsBox = getElement('results');

  var getPlaylistQueryString = function(videoIndexes) {
    var playlistQueryString = '?v=';
    for (index in videoIndexes) {
      playlistQueryString += videoIndexes[index]+',';
    }
    return playlistQueryString.substr(0, playlistQueryString.length - 1);
  }    

  var updateAddressBar = function(action, vars) {
    vars = (typeof vars !== 'undefined') ? vars : null;
    var leDate = new Date;
    var playerState = {
      videoIndexes: videoIndexes,
    };
    window.history.pushState(playerState, 'playr.me', getPlaylistQueryString(videoIndexes));
  }

  var playOrResumeCurrentVideo = function() {
    video.loadVideoById(playr.videoId);
    highlightCurrentVideo();
    if (storedTime > 0.0) {
      seekToSeconds(storedTime);
    }
  }

  var highlightCurrentVideo = function() {
    if (playr.videoId != null) {
      for (videoId in playlist) {
        playlist[videoId].element.className = 'ListElement';
      }

      if (playlist[playr.videoId]) {
        playlist[playr.videoId].element.className = 'ListElement Playing';
        playlist[playr.videoId].element.scrollIntoView();
      } else {        
        var titleElement = getElement('video_title_'+playr.videoId);
        titleElement.className = 'PreviewTitle Played';
      }
    }
  }  

  var playVideoId = function(id) {
    playr.videoId = id;
    playOrResumeCurrentVideo();
  }

  var updateVideoOrder = function(videoId) {
    var startIndex = videoIndexes.indexOf(videoId);
    startIndex = startIndex > 0 ? startIndex : 0;
    for (var i = startIndex; i < videoIndexes.length; i++) {
      var videoId = videoIndexes[i];
      playlist[videoId].index = i+1;
      setTitleForPlaylistItem(videoId);
    }
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
    var le_width = ((seekTime / totalTime)*progressBar.offsetWidth) || 0;
    progressSoFar.style.width = le_width+'px';
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

    if (storedTime > 0.0) {
      seekToSeconds(storedTime);
      storedTime = 0.0;
    }
  }

  var setUIToPaused = function() {
    btnPlay.style.display = 'inline';
    btnPause.style.display = 'none';
    refreshWidthToCurrent();
    window.clearInterval(window.timer);
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

  var arrayGetRandom = function(a) {
    return a[Math.floor(Math.random() * a.length)];
  };

  var arrayDiff = function(outside, inside) {
    return outside.filter(function(i) {return !(inside.indexOf(i) > -1);});
  };  

  var resetPlayOrder = function() {
    playedSoFar = [vplayr.videoId];
  }

  var playNextContinuous = function() {
    var currentVideoIndex = videoIndexes.indexOf(playr.videoId);
    if (currentVideoIndex < (videoIndexes.length - 1)) {
      playVideoId(videoIndexes[currentVideoIndex + 1]);
    }
  }

  var playNextRandom = function() {
    if (playedSoFar.length == videoIndexes.length) {
      resetPlayOrder();
    }
    var randomId = arrayGetRandom(arrayDiff(videoIndexes, playedSoFar));
    playedSoFar.push(randomId);
    playVideoId(randomId);
  }

  var playNext = function() {
    if (continuousPlayback) {
      playNextContinuous();
    } else {
      playNextRandom();
    }
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

  var addFullScreenEvents = function() {
    if (player.requestFullScreen) {
      document.addEventListener("fullscreenchange", switchBetweenNormalAndFullScreen);
    } else if (player.mozRequestFullScreen) {
      document.addEventListener("mozfullscreenchange", switchBetweenNormalAndFullScreen);
    } else if (player.webkitRequestFullScreen) {
      document.addEventListener("webkitfullscreenchange", switchBetweenNormalAndFullScreen);
    }
    
    btnFullScreen.onclick = fullscreen;
    btnEndFullScreen.onclick = endFullScreen;
  }
  
  var setButtons = function() {
    btnPlay.onclick = play;
    btnPause.onclick = pause;
    video.addEventListener('onStateChange', 'playerStateChanged');
    btnAddVideo.onclick = addVideo;
    btnContinuous.onclick = setPlayToRandom;
    btnRandom.onclick = setPlayToContinuous;
    progressBar.onclick = seek;
    videoContainer.onkeydown = handleKeyDown;
    videoContainer.onclick = pauseOrPlay;
    txtVideoSearch.onkeyup = restartPressTimer;
    volumeControl.onclick = setVolume;
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

  var pauseOrPlay = function() {
    if (video.getPlayerState() == videoStates.PLAYING) {
      pause();
    } else {
      play();
    }
  }

  var getKeyPressed = function(event) {
    var retval = -1;
    if (window.event) {
      retval = event.keyCode;
    } else {
      retval = event.which
    }
    return retval;
  }

  var handleKeyDown = function(event) {
    if (getKeyPressed(event) == 32) {      
      pauseOrPlay();
    }
  }

  onYouTubePlayerReady = function(playerId) {
    video = getElement(playerId);
    setButtons();

    if (playr.videoId != null) {
      playOrResumeCurrentVideo();
    } else if (addVideoIds(getVideoIdsFromAddressBar())) {
      defaultVideoId = null;
    } else if (defaultVideoId != null) {
      addVideoId(defaultVideoId);
      defaultVideoId = null;
    }
  }

  resetScreen();
})(window);
