import { React, ImmutableArray, UseDataSource, StatisticType, Immutable, ImmutableObject } from 'jimu-core'
import { Select, hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { ChartDataSource, ChartType, WebChartSeries } from '../../../../../../config'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { FieldSelector, SorteSetting } from '../../components'
import defaultMessages from '../../../../../translations/default'
import { createByFieldQuery, createByFieldSeries, getByFieldOrderFields } from './utils'
import { ByFieldSeriesX, ByFieldSeriesY } from '../../../../../../constants'
import { StatisticFunctions } from '../utils'

export interface ByFieldDataProps {
  type: ChartType
  series: ImmutableArray<WebChartSeries>
  chartDataSource: ImmutableObject<ChartDataSource>
  useDataSources: ImmutableArray<UseDataSource>
  onChange?: (series: ImmutableArray<WebChartSeries>, chartDataSource: ImmutableObject<ChartDataSource>) => void
}

const StatisticTypes = Object.keys(StatisticType).filter(st => !(StatisticType[st] === StatisticType.Count))
const defaultChartDataSource = Immutable({}) as ImmutableObject<ChartDataSource>

export const ByFieldData = (props: ByFieldDataProps): React.ReactElement => {
  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)
  const {
    chartDataSource: propChartDataSource = defaultChartDataSource,
    useDataSources,
    series: propSeries,
    onChange
  } = props

  const x = ByFieldSeriesX
  const y = ByFieldSeriesY

  const query = propChartDataSource.query
  const outStatistics = query?.outStatistics
  const numericFields = outStatistics?.map((outStatistic) => outStatistic.onStatisticField).filter(field => !!field)
  const statisticType = outStatistics?.[0]?.statisticType ?? StatisticType.Sum
  const orderByFields = query?.orderByFields ?? [`${x} ASC`]

  const seriesName = React.useMemo(() => translate('sumOfValue'), [translate])

  const orderFields = React.useMemo(() => getByFieldOrderFields(propSeries, translate), [translate, propSeries])

  const handleStatisticTypeChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    const statisticType = evt?.currentTarget.value as StatisticType

    const series = createByFieldSeries({ x, y, name: seriesName, propSeries })
    const query = createByFieldQuery({ statisticType, numericFields }, orderByFields)
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(Immutable(series), chartDataSource)
  }

  const handleNumericFieldsChange = (numericFields: ImmutableArray<string>): void => {
    const series = createByFieldSeries({ x, y, name: seriesName, propSeries })
    const query = createByFieldQuery({ statisticType, numericFields }, orderByFields)
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(Immutable(series), chartDataSource)
  }

  const handleOrderChanged = (value: string): void => {
    const query = createByFieldQuery({ statisticType, numericFields }, [value])
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(propSeries, chartDataSource)
  }

  return (
    <>
      <SettingRow label={translate('statistics')} flow='wrap'>
        <Select
          size='sm'
          value={statisticType}
          onChange={handleStatisticTypeChange}
        >
          {StatisticTypes.map((st, i) => (
            <option
              value={StatisticType[st]}
              key={i}
              className='text-truncate'
            >
              {StatisticFunctions[StatisticType[st]]}
            </option>
          ))}
        </Select>
      </SettingRow>

      <SettingRow label={translate('numberFields')} flow='wrap'>
        <FieldSelector
          className='numeric-fields-selector'
          type='numeric'
          isMultiple={true}
          useDataSources={useDataSources}
          fields={numericFields}
          onChange={handleNumericFieldsChange}
        />
      </SettingRow>

      <SettingRow label={translate('sortBy')} flow='wrap'>
        <SorteSetting
          value={orderByFields?.[0]}
          fields={orderFields}
          onChange={handleOrderChanged}
        />
      </SettingRow>
    </>
  )
}
