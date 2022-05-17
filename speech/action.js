require('mathjax-full/js/util/asyncLoad/node.js');
// This is loaded to import `STATE.ENRICHED` is set.
require('mathjax-full/js/a11y/semantic-enrich.js');
const {STATE} = require('mathjax-full/js/core/MathItem.js');

//
//  Remove the data-semantic-* attributes other than data-semantic-speech
//
function removeSemanticData(math) {
  math.root.walkTree(node => {
    const attributes = node.attributes.getAllAttributes();
    delete attributes.xmlns;    // some internal nodes get this attribute for some reason
    for (const name of Object.keys(attributes)) {
      if (name.substr(0, 14) === 'data-semantic-' && name !== 'data-semantic-speech') {
        delete attributes[name];
      }
    }
  });
}


//
// Moves a speech element into the description element for SVG output.
//
// Note, that here we cannot walk the source tree, as we alterations are to be
// done on the typeset element, if it is a SVG node.
//
function speechToDescription(math) {
  const root = math.typesetRoot;
  const adaptor = math.adaptor;
  const svg = adaptor.childNodes(root)[0];
  if (!svg || adaptor.kind(svg) !== 'svg') return;
  const children = [svg];
  while (children.length) {
    let child = children.shift();
    if (adaptor.kind(child) === '#text') continue;
    if (adaptor.hasAttribute(child, 'data-semantic-speech')) {
      let desc = adaptor.create('desc');
      let text = adaptor.text(adaptor.getAttribute(child, 'data-semantic-speech'));
      adaptor.append(desc, text);
      adaptor.append(child, desc);
      adaptor.removeAttribute(child, 'data-semantic-speech');
    }
    children.push(...adaptor.childNodes(child));
  }
}

//
// Configures SRE from key value pairs by populating MathJax's config options.
//
exports.dataPairs = function(data) {
  const config = {};
  if (data) {
    for (let i = 0, key; key = data[i]; i++) {
      let value = data[++i];
      config[key] = value || false;
    }
  }
  return config;
};

exports.sreconfig = function(data) {
  const config = exports.dataPairs(data);
  if (data) {
    for (let i = 0, key; key = data[i]; i++) {
      let value = data[++i];
      config[key] = value || false;
    }
  }
  if (!MathJax.config.options) {
    MathJax.config.options = {};
  }
  if (!MathJax.config.options.sre) {
    MathJax.config.options.sre = {};
  }
  Object.assign(MathJax.config.options.sre, config);
};


//
//  The renderActions needed to remove the data-semantic-attributes.
//    STATE.ENRICHED is the priority of the enrichment, so this will run just after enrichment.
//    The first function is the one for when the document's render() method is called.
//    The second is for when a MathItem's render(), rerender() or convert() method is called.
//
exports.speechAction = {
  simplify: [
    STATE.ENRICHED + 1,
    (doc) => {
      for (const math of doc.math) {
        removeSemanticData(math);
      }
    },
    (math, doc) => {
      removeSemanticData(math);
    }
  ],
  describe: [
    1000,
    (doc) => {
      for (const math of doc.math) {
        speechToDescription(math);
      }
    },
    (math, doc) => {
      speechToDescription(math);
    }
  ]

};
