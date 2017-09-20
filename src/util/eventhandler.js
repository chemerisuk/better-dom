import { WINDOW } from "../const";
import { $Element } from "../element/index";
import SelectorMatcher from "./selectormatcher";
import HOOK from "./eventhooks";

// https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
var supportsPassive = false;
try {
    const opts = Object.defineProperty({}, "passive", {
        get() {
            supportsPassive = true;
        }
    });
    WINDOW.addEventListener("test", null, opts);
} catch (e) {}

function EventHandler(context, node, options) {
    this.context = context;
    this.node = node;
    this.options = options;

    if (options.selector) {
        this.matcher = SelectorMatcher(options.selector, node);
    }
}

EventHandler.prototype = {
    handleEvent(e) {
        this.event = e;
        // update value of currentTarget if selector exists
        this.currentTarget = this.matcher ? this.matcher(e.target) : this.node;
        // early stop when target doesn't match selector
        if (this.currentTarget) {
            if (this.options.once === true) {
                this.unsubscribe();
            }

            var args = [];
            if (this.options.args) {
                args = this.options.args.map(this.getEventProperty, this);
            }
            // prevent default if handler returns false
            if (this.callback.apply(this.context, args) === false) {
                e.preventDefault();
            }
        }
    },
    getEventProperty(name) {
        const e = this.event;

        switch (name) {
        case "type":
            return this.type;
        case "target":
            return $Element(e.target);
        case "relatedTarget":
            return $Element(e.relatedTarget);
        case "currentTarget":
            return $Element(this.currentTarget);
        }

        const value = e[name];

        if (typeof value === "function") {
            return () => value.apply(e, arguments);
        } else {
            return value;
        }
    },
    subscribe(type, callback) {
        const hook = HOOK[type];

        this.type = type;
        this.callback = callback;

        if (hook) hook(this);

        this.node.addEventListener(this._type || this.type, this, this.getLastArgument());
    },
    unsubscribe() {
        this.node.removeEventListener(this._type || this.type, this, this.getLastArgument());
    },
    getLastArgument() {
        var lastArg = !!this.options.capture;
        if (this.options.passive && supportsPassive) {
            lastArg = {passive: true, capture: lastArg};
        }
        return lastArg;
    }
};

export default EventHandler;
