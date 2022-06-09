import { IMFeatureLayerQueryParams, ImmutableArray, ImmutableObject, React, UseDataSource } from 'jimu-core'
import { ChartType, IWebChart } from '../../../../config'
import { SerialSetting } from './serial'
import { PieSetting } from './pie'
import { ChartSettingSection } from '../type'
import { ScatterPlotSetting } from './scatter-plot'

interface WebChartSettingProps {
  type: ChartType
  section: ChartSettingSection
  webChart: ImmutableObject<IWebChart>
  useDataSources: ImmutableArray<UseDataSource>
  onSectionChange: (section: ChartSettingSection) => void
  onWebChartChange: (webChart: ImmutableObject<IWebChart>, query?: IMFeatureLayerQueryParams) => void
}

export const WebChartSetting = (props: WebChartSettingProps) => {
  const { type, section, webChart, onSectionChange, useDataSources, onWebChartChange } = props

  return (
    <>
      {type === 'serial' && (
        <SerialSetting
          type={type}
          section={section}
          webChart={webChart}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
        />
      )}
      {
        type === 'pie' && (
          <PieSetting
            type={type}
            section={section}
            webChart={webChart}
            onSectionChange={onSectionChange}
            useDataSources={useDataSources}
            onWebChartChange={onWebChartChange}
          />
        )
      }
      {
        type === 'scatter-plot' && (
          <ScatterPlotSetting
            type={type}
            section={section}
            webChart={webChart}
            onSectionChange={onSectionChange}
            useDataSources={useDataSources}
            onWebChartChange={onWebChartChange}
          />
        )
      }
    </>
  )
}
