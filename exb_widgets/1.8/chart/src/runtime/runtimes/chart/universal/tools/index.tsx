/** @jsx jsx */
import { React, jsx, css, classNames, ImmutableObject, getAppStore } from 'jimu-core'
import { DataActionDropDown, hooks } from 'jimu-ui'
import { ChartTools, ChartType } from '../../../../../config'
import { RangeCursorModeValue } from './range-cursor-mode'
import { useChartRuntimeState } from '../../../state'
import { useSourceRecords } from '../../../utils'
import { SelectionZoom } from './selection-zoom'
import { ActionModes } from 'arcgis-charts'

interface ToolsProps {
  type: ChartType
  widgetId: string
  className?: boolean
  tools?: ImmutableObject<ChartTools>
  enableDataAction?: boolean
}

const style = css`
  .tool-dividing-line {
    height: 16px;
    width: 1px;
    background-color: var(--light-400);
  }
`

export const Tools = (props: ToolsProps): React.ReactElement => {
  const { type = 'serial', className, widgetId, tools, enableDataAction } = props

  const translate = hooks.useTranslate()
  const widgetLabel = getAppStore().getState().appConfig.widgets?.[widgetId]?.label ?? 'Chart'
  const dataActionLabel = translate('outputStatistics', { name: widgetLabel })
  const { outputDataSource, chart } = useChartRuntimeState()

  const { records } = useSourceRecords(outputDataSource)
  const cursorEnable = tools?.cursorEnable

  const handleRangeModeChange = (mode: RangeCursorModeValue) => {
    if (mode === 'selection') {
      chart?.setActionMode({ actionMode: ActionModes.MultiSelection, needToPressKeyToMultiSelect: true })
    } else if (mode === 'zoom') {
      chart?.setActionMode({ actionMode: ActionModes.Zoom, needToPressKeyToMultiSelect: true })
    }
  }

  const handleClearSelection = () => {
    chart?.clearSelection()
  }

  React.useEffect(() => {
    if (cursorEnable) {
      chart?.setActionMode({ actionMode: ActionModes.MultiSelection, needToPressKeyToMultiSelect: true })
    } else {
      chart?.setActionMode({ actionMode: ActionModes.None })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorEnable, chart])

  return (
    <div
      css={style}
      className={classNames(
        'chart-tool-bar w-100 d-flex align-items-center justify-content-end px-2 pt-2',
        className
      )}
    >
      {cursorEnable && (
        <SelectionZoom
          type={type}
          className='mr-1'
          onModeChange={handleRangeModeChange}
          onClearSelection={handleClearSelection}
        />
      )}

      {enableDataAction && (
        <React.Fragment>
          <span className='tool-dividing-line mx-1'></span>
          <DataActionDropDown
            type='tertiary'
            dataName={dataActionLabel}
            widgetId={widgetId}
            dataSource={outputDataSource}
            records={records}
          />
        </React.Fragment>
      )}
    </div>
  )
}
