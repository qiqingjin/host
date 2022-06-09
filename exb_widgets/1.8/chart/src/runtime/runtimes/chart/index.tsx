/** @jsx jsx */
import { ImmutableObject, React, jsx, css } from 'jimu-core'
import { ChartTools, IWebChart } from '../../../config'
import { getChartType } from '../../../utils/default'
import { Tools } from './universal'
import { WebChart } from './web-chart'

interface ChartPorps {
  widgetId: string
  webChart: ImmutableObject<IWebChart>
  tools: ImmutableObject<ChartTools>
  enableDataAction: boolean
}

const useStyle = (showTools: boolean) => {
  return React.useMemo(() => {
    return css`
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      .chart-tool-bar {
        height: 38px;
      }
      .web-chart {
        height: ${showTools ? 'calc(100% - 38px)' : '100%'} !important;
      }
    `
  }, [showTools])
}

export const Chart = (props: ChartPorps) => {
  const { widgetId, tools, enableDataAction = true, webChart } = props

  const type = getChartType(webChart?.series)
  const showTools = tools?.cursorEnable || !!tools.filter || enableDataAction
  const style = useStyle(showTools)

  return <div css={style} className='chart'>
    {showTools && <Tools
      type={type}
      tools={tools}
      widgetId={widgetId}
      enableDataAction={enableDataAction} />}
    <WebChart type={type} widgetId={widgetId} webChart={webChart} />
  </div>
}
