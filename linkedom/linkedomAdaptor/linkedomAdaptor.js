import {linkedomAdaptor} from '@mathjax/src/js/adaptors/linkedomAdaptor.js';
import {VERSION} from '@mathjax/src/js/components/version.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[linkedom]/linkedomAdaptor', VERSION, 'DOMadaptor');
}

if (MathJax.startup) {
  MathJax.startup.registerConstructor('linkedomAdaptor', () => linkedomAdaptor(MathJax.config.LINKEDOM));
  MathJax.startup.useAdaptor('linkedomAdaptor', true);
}
