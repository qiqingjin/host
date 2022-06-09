import { React, ImmutableArray, UseDataSource, ImmutableObject, IMFeatureLayerQueryParams } from 'jimu-core'
import { SettingSection, SettingRow, SettingCollapse } from 'jimu-ui/advanced/setting-components'
import { IWebChart, WebChartSeries, ChartType, ChartDataSource } from '../../../../../config'
import { DataSetting } from '../data'
import { hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { defaultMessages as jimuBuilderDefaultMessage } from 'jimu-for-builder'
import { WebChartAxis, WebChartText, WebChartLegend } from 'jimu-ui/advanced/chart'
import { getSerialSeriesRotated } from '../../../../../utils/common/serial'
import defaultMessages from '../../../../translations/default'
import { SerialSeries } from './series'
import { SerialAxes } from './axes'
import { SerialGeneral } from './general'
import { SerialAppearance } from './appearance'
import { ChartSettingSection } from '../../type'

interface SerialSettingProps {
  type: ChartType
  section: ChartSettingSection
  webChart: ImmutableObject<IWebChart>
  useDataSources: ImmutableArray<UseDataSource>
  onSectionChange: (section: ChartSettingSection) => void
  onWebChartChange: (webChart: ImmutableObject<IWebChart>, query?: IMFeatureLayerQueryParams) => void
}

export const SerialSetting = (props: SerialSettingProps): React.ReactElement => {
  const {
    type,
    section,
    webChart,
    useDataSources,
    onSectionChange,
    onWebChartChange
  } = props

  const rotated = getSerialSeriesRotated(webChart?.series)
  const legendValid = webChart?.series != null && webChart?.series?.length > 1

  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage, jimuBuilderDefaultMessage)

  const handleSeriesChange = (series: ImmutableArray<WebChartSeries>, chartDataSource?: ImmutableObject<ChartDataSource>) => {
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

  const handleAxesChange = (axes: ImmutableArray<WebChartAxis>): void => {
    onWebChartChange?.(webChart.set('axes', axes))
  }

  const handleTitleChange = (title: ImmutableObject<WebChartText>): void => {
    onWebChartChange?.(webChart.set('title', title))
  }

  const onFooterChange = (footer: ImmutableObject<WebChartText>): void => {
    onWebChartChange?.(webChart.set('footer', footer))
  }

  const handleRotatedChange = (rotated: boolean): void => {
    const horizontalAlignment = rotated ? 'right' : 'center'
    const verticalAlignment = rotated ? 'middle' : 'top'
    const series = webChart?.series.map(serie => (serie as any).set('rotated', rotated)
      .setIn(['dataLabels', 'content', 'horizontalAlignment'], horizontalAlignment)
      .setIn(['dataLabels', 'content', 'verticalAlignment'], verticalAlignment))

    onWebChartChange?.(webChart.set('series', series))
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
              onChange={handleSeriesChange}
            />
          </SettingRow>
        </SettingCollapse>
      </SettingSection>
      <SettingSection>
        <SettingCollapse
          label={translate('series')}
          isOpen={section === ChartSettingSection.Series}
          onRequestOpen={() => onSectionChange(ChartSettingSection.Series)}
          onRequestClose={() => onSectionChange(ChartSettingSection.None)}
        >
          <SettingRow flow='wrap'>
            <SerialSeries
              series={webChart?.series}
              onChange={handleSeriesChange}
            />
          </SettingRow>
        </SettingCollapse>
      </SettingSection>
      <SettingSection>
        <SettingCollapse
          label={translate('axes')}
          isOpen={section === ChartSettingSection.Axes}
          onRequestOpen={() => onSectionChange(ChartSettingSection.Axes)}
          onRequestClose={() => onSectionChange(ChartSettingSection.None)}
        >
          <SettingRow flow='wrap'>
            <SerialAxes
              rotated={rotated}
              axes={webChart?.axes}
              onChange={handleAxesChange}
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
            <SerialGeneral
              title={webChart?.title}
              footer={webChart?.footer}
              legend={webChart?.legend}
              legendValid={legendValid}
              rotated={rotated}
              onTitleChange={handleTitleChange}
              onFooterChange={onFooterChange}
              onRotatedChange={handleRotatedChange}
              onLegendChange={handleLegendChange}
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
            <SerialAppearance
              webChart={webChart}
              onChange={onWebChartChange}
            />
          </SettingRow>
        </SettingCollapse>
      </SettingSection>
    </>
  )
}
