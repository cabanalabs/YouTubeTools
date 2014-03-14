var playlist = {
  DEFAULT_VIDEO_ID: 'QcvjoWOwnn4',
  list: {},
  videoIndexes: [],
  playedSoFar: [],
  continuousPlayback: true,
  playOrResumeCurrentVideo: function() {
    playr.player.loadVideoById(playr.videoId);
    playlist.highlightCurrentVideo();
    //if (storedTime > 0.0) {
    //  seekToSeconds(storedTime);
    //}
  },
  highlightCurrentVideo: function() {
    var pls = playlist;
    if (playr.videoId != null) {
      for (videoId in pls.list) {
        pls.list[videoId].element.className = 'ListElement';
      }

      if (pls.list[playr.videoId]) {
        pls.list[playr.videoId].element.className = 'ListElement Playing';
        pls.list[playr.videoId].element.scrollIntoView();
      } else {        
        var titleElement = getElement('video_title_'+playr.videoId);
        titleElement.className = 'PreviewTitle Played';
      }
    }
  },
  playVideoId: function(id) {
    playr.videoId = id;
    playlist.playOrResumeCurrentVideo();
  },
  updateVideoOrder: function(videoId) {
    var pls = playlist;
    var startIndex = pls.videoIndexes.indexOf(videoId);
    startIndex = startIndex > 0 ? startIndex : 0;
    for (var i = startIndex; i < pls.videoIndexes.length; i++) {
      var videoId = pls.videoIndexes[i];
      pls.list[videoId].index = i+1;
      pls.setTitleForPlaylistItem(videoId);
    }
  },
  arrayGetRandom: function(a) {
    return a[Math.floor(Math.random() * a.length)];
  },
  arrayDiff: function(outside, inside) {
    return outside.filter(function(i) {return !(inside.indexOf(i) > -1);});
  }, 
  setPlayToRandom: function () {    
    playlist.continuousPlayback = false;
    playlist.resetPlayOrder();
  },
  setPlayToContinuous: function() {
    playlist.continuousPlayback = true;
  },
  playNextContinuous: function() {
    var pls = playlist;
    var currentVideoIndex = pls.videoIndexes.indexOf(playr.videoId);
    if (currentVideoIndex < (pls.videoIndexes.length - 1)) {
      pls.playVideoId(pls.videoIndexes[currentVideoIndex + 1]);
    }
  },
  playNextRandom: function() {
    var pls = playlist;
    if (pls.playedSoFar.length == pls.videoIndexes.length) {
      pls.resetPlayOrder();
    }
    var randomId = pls.arrayGetRandom(pls.arrayDiff(pls.videoIndexes, pls.playedSoFar));
    pls.playedSoFar.push(randomId);
    pls.playVideoId(randomId);
  },
  playNext: function() {
    pls = playlist;
    if (pls.continuousPlayback) {
      pls.playNextContinuous();
    } else {
      pls.playNextRandom();
    }
  },
  removeFromPlaylist: function(videoId) {
    var pls = playlist;
    pls.list[videoId].element.parentNode.removeChild(pls.list[videoId].element);
    delete(pls.list[videoId]);
    pls.videoIndexes.splice(pls.videoIndexes.indexOf(videoId), 1);
    if (pls.videoIndexes.indexOf(videoId) != -1) { 
      pls.playedSoFar.splice(pls.playedSoFar.indexOf(videoId), 1) 
    };

    pls.updateVideoOrder();
    pls.updateAddressBar('remove');
  },  
  dragSourceElement: null,
  handleDragStart: function(e) {
    this.style.opacity = '0.8';  // this / e.target is the source node.
    playlist.dragSourceElement = this;
  },
  handleDragEnter: function(e) {
    this.classList.add('over');
  },
  handleDragOver: function(e) {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  },
  handleDragLeave: function(e) {
    this.classList.remove('over');
  },
  handleDrop: function(e) {
    var pls = playlist;
    if (e.stopPropagation) {
      e.stopPropagation(); // Stops some browsers from redirecting.
    }
    // Don't do anything if dropping the same column we're dragging.
    if (pls.dragSourceElement != this) {
      var videoId = this.getElementsByClassName('VideoId')[0].value;
      var dragSourceVideoId = pls.dragSourceElement.getElementsByClassName('VideoId')[0].value;
      this.parentNode.insertBefore(pls.dragSourceElement, this);
      
      pls.videoIndexes.splice(pls.videoIndexes.indexOf(dragSourceVideoId), 1);
      pls.videoIndexes.splice(pls.videoIndexes.indexOf(videoId), 0, dragSourceVideoId);
      pls.updateVideoOrder(dragSourceVideoId);
      pls.updateAddressBar('remove');
    }
    return false;
  },
  handleDragEnd: function(e) {
    this.style.opacity = '1.0';  // this / e.target is the source node.
    this.classList.remove('over');
  },
  handleDoubleClick: function(e) {
    this.classList.remove('over');
    var clickedVideoId = this.getElementsByClassName('VideoId')[0].value;
    playlist.playVideoId(clickedVideoId);
    scrollToTop();
  },
  handleClick: function(e) {
    this.classList.toggle('over');
  },
  getNewVideoNode: function(videoId) {
    var newItem = document.createElement('div');
    newItem.className = 'ListElement';
    newItem.draggable = true;
    newItem.innerHTML = '<span>'+videoId+'</span>\n' +
      '<input type="hidden" name="videoId" class="VideoId" value="'+videoId+'" />\n' +
      '<a href="javascript:void(0);" class="RemoveButton" title="Remove from Playlist"><img src="images/btnRemove.png" /></a>\n' +
      '<a href="javascript:void(0);" class="DragButton" title="Click And Drag to Rearrange the Playlist"><img src="images/btnDrag.png" /></a>';
    return newItem;
  },
  getTitleFromSource: function(videoId) {
    var url = 'https://gdata.youtube.com/feeds/api/videos/'+videoId+'?v=2&alt=json';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    var response = xmlHttp.responseText;
    var videoFunc = new Function('return '+response);
    return videoFunc().entry.title['$t'];
  },
  setTitleForPlaylistItem: function(id) {
    var list = playlist.list;
    if (list[id].title === null) {
      list[id].title = playlist.getTitleFromSource(id);
    }
    list[id].element.getElementsByTagName('span')[0].innerHTML = list[id]['index'] +' - ' + list[id].title;
  },
  setupPlaylistControlsForVideoId: function(videoId) {
    var item = playlist.list[videoId].element;
    var removeButton = item.getElementsByClassName('RemoveButton')[0];
    var dragButton = item.getElementsByClassName('DragButton')[0];

    item.addEventListener('dblclick', playlist.handleDoubleClick, false);
    item.addEventListener('click', playlist.handleClick, false);

    item.addEventListener('dragstart', playlist.handleDragStart, false);
    item.addEventListener('dragenter', playlist.handleDragEnter, false);
    item.addEventListener('dragover', playlist.handleDragOver, false);
    item.addEventListener('dragleave', playlist.handleDragLeave, false);
    item.addEventListener('drop', playlist.handleDrop, false);
    item.addEventListener('dragend', playlist.handleDragEnd, false);
    removeButton.setAttribute('onClick', "playlist.removeFromPlaylist('"+videoId+"')");
  },
  adjustPlaylistSize: function(offset) {
    getElement('list').style.marginRight = getElement('player').offsetWidth - progressBar.offsetLeft - progressBar.offsetWidth + offset + 'px';
  },
  getPlaylistQueryString: function(videoIndexes) {
    var playlistQueryString = '?v=';
    for (index in videoIndexes) {
      playlistQueryString += videoIndexes[index]+',';
    }
    return playlistQueryString.substr(0, playlistQueryString.length - 1);
  },
  updateAddressBar: function(action) {
    var leDate = new Date;
    var playerState = {
      videoIndexes: playlist.videoIndexes,
    };
    window.history.pushState(playerState, 'playr.me', playlist.getPlaylistQueryString(playlist.videoIndexes));
  },
  addVideoIds: function(ids) {
    var retval = false;
    for (var key in ids) {
      retval = playlist.addVideoId(ids[key]) || retval;
    }
    if (retval === true) {
      playlist.updateAddressBar('add');
    }

    return retval;
  },
  addVideoId: function(id) {    
    var list = playlist.list;
    var videoIndexes = playlist.videoIndexes;
    var retval = false;
    if (list[id] === undefined) {
      var newItem = playlist.getNewVideoNode(id);
      getElement('list').appendChild(newItem);
      
      if (videoIndexes.indexOf(id) == -1) {
        list[id] = {
          'id': id,
          'element': newItem,
          'title': null
        };

        videoIndexes.push(id);
        list[id]['index'] = videoIndexes.length;

        playlist.setupPlaylistControlsForVideoId(id);
        playlist.setTitleForPlaylistItem(id);
      }
      
      if (videoIndexes.length == 1) {
        playlist.playVideoId(id);
        scrollToTop();
      }
      playlist.updateAddressBar('add');
      retval = true;
    }
    return retval;
  },
  getVideoIdsFromAddress: function(address) {
    var match = address.match(/([?\&]v\=)([\w-,]+)/gi);
    var videoIds = null;
    if (match != null) {
      videoIds = match[0].substr(3).split(',');
    }
    return videoIds;
  },
  getVideoIdsFromAddressBar: function() {
    return playlist.getVideoIdsFromAddress(window.location.toString());
  },
  resetPlayOrder: function() {
    playlist.playedSoFar = [playr.videoId];
  },
  initialize: function() {
    // Add first item to playlist
    // and play it.
    var pls = playlist;
    var videoIds = pls.getVideoIdsFromAddressBar();
    if (videoIds) {
      pls.addVideoIds(videoIds);
    } else {
      // Default video ID
      pls.addVideoId(pls.DEFAULT_VIDEO_ID);
    }
  },
  handleStatusChange: function(e) {
    var pls = playlist;
    switch (playr.status) {
      case 'YOUTUBE PLUGIN LOADED':
        pls.initialize();
        break;
      case 'VIDEO HAS ENDED':
        pls.playNext();
        break;
      case 'PLAYBACK SET TO RANDOM':
        pls.setPlayToRandom();
        break;
      case 'PLAYBACK SET TO CONTINUOUS':
        pls.setPlayToContinuous();
        break;
    }
  }
};

document.addEventListener("playrStatusChanged", playlist.handleStatusChange);
