var path = require("path");
var through = require("through")
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;

var es6modules = require("es6-module-transpiler");
var recast = require("es6-module-transpiler/node_modules/recast");

var Container = es6modules.Container;
var FileResolver = es6modules.FileResolver;
var BundleFormatter = es6modules.formatters.bundle;


module.exports = function(dest, options) {
    if (!dest) throw new PluginError("compile", "Missing file option for compile");

    options = options || {};

    var container = new Container({
        resolvers: [ new FileResolver(["src/"]) ],
        formatter: new BundleFormatter()
    });

    var firstFile = null;

    function bufferContents(file) {
        if (file.isNull()) return; // ignore

        container.getModule(file.path);

        if (!firstFile) firstFile = file;
    }

    function endStream() {
        if (!firstFile || firstFile.isNull()) {
            cb(null, firstFile);
            return;
        }

        try {
            var ast = container.convert();
            var code = recast.print(ast[0]).code;

            if (options.jsdocs === false) {
                // remove jsdoc comments from the output
                code = code.replace(/\/\*\*([\s\S]*?)\*\/\s+/gm, "");
            }

            if (options.banner) {
                code = options.banner + "\n" + code;
            }

            // fix for browserify
            code = code.replace("}).call(this)", "})()");

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
