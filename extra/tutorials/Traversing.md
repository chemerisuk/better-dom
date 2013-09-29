`child` method is used to access Nth child element of the current one. Index could be negative to grab a child starting from the end in right to left order.

    var body = DOM.find("body");

    body.child(0); // => first body child
    body.child(-1); // => last body child