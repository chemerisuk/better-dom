describe("DOM.register", function() {
    it("allows extending the $Element prototype", function() {
        var empty = DOM.mock();

        DOM.register({ test: function() { return 555 } });

        expect(DOM.create("a").test()).toBe(555);
        expect(empty.test()).toBe(empty);
    });

    it("allows to specify default behavior", function() {
        var empty = DOM.mock();

        DOM.register({
            test: function() { return "a" }
        }, function() {
            return function() { return "b" };
        });

        expect(DOM.create("a").test()).toBe("a");
        expect(empty.test()).toBe("b");
    });
});
