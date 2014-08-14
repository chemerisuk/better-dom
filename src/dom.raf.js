import { WINDOW } from "./util/const";
import { DOM } from "./index";

var lastTime = 0,
    propName = ["r", "webkitR", "mozR", "oR"].reduce((memo, name) => {
        var prop = name + "equestAnimationFrame";

        return memo || WINDOW[prop] && prop;
    }, 0);

/**
 * Request animation frame helper
 * @memberof DOM
 * @alias DOM.raf
 * @param  {Function}  callback  request animation frame callback
 * @return {Number}    rafId
 */
DOM.raf = function(callback) {
    if (propName) {
        WINDOW[propName](callback);
    } else {
        var currTime = Date.now(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime));

        lastTime = currTime + timeToCall;

        if (timeToCall) {
            setTimeout(callback, timeToCall);
        } else {
            callback(currTime + timeToCall);
        }
    }
};
