import { IMFeatureLayerQueryParams, ImmutableArray, ImmutableObject, React, UseDataSource } from 'jimu-core'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { ChartTools, ChartType, IWebChart } from '../../config'
import { hooks } from 'jimu-ui'
import { ChartSetting } from './chart'
import { Placeholder } from './placeholder'
import defaultMessages from '../translations/default'
import { ChartTypeSelector } from './chart-type-selector'

interface ChartSettingsProps {
  type: ChartType
  template: string
  tools: ImmutableObject<ChartTools>
  webChart: ImmutableObject<IWebChart>
  useDataSources: ImmutableArray<UseDataSource>
  onTemplateChange: (templateId: string, webChart: ImmutableObject<IWebChart>) => void
  onToolsChange: (tools: ImmutableObject<ChartTools>) => void
  onWebChartChange: (webChart: ImmutableObject<IWebChart>, query?: IMFeatureLayerQueryParams) => void
}

export const ChartSettings = (props: ChartSettingsProps) => {
  const {
    type,
    template,
    tools,
    webChart,
    useDataSources,
    onTemplateChange,
    onToolsChange,
    onWebChartChange
  } = props

  const translate = hooks.useTranslate(defaultMessages)

  const hasDataSource = !!useDataSources?.[0]?.dataSourceId

  return (
    <>
      {hasDataSource && (
        <SettingSection>
          <SettingRow label={translate('chartType')} flow='wrap' level={1}>
            <ChartTypeSelector
              templateId={template}
              onChange={onTemplateChange}
            />
          </SettingRow>
        </SettingSection>
      )}
      {hasDataSource && webChart && (
        <ChartSetting
          type={type}
          tools={tools}
          webChart={webChart}
          useDataSources={useDataSources}
          onToolsChange={onToolsChange}
          onWebChartChange={onWebChartChange}
        />
      )}
      {!hasDataSource && <Placeholder />}
    </>
  )
}
