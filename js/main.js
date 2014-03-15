(function() {
  var includes = [
    'http://www.google.com/jsapi',
    'js/swfobject.js',
    'js/common.js',
    'js/playlist.js',
    'js/playback_controls.js',
    'js/search.js',
    'js/keyboard_controls.js',
    'js/playr.js'
  ];
  var included = [];
  var checkLoadedScripts = function(path) {
    included.push(path);
    if (included.length === includes.length) {
      playr.start();
    }
  }
  var include = function(path, async) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = path;
    script.async = typeof async !== 'undefined' ? async : false;
    script.onload = checkLoadedScripts;
    head.appendChild(script);
  };

  for (idx = 0; idx < includes.length; idx++) {
    include(includes[idx]);
  }
})();
