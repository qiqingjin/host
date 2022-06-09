import { React, ImmutableArray, DataRecord, IntlShape, useIntl, IMState, ReactRedux, lodash, IMFeatureLayerQueryParams } from 'jimu-core'
import { ChartInlineData, WebChartDataItem, WebChartSortOrderKinds } from 'jimu-ui/advanced/chart'
import { CategoryType, ChartType, ColorMatches, ConfigFields } from '../../../../../config'
import { ByFieldSeriesX, ByFieldSeriesY, ObjectIdField } from '../../../../../constants'
import { getFieldSchema } from '../../../../../utils/common'
import { getCategoryType, parseOrderByField } from '../../../../../utils/common/serial'
import { SourceRecords } from '../../../utils'

/**
 * Convert to formatted and coloring data for `by-field` mode.
 * In order for the series to know which data is to used in the global chart array (through valueY), need to convert the data,
 * transforming data into web chart data for `ByField` mode.
 *
 * In case of non-aggregated type bar chart, we rename the category names by adding a suffix, in order
 * to avoid multiple identical values (they are switched back to their original value when displayed).
 * @param record
 * @param query
 * @param colorMatches
 * @param dataSourceId
 */
export const convertFieldData = (record: DataRecord, query: IMFeatureLayerQueryParams, colorMatches: ColorMatches, dataSourceId: string): WebChartDataItem[] => {
  if (!record) return []
  const orderByFields = query?.orderByFields
  const outStatistics = query?.outStatistics
  const numericFields = outStatistics?.map(statics => statics.onStatisticField)?.filter(field => !!field)
  const x = ByFieldSeriesX
  const y = ByFieldSeriesY

  const data = numericFields?.asMutable()?.map((field, index) => {
    const value = record.getFieldValue(field)
    let item = {
      [ObjectIdField]: index,
      [x]: field,
      [y]: value ?? 0
    } as WebChartDataItem

    item = applyColorMatch(item, x, y, colorMatches)
    const alias = getFieldSchema(field, dataSourceId)?.alias ?? field
    item[x] = alias
    return item
  }) ?? []

  sortWebChartData(data, orderByFields)

  return data
}

/**
 * Convert to formatted and coloring data for scatter-plot chart.
 * @param records
 * @param query
 * @param intl
 */
export const convertScatterPlotData = (records: DataRecord[], query: IMFeatureLayerQueryParams) => {
  const result = []
  const x = query?.outFields?.[0]
  records?.forEach(record => {
    const data = record.getData()
    // Null category value will affect the calculation of value axis range,
    // and it will not be displayed on the chart by default, so we filter it out. #7607
    const item = { ...data }
    if (x && item[x] == null) return
    result.push(item)
  })
  return result
}

/**
 * Convert to formatted and coloring data for `by-group` mode.
 * @param records
 * @param x
 * @param colorMatches
 * @param intl
 */
export const convertGroupData = (records: DataRecord[], query: IMFeatureLayerQueryParams, colorMatches: ColorMatches, intl: IntlShape): any[] => {
  const result = []
  const x = query?.groupByFieldsForStatistics?.[0]
  const y = query?.outStatistics?.[0]?.outStatisticFieldName
  records?.forEach(record => {
    const data = record.getData()
    // Null category value will affect the calculation of value axis range,
    // and it will not be displayed on the chart by default, so we filter it out. #7607
    let item = { ...data }
    if (x && item[x] == null) return
    //Apply color match
    item = applyColorMatch(item, x, y, colorMatches)
    //Now only formatted the value of x
    item = formatFieldValue(item, record, x, intl)
    result.push(item)
  })
  return result
}

/**
 * Format the specific field value by its record.
 * @param item
 * @param record
 * @param field
 */
export const formatFieldValue = (item: WebChartDataItem, record: DataRecord, field: string, intl) => {
  const xValue = record.getFieldValue(field)
  const xFormattedValue = record.getFormattedFieldValue(field, intl)
  if (xFormattedValue !== xValue) {
    item[field] = xFormattedValue
  }
  return item
}

/**
 * Apple `colorMatch` to the data item.
 * @param field
 * @param item
 * @param colorMatches
 */
export const applyColorMatch = (item: WebChartDataItem, x: string, y: string, colorMatches: ColorMatches): WebChartDataItem => {
  if (!colorMatches) return item

  const value = item?.[x] as string
  if (value != null) {
    const match = colorMatches[value]
    if (match) {
      const _fillColor = match._fillColor
      const fillColor = `${ConfigFields.fillColor}_${y}`
      return {
        ...item,
        [fillColor]: _fillColor
      }
    } else {
      return item
    }
  }
  return item
}

/**
 * Convert to formatted and coloring data.
 * @param records
 * @param x
 * @param colorMatches
 * @param categoryType
 * @param intl
 */
export const convertData = (type: ChartType, records: DataRecord[], query: IMFeatureLayerQueryParams, colorMatches: ColorMatches, dataSourceId: string, intl: IntlShape) => {
  if (type === 'scatter-plot') {
    return convertScatterPlotData(records, query)
  } else {
    const categoryType = getCategoryType(query)
    if (categoryType === CategoryType.ByGroup) {
      return convertGroupData(records, query, colorMatches, intl)
    } else if (categoryType === CategoryType.ByField) {
      return convertFieldData(records?.[0], query, colorMatches, dataSourceId)
    }
  }
}

/**
 * In order for the series to know which data is to used for which series,
 * we should replace the default statistic field name by its value as defined in the series(serie.y)
 */
export const useRecordsToChartData = (type: ChartType, sourceRecords: SourceRecords, query: IMFeatureLayerQueryParams, colorMatches: ColorMatches, dataSourceId: string): ChartInlineData => {
  const intl = useIntl()
  const versionRef = React.useRef(0)
  const version = React.useMemo(() => {
    return ++versionRef.current
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceRecords.version, colorMatches])
  const data = React.useMemo(() => convertData(type, sourceRecords.records, query, colorMatches, dataSourceId, intl), [type, sourceRecords, query, colorMatches, dataSourceId, intl])
  return React.useMemo(() => ({ items: data, version }), [data, version])
}

const getObjectIdFromDataItem = (item: WebChartDataItem): string => {
  const objectid = ((item as any)?.[ObjectIdField] ?? '') + ''
  return objectid
}

const getRecordById = (id: string, records: DataRecord[]) => {
  return records?.find(record => {
    return record.getId() === id
  })
}

const getDataItemById = (id: string, data: WebChartDataItem[]) => {
  return data?.find(item => {
    const objectid = getObjectIdFromDataItem(item)
    return objectid === id
  })
}

/**
 * Get some records based on the selection items from chart.
 * @param selectionItems
 * @param records
 */
export const getSelectedRecords = (selectedIds: string[], records: DataRecord[]): DataRecord[] => {
  return selectedIds?.map((objectid) => {
    return getRecordById(objectid, records)
  })
}

/**
 * Get the object ids from chart data.
 * @param data
 */
export const getObjectIdsFromData = (data: WebChartDataItem[]): string[] => {
  return data?.map(getObjectIdFromDataItem)
}

/**
 * Get select data items.
 */
export const getSelectedData = (selectedIds: string[], data: WebChartDataItem[]): WebChartDataItem[] => {
  return selectedIds?.map((objectid) => {
    return getDataItemById(objectid, data)
  })
}

/**
 * Sorting an array WebChartDataItem following the orderByFields instructions.
 * @param props
 */
export function sortWebChartData (
  data: WebChartDataItem[],
  orderByFields: ImmutableArray<string>,
  forceAscendingOrder: boolean = false
): void {
  if (data == null || orderByFields == null) return
  data.sort(
    (dataItemA: WebChartDataItem, dataItemB: WebChartDataItem): number => {
      // Default sort decision = 0 (equal values)
      let sortDecision = 0

      // Using all the fields from orderByFields to proceed to the comparison
      for (let idx = 0; idx < orderByFields.length; idx += 1) {
        //`orderByField` must has `ASC` or `DESC` in it, e.g. 'field ASC', 'field name DESC'
        const [field, sortOrder] = parseOrderByField(orderByFields[idx])

        const descOrder: boolean = sortOrder === WebChartSortOrderKinds.Descending && !forceAscendingOrder
        /**
         * We set the sortDecision only if one of the values is greater than the other one.
         * Otherwise it continues to the next value in the `orderByFields` array.
         */
        const firstEntry = dataItemA[field]
        const secondEntry = dataItemB[field]

        // In case of string values, we perform a natural sort using the native `localeCompare`
        if (typeof firstEntry === 'string' && typeof secondEntry === 'string') {
          sortDecision = firstEntry.localeCompare(secondEntry, undefined, {
            numeric: true
          })
          if (descOrder) sortDecision *= -1
        } else if (firstEntry === undefined || firstEntry === null) {
          sortDecision = !descOrder ? 1 : -1
        } else if (secondEntry === undefined || secondEntry === null) {
          sortDecision = !descOrder ? -1 : 1
        } else if (firstEntry > secondEntry) {
          sortDecision = !descOrder ? 1 : -1
          break
        } else if (firstEntry < secondEntry) {
          sortDecision = !descOrder ? -1 : 1
          break
        }
      }

      return sortDecision
    }
  )
}

/**
 * Get the selected records on the data source and convert them into the selected data of chart component.
 * @param dataSource
 * @param data
 * @param categoryField
 * @param splitByField
 */
export const useSelectedDataItems = (
  categoryType: CategoryType,
  dataSourceId: string,
  data: WebChartDataItem[],
  selectedIdsRef: React.MutableRefObject<string[]>
): WebChartDataItem[] => {
  const [selectedDataItems, setSelectedDataItems] = React.useState<WebChartDataItem[]>()
  const selectedIds = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.selectedIds)

  React.useEffect(() => {
    if (!selectedIds) return

    const selectedRecordIds = selectedIds.asMutable()

    if (!selectedRecordIds.length && !selectedIdsRef.current?.length) {
      return
    }
    if (lodash.isDeepEqual(selectedRecordIds, selectedIdsRef.current)) {
      return
    }
    let selectedDataItems
    if (categoryType === CategoryType.ByField) {
      if (selectedRecordIds?.length) {
        selectedDataItems = data
      }
    } else {
      selectedDataItems = (selectedRecordIds?.length && data?.length) ? getSelectedData(selectedRecordIds, data) : undefined
    }
    setSelectedDataItems(selectedDataItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds])

  return selectedDataItems
}
