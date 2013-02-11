<!DOCTYPE html>
<html id="home" lang="en">
<head>
  <meta charset=utf-8 />
  <title>YouTubeTools</title>
  <link href="css/embed.css" rel="stylesheet" type="text/css">
  <?php include_once("track.php") ?>
</head>
<body>
  <div id="makeMeAPlayer" class="YouTubePlayer">
    <div id="ze_player" class="YouTubePlayerScreen"/></div>
    <div class="DefaultControls"/>
      <a href="javascript:void(0);" class="PlayButton"><img src="images/btnPlay.png" /></a>
      <a href="javascript:void(0);" class="PauseButton"><img src="images/btnPause.png" /></a>

      <a href="javascript:void(0);" class="FullScreenButton"><img src="images/btnFullScreen.png" /></a>
      <span class="TimePassed">00:00:00</span>
    </div>
    <div class="Progress">
      <span class="ProgressBar"><span class="ProgressSoFar"></span></span>
    </div>
    <div class="Playlist">
      <div class="PlaylistControls">
        <input class="VideoUrl" type="textbox" />
        <a href="javascript:void(0);" class="AddVideoButton"><img src="images/btnAddToPlaylist.png" /></a>
        <a href="javascript:void(0);" class="EmbedVideoButton"><img src="images/btnEmbed.png" /></a>
      </div>
      <div class="List"></div>
    </div>
  </div>

  <!-- load all the libraries first -->
  <script type="text/javascript" src="http://www.google.com/jsapi"></script>
  <script type="text/javascript" src="js/swfobject.js"></script>

  <script type="text/javascript" src="js/player.js"></script>
  <script type="text/javascript">
    (new YouTubeTool).makePlayer('makeMeAPlayer', 'ze_player', true);
  </script>
</body>
</html>
