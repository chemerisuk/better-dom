import { WINDOW } from "../const";

var raf = WINDOW.requestAnimationFrame,
    craf = WINDOW.cancelAnimationFrame;

if (!(raf && craf)) {
    ["ms", "moz", "webkit", "o"].some((prefix) => {
        raf = WINDOW[prefix + "RequestAnimationFrame"];
        craf = WINDOW[prefix + "CancelAnimationFrame"];

        return !!raf;
    });
}

DOM.nextFrame = (callback) => {
    if (raf) {
        return raf.call(WINDOW, callback);
    } else {
        return WINDOW.setTimeout(callback, 1000 / 60);
    }
};

DOM.cancelFrame = (frameId) => {
    if (craf) {
        craf.call(WINDOW, frameId);
    } else {
        WINDOW.clearTimeout(frameId);
    }
};
