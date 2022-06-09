/** @jsx jsx */
import { React, jsx, css, ImmutableObject, UseDataSource, IMState, ReactRedux, DataSourceStatus, defaultMessages as jimucoreDefaultMessages } from 'jimu-core'
import { hooks, defaultMessages as jimuDefaultMessages } from 'jimu-ui'
import { IMConfig } from '../../config'
import { Chart } from './chart'
import { Placeholder, getTemplateType, getWarningMessage } from './placeholder'
import { SourceStatus, useChartRuntimeState } from './state'
import defaultMessages from '../translations/default'
import { getChartType } from '../../utils/default'

interface ChartRuntimePorps {
  widgetId: string
  useDataSource: ImmutableObject<UseDataSource>
  config: IMConfig
  enableDataAction: boolean
}

/**
 * Whether to render chart.
 * @param sourceStatus
 * @returns
 */
const whetherRenderChart = (originSourceStatus: DataSourceStatus, sourceStatus: SourceStatus): boolean => {
  const rendered = originSourceStatus !== DataSourceStatus.NotReady &&
    (sourceStatus === SourceStatus.Loaded || sourceStatus === SourceStatus.Loading)
  return rendered
}

/**
 * Whether to render warning message.
 * @param useDataSource
 * @param sourceStatus
 */
const wehtherRenderWarningMessage = (originSourceStatus: DataSourceStatus, sourceStatus: SourceStatus): boolean => {
  const rendered = originSourceStatus === DataSourceStatus.NotReady ||
    sourceStatus === SourceStatus.ExceedLimit ||
    sourceStatus === SourceStatus.LoadError ||
    sourceStatus === SourceStatus.LoadEmpty

  return rendered
}

const useStyle = (background: string) => {
  return React.useMemo(() => {
    return css`
      position: relative;
      background-color: ${background} !important;
    `
  }, [background])
}

export const ChartRuntime = (props: ChartRuntimePorps) => {
  const { dataSource, sourceStatus } = useChartRuntimeState()

  const { widgetId, useDataSource, config, enableDataAction } = props
  const { tools, webChart, _templateType } = config

  const style = useStyle(webChart?.background)
  const translate = hooks.useTranslate(jimucoreDefaultMessages, jimuDefaultMessages, defaultMessages)
  const templateType = getTemplateType(webChart?.series, _templateType)
  const type = getChartType(webChart?.series)

  const originSourceStatus = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[useDataSource?.dataSourceId]?.status)
  const renderMessage = useDataSource && wehtherRenderWarningMessage(originSourceStatus, sourceStatus)
  const messageType = (sourceStatus === SourceStatus.ExceedLimit || sourceStatus === SourceStatus.LoadEmpty) ? 'basic' : 'tooltip'
  const message = getWarningMessage(type, originSourceStatus, sourceStatus, useDataSource, dataSource, translate)

  const renderChart = whetherRenderChart(originSourceStatus, sourceStatus)

  return (
    <div css={style} className='chart-runtime w-100 h-100'>
      {renderChart && (
        <Chart
          widgetId={widgetId}
          webChart={webChart}
          enableDataAction={enableDataAction}
          tools={tools}
        />
      )}
      {!renderChart && (
        <Placeholder
          templateType={templateType}
          message={message}
          messageType={messageType}
          showMessage={renderMessage}
        />
      )}
    </div>
  )
}

export * from './data-source-manager'
export * from './state'
