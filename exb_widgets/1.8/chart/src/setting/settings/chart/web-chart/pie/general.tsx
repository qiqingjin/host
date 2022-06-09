import { React, ImmutableObject, ImmutableArray, Immutable } from 'jimu-core'
import { hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { WebChartLegend, WebChartText } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../translations/default'
import { Title, Angle, InnerRadius, Legend } from '../genaral'
import { WebChartPieChartSeries, WebChartSeries } from '../../../../../config'

interface PieGeneralProps {
  title?: ImmutableObject<WebChartText>
  footer?: ImmutableObject<WebChartText>
  legend?: ImmutableObject<WebChartLegend>
  series: ImmutableArray<WebChartSeries>
  onSeriesChange?: (series: ImmutableArray<WebChartSeries>) => void
  onTitleChange?: (value: ImmutableObject<WebChartText>) => void
  onFooterChange?: (value: ImmutableObject<WebChartText>) => void
  onLegendChange?: (value: ImmutableObject<WebChartLegend>) => void
}

export const PieGeneral = (props: PieGeneralProps): React.ReactElement => {
  const {
    title,
    footer,
    legend,
    series: propSeries,
    onTitleChange,
    onFooterChange,
    onSeriesChange,
    onLegendChange
  } = props

  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)
  const serie = propSeries?.[0] as ImmutableObject<WebChartPieChartSeries>
  const angle = serie?.startAngle ?? 0
  const innerRadius = serie?.innerRadius ?? 0

  const handleAngleChange = (start: number, end: number) => {
    let series = Immutable.setIn(propSeries, ['0', 'startAngle'], start)
    series = Immutable.setIn(series, ['0', 'endAngle'], end)
    onSeriesChange?.(series)
  }

  const handleInnerRadiusChange = (radius: number) => {
    const series = Immutable.setIn(propSeries, ['0', 'innerRadius'], radius)
    onSeriesChange?.(series)
  }

  return (
    <div className='serial-general w-100 mt-2'>
      <Title
        type='input'
        value={title}
        label={translate('chartTitle')}
        onChange={onTitleChange}
      />
      <Title
        type='area'
        value={footer}
        label={translate('description')}
        onChange={onFooterChange}
      />
      <Angle value={angle} onChange={handleAngleChange} />
      <InnerRadius value={innerRadius} onChange={handleInnerRadiusChange} />
      <Legend value={legend} onChange={onLegendChange} />
    </div>
  )
}
