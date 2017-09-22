import { WEBKIT_PREFIX } from "../const";

const TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend";
const ANIMATION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend";

function AnimationHandler(node, animationName) {
    this.node = node;
    this.style = node.style;
    this.eventType = animationName ? ANIMATION_EVENT_TYPE : TRANSITION_EVENT_TYPE;
    this.animationName = animationName;
}

AnimationHandler.prototype = {
    handleEvent(e) {
        if (!this.animationName || e.animationName === this.animationName) {
            if (this.animationName) {
                this.style.animationName = "";
                this.style.animationDirection = "";
            }

            this.node.removeEventListener(this.eventType, this, true);

            if (typeof this.callback === "function") {
                this.callback();
            }
        }
    },
    start(callback, animationDirection) {
        this.callback = callback;

        if (this.animationName) {
            this.style.animationName = this.animationName;
            this.style.animationDirection = animationDirection;
        }

        this.node.addEventListener(this.eventType, this, true);
    }
};

export default AnimationHandler;
