require('mathjax-full/js/util/asyncLoad/node.js');
// This is loaded to ensure `STATE.ENRICHED` is set.
require('mathjax-full/js/a11y/semantic-enrich.js');
const {newState, STATE} = require('mathjax-full/js/core/MathItem.js');


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
// Moves all speech elements into aria-labels for SVG output. This allows for
// elements without containers to have some limited exploration.
//
// Note, that here we cannot walk the source tree, as alterations are to be
// done on the typeset element, if it is a SVG node.
//
function speechToRoles(math) {
  const root = math.typesetRoot;
  const adaptor = math.adaptor;
  const svg = adaptor.tags(root, 'svg')[0];
  if (!svg) return;
  adaptor.removeAttribute(svg, 'aria-hidden');
  adaptor.removeAttribute(svg, 'role');
  const children = [svg];
  while (children.length) {
    let child = children.shift();
    if (adaptor.kind(child) === '#text') continue;
    if (adaptor.hasAttribute(child, 'data-semantic-speech')) {
      let text = adaptor.getAttribute(child, 'data-semantic-speech');
      adaptor.setAttribute(child, 'aria-label', text);
      adaptor.setAttribute(child, 'role', 'img');
      adaptor.removeAttribute(child, 'data-semantic-speech');
    }
    children.push(...adaptor.childNodes(child));
  }
}

//
// Sets the rendered roots role to image if their is an aria-label to speak
// custom elements.
//
function roleImg(math) {
  const adaptor = math.adaptor;
  const root = math.typesetRoot;
  if (adaptor.hasAttribute(root, 'aria-label')) {
    adaptor.setAttribute(root, 'role', 'img');
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
  if (!MathJax.config.options) {
    MathJax.config.options = {};
  }
  if (!MathJax.config.options.sre) {
    MathJax.config.options.sre = {};
  }
  Object.assign(MathJax.config.options.sre, config);
};

//
// Let's define some new states for enlisting new renderActions into the queue.
//
// STATE.ENRICHED is the priority of the enrichment. Enrichment happens before
// elements are rendered (i.e., typeset) and therefore all attributes added during
// enrichment will be part of the MathItem.
//
// STATE 1000 is so hight that any other render action should be done by
// then. That is, the MathItem is fully typeset in the document.
//
newState('SIMPLIFY', STATE.ENRICHED + 1);
newState('ROLE', 1000);
newState('DESCRIBE', STATE.ROLE + 1);

//
// The renderActions needed for manipulating MathItems with speech entries.
// We define three render actions, each with two functions:
//    The first function is the one for when the document's render() method is called.
//    The second is for when a MathItem's render(), rerender() or convert() method is called.
//
// simplify: Removes the data-semantic-attributes except speech directly after enrichment.
//
// role: Adds an aria role to the container element so aria-labels are spoken on custom elements.
//       This happens after typesetting.
//
// describe: Rewrites speech attributes into aria-labels with img roles in SVGs.
//       This happens after container elements are rewritten.
//
exports.speechAction = {
  simplify: [
    STATE.SIMPLIFY,
    (doc) => {
      for (const math of doc.math) {
        removeSemanticData(math);
      }
    },
    (math, doc) => {
      removeSemanticData(math);
    }
  ],
  role: [
    STATE.ROLE,
    (doc) => {
      for (const math of doc.math) {
        roleImg(math);
      }
    },
    (math, doc) => {
      roleImg(math);
    }
  ],
  describe: [
    STATE.DESCRIBE,
    (doc) => {
      for (const math of doc.math) {
        speechToRoles(math);
      }
    },
    (math, doc) => {
      speechToRoles(math);
    }
  ]

};
