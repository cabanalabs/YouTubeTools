<!DOCTYPE html>
<html id="home" lang="en">
<head>
  <meta charset=utf-8 />
  <title>Playr.me</title>
  <link href="css/main_new.css" rel="stylesheet" type="text/css">
  <?php include_once("track.php") ?>
</head>
<body>
  <div id="player">
    <div id="screenContainer"><div id="playerScreen"></div></div>
    <div id="controls">
      <a id="btnPlay" href="javascript:void(0);"><img src="images/btnPlay.png" /></a>
      <a id="btnPause" href="javascript:void(0);"><img src="images/btnPause.png" /></a>
      <a id="btnFullScreen" href="javascript:void(0);"><img src="images/btnFullScreen.png" /></a>
      <a id="btnEndFullScreen" href="javascript:void(0);"><img src="images/btnEndFullScreen.png" /></a>
      <span id="timePassed">00:00:00</span>
    </div>
    <div id="progressBox">
      <span id="progressBar"><span id="progressSoFar"></span></span>
    </div>
    <div id="playlist">
      <div id="playlistControls">
        <input id="txtVideoUrl" type="textbox" placeholder="Address of a YouTube video"/>
        <a href="javascript:void(0);" id="btnAddVideo"><img src="images/btnAddToPlaylist.png" /></a>
        <a href="javascript:void(0);" id="btnContinuous"><img src="images/btnContinuous.png" /></a>
        <a href="javascript:void(0);" id="btnRandom"><img src="images/btnRandom.png" /></a>        
      </div>
      <div id="list"></div>
    </div>
  </div>
  <!-- load all the libraries first -->
  <script type="text/javascript" src="http://www.google.com/jsapi"></script>
  <script type="text/javascript" src="js/swfobject.js"></script>
  <script type="text/javascript" src="js/player_new.js"></script>
</body>
</html>