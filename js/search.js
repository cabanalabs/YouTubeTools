var search = {
  txtVideoSearch: getElement('txtVideoSearch'),
  resultsBox: getElement('results'),
  lastKeywords: '',
  searchYouTube: function() {
    var keywords = encodeURIComponent(search.txtVideoSearch.value.trim());
    if (keywords.length == 0) {
      search.resultsBox.innerHTML = '';
      search.lastKeywords = '';
      playlist.adjustPlaylistSize(8);
    } else if (keywords != search.lastKeywords) {
      search.resultsBox.innerHTML = '';
      search.lastKeywords = keywords;
      var yt_url='https://gdata.youtube.com/feeds/api/videos?q='+keywords+'&format=5&max-results=15&v=2';
      var httpRequest;

      if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
      }

      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          search.showResults(httpRequest.responseXML);
        }
      };

      httpRequest.open('GET', yt_url);
      httpRequest.send();
    }
  },
  addSearchResult: function(id) {
    playlist.addVideoIds([id]);
  },
  playPreview: function(playButton, id) {
    playr.videoId = id;
    playlist.playVideoId(id);
    scrollToTop();
  },
  createResult: function(info) {
    var newItem = document.createElement('div');
    newItem.className = 'SearchResult';
    newItem.innerHTML = '<div class="PreviewTitle" id="video_title_'+info['videoId']+'">'+info['title']+'<br />'+info['duration']+'</div>' +
        '<img class="videoPreview" src="'+info['thumbnail']+'" />\n'+
        '<a href="javascript:search.addSearchResult(\''+info['videoId']+'\');" class="SearchResultAddButton" title="Add to Playlist"><img src="images/btnAddToPlaylist.png" /></a>' +
        '<a href="javascript:search.playPreview(this, \''+info['videoId']+'\');" class="SearchResultPlayButton" title="Preview"><img src="images/btnPlay.png" /></a>';
    search.resultsBox.appendChild(newItem);
  },
  showResults: function(response) {
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
        playlist.adjustPlaylistSize(0);
      }
      for(var i = 0; i < resultSets.length; i++) {
        search.createResult ({ 
          title : resultSets[i].getElementsByTagName(names.title)[0].childNodes[0].nodeValue,
          thumbnail : resultSets[i].getElementsByTagName(names.thumbnail)[0].attributes['url'].value,
          videoId : resultSets[i].getElementsByTagName(names.videoId)[0].childNodes[0].nodeValue,
          duration : convertSecondsToTime(resultSets[i].getElementsByTagName(names.duration)[0].attributes.getNamedItem('seconds').value)
        });
      }
    } else {
      alert('no go');
    }
  },
  restartPressTimer: function(event) {
    window.clearTimeout(window.keyDownTimer);
    window.keyDownTimer = window.setTimeout(search.searchYouTube, 350);
    event.stopPropagation();
  },
  initialize: function() {
    txtVideoSearch.onkeyup = search.restartPressTimer;
    txtVideoSearch.onfocus = function() {
      playr.updateStatus('IN SEARCH BOX NOW');
    };
    txtVideoSearch.onblur = function() {
      playr.updateStatus('NO LONGER IN SEARCH BOX');
    };
  },
  handleStatusChange: function(e) {
    if (playr.status === 'YOUTUBE PLUGIN LOADED') {
      search.initialize();
    }
  }
};

document.addEventListener("playrStatusChanged", search.handleStatusChange);
