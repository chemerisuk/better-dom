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
        expect(spy1).toHaveBeenCalledWith("href", "url_changed", oldHref);
        expect(spy2).not.toHaveBeenCalled();

        link.set("title", "modified");
        expect(spy2).toHaveBeenCalledWith("title", "modified", "text");
        expect(spy1.calls.count()).toBe(1);

        link.set("123");
        expect(spy1.calls.count()).toBe(1);
        expect(spy1.calls.count()).toBe(1);

        link.set("title", "new");
        expect(spy2).toHaveBeenCalledWith("title", "new", "modified");
    });

    it("should execute for visibility methods", function() {
        var spy = jasmine.createSpy("watcher");

        link.watch("aria-hidden", spy);

        spy.and.callFake(function(name, newValue, oldValue) {
            expect(name).toBe("aria-hidden");
            expect(newValue).toBe("true");
            expect(oldValue).toBeFalsy();
        });

        link.hide();
        expect(spy.calls.count()).toBe(1);

        spy.and.callFake(function(name, newValue, oldValue) {
            expect(name).toBe("aria-hidden");
            expect(newValue).toBe("false");
            expect(oldValue).toBe("true");
        });

        link.show();
        expect(spy.calls.count()).toBe(2);
    });
});
