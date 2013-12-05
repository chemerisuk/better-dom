// requestAnimationFrame implementation

var lastTime = 0;

window.requestAnimationFrame = function(callback) {
    var currTime = new Date().getTime(),
        timeToCall = Math.max(0, 16 - (currTime - lastTime));

    lastTime = currTime + timeToCall;

    if (timeToCall) {
        setTimeout(callback, timeToCall);
    } else {
        callback(currTime + timeToCall);
    }
};
