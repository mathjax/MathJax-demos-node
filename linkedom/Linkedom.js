/*************************************************************************
 *
 *  linkedom/Linkedom.js
 *
 *  Utilities for MathJax v4 command-line tools using linkedom.
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
import {parseHTML as LINKEDOM} from 'linkedom';
Util.altDOM = true;

export const Linkedom = {
  LINKEDOM: LINKEDOM,
  
  hooks: {
    loader(_args, config) {
      config.paths.linkedom = new URL('./linkedomAdaptor', import.meta.url).pathname;
      const i = config.load.indexOf('adaptors/liteDOM');
      if (i >= 0) {
        config.load.splice(i, 1);
      }
      config.load.unshift('[linkedom]/linkedomAdaptor');
    },

    typeset(_args, config) {
      config.LINKEDOM = LINKEDOM;
    },

    async args(args) {
      if (Util.direct) {
        const {linkedomAdaptor} = await Util.import('@mathjax/src/js/adaptors/linkedomAdaptor.js');
        Util.adaptor = (args) => linkedomAdaptor(LINKEDOM, Util.config.adaptor(args));
      }
    }
  },
};
