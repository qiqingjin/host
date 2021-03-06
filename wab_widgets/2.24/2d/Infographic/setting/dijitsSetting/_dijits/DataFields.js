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
    'dojo/query',
    'jimu/dijit/_DataFields'
  ],
  function(declare, query, _DataFields) {
    return declare([_DataFields], {

      uncheckAllFields: function() {
        var fieldItemDivs = query('.field-item', this.fieldsContent);
        fieldItemDivs.forEach(function(fieldItemDom) {
          var cbx = query('input', fieldItemDom)[0];
          cbx.checked = false;
        }.bind(this));
      }
    });
  });