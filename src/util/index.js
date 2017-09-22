import { WINDOW, ELEMENT_NODE } from "../const";

const arrayProto = Array.prototype;

export const every = arrayProto.every;
export const each = arrayProto.forEach;
export const filter = arrayProto.filter;
export const map = arrayProto.map;
export const slice = arrayProto.slice;
export const isArray = Array.isArray;
export const keys = Object.keys;
export const raf = WINDOW.requestAnimationFrame;

export function computeStyle(node) {
    return node.ownerDocument.defaultView.getComputedStyle(node);
}

export function injectElement(node) {
    if (node && node.nodeType === ELEMENT_NODE) {
        return node.ownerDocument.getElementsByTagName("head")[0].appendChild(node);
    }
}
