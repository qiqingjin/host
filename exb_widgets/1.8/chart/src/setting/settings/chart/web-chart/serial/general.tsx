import { React, ImmutableObject } from 'jimu-core'
import { hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { WebChartLegend, WebChartText } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../translations/default'
import { Title, Orientation, Legend } from '../genaral'

interface SerialGeneralProps {
  title?: ImmutableObject<WebChartText>
  footer?: ImmutableObject<WebChartText>
  rotated: boolean
  showRotated?: boolean
  legend?: ImmutableObject<WebChartLegend>
  legendValid?: boolean
  onTitleChange?: (value: ImmutableObject<WebChartText>) => void
  onFooterChange?: (value: ImmutableObject<WebChartText>) => void
  onRotatedChange?: (value: boolean) => void
  onLegendChange?: (value: ImmutableObject<WebChartLegend>) => void
}

export const SerialGeneral = (props: SerialGeneralProps): React.ReactElement => {
  const {
    title,
    footer,
    rotated = false,
    showRotated = true,
    legend,
    legendValid,
    onTitleChange,
    onFooterChange,
    onRotatedChange,
    onLegendChange
  } = props

  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)

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
      {showRotated && <Orientation value={rotated} onChange={onRotatedChange} />}
      <Legend value={legend} onChange={onLegendChange} disabled={!legendValid} />
    </div>
  )
}
