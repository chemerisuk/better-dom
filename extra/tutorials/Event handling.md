Event handling is a big part of coding for DOM. There are some features included into the library that help developers to avoid potential issues and keep their code easier to maintain.

### Get rid of the event object
Event callbacks loose the event object argument that improves testability of code.

    // NOTICE: handler don't have e as the first argument
    input.on("click", function() {...});
    // NOTICE: using of array to pass event properties into callback
    input.on("keydown", ["which", "altKey"], function(which, altKey) {...});

### Correct return false interpretation
jQuery has strange behavior of event handler that returns false which is a [cause of confusion](http://fuelyourcoding.com/jquery-events-stop-misusing-return-false/) for a lot of people. This library has standards-based behavior and does what everybody expects.

    // NOTICE: returning false prevents ONLY default action
    DOM.find("a").on("click", function() { return false; });


### stopPropagation is evil
If you need to call stopPropagation in an event handler in 95% situations you are doing something wrong. Solutions that utilize this function becomes to be complex, moreover they introduce compatability problems. Probably every experienced javascript developer had a issue where a third party script has blocked some useful event and there is no way to fix exept forking the extension's source code.

That's why it's _not possible to call stopPropagation_ using better-dom. And this is not a bug _it's a feature_.

### Late binding
Usually an event listener is bound when the `addEventListener` method is called. This causes trouble when the handler is changed. The library helps to solve the problem by allowing to listent to an event using _object property_ instead of just function.

    var link = DOM.find(".test-link"),
        obj = {handleClick: function() { console.log("Hello!"); }};

    link.on("click", obj, "handleClick");
    // every click on the link now logs "Hello!" into console
    obj.handleClick = function() { console.log("Hello, Maksim!"); }
    // every click on the link now logs "Hello, Maksim!" into console

### Callback systems are brittle
There are no callback arrays, so any event listener can't break another one (read a [nice article](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/) for additional details).

    DOM.ready(function() { throw Error("exception in a bad code"); });
    // NOTICE: you'll always see the message in console
    DOM.ready(function() { console.log("Nothing can break your code") });
