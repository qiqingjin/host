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
define(['jimu/shared/BaseVersionManager'],
  function(BaseVersionManager) {

    function VersionManager() {
      this.versions = [{
        version: '1.0',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '1.1',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '1.2',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '1.3',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '1.4',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.0Beta',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.0',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.0.1',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.1',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.2',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.3',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.4',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.5',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.6',
        upgrader: function(oldConfig) {
          if(!oldConfig || !oldConfig.dijits){
            return oldConfig;
          }
          var newConfig = oldConfig;
          var dijits = newConfig.dijits;
          var sortOrder;
          for (var i = 0; i < dijits.length; i++) {
            if (dijits[i].type === 'chart') {
              //sortOrder
              sortOrder = dijits[i].config.sortOrder;
              dijits[i].config.sortOrder = {
                isLabelAxis: true,
                isAsc: sortOrder ? sortOrder === 'asc' : true
              };
              if (dijits[i].config.mode === 'feature') {
                dijits[i].config.sortOrder.field = dijits[i].config.labelField;
              }
              //maxLabel
              dijits[i].config.maxLabels = undefined;
              //nullValue
              if (dijits[i].config.mode === 'feature' || dijits[i].mode === 'count') {
                dijits[i].config.nullValue = undefined;
              } else {
                dijits[i].config.nullValue = true;
              }
              //dateConfig
              dijits[i].config.dateConfig = undefined;
              //useLayerSymbology
              dijits[i].config.useLayerSymbology = undefined;
            }
          }
          return newConfig;
        }
      }, {
        version: '2.7',
        upgrader: function(oldConfig) {
          if(!oldConfig || !oldConfig.dijits){
            return oldConfig;
          }
          var newConfig = oldConfig;
          var dijits = newConfig.dijits;
          var chartConfig;
          for (var i = 0; i < dijits.length; i++) {
            if (dijits[i].type === 'chart') {
              chartConfig = dijits[i].config;
              break;
            }
          }
          if (!chartConfig || !chartConfig.mode) {
            return newConfig;
          }
          var mode = chartConfig.mode;
          var type = chartConfig.type;

          var valueFields = chartConfig.valueFields;
          /* color and useLayerSymbology upgrade to seriesStyle */
          var colors = chartConfig.colors;
          if (!colors) {
            colors = ['#5d9cd3', '#eb7b3a', '#a5a5a5', '#febf29', '#4673c2', '#72ad4c'];
          }
          var seriesStyle = {};
          //useLayerSymbology
          if (typeof chartConfig.useLayerSymbology !== 'undefined') {
            if (type === 'line') {
              delete chartConfig.useLayerSymbology;
            }
          }
          if (typeof chartConfig.useLayerSymbology !== 'undefined') {
            seriesStyle.useLayerSymbology = chartConfig.useLayerSymbology;
          }

          var notAddedFields = [];
          if (valueFields && valueFields.length > 0) {
            notAddedFields = valueFields;
          }

          var colorAsArray = false;
          if (type === 'column' || type === 'bar' || type === 'line') {
            if (type === 'line' && mode === 'field') {
              notAddedFields = ['line~field'];
            } else {
              if (mode === 'count') {
                notAddedFields = ['count~count'];
              }
            }
          } else if (type === 'pie') {
            if (mode !== 'field') {
              colorAsArray = true;
              notAddedFields = ['pie~not-field'];
            }
          }

          var newStyles = notAddedFields.map(function(item, i) {
            return createSeriesStyle(item, i, colorAsArray, colors);
          }.bind(this));
          seriesStyle.styles = {};
          if (newStyles) {
            seriesStyle.styles = newStyles;
          }
          chartConfig.seriesStyle = seriesStyle;

          if (typeof chartConfig.colors !== 'undefined') {
            delete chartConfig.colors;
          }

          function createSeriesStyle(valueField, index, colorAsArray, colors) {
            var style = {
              name: valueField,
              style: {
                color: getRandomColor(colors, index)
              }
            };

            if (colorAsArray) {
              style.style.color = colors;
            }
            return style;
          }

          function getRandomColor(colors, i) {
            var length = colors.length;
            i = i % length;
            return colors[i];
          }

          /* disable show legend for count and field mode(expect pie)*/
          if (type !== 'pie') {
            if (mode === 'count' || mode === 'field') {
              chartConfig.showLegend = false;
            }
          }
          /* force dateConfig.isNeedFilled is false for pie chart */
          if (type === 'pie') {
            if (chartConfig.dateConfig) {
              chartConfig.dateConfig.isNeedFilled = false;
            }
          }
          return newConfig;
        }
      }, {
        version: '2.8',
        upgrader: function(oldConfig) {
          if(!oldConfig || !oldConfig.dijits){
            return oldConfig;
          }
          var newConfig = oldConfig;
          //get chart dijit config
          var dijits = newConfig.dijits;
          var chartDijit = dijits.filter(function(d) {
            return d.type === 'chart';
          })[0];

          if (!chartDijit) {
            return newConfig;
          }

          var chartConfig = chartDijit && chartDijit.config;

          if (!chartConfig || !chartConfig.mode) {
            return newConfig;
          }
          var seriesStyle = chartConfig.seriesStyle;
          if (!seriesStyle) {
            return newConfig;
          }
          //upgrade seriesStyle.useLayerSymbology to seriesStyle.type
          seriesStyle.type = seriesStyle.useLayerSymbology ? 'layerSymbol' : 'series';
          if (typeof seriesStyle.useLayerSymbology !== 'undefined') {
            delete seriesStyle.useLayerSymbology;
          }
          chartDijit.config = getCleanChartConfig(chartConfig);

          function getCleanChartConfig(config) {
            var cleanConfig = {
              mode: config.mode,
              type: config.type
            };

            var type = cleanConfig.type;
            var mode = cleanConfig.mode;

            var baseChartProperties = [];

            if (mode === 'feature') {
              baseChartProperties = baseChartProperties.concat(["labelField", "valueFields", "sortOrder", "maxLabels"]);
            } else if (mode === 'category') {
              baseChartProperties = baseChartProperties.concat(["categoryField", "dateConfig",
                "valueFields", "sortOrder", "operation", "maxLabels", "nullValue"
              ]);
            } else if (mode === 'count') {
              baseChartProperties = baseChartProperties.concat(["categoryField", "dateConfig",
                "sortOrder", "maxLabels"
              ]);
            } else if (mode === 'field') {
              baseChartProperties = baseChartProperties.concat(["valueFields", "operation",
                "sortOrder", "maxLabels", "nullValue"
              ]);
            }

            var baseDisplayProperties = ["backgroundColor", "seriesStyle", "showLegend",
              "legendTextColor", "legendTextSize", "highLightColor"
            ];

            if (type === 'pie') {
              baseDisplayProperties = baseDisplayProperties.concat(["showDataLabel", "dataLabelColor",
                "dataLabelSize", "innerRadius"
              ]);
            } else {
              baseDisplayProperties = baseDisplayProperties.concat([
                "showHorizontalAxis",
                "horizontalAxisTextColor",
                "horizontalAxisTextSize",
                "showVerticalAxis",
                "verticalAxisTextColor",
                "verticalAxisTextSize",
                "stack",
                "area"
              ]);
            }

            baseChartProperties.forEach(function(chartProperty) {
              cleanConfig[chartProperty] = config[chartProperty];
            });

            baseDisplayProperties.forEach(function(displayProperty) {
              cleanConfig[displayProperty] = config[displayProperty];
            });

            //completed some option
            if (!cleanConfig.hasOwnProperty("showLegend")) {
              cleanConfig.showLegend = false;
            }
            if (type === 'pie') {
              if (!cleanConfig.hasOwnProperty("showDataLabel")) {
                cleanConfig.showDataLabel = true;
              }
            } else {
              if (!cleanConfig.hasOwnProperty("showHorizontalAxis")) {
                cleanConfig.showHorizontalAxis = true;
              }
              if (!cleanConfig.hasOwnProperty("showVerticalAxis")) {
                cleanConfig.showVerticalAxis = true;
              }
            }
            return cleanConfig;
          }

          return newConfig;
        }
      }, {
        version: '2.9',
        upgrader: function(oldConfig) {
          if(!oldConfig || !oldConfig.dijits){
            return oldConfig;
          }
          var newConfig = oldConfig;
          //get chart dijit config
          var dijits = newConfig.dijits;
          var chartDijit = dijits.filter(function(d) {
            return d.type === 'chart';
          })[0];

          if (!chartDijit) {
            return newConfig;
          }

          var chartConfig = chartDijit && chartDijit.config;

          if (!chartConfig || !chartConfig.mode) {
            return newConfig;
          }

          //legend
          var legend = {
            show: chartConfig.showLegend,
            textStyle: {
              color: chartConfig.legendTextColor,
              fontSize: chartConfig.legendTextSize
            }
          };
          chartConfig.legend = legend;
          //xAxis
          var showxAxis = chartConfig.showHorizontalAxis === undefined ? true : chartConfig.showHorizontalAxis;
          var xAxis = {
            show: showxAxis,
            textStyle: {
              color: chartConfig.horizontalAxisTextColor,
              fontSize: chartConfig.horizontalAxisTextSize
            },
            nameTextStyle: {
              color: chartConfig.horizontalAxisTextColor
            }
          };
          chartConfig.xAxis = xAxis;
          //yAxis
          var showyAxis = chartConfig.showVerticalAxis === undefined ? true : chartConfig.showVerticalAxis;
          var yAxis = {
            show: showyAxis,
            textStyle: {
              color: chartConfig.verticalAxisTextColor,
              fontSize: chartConfig.verticalAxisTextSize
            },
            nameTextStyle: {
              color: chartConfig.horizontalAxisTextColor
            }
          };
          chartConfig.yAxis = yAxis;

          //dataLabel
          var dataLabel = {
            show: chartConfig.showDataLabel,
            textStyle: {
              color: chartConfig.dataLabelColor,
              fontSize: chartConfig.dataLabelSize
            }
          };
          chartConfig.dataLabel = dataLabel;
          //marks
          if (!chartConfig.marks) {
            chartConfig.marks = {};
          }
          chartDijit.config = getCleanChartConfig(chartConfig);

          function getCleanChartConfig(config) {
            var cleanConfig = {
              mode: config.mode,
              type: config.type
            };

            var type = cleanConfig.type;
            var mode = cleanConfig.mode;

            var baseChartProperties = [];

            if (mode === 'feature') {
              baseChartProperties = baseChartProperties.concat(["labelField", "valueFields", "sortOrder", "maxLabels"]);
            } else if (mode === 'category') {
              baseChartProperties = baseChartProperties.concat(["categoryField", "dateConfig",
                "valueFields", "sortOrder", "operation", "maxLabels", "nullValue"
              ]);
            } else if (mode === 'count') {
              baseChartProperties = baseChartProperties.concat(["categoryField", "dateConfig",
                "sortOrder", "maxLabels"
              ]);
            } else if (mode === 'field') {
              baseChartProperties = baseChartProperties.concat(["valueFields", "operation",
                "sortOrder", "maxLabels", "nullValue"
              ]);
            }

            var baseDisplayProperties = ["backgroundColor", "seriesStyle", "legend", "highLightColor"];

            if (type === 'pie') {
              baseDisplayProperties = baseDisplayProperties.concat(["dataLabel", "innerRadius"]);
            } else {
              baseDisplayProperties = baseDisplayProperties.concat([
                "xAxis",
                "yAxis",
                "stack",
                "area",
                "marks"
              ]);
            }

            baseChartProperties.forEach(function(chartProperty) {
              cleanConfig[chartProperty] = config[chartProperty];
            });

            baseDisplayProperties.forEach(function(displayProperty) {
              cleanConfig[displayProperty] = config[displayProperty];
            });
            return cleanConfig;
          }

          return newConfig;
        }
      }, {
        version: '2.10',
        upgrader: function(oldConfig) {
          if(!oldConfig || !oldConfig.dijits){
            return oldConfig;
          }

          var newConfig = oldConfig;

          //get gauge dijit config
          var dijits = newConfig.dijits;
          var gaugeDijit = dijits.filter(function(d) {
            return d.type === 'gauge';
          })[0];

          //number dijit and config
          var numberDijit = dijits.filter(function(d) {
            return d.type === 'number';
          })[0];

          upgradeGauge(gaugeDijit);
          upgradeNumber(numberDijit);

          function upgradeGauge(gaugeDijit) {
            if (!gaugeDijit || !gaugeDijit.config) {
              return;
            }
            var gaugeConfig = gaugeDijit.config;
            //config.max && min
            var min = gaugeConfig.min;
            var max = gaugeConfig.max || 1000;
            var statistic = gaugeConfig.statistic;
            var type = statistic.type === 'Features' ? 'count' : statistic.statisticsType;
            var field = type !== 'count' ? statistic.fieldName : '';

            var mainStatValue = {
              type: type
            };
            if (field) {
              mainStatValue.field = field;
            }
            var statistics = [{
              type: 'value',
              config: {
                type: 'stat',
                value: mainStatValue
              }
            }, {
              type: 'range',
              name: 'range1',
              config: {
                type: 'fixed',
                value: min
              }
            }, {
              type: 'range',
              name: 'range2',
              config: {
                type: 'fixed',
                value: max
              }
            }];
            delete gaugeConfig.statistic;
            delete gaugeConfig.min;
            delete gaugeConfig.max;
            gaugeConfig.statistics = statistics;
            gaugeDijit.config = gaugeConfig;
          }

          function upgradeNumber(numberDijit) {
            //upgrade number dijit
            if (!numberDijit || !numberDijit.config) {
              return;
            }
            var numberConfig = numberDijit.config;
            var statistic = numberConfig.statistic;

            var type = statistic.type === 'Features' ? 'count' : statistic.statisticsType;
            var field = type !== 'count' ? statistic.fieldName : '';
            var mainStatValue = {
              type: type
            };
            if (field) {
              mainStatValue.field = field;
            }
            var statistics = [{
              type: 'value',
              config: {
                type: 'stat',
                value: mainStatValue
              }
            }];
            delete numberConfig.statistic;
            numberConfig.statistics = statistics;
            numberDijit.config = numberConfig;
          }

          return newConfig;
        }
      }, {
        version: '2.11',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.12',
        upgrader: function(oldConfig) {
          if(!oldConfig || !oldConfig.dijits){
            return oldConfig;
          }
          var newConfig = oldConfig;
          //get chart dijit config
          var dijits = newConfig.dijits;
          var chartDijit = dijits.filter(function(d) {
            return d.type === 'chart';
          })[0];

          if (!chartDijit) {
            return newConfig;
          }

          var chartConfig = chartDijit && chartDijit.config;

          if (!chartConfig || !chartConfig.mode) {
            return newConfig;
          }

          upgradeClusterField(chartConfig);
          chartDijit.config = getChartConfig(chartConfig);

          function upgradeClusterField(chartConfig){
            if(!chartConfig || chartConfig.clusterField){
              return chartConfig;
            }
            if(chartConfig.mode === 'feature'){
              chartConfig.clusterField = chartConfig.labelField;
            }else if(chartConfig.mode === 'category' || chartConfig.mode === 'count'){
              chartConfig.clusterField = chartConfig.categoryField;
            }
          }

          function separationChartProperties(type, mode) {
            var dataProperties = ['mode', 'type'];

            var displayProperties = ["backgroundColor", "seriesStyle", "legend", "highLightColor"];

            if (mode === 'feature') {
              dataProperties = dataProperties.concat(["clusterField", "valueFields"]);
            } else if (mode === 'category') {
              dataProperties = dataProperties.concat(["clusterField", "dateConfig",
                "valueFields", "operation", "nullValue"
              ]);

            } else if (mode === 'count') {
              dataProperties = dataProperties.concat(["clusterField", "dateConfig"]);
            } else if (mode === 'field') {
              dataProperties = dataProperties.concat(["valueFields", "operation", "nullValue"]);
            }
            dataProperties = dataProperties.concat(["sortOrder", "maxLabels"]);

            if (type === 'pie') {
              displayProperties = displayProperties.concat(["dataLabel", "innerRadius"]);
            } else {
              displayProperties = displayProperties.concat([
                "xAxis",
                "yAxis",
                "stack",
                "area",
                "marks"
              ]);
            }
            return {
              dataProperties: dataProperties,
              displayProperties: displayProperties
            };
          }

          function getChartConfig(enumValues) {
            if (!enumValues) {
              return;
            }
            var mode = enumValues.mode;
            var type = enumValues.type;

            var properties = separationChartProperties(type, mode);
            var dataProperties = properties.dataProperties;
            var displayProperties = properties.displayProperties;

            var data = {},
              display = {};

            dataProperties.forEach(function(chartProperty) {
              data[chartProperty] = enumValues[chartProperty];
            });

            displayProperties.forEach(function(displayProperty) {
              display[displayProperty] = enumValues[displayProperty];
            });

            return {
              data: data,
              display: display
            };
          }
          return newConfig;
        }
      }, {
        version: '2.13',
        upgrader: function(oldConfig){
          if(!oldConfig || !oldConfig.dijits){
            return oldConfig;
          }
          var newConfig = oldConfig;
          //get chart dijit config
          var dijits = newConfig.dijits;
          var chartDijit = dijits.filter(function(d) {
            return d.type === 'chart';
          })[0];

          if (!chartDijit) {
            return newConfig;
          }

          var chartConfig = chartDijit && chartDijit.config;
          if(!chartConfig){
            return newConfig;
          }
          var mode =  chartConfig.data && chartConfig.data.mode;
          var type =  chartConfig.data && chartConfig.data.type;
          var display =  chartConfig.display;
          if (!type || !mode || !display || display.tooltip) {
            return newConfig;
          }

          var tooltip = {
            confine: true,
            trigger: type === 'pie' ? 'item': 'axis'
          };

          chartConfig.display.tooltip = tooltip;
          return newConfig;
        }
      },{
        version: '2.14',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.15',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '2.16',
        upgrader: function(oldConfig) {
          if(!oldConfig || !oldConfig.dijits){
            return oldConfig;
          }
          var newConfig = oldConfig;
          //get chart dijit config
          var dijits = newConfig.dijits;
          var chartDijit = dijits.filter(function(d) {
            return d.type === 'chart';
          })[0];
          if (!chartDijit) {
            return newConfig;
          }
          var chartConfig = chartDijit && chartDijit.config;
          if(!chartConfig){
            return newConfig;
          }
          var type =  chartConfig.data && chartConfig.data.type;
          var mode =  chartConfig.data && chartConfig.data.mode;
          var display =  chartConfig.display;
          if (!type || !mode || !display) {
            return newConfig;
          }
          if(type === 'pie') {
            return newConfig;
          }
          chartConfig.display.displayRange = 'AUTO';
          return newConfig;
        }
      }];
    }

    VersionManager.prototype = new BaseVersionManager();
    VersionManager.prototype.constructor = VersionManager;
    return VersionManager;
  });