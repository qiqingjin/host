import { FeatureLayerQueryParams, ImmutableObject, SqlExpression } from 'jimu-core'
import {
  WebChart as _WebChart,
  WebChartBarChartSeries as _WebChartBarChartSeries,
  WebChartConfigFields,
  WebChartLineChartSeries as _WebChartLineChartSeries,
  WebChartPieChartSeries as _WebChartPieChartSeries,
  WebChartScatterPlotSeries as _WebChartScatterPlotSeries
} from 'jimu-ui/advanced/chart'

export type TemplateType = 'bar' | 'column' | 'stacked-bar' | 'stacked100-bar' | 'stacked-column' | 'stacked100-column'
| 'line' | 'smooth-line' | 'area' | 'smooth-area'
| 'pie' | 'donut'
| 'scatter-plot' | 'scatter-plot-trend-line'

export type WebChartBarChartSeries = Omit<_WebChartBarChartSeries, 'query'> & {
  query?: FeatureLayerQueryParams
}

export type WebChartLineChartSeries = Omit<_WebChartLineChartSeries, 'query'> & {
  query?: FeatureLayerQueryParams
}

export type WebChartPieChartSeries = Omit<_WebChartPieChartSeries, 'query'> & {
  query?: FeatureLayerQueryParams
}

export type WebChartScatterPlotSeries = Omit<_WebChartScatterPlotSeries, 'query'> & {
  query?: FeatureLayerQueryParams
}

export type WebChartSeries = WebChartLineChartSeries | WebChartBarChartSeries | WebChartScatterPlotSeries | WebChartPieChartSeries

export const ConfigFields = {
  fillColor: '_fillColor'
}

export interface ColorMatch {
  _fillColor: any
}

export interface ColorMatches {
  [value: string]: ColorMatch
}

export interface ChartDataSource {
  query: FeatureLayerQueryParams
  colorMatch?: {
    configFields?: WebChartConfigFields
    colorMatches: ColorMatches
  }
}

export interface IWebChart extends Omit<_WebChart, 'dataSource' | 'background' | 'series'> {
  dataSource: ChartDataSource
  background?: string
  series: WebChartSeries[]
}

export enum CategoryType {
  ByGroup = 'BYGROUP',
  ByField = 'BYFIELD'
}

export interface ChartTools {
  filter?: SqlExpression
  cursorEnable?: boolean
}

export type ChartType = 'serial' | 'scatter-plot' | 'pie' | 'gauge'

export interface Config {
  //It is only used when configuring the app template
  _templateType?: TemplateType
  template: string
  webChart: IWebChart
  tools?: ChartTools
}

export type IMConfig = ImmutableObject<Config>
