import { IMFeatureLayerQueryParams, Immutable, ImmutableArray, StatisticType } from 'jimu-core'
import { createDefaultSerie, getUsedSeriesProps, SelectedOption } from '../utils'
import { getFieldSchema } from '../../../../../../utils/common'
import { WebChartSeries } from '../../../../../../config'

/**
 * Generate the `outStatisticName` for `query`, and it's always equal to `serie.y`
 * @param numericField
 * @param statisticType
 */
export const getOutStatisticName = (numericField: string, statisticType: StatisticType) => {
  return `${numericField}_${statisticType}`
}

export const createByGroupSeries = ({ categoryField, statisticType, numericFields, propSeries }, dataSourceId: string): ImmutableArray<WebChartSeries> => {
  const series = numericFields.map((numericField, index) => {
    const seriesProps = getUsedSeriesProps(propSeries, numericField, index)
    const serie = createDefaultSerie(seriesProps, index)
    const y = getOutStatisticName(numericField, statisticType)
    const name = getFieldSchema(numericField, dataSourceId)?.alias || numericField
    serie.id = numericField
    serie.x = categoryField
    serie.y = y
    serie.name = name
    return serie
  })
  return Immutable(series)
}

export const createByGroupQuery = ({ categoryField, statisticType, numericFields }, orderByFields, pageSize): IMFeatureLayerQueryParams => {
  let outStatistics = numericFields.map((numericField) => {
    const outStatisticFieldName = getOutStatisticName(numericField, statisticType)
    const statistic = {
      statisticType,
      onStatisticField: numericField,
      outStatisticFieldName
    }
    return statistic
  })
  const groupByFieldsForStatistics = [categoryField]
  if (!outStatistics.length) {
    outStatistics = [{
      statisticType: statisticType ?? StatisticType.Sum,
      onStatisticField: '',
      outStatisticFieldName: ''
    }]
  }
  return Immutable({ groupByFieldsForStatistics, outStatistics, orderByFields, pageSize })
}

export const getByGroupOrderFields = (query: IMFeatureLayerQueryParams, dataSourceId: string): ImmutableArray<SelectedOption> => {
  const categoryField = query?.groupByFieldsForStatistics?.[0]
  const numericFields = query?.outStatistics?.map((outStatistic) => outStatistic.onStatisticField)

  if (!categoryField || !numericFields?.length) return Immutable([])

  let fields: ImmutableArray<SelectedOption> = Immutable([])

  if (categoryField !== '') {
    fields = fields.concat([{
      name: getFieldSchema(categoryField, dataSourceId)?.alias || categoryField,
      value: categoryField
    }])
  }

  const numericOrderFields = query?.outStatistics?.map(statistic => {
    const value = statistic.outStatisticFieldName
    const field = statistic.onStatisticField
    let name = ''
    if (statistic.statisticType === StatisticType.Count) {
      name = 'COUNT'
    } else {
      name = getFieldSchema(field, dataSourceId)?.alias || field
    }
    return ({ name, value })
  })

  fields = fields.concat(numericOrderFields)

  return fields
}
