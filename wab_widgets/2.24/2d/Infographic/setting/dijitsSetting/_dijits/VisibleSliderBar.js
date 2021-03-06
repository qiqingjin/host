///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dojo/on',
    'dojo/_base/html',
    'dojo/Evented',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    "dojo/store/Memory",
    "dijit/form/HorizontalSlider",
    "../../utils",
    "dijit/form/ComboBox"
  ],
  function(declare, lang, on, html, Evented, _WidgetBase, _TemplatedMixin,
    _WidgetsInTemplateMixin, Memory, HorizontalSlider, utils) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'infographic-visible-sliderbar',
      templateString: '<div>' +
        '<div style="justify-content:space-between" class="lr-flex">' +
        '<div data-dojo-attach-point="vsbSelect" data-dojo-props="style:\'width:35%;\'"' +
        'data-dojo-type="dijit/form/ComboBox" ></div>' +
        '<div data-dojo-attach-point="vsbSlider" style:"width:57%;"></div>' +
        '</div>',
      // options
      // min
      // max
      // step
      // value

      //public methods
      //setValue
      //getValue

      //events:
      //change

      postCreate: function() {
        this.inherited(arguments);
        this.ignoreEvent = true;
        this._initDefaultValue();
        this._initUI();
        this._initEvent();
        html.addClass(this.domNode, this.baseClass);
        setTimeout(function() {
          this.ignoreEvent = false;
        }.bind(this), 200);
        this._changes = {
          select: false,
          slider: false
        };
      },

      _initDefaultValue: function() {
        if (typeof this.min === 'undefined') {
          this.min = 0;
        }
        if (typeof this.max === 'undefined') {
          this.min = 100;
        }
        if (typeof this.step === 'undefined') {
          this.step = 1;
        }
        if (typeof this.value === 'undefined') {
          this.value = 50;
        }
      },

      isValid: function() {
        return this.vsbSelect.isValid();
      },

      getValue: function() {
        return this.value;
      },

      setValue: function(value) {
        this.ignoreEvent = true;
        this.value = value;
        this.vsbSliderbar.set('value', value);
        setTimeout(function() {
          this.ignoreEvent = false;
        }.bind(this), 200);
      },

      _onChange: function(value) {
        if (this.ignoreEvent) {
          return;
        }
        this.emit('change', value);
      },

      _initEvent: function() {

        this.own(on(this.vsbSelect, 'change', lang.hitch(this, function(value) {
          if (this._ignoreEvent) {
            return;
          }
          if (!this.vsbSelect.isValid()) {
            return;
          }
          value = Number(value);
          this.updateValue(value);

        })));

        this.own(on(this.vsbSliderbar, 'change', lang.hitch(this, function(value) {
          if (this._ignoreEvent) {
            return;
          }
          value = Number(value);
          if (!utils.isInteger(value)) {
            value = parseFloat(value, 10).toFixed(1);
          }
          value = Number(value);
          this.updateValue(value);
        })));

      },

      updateValue: function(value) {
        this.value = value;
        this._ignoreEvent = true;
        this.vsbSelect.set('value', value);
        this.vsbSliderbar.set('value', value);
        this._onChange(value);
        setTimeout(function() {
          this._ignoreEvent = false;
        }.bind(this), 200);

      },

      _initUI: function() {
        //vsb select
        var vsbSelectStore = new Memory({});
        for (var i = this.min * 10, max = this.max * 10; i <= max; i += this.step * 10) {
          vsbSelectStore.put({
            id: i / 10,
            name: i / 10
          });
        }
        this.vsbSelect.store = vsbSelectStore;
        this.vsbSelect.set('value', this.value);
        this.vsbSelect.validator = lang.hitch(this, function() {
          var s = this.vsbSelect.get('value');
          if (s > this.max || s < this.min) {
            return false;
          }
          if (s !== null && s !== "") {
            return !isNaN(s);
          }
          return false;
        });
        //vsb slider
        this.vsbSliderbar = new HorizontalSlider({
          name: "slider",
          value: this.value,
          minimum: this.min,
          maximum: this.max,
          discreteValues: this.max / this.step,
          intermediateChanges: false,
          showButtons: false,
          style: "width:57%;margin:auto 2px auto 5px"
        }, this.vsbSlider);
        this.vsbSliderbar.startup();
      }
    });
  });