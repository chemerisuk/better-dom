var path = require("path");
var through = require("through")
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;

var es6modules = require("es6-module-transpiler");
var recast = require("es6-module-transpiler/node_modules/recast");

var Container = es6modules.Container;
var FileResolver = es6modules.FileResolver;
var BundleFormatter = es6modules.formatters.bundle;

var banner = [
    "/**",
    " * @file better-dom.js",
    " * @overview <%= pkg.name %>: <%= pkg.description %>",
    " * @version <%= pkg.version %> <%= new Date().toUTCString() %>",
    " * @copyright 2013-2014 <%= pkg.author %>",
    " * @license <%= pkg.license %>",
    " * @see <%= pkg.repository.url %>",
    " */"
].join("\n");

module.exports = function(dest) {
    if (!dest) throw new PluginError("compile", "Missing file option for compile");

    var firstFile = null;
    var container = null;

    function bufferContents(file) {
        if (file.isNull()) return; // ignore

        if (!firstFile) {
            firstFile = file;
            container = new Container({
                resolvers: [ new FileResolver([file.cwd]) ],
                formatter: new BundleFormatter()
            });
        }

        container.getModule(path.relative(file.cwd, file.path));
    }

    function endStream() {
        if (!firstFile || firstFile.isNull()) return;

        try {
            var ast = container.convert();
            var code = recast.print(ast[0]).code;
            // improve internal type names
            code = code.replace(/types\$\$(\$?\w+)/g, "$1");
            // remove generated prefix from constants
            code = code.replace(/const\$\$/g, "");
            // append banner
            code = banner + "\n" + code;
            // fix for browserify
            code = code.replace("}).call(this);", "})();\n");

            firstFile = firstFile.clone({contents: false});
            firstFile.path = path.join(firstFile.base, dest);
            firstFile.contents = new Buffer(code);

            this.emit("data", firstFile);
        } catch (err) {
            this.emit("error", new PluginError("compile", err, {fileName: firstFile.path}));
        }

        this.emit("end");
    }

    return through(bufferContents, endStream);
};
