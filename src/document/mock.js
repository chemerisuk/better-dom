import { register, each } from "../util/index";
import { $NullElement } from "../types";

register({
    /**
     * Return {@link $Element} initialized with all existing live extensions.
     * Also exposes private functions that do not usually exist. Accepts the
     * same arguments as {@link DOM.create}
     * @memberof $Document#
     * @alias $Document#mock
     * @param  {String}       value     EmmetString or HTMLString
     * @param  {Object|Array} [varMap]  key/value map of variables
     * @return {$Element} a mocked instance
     * @see $Document#create
     */
    mock(content, varMap) {
        if (!content) return new $NullElement();

        var result = this.create(content, varMap),
            mappings = this._["<%= prop('mappings') %>"],
            applyExtensions = (node) => {
                mappings.forEach((ext) => { ext(node) });

                each.call(node.children, applyExtensions);
            };

        if (mappings && mappings.length) {
            applyExtensions(result[0]);
        }

        return result;
    }
});
