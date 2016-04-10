describe("manipulation", function() {
    "use strict";

    describe("remove", function() {
        var div;

        beforeEach(function() {
            div = DOM.create("div>a+a");
            // italics = div.nextAll(".removable");
        });

        it("should remove element(s) from DOM", function() {
            expect(div.remove()).toBe(div);
            expect(document.getElementById("test")).toBeNull();

            // expect(italics.remove()).toBe(italics);
            expect(DOM.findAll(".removable").length).toBe(0);
        });

        it("should check if element has parent", function() {
            expect(div.remove().remove()).toBe(div);
        });

        it("does nothing for empty nodes", function() {
            var empty = DOM.mock();

            expect(empty.remove()).toBe(empty);
        });

        // it("should throw error if argument is invalid", function() {
        //     expect(function() { div.remove(1); }).toThrow();
        // });
    });

    function createDivHtml(className) {
        return "<div class='" + className + "'></div>";
    }

    function createDivHtmlWhitespaced(className) {
        return "   <div class='" + className + "'></div>  ";
    }

    function createArray(className) {
        return DOM.createAll("<i class='$0'></i><b class='$0'></b>".split("$0").join(className));
    }

    function expectToBeReplaced(id) {
        expect(document.getElementById(id)).toBeNull();
    }

    function _forIn(obj, callback, thisPtr) {
        for (var prop in obj) {
            callback.call(thisPtr, obj[prop], prop, obj);
        }
    }

    describe("append, prepend, after, before", function() {
        var checkStrategies = {
                prepend: function(el) { return el.child(0); },
                append: function(el) { return el.child(-1); },
                after: function(el) { return el.next(); },
                before: function(el) { return el.prev(); }
            },
            div;

        beforeEach(function() {
            jasmine.sandbox.set("<div id='test'><a></a></div>");

            div = DOM.find("#test");
        });

        it("should accept html string", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivHtml(strategy);

                expect(checkMethod(div[strategy](arg))).toHaveClass(strategy);
            });
        });

        it("should accept empty string", function() {
            var link = div.child(0);

            _forIn(checkStrategies, function(checkMethod, strategy) {
                expect(checkMethod(link[strategy](""))).toBeMock();
            });
        });

        it("should trim html string", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivHtmlWhitespaced(strategy);

                expect(checkMethod(div[strategy](arg))).toHaveClass(strategy);
            });
        });

        it("should accept functor", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                var arg = function() { return createDivHtml(strategy); };

                expect(checkMethod(div[strategy](arg))).toHaveClass(strategy);
            });
        });

        // it("accept DOMElement", function() {
        //     _forIn(checkStrategies, function(checkMethod, strategy) {
        //         //var arg = DOM.create(createDiv(strategy));
        //         var arg = DOM.create(createDivHtml(strategy)),
        //             otherDiv = DOM.create("<div>");

        //         expect(checkMethod(div[strategy](arg))).toHaveClass(strategy);

        //         otherDiv.value("<section>This <mark>highlighted</mark>?</section>");

        //         expect(checkMethod(div[strategy](otherDiv))).toHaveTag("div");
        //         expect(otherDiv.find("section")).toHaveTag("section");
        //     });
        // });

        it("access array of $Element", function() {
            var sandbox = DOM.find("#" + jasmine.sandbox.id);

            _forIn(checkStrategies, function(_, strategy) {
                div[strategy](createArray(strategy));

                expect(sandbox.findAll("." + strategy).length).toBe(2);
            });
        });

        // it("should throw error if argument is invalid", function() {
        //     var callProp = function(strategy) {
        //             return function() {
        //                 div[strategy](1);
        //             };
        //         };

        //     _forIn(checkStrategies, function(checkMethod, strategy) {
        //         expect(callProp(strategy)).toThrow();
        //     });
        // });

        it("should return this", function() {
            _forIn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivHtml(strategy);

                expect(div[strategy](arg)).toBe(div);
            });
        });

        it("should work properly on detached elements", function() {
            div.remove();

            expect(div.append(createDivHtml("append")).child(-1)).toHaveClass("append");
            expect(div.prepend(createDivHtml("prepend")).child(0)).toHaveClass("prepend");
            expect(div.after(createDivHtml("after")).next()).toBeMock();
            expect(div.before(createDivHtml("before")).prev()).toBeMock();
        });
    });

    describe("replace", function() {
        var div;

        beforeEach(function() {
            jasmine.sandbox.set("<div id='test'><a></a></div>");

            div = DOM.find("#test");
        });

        it("should accept html string", function() {
            expect(div.replace(createDivHtml("replace"))).toBe(div);

            expectToBeReplaced("test", "replace");
        });

        // it("should throw error if argument is invalid", function() {
        //     expect(function() { div.replace(1); }).toThrow();
        // });
    });

});