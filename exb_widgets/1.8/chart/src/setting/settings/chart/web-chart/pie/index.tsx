import { React, ImmutableArray, UseDataSource, ImmutableObject, IMFeatureLayerQueryParams } from 'jimu-core'
import { SettingSection, SettingRow, SettingCollapse } from 'jimu-ui/advanced/setting-components'
import { IWebChart, WebChartSeries, ChartType, ChartDataSource } from '../../../../../config'
import { hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { defaultMessages as jimuBuilderDefaultMessage } from 'jimu-for-builder'
import { WebChartText, WebChartLegend } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../translations/default'
import { PieSeries } from './series'
import { PieGeneral } from './general'
import { DataSetting } from '../data'
import { PieAppearance } from './appearance'
import { ChartSettingSection } from '../../type'

interface PieSettingProps {
  type: ChartType
  section: ChartSettingSection
  webChart: ImmutableObject<IWebChart>
  useDataSources: ImmutableArray<UseDataSource>
  onSectionChange: (section: ChartSettingSection) => void
  onWebChartChange: (webChart: ImmutableObject<IWebChart>, query?: IMFeatureLayerQueryParams) => void
}

export const PieSetting = (props: PieSettingProps): React.ReactElement => {
  const {
    type,
    section,
    webChart,
    onSectionChange,
    useDataSources,
    onWebChartChange
  } = props

  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage, jimuBuilderDefaultMessage)

  const handleSeiesChange = (series: ImmutableArray<WebChartSeries>, chartDataSource?: ImmutableObject<ChartDataSource>) => {
    if (chartDataSource) {
      if (chartDataSource.query !== webChart?.dataSource?.query) {
        onWebChartChange?.(webChart.set('dataSource', chartDataSource).set('series', series), chartDataSource?.query)
      } else {
        onWebChartChange?.(webChart.set('dataSource', chartDataSource).set('series', series))
      }
    } else {
      onWebChartChange?.(webChart.set('series', series))
    }
  }

  const handleTitleChange = (title: ImmutableObject<WebChartText>): void => {
    onWebChartChange?.(webChart.set('title', title))
  }

  const onFooterChange = (footer: ImmutableObject<WebChartText>): void => {
    onWebChartChange?.(webChart.set('footer', footer))
  }

  const handleLegendChange = (legend: ImmutableObject<WebChartLegend>): void => {
    onWebChartChange?.(webChart.set('legend', legend))
  }

  return (
    <>
      <SettingSection>
        <SettingCollapse
          label={translate('data')}
          isOpen={section === ChartSettingSection.Data}
          onRequestOpen={() => onSectionChange(ChartSettingSection.Data)}
          onRequestClose={() => onSectionChange(ChartSettingSection.None)}
        >
          <SettingRow flow='wrap'>
            <DataSetting
              type={type}
              chartDataSource={webChart?.dataSource}
              useDataSources={useDataSources}
              series={webChart?.series}
              onChange={handleSeiesChange}
            />
          </SettingRow>
        </SettingCollapse>
      </SettingSection>
      <SettingSection>
        <SettingCollapse
          label={translate('slices')}
          isOpen={section === ChartSettingSection.Series}
          onRequestOpen={() => onSectionChange(ChartSettingSection.Series)}
          onRequestClose={() => onSectionChange(ChartSettingSection.None)}
        >
          <SettingRow flow='wrap'>
            <PieSeries
              useDataSources={useDataSources}
              chartDataSource={webChart.dataSource}
              series={webChart?.series}
              onChange={handleSeiesChange}
            />
          </SettingRow>
        </SettingCollapse>
      </SettingSection>
      <SettingSection>
        <SettingCollapse
          label={translate('general')}
          isOpen={section === ChartSettingSection.General}
          onRequestOpen={() => onSectionChange(ChartSettingSection.General)}
          onRequestClose={() => onSectionChange(ChartSettingSection.None)}
        >
          <SettingRow flow='wrap'>
            <PieGeneral
              title={webChart?.title}
              footer={webChart?.footer}
              legend={webChart?.legend}
              series={webChart?.series}
              onTitleChange={handleTitleChange}
              onFooterChange={onFooterChange}
              onLegendChange={handleLegendChange}
              onSeriesChange={handleSeiesChange}
            />
          </SettingRow>
        </SettingCollapse>
      </SettingSection>
      <SettingSection>
        <SettingCollapse
          label={translate('appearance')}
          isOpen={section === ChartSettingSection.Appearance}
          onRequestOpen={() => onSectionChange(ChartSettingSection.Appearance)}
          onRequestClose={() => onSectionChange(ChartSettingSection.None)}
        >
          <SettingRow flow='wrap'>
            <PieAppearance
              webChart={webChart}
              onChange={onWebChartChange}
            />
          </SettingRow>
        </SettingCollapse>
      </SettingSection>
    </>
  )
}
