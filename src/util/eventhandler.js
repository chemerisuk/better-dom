import { $Element } from "../element/index";
import SelectorMatcher from "./selectormatcher";
import HOOK from "./eventhooks";

function getEventProperty(name, e, type, currentTarget) {
    switch (name) {
    case "type":
        return type;
    case "target":
        return $Element(e.target);
    case "currentTarget":
        return $Element(currentTarget);
    case "relatedTarget":
        return $Element(e.relatedTarget);
    }

    var value = e[name];

    if (typeof value === "function") {
        return () => value.apply(e, arguments);
    }

    return value;
}

function EventHandler(context, node, props) {
    this.context = context;
    this.node = node;
    this.props = props || [];
}

EventHandler.prototype = {
    handleEvent(e) {
        if (EventHandler.supress !== this.type) {
            const currentTarget = this.matcher ? this.matcher(e.target) : this.node;
            // early stop when target doesn't match selector
            if (currentTarget) {
                const args = this.props.map((name) => getEventProperty(
                    name, e, this.type, currentTarget));
                // prevent default if handler returns false
                if (this.callback.apply(this.context, args) === false) {
                    e.preventDefault();
                }
            }
        }
    },
    subscribe(type, selector, callback) {
        const hook = HOOK[type];

        this.type = type;
        this.callback = callback;
        this.matcher = SelectorMatcher(selector, this.node);

        if (hook) hook(this);

        this.node.addEventListener(this._type || this.type, this, !!this.capturing);
    },
    unsubscribe() {
        this.node.removeEventListener(this._type || this.type, this, !!this.capturing);
    }
};

export default EventHandler;
