#! /usr/bin/env node

/*************************************************************************
 *
 *  direct/am2chtml
 *
 *  Uses MathJax v3 to convert a MathML string to an HTML string.
 *
 * ----------------------------------------------------------------------
 *
 *  Copyright (c) 2018 The MathJax Consortium
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

//
//  Load the packages needed for MathJax
//
const {mathjax} = require('mathjax-full/js/mathjax.js');
const {AsciiMath} = require('mathjax-full/js/input/asciimath.js');
const {CHTML} = require('mathjax-full/js/output/chtml.js');
const {liteAdaptor} = require('mathjax-full/js/adaptors/liteAdaptor.js');
const {RegisterHTMLHandler} = require('mathjax-full/js/handlers/html.js');
const {AssistiveMmlHandler} = require('mathjax-full/js/a11y/assistive-mml.js');

//
//  Get the command-line arguments
//
var argv = require('yargs')
    .demand(0).strict()
    .usage('$0 [options] "math" > file.html')
    .options({
        em: {
            default: 16,
            describe: 'em-size in pixels'
        },
        ex: {
            default: 8,
            describe: 'ex-size in pixels'
        },
        width: {
            default: 80 * 16,
            describe: 'width of container in pixels'
        },
        css: {
            boolean: true,
            describe: 'output the required CSS rather than the HTML itself'
        },
        fontURL: {
            default: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2',
            describe: 'the URL to use for web fonts'
        },
        assistiveMml: {
            boolean: true,
            default: false,
            describe: 'whether to include assistive MathML output'
        }
    })
    .argv;

//
//  Create DOM adaptor and register it for HTML documents
//
const adaptor = liteAdaptor({fontSize: argv.em});
const handler = RegisterHTMLHandler(adaptor);
if (argv.assistiveMml) AssistiveMmlHandler(handler);

//
//  Create input and output jax and a document using them on the content from the HTML file
//
const asciimath = new AsciiMath();
const chtml = new CHTML({fontURL: argv.fontURL});
const html = mathjax.document('', {InputJax: asciimath, OutputJax: chtml});

//
//  Typeset the math from the command line
//
const node = html.convert(argv._[0] || '', {
    display: !argv.inline,
    em: argv.em,
    ex: argv.ex,
    containerWidth: argv.width
});

//
//  If the --css option was specified, output the CSS,
//  Otherwise, typeset the math and output the HTML
//
if (argv.css) {
    console.log(adaptor.textContent(chtml.styleSheet(html)));
} else {
    console.log(adaptor.outerHTML(node));
}
