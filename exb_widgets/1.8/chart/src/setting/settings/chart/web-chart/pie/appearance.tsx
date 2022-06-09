import { React, ImmutableObject } from 'jimu-core'
import { hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { IWebChart } from '../../../../../config'
import { DefaultBgColor } from '../../../../../utils/default'
import defaultMessages from '../../../../translations/default'
import { Background, ElementPanel, TextStyle, getTextElements } from '../appearance'

export interface PieAppearanceProps {
  webChart: ImmutableObject<IWebChart>
  onChange: (webChart: ImmutableObject<IWebChart>) => void
}

const TextElements = getTextElements('pie')

export const PieAppearance = (props: PieAppearanceProps): React.ReactElement => {
  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)
  const { webChart, onChange } = props
  const background = webChart?.background

  const handleBackgroundChange = (value: string): void => {
    onChange?.(webChart.set('background', value || DefaultBgColor))
  }

  return (
    <div className='Pie-general w-100'>
      <Background value={background} onChange={handleBackgroundChange} />
      <ElementPanel label={translate('textElements')} title={translate('textElements')}>
        <TextStyle
          webChart={webChart}
          elements={TextElements}
          onChange={onChange}
        />
      </ElementPanel>
    </div>
  )
}
