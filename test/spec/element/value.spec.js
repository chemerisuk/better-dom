describe("value", function() {
  "use strict";

  var div;

  beforeEach(function() {
    div = DOM.create("div>a+a");
  });

  it("should replace child element(s) from node with provided element", function() {
    expect(div[0].childNodes.length).toBe(2);
    expect(div.value(DOM.create("b"))).toBe(div);
    expect(div[0].childNodes.length).toBe(1);
    expect(div[0].childNodes[0].tagName).toBe("B");
  });

  it("should return innerHTML string from node when called with no args", function() {
    expect(div.value()).toBe("<a></a><a></a>");
  });

});

