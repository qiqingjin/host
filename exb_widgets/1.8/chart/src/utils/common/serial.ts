import {
  ImmutableObject,
  ImmutableArray,
  IMFeatureLayerQueryParams
} from 'jimu-core'
import { WebChartStackedKinds } from 'jimu-ui/advanced/chart'
import { CategoryType, WebChartLineChartSeries, WebChartSeries } from '../../config'

/**
 * Get category type from query params
 * @param query
 */
export const getCategoryTypeFromQuery = (
  query: IMFeatureLayerQueryParams
): CategoryType => {
  if (query?.groupByFieldsForStatistics != null) {
    return CategoryType.ByGroup
  } else if (query?.outStatistics != null) {
    return CategoryType.ByField
  }
}

/**
 * Get category type from chart data source
 * @param query
 */
export const getCategoryType = (
  query: IMFeatureLayerQueryParams
): CategoryType => {
  if (query?.groupByFieldsForStatistics != null) {
    return CategoryType.ByGroup
  } else if (query?.outStatistics != null) {
    return CategoryType.ByField
  }
}

export const getSerialStackedType = (
  series: ImmutableArray<WebChartSeries>
): WebChartStackedKinds => {
  return (series?.[0] as any).stackedType
}

export const getSeriaLlineSmoothed = (
  series: ImmutableArray<WebChartSeries>
): boolean => {
  return (series?.[0] as ImmutableObject<WebChartLineChartSeries>).lineSmoothed
}

export const getSeriaLlineShowArea = (
  series: ImmutableArray<WebChartSeries>
): boolean => {
  return (series?.[0] as ImmutableObject<WebChartLineChartSeries>).showArea
}

export const getSerialSeriesRotated = (
  series: ImmutableArray<WebChartSeries>
): boolean => {
  return (series?.[0] as any)?.rotated ?? false
}

const OrderSeparator = ' '
/**
 * Parse a query.orderByFields[i]
 * @param fieldOrder
 * normal: 'fieldname ASC'
 * with space in field: 'field name ASC'
 */
export const parseOrderByField = (fieldOrder: string): string[] => {
  if (!fieldOrder || !fieldOrder.includes(OrderSeparator)) return []
  const lastIndex = fieldOrder.lastIndexOf(OrderSeparator)
  const index = fieldOrder.indexOf(OrderSeparator)
  if (lastIndex !== index) {
    const field = fieldOrder.substring(0, lastIndex)
    const order = fieldOrder.substring(lastIndex + 1)
    return [field, order]
  } else {
    return fieldOrder.split(' ')
  }
}
