import { React, ImmutableObject } from 'jimu-core'
import { hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { IWebChart } from '../../../../../config'
import { DefaultBgColor } from '../../../../../utils/default'
import defaultMessages from '../../../../translations/default'
import { Background, ElementPanel, TextStyle, getTextElements, LineStyle, getLineElements } from '../appearance'

export interface ScatterAppearanceProps {
  webChart: ImmutableObject<IWebChart>
  onChange: (webChart: ImmutableObject<IWebChart>) => void
}

const TextElements = getTextElements('scatter-plot')
const LineElements = getLineElements('scatter-plot')

export const ScatterAppearance = (props: ScatterAppearanceProps): React.ReactElement => {
  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)
  const { webChart, onChange } = props
  const background = webChart?.background

  const handleBackgroundChange = (value: string): void => {
    onChange?.(webChart.set('background', value || DefaultBgColor))
  }

  return (
    <div className='serial-general w-100'>
      <Background value={background} onChange={handleBackgroundChange} />
      <ElementPanel label={translate('textElements')} title={translate('textElements')}>
        <TextStyle
          webChart={webChart}
          elements={TextElements}
          onChange={onChange}
        />
      </ElementPanel>
      <ElementPanel label={translate('symbolElements')} title={translate('symbolElements')}>
        <LineStyle
          webChart={webChart}
          elements={LineElements}
          onChange={onChange}
        />
      </ElementPanel>
    </div>
  )
}
