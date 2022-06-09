import { React, ImmutableArray, UseDataSource, Immutable, StatisticType, ImmutableObject } from 'jimu-core'
import { Select, hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { ChartDataSource, ChartType, WebChartSeries } from '../../../../../../config'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { FieldSelector, SorteSetting } from '../../components'
import defaultMessages from '../../../../../translations/default'
import { getObjectIdField } from '../../../../../../utils/common'
import { createByGroupQuery, createByGroupSeries, getByGroupOrderFields } from './utils'
import { StatisticFunctions } from '../utils'

export interface ByGroupDataProps {
  type: ChartType
  series: ImmutableArray<WebChartSeries>
  chartDataSource: ImmutableObject<ChartDataSource>
  useDataSources: ImmutableArray<UseDataSource>
  onChange?: (series: ImmutableArray<WebChartSeries>, chartDataSource: ImmutableObject<ChartDataSource>) => void
}

const defaultChartDataSource = Immutable({}) as ImmutableObject<ChartDataSource>

export const ByGroupData = (props: ByGroupDataProps): React.ReactElement => {
  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)
  const {
    type = 'serial',
    chartDataSource: propChartDataSource = defaultChartDataSource,
    useDataSources,
    series: propSeries,
    onChange
  } = props

  const seriesPropsRef = React.useRef<ImmutableObject<WebChartSeries>>()

  const dataSourceId = useDataSources?.[0]?.dataSourceId
  const objectidField = React.useMemo(() => getObjectIdField(dataSourceId), [dataSourceId])
  const query = propChartDataSource.query
  const categoryField = query?.groupByFieldsForStatistics?.[0] ?? ''
  const outStatistics = query?.outStatistics

  let numericFields = outStatistics?.map((outStatistic) => outStatistic.onStatisticField)?.filter(field => !!field)
  if (!numericFields?.length && !categoryField) {
    numericFields = Immutable([objectidField])
  }
  const statisticType = outStatistics?.[0]?.statisticType ?? StatisticType.Count
  const orderByFields = query?.orderByFields
  const pageSize = query?.pageSize

  const orderFields = React.useMemo(() => getByGroupOrderFields(query, dataSourceId), [query, dataSourceId])

  const hideNumericFields = numericFields.length === 1 && statisticType === StatisticType.Count
  const isNumericFieldsMultiple = type === 'serial'

  const handleCategoryFieldChange = (fields: ImmutableArray<string>): void => {
    const categoryField = fields?.[0]
    const orderByFields = [`${categoryField} ASC`]
    const series = createByGroupSeries({ categoryField, statisticType, numericFields, propSeries }, dataSourceId)
    const query = createByGroupQuery({ categoryField, statisticType, numericFields }, orderByFields, pageSize)
    const chartDataSource = propChartDataSource.set('query', query).without('colorMatch')
    onChange(Immutable(series), chartDataSource)
  }

  const handleStatisticTypeChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    const statisticType = evt?.currentTarget.value as StatisticType
    let _numericFields = numericFields
    if (statisticType === StatisticType.Count) {
      _numericFields = Immutable([objectidField])
    }

    const orderByFields = [`${categoryField} ASC`]
    const series = createByGroupSeries({ categoryField, statisticType, numericFields: _numericFields, propSeries }, dataSourceId)
    const query = createByGroupQuery({ categoryField, statisticType, numericFields: _numericFields }, orderByFields, pageSize)
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(Immutable(series), chartDataSource)
  }

  const handleNumericFieldsChange = (numericFields: ImmutableArray<string>): void => {
    if (!numericFields?.length && propSeries?.length) {
      seriesPropsRef.current = propSeries?.[0]
    }
    const seriesProps = propSeries?.length ? propSeries : Immutable([seriesPropsRef.current])

    const orderByFields = [`${categoryField} ASC`]
    const series = createByGroupSeries({ categoryField, statisticType, numericFields, propSeries: seriesProps }, dataSourceId)
    const query = createByGroupQuery({ categoryField, statisticType, numericFields }, orderByFields, pageSize)
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(Immutable(series), chartDataSource)
  }

  const handleOrderChanged = (value: string): void => {
    const query = createByGroupQuery({ categoryField, statisticType, numericFields }, [value], pageSize)
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(propSeries, chartDataSource)
  }

  return (
    <>
      <SettingRow label={translate('categoryField')} flow='wrap'>
        <FieldSelector
          className='category-field-selector'
          type='category'
          useDataSources={useDataSources}
          isMultiple={false}
          fields={categoryField ? Immutable([categoryField]) : undefined}
          onChange={handleCategoryFieldChange}
        />
      </SettingRow>

      <SettingRow label={translate('statistics')} flow='wrap'>
        <Select
          size='sm'
          disabled={!categoryField}
          value={statisticType}
          onChange={handleStatisticTypeChange}
        >
          {Object.keys(StatisticType).map((st, i) => (
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
      {!hideNumericFields &&
        <>
          <SettingRow label={translate('numberFields')} flow='no-wrap'></SettingRow>
          <FieldSelector
            disabled={!categoryField}
            className='numeric-fields-selector mt-2 mb-3'
            type='numeric'
            isMultiple={isNumericFieldsMultiple}
            useDataSources={useDataSources}
            fields={numericFields}
            onChange={handleNumericFieldsChange}
          />
        </>}

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
