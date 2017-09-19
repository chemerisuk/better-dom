import { $Element } from "../element/index";
import SelectorMatcher from "./selectormatcher";
import HOOK from "./eventhooks";


function EventHandler(context, node, props, selector) {
    this.context = context;
    this.node = node;
    this.props = props || [];
    this.matcher = SelectorMatcher(selector, node);
}

EventHandler.prototype = {
    handleEvent(e) {
        this.event = e;

        if (EventHandler.supress !== this.type) {
            // update value of currentTarget if selector exists
            this.currentTarget = this.matcher ? this.matcher(e.target) : this.node;
            // early stop when target doesn't match selector
            if (this.currentTarget) {
                const args = this.props.map(this.getEventProperty, this);
                // prevent default if handler returns false
                if (this.callback.apply(this.context, args) === false) {
                    e.preventDefault();
                }
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
        case "currentTarget":
            return $Element(this.currentTarget);
        case "relatedTarget":
            return $Element(e.relatedTarget);
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

        this.node.addEventListener(this._type || this.type, this, !!this.capturing);
    },
    unsubscribe() {
        this.node.removeEventListener(this._type || this.type, this, !!this.capturing);
    }
};

export default EventHandler;
