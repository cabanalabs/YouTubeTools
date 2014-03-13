var getElement = function(id) {
  return document.getElementById(id);
};

var scrollToTop = function() {
  document.body.scrollTop = document.documentElement.scrollTop = 0;
};

var convertSecondsToTime = function(secs) {
  var zeroPad = function(number) {
    return (number > 9 ? number : '0'+number);
  };  
  var hours = Math.floor(secs / (60 * 60));
  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);
  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);
  return zeroPad(hours)+':'+zeroPad(minutes)+':'+zeroPad(seconds);
};

