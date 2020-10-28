require('mathjax-full/js/util/asyncLoad/node.js');
require('mathjax-full/js/a11y/semantic-enrich.js');
require('mathjax-full/js/a11y/sre-node.js');
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


const sreDefault = {
    domain: 'mathspeak',
    style: 'default'
};


// Configures SRE from key value pairs.
exports.sreconfig = function(data) {
    let config = {};
    if (data) {
        for (let i = 0, key; key = data[i]; i++) {
            let value = data[++i];
            config[key] = value || false;
        }
    }
    sre.setupEngine(Object.assign({}, sreDefault, config));
};


//
//  The renderActions needed to remove the data-semantic-attributes.
//    STATE.ENRICHED is the priority of the enrichment, so this will rung just after enrichment.
//    The first function is the one for when the document's render() method is called.
//    The second is for when a MathItem's render(), rerender() or convert() method is called.
//
exports.speechAction = {
  simplfy: [
    STATE.ENRICHED + 1,
    (doc) => {
      for (const math of doc.math) {
        removeSemanticData(math);
      }
    },
    (math, doc) => {
      removeSemanticData(math);
    }
  ]
};
