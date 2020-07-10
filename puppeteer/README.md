# MathJax in Puppeteer

This example shows how to run MathJax within a headless Chrome instance using the [Puppeteer](https://developers.google.com/web/tools/puppeteer) library.  Although MathJax provides a lightweight DOM implementation (called `LiteDOM`) for use in node applications, it is limited in its scope, and there are reasons you may want to work within an actual browser DOM.  For example, when a character is used that is not in MathJax's fonts, MathJax can query the browser to attempt to determine the character's size, but this only works in an actual browser, not MathJax's `LiteDOM`.  Similarly, if you have specified `mtextInheritFont: true` or have set the `mtextFont`, MathJax asks the browser to compute the size of the resulting text strings.  So if you are processing expressions that contain characters not in MathJax's fonts, or are using inherited or explicit fonts for text-mode material, MathJax's `LiteDOM` will produce poorer quality results than in an actual browser.  Using an actual browser DOM, made available by Puppeteer, is one solution to this problem.

## The Example Code

There are two parts to this example, the first is a basic HTML file that contains

``` html
<!DOCTYPE html>
<html>
<head>
<title>MathJax in Puppeteer</title>
</head>
<body>
</body>
</html>
```

that is loaded into Puppeteer via a `file:` URL.  This is so that additional `file:` URLs can be used to load MathJax itself and any components that it needs to load (if a `data:` URL were used, Chrome's security model would not allow `file:` URL access, and MathJax could not be loaded).

The main code is in the `tex2svg` file.  It loads the required node packages, and processes command-line arguments (not shown here).  Then the HTML file shown above is loaded:

``` javascript
const html = 'file://' + path.resolve(__dirname, 'puppeteer.html');
```

and the MathJax component file (`tex-svg-full`) and root directory are set up:

``` javascript
const component = require.resolve('mathjax-full/es5/tex-svg-full.js');
const root = path.dirname(component);
```

The user-supplied TeX expression is obtained from the command line, and whether the math is in display mode is determined

``` javascript
const math = argv._[0] || '';
const display = {display: !argv.inline};
```

The MathJax configuration is created from the user-supplied values:

``` javascript
const config = 'MathJax = ' + JSON.stringify({
  tex: {
    packages: argv.packages.replace('\*', PACKAGES).split(/\s*,\s*/)
  },
  svg: {
    mtextFont: argv.textfont,
    merrorFont: argv.textfont,
    fontCache: (argv.fontCache ? 'local' : 'none')
  },
  loader: {
    paths: {
      mathjax: `file://${root}`
    }
  },
  startup: {
    typeset: false
  }
});
```

Note that this is a string, as it will be sent to Puppeteer to be executed.

Finally, the main code to do the conversion:

``` javascript
(async () => {
  const browser = await puppeteer.launch();       // launch the browser
  const page = await browser.newPage();           // and get a new page.
  await page.goto(html);                          // open the shell HTML page
  await page.addScriptTag({content: config});     // configure MathJax
  await page.addScriptTag({path: component});     // load the MathJax conponent
  return page.evaluate((math, display) => {       // the following is performed in the browser...
    return MathJax.startup.promise.then(() => {                      // wait for MathJax to be ready
      return MathJax.tex2svgPromise(math, display).then((m) => {     // convert TeX to svg
        return m.firstChild.outerHTML.replace(/&nbsp;/g, '\&#A0;')   //   then change &nbsp; to &#A0;
      });
    });
  }, math, display).then((svg) => {               // if successful:
    console.log(svg);                             //   output the resulting svg
    return browser.close();                       //   close the browser
  }).catch((e) => {                               // if there is an error:
    browser.close();                              //   close the browser
    throw e;                                      //   throw the error again (handled below)
  });
})().catch((e) => {                // If the process produces an error
  console.error(e.message);        //   reoport the error
});
```

This first launches the browser and creates a page within it, then navigates that page to the HTML file using the `file:` URL set up above.  Then we run the configuration script in the page in order to set up the `MathJax` variable, after which we load the MathJax component into the browser.

The `page.evaluate()` command does the real work.  It asks the browser to wait for the `MathJax.startup.promise` to be fulfilled (i.e., MathJax has loaded all its needed parts), and then uses `MathJax.tex2svgPromise()` to convert the TeX expression (passed to it) using the proper display mode (also passed to it) into an SVG DOM tree.  That is then serialized (via `outerHTML`) and returned to the node program, where it is printed, and the browser is closed.  If any error occurred during the process, the browser is closed, and the error message is printed.

Note that if you have many expressions to process, you could leave the browser running and perform multiple calls to `Mathjax.tex2svgPromise()` to convert the expressions.  That would avoid launching a separate Chrome instance for each expression, which would be rather inefficient.


## Installation

In order to try out this example you must install its dependencies.  Since the code relies on Puppeteer, that needs to be installed, so this directory contains a separate `package.json` file, and you should do the following:

``` bash
cd MathJax-demos-node/puppeteer
npm install
```

The `tex2svg` file should be an executable that you can run.  On non-unix systems, you may need to call

    node tex2svg 'tex-code' > file.svg

where `tex-code` is the TeX expression to typeset, and `file.svg` is the name of the file where you will store the SVG output.
