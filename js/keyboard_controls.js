var keyboardControls = kbc = {
  getKeyPressed: function(event) {
    var retval = -1;
    if (window.event) {
      retval = event.keyCode;
    } else {
      retval = event.which
    }
    return retval;
  },
  keyboardCommand: function(event) {
    if (kbc.getKeyPressed(event) == 32) {      
      playr.pauseOrPlay();
    }
  },
  initialize: function() {
    window.onkeyup = kbc.keyboardCommand;
    playr.player.onkeyup = kbc.keyboardCommand;
  },
  handleStatusChange: function(e) {
    switch (playr.status) {
      case 'YOUTUBE PLUGIN LOADED':
        kbc.initialize();
        break;
    };
  }
};
document.addEventListener("playrStatusChanged", keyboardControls.handleStatusChange);
