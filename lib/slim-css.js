//
//  Override the TeXFont stylesheet creation method
//
const TeXFont = require('mathjax3/mathjax3/output/chtml/fonts/tex.js').TeXFont;
const CSS = {width: 1 << 0, padding: 1 << 1, content: 1 << 2};

class SlimTeXFont extends TeXFont {
    //
    //  Make sure each character contains the text for the content of the mjx-c element
    //
    defineChars(name, chars) {
        super.defineChars(name, chars);
        let variant = this.variant[name];
        for (const n of Object.keys(chars)) {
            const options = chars[n][3];
            if (options && (options.css & CSS.content) && options.c) {
                options.c = options.c.replace(/\\[0-9A-F]+/ig,
                                                  x => String.fromCharCode(parseInt(x.substr(1), 16)));
            } else if (options) {
                options.c = String.fromCharCode(n);
            } else {
                chars[n][3] = {c: String.fromCharCode(n)};
            }
        }
    }

    addCharStyles(styles, vclass, n, data) {
        const [h, d, w, options] = data;
        const css = {};
        if (options.css) {
            if (options.css & CSS.width) {
                css.width = this.em(w);
            }
            if (options.css & CSS.padding) {
                css.padding = this.em0(h) + ' 0 ' + this.em0(d);
            }
        }
        if (options.f !== undefined) {
            css['font-family'] = 'MJXZERO, MJXTEX' + (options.f ? '-' + options.f : '');
        }
        const char = vclass + ' mjx-c[c="' + this.char(n) + '"]';
        if (Object.keys(css).length) {
            styles[char] = css;
        }
        if (options.ic) {
            const [MJX, noIC] = ['mjx-', ':not([noIC])' + char.substr(1) + ':last-child'];
            styles[MJX + 'mi' + noIC] =
            styles[MJX + 'mo' + noIC] = {
                width: this.em(w + options.ic)
            };
        }
    }
}

//
// Override the TeXAtom wrapper
//

const CHTMLTextNode = require('mathjax3/mathjax3/output/chtml/Wrappers/TextNode.js').CHTMLTextNode;

class SlimTextNode extends CHTMLTextNode {
    toCHTML(parent) {
        const text = this.node.getText();
        if (this.parent.variant === '-explicitFont') {
            this.adaptor.append(parent, this.text(text));
        } else {
            const map = this.font.variant[this.parent.variant].chars;
            const c = this.parent.stretch.c;
            const chars = this.parent.remapChars(c ? [c] : this.unicodeChars(text));
            for (const n of chars) {
                const C = this.text(map[n][3].c);
                this.adaptor.append(parent, this.html('mjx-c', {c: this.char(n)}, [C]));
            }
        }
    }
}

//
//  Hook the new TextNode into the wrapper factory
//
const CHTMLWrapperFactory = require('mathjax3/mathjax3/output/chtml/WrapperFactory.js').CHTMLWrapperFactory;
CHTMLWrapperFactory.defaultNodes[SlimTextNode.kind] = SlimTextNode;

module.exports = SlimTeXFont;
