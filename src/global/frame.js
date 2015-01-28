import { DOM, WINDOW, VENDOR_PREFIXES } from "../const";

var raf = WINDOW.requestAnimationFrame,
    craf = WINDOW.cancelAnimationFrame,
    lastTime = 0;

/* istanbul ignore else */
if (!(raf && craf)) {
    VENDOR_PREFIXES.forEach((prefix) => {
        prefix = prefix.toLowerCase();

        raf = raf || WINDOW[prefix + "RequestAnimationFrame"];
        craf = craf || WINDOW[prefix + "CancelAnimationFrame"];
    });
}

/**
 * Executes a callback in the next frame
 * @memberof DOM
 * @alias DOM.requestFrame
 * @param {Fuction} callback function to execute in the next frame
 * @return {Number} - id of the frame
 * @example
 * DOM.requestFrame(function() {
 *   // postpone removing a div to the next frame
 *   div.remove();
 * });
 */
DOM.requestFrame = (callback) => {
    /* istanbul ignore else */
    if (raf) {
        return raf.call(WINDOW, callback);
    } else {
        // use idea from Erik Möller's polyfill:
        // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
        var currTime = Date.now();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));

        lastTime = currTime + timeToCall;

        return WINDOW.setTimeout(() => { callback(currTime + timeToCall) }, timeToCall);
    }
};

/**
 * Cancel a scheduled frame
 * @memberof DOM
 * @alias DOM.cancelFrame
 * @param {Number} frameId id of the frame
 * @example
 * var frameId = DOM.requestFrame(function() {
 *   div.remove();
 * });
 * // div won't be removed
 * DOM.cancelFrame(frameId);
 */
DOM.cancelFrame = (frameId) => {
    /* istanbul ignore else */
    if (craf) {
        craf.call(WINDOW, frameId);
    } else {
        WINDOW.clearTimeout(frameId);
    }
};
