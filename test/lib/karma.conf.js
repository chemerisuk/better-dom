basePath = "../..";

frameworks = ["jasmine"];

browsers = ["PhantomJS"];

files = [
    JASMINE,
    JASMINE_ADAPTER,
    "test/lib/jasmine-dom/*.js",
    "node_modules/lodash/lodash.js",
    "src/*.js",
    "test/spec/*.spec.js"
];
