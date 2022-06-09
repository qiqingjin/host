import { React, Immutable, UseDataSource, defaultMessages as jimucoreMessages, ImmutableObject, getAppStore, IMFeatureLayerQueryParams } from 'jimu-core'
import { AllWidgetSettingProps } from 'jimu-for-builder'
import { defaultMessages as jimuiMessages, hooks } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector, AllDataSourceTypes } from 'jimu-ui/advanced/data-source-selector'
import { ChartTools, IMConfig, IWebChart } from '../config'
import { ChartSettings } from './settings'
import { getChartType } from '../utils/default'
import defaultMessages from './translations/default'
import { createInitOutputDataSource, getOutputDataSource, getUseDataSources } from './output'

const SUPPORTED_TYPES = Immutable([AllDataSourceTypes.FeatureLayer, AllDataSourceTypes.SceneLayer])

type SettingProps = AllWidgetSettingProps<IMConfig>

const Setting = (props: SettingProps): React.ReactElement => {
  const {
    id,
    useDataSources: propUseDataSources,
    outputDataSources: propOutputDataSources,
    onSettingChange,
    config: propConfig,
    label
  } = props

  const translate = hooks.useTranslate(defaultMessages, jimuiMessages, jimucoreMessages)

  const { template = '', webChart, tools } = propConfig
  //Current chart type
  const type = getChartType(webChart?.series) ?? 'serial'
  //The id of the data source used
  const dataSourceId = propUseDataSources?.[0]?.dataSourceId ?? ''
  //The id of the output data source
  const outputDataSourceId = propOutputDataSources?.[0] ?? ''
  //The label of output data source
  const outputDataSourceLabel = translate('outputStatistics', { name: label })

  const handleUseDataSourceChange = (useDataSources: UseDataSource[]): void => {
    let outputDataSources = []
    if (useDataSources?.length > 0) {
      const outputId = id + '_ouput'
      //create the corresponding output data source after use data source changes
      const outputDataSource = createInitOutputDataSource(outputId, outputDataSourceLabel, useDataSources[0])
      outputDataSources = [outputDataSource]
    }
    const config = propConfig.without('webChart').set('tools', { cursorEnable: true }).without('template')
    onSettingChange({ id, useDataSources, config }, outputDataSources)
  }

  const handleQueryChange = (query: IMFeatureLayerQueryParams, config: IMConfig) => {
    const outputDataSource = getOutputDataSource(query, dataSourceId, outputDataSourceId)
    const useDataSources = getUseDataSources(propUseDataSources, outputDataSource)
    if (useDataSources && outputDataSource) {
      onSettingChange({ id, config, useDataSources }, [outputDataSource])
    } else {
      onSettingChange({ id, config })
    }
  }

  const handleTemplateChange = (templateId: string, webChart: ImmutableObject<IWebChart>): void => {
    const config = propConfig.set('template', templateId).set('webChart', webChart).set('tools', { cursorEnable: true })
    handleQueryChange(webChart.dataSource?.query, config)
  }

  //Update output ds label when the label of widget changes
  React.useEffect(() => {
    let outputDataSource = getAppStore().getState().appStateInBuilder.appConfig?.dataSources?.[outputDataSourceId]
    if (outputDataSource && outputDataSource.label !== outputDataSourceLabel) {
      outputDataSource = outputDataSource.set('label', outputDataSourceLabel)
      onSettingChange({ id }, [outputDataSource.asMutable({ deep: true })])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputDataSourceLabel])

  const handleWebChartChange = (webChart: ImmutableObject<IWebChart>, query: IMFeatureLayerQueryParams): void => {
    if (query) {
      handleQueryChange(query, propConfig.set('webChart', webChart))
    } else {
      onSettingChange({ id, config: propConfig.set('webChart', webChart) })
    }
  }

  const handleToolsChange = (tools: ImmutableObject<ChartTools>): void => {
    onSettingChange({ id, config: propConfig.set('tools', tools) })
  }

  return (
    <div className='widget-setting-chart jimu-widget-setting'>
      <div className='w-100 h-100'>
        <div className='w-100'>
          <SettingSection className='d-flex flex-column pb-0'>
            <SettingRow label={translate('data')} flow="wrap" level={1}>
              <DataSourceSelector
                isMultiple={false}
                mustUseDataSource
                types={SUPPORTED_TYPES}
                useDataSources={propUseDataSources}
                onChange={handleUseDataSourceChange}
                widgetId={id}
              />
            </SettingRow>
          </SettingSection>
        </div>
        <ChartSettings
          type={type}
          template={template}
          onTemplateChange={handleTemplateChange}
          useDataSources={propUseDataSources}
          tools={tools}
          webChart={webChart}
          onToolsChange={handleToolsChange}
          onWebChartChange={handleWebChartChange}
        />
      </div>

    </div>
  )
}

export default Setting
