(function() {
  var include = function(path, async) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = path;
    script.async = false;
    head.appendChild(script);
  }

  include('http://www.google.com/jsapi');
  include('js/swfobject.js');
  include('js/playr.js');
  include('js/player.js');
})();
