import {jsdomAdaptor} from '@mathjax/src/js/adaptors/jsdomAdaptor.js';
import {VERSION} from '@mathjax/src/js/components/version.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[jsdom]/jsdomAdaptor', VERSION, 'DOMadaptor');
}

if (MathJax.startup) {
  MathJax.startup.registerConstructor('jsdomAdaptor', () => jsdomAdaptor(MathJax.config.JSDOM));
  MathJax.startup.useAdaptor('jsdomAdaptor', true);
}
