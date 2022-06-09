
import { WebChartSeries } from '../../../../../../config'
import { IMFeatureLayerQueryParams, Immutable, ImmutableArray } from 'jimu-core'
import { createDefaultSerie, SelectedOption } from '../utils'

export const createByFieldSeries = ({ x, y, name, propSeries }): ImmutableArray<WebChartSeries> => {
  const seriesProps = propSeries[0]
  const serie = createDefaultSerie(seriesProps, 0)
  serie.x = x
  serie.y = y
  serie.name = name
  serie.id = y
  return Immutable([serie])
}

export const createByFieldQuery = ({ statisticType, numericFields }, orderByFields): IMFeatureLayerQueryParams => {
  const outStatistics = numericFields.map((numericField) => {
    const statistic = {
      statisticType,
      onStatisticField: numericField,
      outStatisticFieldName: numericField
    }
    return statistic
  })

  return Immutable({ outStatistics, orderByFields })
}

export const getByFieldOrderFields = (series: ImmutableArray<WebChartSeries>, translate): ImmutableArray<SelectedOption> => {
  const categoryField = series?.[0]?.x
  const serieY = series?.[0]?.y
  let fields: ImmutableArray<SelectedOption> = Immutable([])
  const xAxisLabel = translate('categoryAxis')
  const yAxisLabel = translate('valueAxis')

  fields = fields.concat(
    [{
      name: xAxisLabel,
      value: categoryField
    },
    {
      name: yAxisLabel,
      value: serieY
    }]
  )

  return fields
}
