import { React, ImmutableObject, MessageManager, DataRecordsSelectionChangeMessage, Immutable, lodash } from 'jimu-core'
import { Chart as ChartComponent, WebChartInlineDataSource, WebChart as WebChartConfig, ChartInstance, traverseConvertColor, SelectionSource } from 'jimu-ui/advanced/chart'
import { useRecordsToChartData, getSelectedRecords, getObjectIdsFromData, useSelectedDataItems } from './utils'
import { useChartRuntimeDispatch, useChartRuntimeState } from '../../state'
import { FeatureLayerQueryParams } from 'jimu-core/data-source'
import { CategoryType, ChartType, IWebChart } from '../../../../config'
import { useSourceRecords } from '../../utils'
import { hooks } from 'jimu-ui'
import { getCategoryType } from '../../../../utils/common/serial'
import { useTheme } from 'jimu-theme'

export interface ChartProps {
  type: ChartType
  widgetId: string
  webChart: ImmutableObject<IWebChart>
}

const ChartDataSource: WebChartInlineDataSource = {
  type: 'inline',
  data: {
    dataItems: []
  },
  processed: true
}

const getScatterDataSource = (query: ImmutableObject<FeatureLayerQueryParams>): any => {
  return {
    type: 'inline',
    data: {
      data: []
    },
    processed: false
  }
}

function _WebChart (props: ChartProps): React.ReactElement {
  const { type = 'serial', webChart: propWebChart, widgetId } = props
  const theme = useTheme()
  const { outputDataSource } = useChartRuntimeState()
  const dispatch = useChartRuntimeDispatch()

  const dataSource = propWebChart?.dataSource
  const query = dataSource?.query
  const configFields = dataSource?.colorMatch?.configFields
  const propColorMatches = dataSource?.colorMatch?.colorMatches

  /**
   * Traverses and converts all string colors to symbol colors
   * The chart component only supports symbol color formats, so we need to do color conversion
   */
  const colorMatches = React.useMemo(() => traverseConvertColor(lodash.cloneDeep(propColorMatches), theme, '_fillColor'), [propColorMatches, theme])

  const webChartDataSource = React.useMemo(() => {
    let chartDataSource = ChartDataSource
    if (configFields) {
      chartDataSource = {
        ...chartDataSource,
        configFields
      }
    }
    if (type === 'scatter-plot') {
      chartDataSource = getScatterDataSource(query)
    }
    return chartDataSource
  }, [configFields, query, type])

  const categoryType = getCategoryType(dataSource?.query)
  const dataSourceId = outputDataSource?.id
  const version = propWebChart?.version
  const id = widgetId + '-' + (propWebChart?.id ?? 'chart')
  const title = propWebChart?.title
  const webChartType = propWebChart?.type
  const axes = propWebChart?.axes
  const series = propWebChart?.series
  const legend = propWebChart?.legend
  const footer = propWebChart?.footer

  const sourceRecords = useSourceRecords(outputDataSource)
  const data = useRecordsToChartData(type, sourceRecords, query, colorMatches, dataSourceId)
  const selectedIdsRef = React.useRef<string[]>()
  const selectedDataItems = useSelectedDataItems(categoryType, dataSourceId, data.items, selectedIdsRef)

  const handleSelectionComplete = hooks.useEventCallback((e) => {
    if (!outputDataSource) return

    const selectionSource: SelectionSource = e.detail.selectionSource
    // Only trigger selection change message if selection source is from the user operation
    const selectionByUser = selectionSource === SelectionSource.SelectionByClickOrRange ||
    selectionSource === SelectionSource.ClearSelection

    if (!selectionByUser) return

    const selectionItems = e.detail.selectionItems
    let selectedIds = []
    let selectedRecords = []
    if (categoryType === CategoryType.ByField) {
      if (selectionItems?.length) {
        selectedIds = ['0']
        selectedRecords = sourceRecords.records
      }
    } else {
      selectedIds = getObjectIdsFromData(selectionItems) ?? []
      selectedRecords = getSelectedRecords(selectedIds ?? [], sourceRecords.records)
    }

    //Publish records selection change message
    MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(widgetId, selectedRecords ?? []))

    if (!selectedIds.length && !selectedIdsRef.current?.length) return
    selectedIdsRef.current = selectedIds
    outputDataSource.selectRecordsByIds(selectedIds)
  })

  const webChart: ImmutableObject<WebChartConfig> = React.useMemo(() => {
    //We always make the background color of the chart component transparent
    const background = [0, 0, 0, 0] as any
    let webChartConfig = Immutable({
      version,
      id,
      type: webChartType,
      dataSource: webChartDataSource,
      title,
      footer,
      legend,
      series,
      background
    }) as unknown as ImmutableObject<WebChartConfig>

    if (type === 'serial' || type === 'scatter-plot') {
      webChartConfig = webChartConfig.set('axes', axes)
    }

    return webChartConfig
  }, [version, id, webChartType, webChartDataSource, title, footer, legend, axes, series, type])

  const hanldleChartCreate = React.useCallback((chart: ChartInstance) => {
    dispatch({ type: 'SET_CHART', value: chart })
  }, [dispatch])

  hooks.useUnmount(() => {
    dispatch({ type: 'SET_CHART', value: null })
  })

  return (<div className='web-chart w-100'>
    <ChartComponent
      data={data}
      config={webChart}
      selectedDataItems={selectedDataItems}
      ref={hanldleChartCreate}
      arcgisChartsJSSelectionComplete={handleSelectionComplete} />
  </div>)
}

export const WebChart = React.memo(_WebChart)
