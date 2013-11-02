describe("traversing", function() {
    "use strict";

    var link;

    beforeEach(function() {
        setFixtures("<div><b></b><b></b><i></i><a id='test'><strong></strong><em></em></a><b></b><i></i><i></i></div>");

        link = DOM.find("#test");
    });

    describe("next, prev, parent, child", function() {
        describe("next, prev, parent", function() {
            it("should return an appropriate element", function() {
                var expectedResults = {
                        next: "b",
                        prev: "i",
                        parent: "div"
                    };

                _forIn(expectedResults, function(tagName, methodName) {
                    expect(link[methodName]()._node).toHaveTag(tagName);
                });
            });

            it("should search for the first matching element if selector exists", function() {
                expect(link.next("i")._node).toHaveTag("i");
                expect(link.prev("b")._node).toHaveTag("b");
                expect(link.parent("body")._node).toHaveTag("body");
            });
        });

        describe("child", function() {
            it("should accept optional filter", function() {
                expect(link.child(0)._node).toHaveTag("strong");
                expect(link.child(0, "a")._node).toBeFalsy();
            });

            it("should throw error if the first arg is not a number", function() {
                expect(function() { link.child({}); }).toThrow();
            });

        });

        it("should return empty element if value is not found", function() {
            var unknownEl = link.find("unknown");

            expect(unknownEl.next().length).toBe(0);
            expect(unknownEl.prev().length).toBe(0);
            expect(unknownEl.parent().length).toBe(0);
            expect(unknownEl.child(0).length).toBe(0);
        });
    });

    describe("children, nextAll, prevAll", function() {
        it("should return an appropriate collection of elements", function() {
            var expectedResults = {
                    children: "strong em".split(" "),
                    nextAll: "b i i".split(" "),
                    prevAll: "i b b".split(" ")
                },
                isOK = function(methodName) {
                    return function(el, index) {
                        expect(el._node).toHaveTag(expectedResults[methodName][index]);
                    };
                };

            _forIn(expectedResults, function(tagName, methodName) {
                for (var arr = link[methodName](), i = 0, n = arr.length; i < n; ++i) {
                    isOK(arr[i]);
                }
            });
        });

        it("should filter matching elements by optional selector", function() {
            var filters = {
                    children: "em",
                    nextAll: "i",
                    prevAll: "i"
                },
                haveTag = function(tagName) {
                    return function(el) {
                        expect(el._node).toHaveTag(tagName);
                    };
                };

            _forIn(filters, function(tagName, methodName) {
                for (var arr = link[methodName](tagName), i = 0, n = arr.length; i < n; ++i) {
                    haveTag(tagName);
                }
            });
        });

        it("should return empty element if value is not found", function() {
            var unknownEl = link.find("unknown");

            expect(unknownEl.nextAll().length).toBe(0);
            expect(unknownEl.prevAll().length).toBe(0);
            expect(unknownEl.children().length).toBe(0);
        });
    });

    function _forIn(obj, callback, thisPtr) {
        for (var prop in obj) {
            callback.call(thisPtr, obj[prop], prop, obj);
        }
    }

});