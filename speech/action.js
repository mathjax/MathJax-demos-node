require('mathjax3/mathjax3/util/asyncLoad/node.js');
require('mathjax3/mathjax3/a11y/semantic-enrich.js');
const STATE = require('mathjax3/mathjax3/core/MathItem.js').STATE;

//
//  Remove the data-semantic-* attributes other than data-semantic-speech
//
function removeSemanticData(math) {
    math.root.walkTree(node => {
        const attributes = node.attributes.getAllAttributes();
        delete attributes.xmlns;
        for (const name of Object.keys(attributes)) {
            if (name.substr(0, 14) === 'data-semantic-' && name !== 'data-semantic-speech') {
                delete attributes[name];
            }
        }
    });
}

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
