import { WINDOW } from "../const";

var raf = WINDOW.requestAnimationFrame,
    craf = WINDOW.cancelAnimationFrame;
/* istanbul ignore else */
if (!(raf && craf)) {
    ["ms", "moz", "webkit", "o"].some((prefix) => {
        raf = WINDOW[prefix + "RequestAnimationFrame"];
        craf = WINDOW[prefix + "CancelAnimationFrame"];

        return !!raf;
    });
}

DOM.nextFrame = (callback) => {
    /* istanbul ignore else */
    if (raf) {
        return raf.call(WINDOW, callback);
    } else {
        return WINDOW.setTimeout(callback, 1000 / 60);
    }
};

DOM.cancelFrame = (frameId) => {
    /* istanbul ignore else */
    if (craf) {
        craf.call(WINDOW, frameId);
    } else {
        WINDOW.clearTimeout(frameId);
    }
};
