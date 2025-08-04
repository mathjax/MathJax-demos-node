/*************************************************************************
 *
 *  jsdom/Jsdom.js
 *
 *  Utilities for MathJax v4 command-line tools using jsdom.
 *
 * ----------------------------------------------------------------------
 *
 *  Copyright (c) 2025 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {Util} from '../mjs/util/Util.js';
import {JSDOM} from 'jsdom';
Util.altDOM = true;

export const Jsdom = {
  JSDOM: JSDOM,
  
  hooks: {
    loader(_args, config) {
      config.load = config.load.filter((name) => name !== 'adaptors/liteDOM');
      config.load.unshift('adaptors/jsdom');
    },

    typeset(_args, config) {
      config.JSDOM = JSDOM;
    },

    async args(args) {
      if (Util.direct) {
        const {jsdomAdaptor} = await Util.import('@mathjax/src/js/adaptors/jsdomAdaptor.js');
        Util.adaptor = (args) => jsdomAdaptor(JSDOM, Util.config.adaptor(args));
      }
    }
  },
};
