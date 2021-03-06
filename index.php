<!DOCTYPE html>
<html id="home" lang="en">
<head>
  <meta charset=utf-8 />
  <title>Playr.me</title>
  <link href="css/main.css" rel="stylesheet" type="text/css">
  <?php if (@file_exists('./track.php')) { include_once("track.php"); } ?>
</head>
<body>
  <div id="about"><a href="http://seevishal.com" target="new">MY BLOG</a></div>
  <div id="player">
    <div id="screenContainer"><div id="playerScreen"></div></div><br />
    <div id="controls">      
      <a id="btnPlay" href="javascript:void(0);" title="Play"><img src="images/btnPlay.png" /></a>
      <a id="btnPause" href="javascript:void(0);" title="Pause"><img src="images/btnPause.png" /></a>
      <div id="volumeControl" title="Click to Set Volume"><div id="slider"></div><div id="volumeBack"></div></div>
      <a href="javascript:void(0);" id="btnContinuous" title="Switch to Random Playback"><img src="images/btnContinuous.png" /></a>
      <a href="javascript:void(0);" id="btnRandom" title="Switch to Continuous Playback"><img src="images/btnRandom.png" /></a>        
      <a id="btnFullScreen" href="javascript:void(0);" title="Make Fullscreen"><img src="images/btnFullScreen.png" /></a>
      <a id="btnEndFullScreen" href="javascript:void(0);" title="Exit Fullscreen"><img src="images/btnEndFullScreen.png" /></a>      
      <span id="timePassed">00:00:00</span>      
    </div><br />
    <div id="progressBox">
      <span id="progressBar"><span id="progressSoFar"></span></span>
    </div><br />
    <div id="playlist">
      <div id="list"></div>
    </div>
  </div>
  <div id="videoSearch">
    <input id="txtVideoSearch" type="textbox" placeholder="Search YouTube"/>
    <div id="results"></div>
  </div>

  <!-- load all the libraries first -->
  <script type="text/javascript" src="js/main.js"></script>
  <script>
    var getElement = function(id) {
      return document.getElementById(id);
    }
    var progressBar = getElement('progressBar');
    var list = getElement('list');
    list.style.marginRight = player.offsetWidth - progressBar.offsetLeft - progressBar.offsetWidth + 8 + 'px';
  </script>
</body>
</html>
