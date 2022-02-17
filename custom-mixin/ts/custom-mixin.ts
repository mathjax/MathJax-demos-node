/*************************************************************
 *
 *  Copyright (c) 2018-2021 The MathJax Consortium
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

/**
 * @fileoverview  Mixin that adds semantic enrichment to internal MathML
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {Handler} from 'mathjax-full/js/core/Handler.js';
import {MathDocument, AbstractMathDocument, MathDocumentConstructor} from 'mathjax-full/js/core/MathDocument.js';
import {MathItem, AbstractMathItem, STATE, newState} from 'mathjax-full/js/core/MathItem.js';
import {OptionList, expandable} from 'mathjax-full/js/util/Options.js';


/*==========================================================================*/

/**
 * Generic constructor for Mixins
 */
export type Constructor<T> = new(...args: any[]) => T;

/**
 *  Constructor for AbstractMathItem
 */
export type AbstractMathItemConstructor<N, T, D> = Constructor<AbstractMathItem<N, T, D>>;
/**
 *  Constructor for AbstractMathDocument
 */
export type AbstractMathDocumentConstructor<N, T, D> = MathDocumentConstructor<AbstractMathDocument<N, T, D>>;

/*==========================================================================*/

/**
 * Add STATE value for our mixin action
 */
newState('MYACTION', 30);

/**
 * The functions added to MathItem for our mixin action
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface MyMathItem<N, T, D> extends MathItem<N, T, D> {

  /**
   * @param {MathDocument} document  The document where our action is occurring
   */
  myAction(document: MathDocument<N, T, D>): void;

}

/**
 * The mixin for adding our action to MathItems
 *
 * @param {B} BaseMathItem     The MathItem class to be extended
 * @return {MyMathItem}        The MathItem class with our action implemented
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 * @template B  The MathItem class to extend
 */
export function MyMathItemMixin<N, T, D, B extends AbstractMathItemConstructor<N, T, D>>(
  BaseMathItem: B
): Constructor<MyMathItem<N, T, D>> & B {

  return class extends BaseMathItem {

    /**
     * @param {MathDocument} document   The MathDocument for the MathItem
     */
    public myAction(_document: MathDocument<N, T, D>) {
      if (this.state() >= STATE.MYACTION) return;
      // do your action here
      console.log(this.math);
      // end of your actions
      this.state(STATE.ENRICHED);
    }

    /**
     * @override
     */
    public state(state: number = null, _restore: boolean = false) {
      if (state != null) {
        if (state < STATE.MYACTION && this._state >= STATE.MYACTION) {
          // undo the action, if needed when state is reset to an earlier state
        }
      }
      return this._state;
    }

  };

}

/*==========================================================================*/

/**
 * The functions added to MathDocument for our mixin action
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface MyMathDocument<N, T, D> extends AbstractMathDocument<N, T, D> {

  /**
   * Perform our action on the MathItems in the MathDocument
   *
   * @return {MyMathDocument}   The MathDocument (so calls can be chained)
   */
  myAction(): MyMathDocument<N, T, D>;

}

/**
 * The mixin for adding our action to MathDocuments
 *
 * @param {B} BaseDocument     The MathDocument class to be extended
 * @return {MyMathDocument}    The MathDocument class with our action added
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 * @template B  The MathDocument class to extend
 */
export function MyMathDocumentMixin<N, T, D, B extends AbstractMathDocumentConstructor<N, T, D>>(
  BaseDocument: B
): MathDocumentConstructor<MyMathDocument<N, T, D>> & B {

  return class extends BaseDocument {

    /**
     * @override
     */
    public static OPTIONS: OptionList = {
      ...BaseDocument.OPTIONS,
      // add any document-level options needed for our action
      renderActions: expandable({
        ...BaseDocument.OPTIONS.renderActions,
        myAction: [STATE.MYACTION]                  // the key name should match the method name below
                                                    //   or use [STATE.MYACTION, 'methodName']
      }),
    };

    /**
     * Subclass the MathItem class used for this MathDocument
     *   and set up the process bits for bookkeeping
     *
     * @override
     * @constructor
     */
    constructor(...args: any[]) {
      super(...args);
      this.options.MathItem =
        MyMathItemMixin<N, T, D, AbstractMathItemConstructor<N, T, D>>(this.options.MathItem);
      const ProcessBits = (this.constructor as typeof AbstractMathDocument).ProcessBits;
      if (!ProcessBits.has('my-action')) {
        ProcessBits.allocate('my-action');
      }
    }

    /**
     * Perform our action on all the MathItems in the MathDocument
     */
    public myAction() {
      if (!this.processed.isSet('my-action')) {
        for (const math of this.math) {
          (math as MyMathItem<N, T, D>).myAction(this);
        }
        this.processed.set('my-action');
      }
      return this;
    }

    /**
     * @override
     */
    public state(state: number, restore: boolean = false) {
      super.state(state, restore);
      if (state < STATE.MYACTION) {
        this.processed.clear('my-action');
      }
      return this;
    }

  };

}

/*==========================================================================*/

/**
 * Add our action to a Handler instance (by subclassing the MathDocument class)
 *
 * @param {Handler} handler   The Handler instance to modify
 * @return {Handler}          The modified handler (for purposes of chaining extensions)
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */

export function MyHandler<N, T, D>(handler: Handler<N, T, D>): Handler<N, T, D> {
  handler.documentClass =
    MyMathDocumentMixin<N, T, D, AbstractMathDocumentConstructor<N, T, D>>(handler.documentClass);
  return handler;
}
