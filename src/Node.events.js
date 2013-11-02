define(["Node"], function($Node, $Element, SelectorMatcher, EventHandler, _forEach, _legacy, _forOwn, _slice, _every, _makeError) {
    "use strict";

    // DOM EVENTS
    // ----------

    (function() {
        var eventHooks = {},
            legacyCustomEventName = "dataavailable";

        /**
         * Bind a DOM event to the context
         * @param  {String}   type event type with optional selector
         * @param  {Array}    [props] event properties to pass to the callback function
         * @param  {Object}   [context] callback context
         * @param  {Function|String} callback event callback/property name
         * @return {$Node}
         * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
         */
        $Node.prototype.on = function(type, props, context, callback, /*INTERNAL*/once) {
            var eventType = typeof type,
                selector, index;

            if (eventType === "string") {
                index = type.indexOf(" ");

                if (~index) {
                    selector = type.substr(index + 1);
                    type = type.substr(0, index);
                }

                // handle optional props argument
                if (Object.prototype.toString.call(props) !== "[object Array]") {
                    once = callback;
                    callback = context;
                    context = props;
                    props = undefined;
                }

                // handle optional context argument
                if (typeof context !== "object") {
                    once = callback;
                    callback = context;
                    context = undefined;
                }
            }

            return _legacy(this, function(node, el) {
                var hook, handler;

                if (eventType === "string") {
                    if (once) {
                        callback = (function(originalCallback) {
                            return function() {
                                // remove event listener
                                el.off(handler.type, handler.context, callback);

                                return originalCallback.apply(el, arguments);
                            };
                        }(callback));
                    }

                    handler = EventHandler(type, selector, context, callback, props, el);
                    handler.type = selector ? type + " " + selector : type;
                    handler.callback = callback;
                    handler.context = context || el;

                    if (hook = eventHooks[type]) hook(handler);

                    if (document.addEventListener) {
                        node.addEventListener(handler._type || type, handler, !!handler.capturing);
                    } else {
                        // IE8 doesn't support onscroll on document level
                        if (el === DOM && type === "scroll") node = window;

                        node.attachEvent("on" + (handler._type || type), handler);
                    }
                    // store event entry
                    el._listeners.push(handler);
                } else if (eventType === "object") {
                    _forOwn(type, function(value, name) { el.on(name, value) });
                } else {
                    throw _makeError("on", el);
                }
            });
        };

        /**
         * Bind a DOM event to the context and the callback only fire once before being removed
         * @param  {String}   type type of event with optional selector to filter by
         * @param  {Array}    [props] event properties to pass to the callback function
         * @param  {Object}   [context] callback context
         * @param  {Function|String} callback event callback/property name
         * @return {$Node}
         * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
         */
        $Node.prototype.once = function() {
            var args = _slice(arguments);

            args.push(true);

            return this.on.apply(this, args);
        };

        /**
         * Unbind a DOM event from the context
         * @param  {String}          type type of event
         * @param  {Object}          [context] callback context
         * @param  {Function|String} [callback] event handler
         * @return {$Node}
         * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
         */
        $Node.prototype.off = function(type, context, callback) {
            if (typeof type !== "string") throw _makeError("off", this);

            if (arguments.length === 2) {
                callback = context;
                context = !callback ? undefined : this;
            }

            return _legacy(this, function(node, el) {
                _forEach(el._listeners, function(handler, index, events) {
                    if (handler && type === handler.type && (!context || context === handler.context) && (!callback || callback === handler.callback)) {
                        type = handler._type || handler.type;

                        if (document.removeEventListener) {
                            node.removeEventListener(type, handler, !!handler.capturing);
                        } else {
                            // IE8 doesn't support onscroll on document level
                            if (el === DOM && type === "scroll") node = window;

                            node.detachEvent("on" + type, handler);
                        }

                        delete events[index];
                    }
                });
            });
        };

        /**
         * Triggers an event of specific type and executes it's default action if it exists
         * @param  {String} type type of event
         * @param  {Object} [detail] event details
         * @return {Boolean} true if default action wasn't prevented
         * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
         */
        $Node.prototype.fire = function(type, detail) {
            if (typeof type !== "string") {
                throw _makeError("fire", this);
            }

            return _every(this, function(el) {
                var node = el._node,
                    hook = eventHooks[type],
                    handler = {},
                    isCustomEvent, canContinue, event;

                if (hook) hook(handler);

                if (document.createEvent) {
                    event = document.createEvent("HTMLEvents");

                    event.initEvent(handler._type || type, true, true);
                    event.detail = detail;

                    canContinue = node.dispatchEvent(event);
                } else {
                    isCustomEvent = handler.custom || !("on" + type in node);
                    event = document.createEventObject();
                    // store original event type
                    event.srcUrn = isCustomEvent ? type : undefined;
                    event.detail = detail;

                    node.fireEvent("on" + (isCustomEvent ? legacyCustomEventName : handler._type || type), event);

                    canContinue = event.returnValue !== false;
                }

                // Call a native DOM method on the target with the same name as the event
                // IE<9 dies on focus/blur to hidden element
                if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
                    // Prevent re-triggering of the same event
                    EventHandler.veto = type;

                    node[type]();

                    EventHandler.veto = false;
                }

                return canContinue;
            });
        };

        // firefox doesn't support focusin/focusout events
        if ("onfocusin" in document.createElement("a")) {
            _forOwn({focus: "focusin", blur: "focusout"}, function(value, prop) {
                eventHooks[prop] = function(handler) { handler._type = value; };
            });
        } else {
            eventHooks.focus = eventHooks.blur = function(handler) {
                handler.capturing = true;
            };
        }

        if (document.createElement("input").validity) {
            eventHooks.invalid = function(handler) {
                handler.capturing = true;
            };
        }

        if (document.attachEvent && !window.CSSKeyframesRule) {
            // input event fix via propertychange
            document.attachEvent("onfocusin", (function() {
                var legacyEventHandler = function() {
                        if (capturedNode && capturedNode.value !== capturedNodeValue) {
                            capturedNodeValue = capturedNode.value;
                            // trigger special event that bubbles
                            $Element(capturedNode).fire("input");
                        }
                    },
                    capturedNode, capturedNodeValue;

                if (window.addEventListener) {
                    // IE9 doesn't fire oninput when text is deleted, so use
                    // legacy onselectionchange event to detect such cases
                    // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
                    document.attachEvent("onselectionchange", legacyEventHandler);
                }

                return function() {
                    var target = window.event.srcElement,
                        type = target.type;

                    if (capturedNode) {
                        capturedNode.detachEvent("onpropertychange", legacyEventHandler);
                        capturedNode = undefined;
                    }

                    if (type === "text" || type === "password" || type === "textarea") {
                        (capturedNode = target).attachEvent("onpropertychange", legacyEventHandler);
                    }
                };
            })());

            if (!window.addEventListener) {
                // submit event bubbling fix
                document.attachEvent("onkeydown", function() {
                    var e = window.event,
                        target = e.srcElement,
                        form = target.form;

                    if (form && target.type !== "textarea" && e.keyCode === 13 && e.returnValue !== false) {
                        $Element(form).fire("submit");

                        return false;
                    }
                });

                document.attachEvent("onclick", (function() {
                    var handleSubmit = function() {
                            var form = window.event.srcElement;

                            form.detachEvent("onsubmit", handleSubmit);

                            $Element(form).fire("submit");

                            return false;
                        };

                    return function() {
                        var target = window.event.srcElement,
                            form = target.form;

                        if (form && target.type === "submit") {
                            form.attachEvent("onsubmit", handleSubmit);
                        }
                    };
                })());

                eventHooks.submit = function(handler) {
                    handler.custom = true;
                };
            }
        }
    }());
});
