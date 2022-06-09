import { React, AllWidgetProps } from 'jimu-core'
import { IMConfig } from '../config'
import { versionManager } from '../version-manager'
import { ChartRuntimeStateProvider, DataSourceManager, ChartRuntime } from './runtimes'
import { getRecordslimited } from './runtimes/utils'

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const { outputDataSources, useDataSources, config, id, enableDataAction } = props
  //Maximum number of records allowed
  const recordslimited = getRecordslimited(config?.webChart?.series)
  return (
    <div className='jimu-widget widget-chart '>
      <ChartRuntimeStateProvider>
        <DataSourceManager
          widgetId={id}
          recordslimited={recordslimited}
          chartDataSource={config?.webChart?.dataSource}
          useDataSource={useDataSources?.[0]}
          outputDataSourceId={outputDataSources?.[0]}
        />
        <ChartRuntime
          widgetId={id}
          useDataSource={useDataSources?.[0]}
          config={config}
          enableDataAction={enableDataAction} />
      </ChartRuntimeStateProvider>
    </div>
  )
}

Widget.versionManager = versionManager

export default Widget
