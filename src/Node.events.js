define(["Node", "Node.supports"], function(DOMNode, DOMElement, SelectorMatcher, EventHelper, _isArray, _map, _forEach, _forOwn, _makeError) {
    "use strict";

    (function() {
        var eventHooks = {},
            veto = false,
            processObjectParam = function(value, name) { this.on(name, value); },
            createEventHandler = function(type, selector, options, callback, extras, context, thisArg) {
                var currentTarget = thisArg._node,
                    matcher = SelectorMatcher(selector),
                    defaultEventHandler = function(e) {
                        if (veto !== type) {
                            var eventHelper = new EventHelper(e || window.event, currentTarget),
                                fn = typeof callback === "string" ? context[callback] : callback,
                                args;

                            // handle modifiers
                            if (options.cancel) eventHelper.preventDefault();
                            if (options.stop) eventHelper.stopPropagation();

                            // populate extra event arguments
                            if (options.args) {
                                args = _map(options.args, eventHelper.get, eventHelper);
                                
                                if (extras) args.push.apply(args, extras);
                            } else {
                                args = extras ? extras.slice(0) : [];
                            }

                            if (fn) fn.apply(context, args);
                        }
                    };

                return !selector ? defaultEventHandler : function(e) {
                    var el = window.event ? window.event.srcElement : e.target;

                    for (; el && el !== currentTarget; el = el.parentNode) {
                        if (matcher.test(el)) {
                            defaultEventHandler(e);

                            break;
                        }
                    }
                };
            },
            createCustomEventHandler = function(originalHandler, type) {
                var handler = function() {
                        if (window.event._type === type) originalHandler();
                    };

                handler.type = originalHandler.type;
                handler._type = "dataavailable";
                handler.callback = originalHandler.callback;

                return handler;
            };

        /**
         * Bind a DOM event to the context
         * @memberOf DOMNode.prototype
         * @param  {String}   type event type
         * @param  {Object}   [options] callback options
         * @param  {Function|String} callback event callback
         * @param  {Array}    [args] extra arguments
         * @param  {Object}   [context] callback context
         * @return {DOMNode}  current context
         */
        DOMNode.prototype.on = function(type, options, callback, args, context) {
            var eventType = typeof type,
                hook, handler, selector;

            if (eventType === "string") {
                if (typeof options !== "object") {
                    context = args;
                    args = callback;
                    callback = options;
                    options = {};
                }

                if (!_isArray(args)) {
                    context = args;
                    args = null;
                }

                selector = type.substr(type.indexOf(" ") + 1);

                if (selector === type) {
                    selector = undefined;
                } else {
                    type = type.substr(0, type.length - selector.length - 1);
                }
                
                handler = createEventHandler(type, selector, options, callback, args || [], context || this, this);
                handler.type = selector ? type + " " + selector : type;
                handler.callback = callback;
                handler.context = context;

                if (hook = eventHooks[type]) hook(handler);

                if (document.addEventListener) {
                    this._node.addEventListener(handler._type || type, handler, !!handler.capturing);
                } else {
                    // handle custom events for IE8
                    if (~type.indexOf(":") || handler.custom) handler = createCustomEventHandler(handler, type);

                    this._node.attachEvent("on" + (handler._type || type), handler);
                }
                // store event entry
                this._listeners.push(handler);
            } else if (eventType === "object") {
                _forOwn(type, processObjectParam, this);
            } else {
                throw _makeError("on", this);
            }

            return this;
        };

        /**
         * Unbind a DOM event from the context
         * @memberOf DOMNode.prototype
         * @param  {String}   type event type
         * @param  {Object}   [context] callback context
         * @param  {Function} [callback] event handler
         * @return {DOMNode} current context
         */
        DOMNode.prototype.off = function(type, context, callback) {
            if (typeof type !== "string") {
                throw _makeError("off", this);
            }

            if (callback === undefined) {
                callback = context;
                context = undefined;
            }

            _forEach(this._listeners, function(handler, index, events) {
                var node = this._node;

                if (handler && type === handler.type && (!context || context === handler.context) && (!callback || callback === handler.callback)) {
                    type = handler._type || handler.type;

                    if (document.removeEventListener) {
                        node.removeEventListener(type, handler, !!handler.capturing);
                    } else {
                        node.detachEvent("on" + type, handler);
                    }
                    
                    delete events[index];
                }
            }, this);

            return this;
        };

        /**
         * Triggers an event of specific type
         * @memberOf DOMNode.prototype
         * @param  {String} eventType type of event
         * @param  {Object} [detail] data to attach
         * @return {DOMNode} current context
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.fire("focus");
         * // receive focus to the element
         * domLink.fire("custom:event", {x: 1, y: 2});
         * // trigger a custom:event on the element
         */
        DOMNode.prototype.fire = function(type, detail) {
            if (typeof type !== "string") {
                throw _makeError("fire", this);
            }

            var node = this._node,
                isCustomEvent = ~type.indexOf(":"),
                hook = eventHooks[type],
                canContinue, event, handler = {};

            if (hook) hook(handler);

            if (document.dispatchEvent) {
                event = document.createEvent(isCustomEvent ? "CustomEvent" : "Event");

                if (isCustomEvent) {
                    event.initCustomEvent(handler._type || type, true, false, detail);
                } else {
                    event.initEvent(handler._type || type, true, true);
                }

                canContinue = node.dispatchEvent(event);
            } else {
                event = document.createEventObject();

                isCustomEvent = isCustomEvent || handler.custom;

                if (isCustomEvent) {
                    // use private attribute to store custom event name
                    event._type = type;
                    event.detail = detail;
                }

                node.fireEvent("on" + (isCustomEvent ? "dataavailable" : handler._type || type), event);

                canContinue = event.returnValue !== false;
            }

            // Call a native DOM method on the target with the same name as the event
            // IE<9 dies on focus/blur to hidden element
            if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
                // Prevent re-triggering of the same event
                veto = type;
                
                node[type]();

                veto = false;
            }

            return this;
        };

        // firefox doesn't support focusin/focusout events
        if (DOMNode.prototype.supports("onfocusin", "input")) {
            _forOwn({focus: "focusin", blur: "focusout"}, function(value, prop) {
                eventHooks[prop] = function(handler) { handler._type = value; };
            });
        } else {
            eventHooks.focus = eventHooks.blur = function(handler) {
                handler.capturing = true;
            };
        }

        if (DOMNode.prototype.supports("oninvalid", "input")) {
            eventHooks.invalid = function(handler) {
                handler.capturing = true;
            };
        }

        if (!document.addEventListener) {
            // input event fix via propertychange
            document.attachEvent("onfocusin", (function() {
                var propertyChangeEventHandler = function() {
                        var e = window.event;

                        if (e.propertyName === "value") {
                            var event = document.createEventObject();

                            event._type = "input";

                            // trigger special event that bubbles
                            e.srcElement.fireEvent("ondataavailable", event);
                        }
                    },
                    capturedEl;

                return function() {
                    var target = window.event.srcElement;

                    if (capturedEl) {
                        capturedEl.detachEvent("onpropertychange", propertyChangeEventHandler);
                        capturedEl = null;
                    }

                    if (target.type === "input" || target.type === "textarea") {
                        (capturedEl = target).attachEvent("onpropertychange", propertyChangeEventHandler);
                    }
                };
            })());

            // submit event bubbling fix
            document.attachEvent("onkeydown", function() {
                var target = window.event.srcElement,
                    form = target.form;

                if (form && target.type !== "textarea" && window.event.keyCode === 13) {
                    DOMElement(form).fire("submit");

                    return false;
                }
            });

            document.attachEvent("onclick", (function() {
                var handleSubmit = function() {
                        var form = window.event.srcElement;

                        form.detachEvent("onsubmit", handleSubmit);

                        DOMElement(form).fire("submit");

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

            eventHooks.submit = eventHooks.input = function(handler) {
                handler.custom = true;
            };
        }
    }());
});