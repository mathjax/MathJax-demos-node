import './lib/custom-mixin.js';

import {MyHandler} from '../js/custom-mixin.js';

if (MathJax.startup) {
  MathJax.startup.extendHandler(handler => MyHandler(handler));
}
