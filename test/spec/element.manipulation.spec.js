describe("manipulation", function() {
    "use strict";

    describe("remove", function() {
        var div, italics;

        beforeEach(function() {
            div = DOM.create("div>a*2^i.removable*2");
            italics = div.nextAll(".removable");
        });

        it("should remove element(s) from DOM", function() {
            expect(div.remove()).toBe(div);
            expect(document.getElementById("test")).toBeNull();

            expect(italics.remove()).toBe(italics);
            expect(DOM.findAll(".removable").length).toBe(0);
        });

        it("should check if element has parent", function() {
            expect(div.remove().remove()).toBe(div);
        });

        // it("should throw error if argument is invalid", function() {
        //     expect(function() { div.remove(1); }).toThrow();
        // });
    });

    describe("append, prepend, after, before", function() {
        var checkStrategies = {
                prepend: function(el) { return el.child(0); },
                append: function(el) { return el.child(-1); },
                after: function(el) { return el.next(); },
                before: function(el) { return el.prev(); }
            },
            div;

        beforeEach(function() {
            setFixtures("<div id='test'><a></a></div>");

            div = DOM.find("#test");
        });

        it("should accept html string", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivHtml(strategy);

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should trim html string", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivHtmlWhitespaced(strategy);

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should accept functor", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                var arg = function() { return createDivHtml(strategy); };

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should accept DOMElement", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                //var arg = DOM.create(createDiv(strategy));
                var arg = DOM.create(createDivHtml(strategy)),
                    otherDiv = DOM.create("div");

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);

                otherDiv.set("<section>This <mark>highlighted</mark>?</section>");

                expect(checkMethod(div[strategy](otherDiv))._node).toHaveTag("div");
                expect(otherDiv.find("section")._node).toHaveTag("section");
            });
        });

        it("should support emmet-like expressions", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivEmmet(strategy);

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should accept multiple arguments", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                expect(div[strategy](createDivHtml(strategy + 1), createDivEmmet(strategy + 2))).toBe(div);

                expect(checkMethod(div)._node).toHaveClass(strategy + (strategy === "prepend" || strategy === "after" ? 1 : 2));
                checkMethod(div).remove();
                expect(checkMethod(div)._node).toHaveClass(strategy + (strategy === "prepend" || strategy === "after" ? 2 : 1));
                checkMethod(div).remove();
            });
        });

        it("should throw error if argument is invalid", function() {
            var callProp = function(strategy) {
                    return function() {
                        div[strategy](1);
                    };
                };

            _forIn(checkStrategies, function(checkMethod, strategy) {
                expect(callProp(strategy)).toThrow();
            });
        });

        it("should return this", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivHtml(strategy);

                expect(div[strategy](arg)).toBe(div);
            });
        });

        it("should work properly on detached elements", function() {
            div.remove();

            expect(div.append(createDivHtml("append")).child(-1)._node).toHaveClass("append");
            expect(div.prepend(createDivHtml("prepend")).child(0)._node).toHaveClass("prepend");
            expect(div.after(createDivHtml("after")).next()._node).toBeUndefined();
            expect(div.before(createDivHtml("before")).prev()._node).toBeUndefined();
        });
    });

    describe("replace", function() {
        var div;

        beforeEach(function() {
            setFixtures("<div id='test'><a></a></div>");

            div = DOM.find("#test");
        });

        it("should accept html string", function() {
            expect(div.replace(createDivHtml("replace"))).toBe(div);

            expectToBeReplaced("test", "replace");
        });

        it("should throw error if argument is invalid", function() {
            expect(function() { div.replace(1); }).toThrow();
        });
    });

    function createDivHtml(className) {
        return "<div class='" + className + "'></div>";
    }

    function createDivHtmlWhitespaced(className) {
        return "   <div class='" + className + "'></div>  ";
    }

    function createDivEmmet(className) {
        return "div." + className;
    }

    function expectToBeReplaced(id) {
        expect(document.getElementById(id)).toBeNull();
    }

    function _forIn(obj, callback, thisPtr) {
        for (var prop in obj) {
            callback.call(thisPtr, obj[prop], prop, obj);
        }
    }

});