describe("watch", function() {
    var link;

    beforeEach(function() {
        link = DOM.create("a[href=url title=text]");
    });

    it("should execute callback after the setter call", function() {
        var spy1 = jasmine.createSpy("watcher1"),
            spy2 = jasmine.createSpy("watcher2"),
            oldHref = link.get("href");

        expect(link.watch("href", spy1)).toBe(link);
        expect(link.watch("title", spy2)).toBe(link);

        link.set("href", "url_changed");
        expect(spy1).toHaveBeenCalledWith("url_changed", oldHref);
        expect(spy2).not.toHaveBeenCalled();

        link.set("title", "modified");
        expect(spy2).toHaveBeenCalledWith("modified", "text");
        expect(spy1.calls.count()).toBe(1);

        link.set("123");
        expect(spy1.calls.count()).toBe(1);
        expect(spy1.calls.count()).toBe(1);

        link.set("title", "new");
        expect(spy2).toHaveBeenCalledWith("new", "modified");
    });

    it("should execute for visibility methods", function(done) {
        var spy = jasmine.createSpy("watcher");

        link.watch("aria-hidden", spy);

        spy.and.callFake(function(newValue, oldValue) {
            expect(newValue).toBe("true");
            expect(oldValue).toBeFalsy();
        });

        link.hide(function() {
            expect(spy.calls.count()).toBe(1);

            spy.and.callFake(function(newValue, oldValue) {
                expect(newValue).toBe("false");
                expect(oldValue).toBe("true");
            });

            link.show(function() {
                expect(spy.calls.count()).toBe(2);

                done();
            });
        });
    });

    it("should allow to unregister handler", function() {
        var spy = jasmine.createSpy("watcher");

        expect(link.watch("title", spy)).toBe(link);

        link.set("title", "modified");
        expect(spy).toHaveBeenCalledWith("modified", "text");
        expect(spy.calls.count()).toBe(1);

        expect(link.unwatch("href", spy)).toBe(link);
        link.set("title", "modified1");
        expect(spy.calls.count()).toBe(2);

        expect(link.unwatch("title", spy)).toBe(link);
        link.set("title", "modified2");
        expect(spy.calls.count()).toBe(2);
    });

    it("should work for the value shortcut", function() {
        var spy = jasmine.createSpy("watcher"),
            input = DOM.create("input");

        link.watch("innerHTML", spy);
        link.set("test1");

        expect(spy).toHaveBeenCalledWith("test1", "");

        spy.calls.reset();

        input.watch("value", spy);
        input.set("test2");

        expect(spy).toHaveBeenCalledWith("test2", "");
    });
});
