import DOM from "./dom";

/**
 * Request animation frame helper
 * @memberOf DOM
 * @param  {Function}  callback  request animation frame callback
 * @return {Number}    rafId
 * @function
 */
DOM.raf = (function(win) {
    var lastTime = 0,
        propName = ["r", "webkitR", "mozR", "oR"].reduce((memo, name) => {
            var prop = name + "equestAnimationFrame";

            return memo || win[prop] && prop;
        }, null);

    if (propName) {
        return (callback) => { win[propName](callback) };
    } else {
        return (callback) => {
            var currTime = Date.now(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime));

            lastTime = currTime + timeToCall;

            if (timeToCall) {
                setTimeout(callback, timeToCall);
            } else {
                callback(currTime + timeToCall);
            }
        };
    }
}(this));
