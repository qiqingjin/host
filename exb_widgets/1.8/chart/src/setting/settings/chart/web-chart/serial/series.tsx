
import { React, ImmutableArray, ImmutableObject, Immutable, classNames } from 'jimu-core'
import { Select, hooks, defaultMessages as jimuiDefaultMessage, Switch } from 'jimu-ui'
import { WebChartStackedKinds } from 'jimu-ui/advanced/chart'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { WebChartSeries } from '../../../../../config'
import defaultMessages from '../../../../translations/default'
import { SerialSerieStyle } from './components/series-style'
import { SettingCollapse } from '../../../components'
import { DefaultSeriesOutlineColor, getSeriesFillColor } from '../../../../../utils/default'
import { getSerialStackedType } from '../../../../../utils/common/serial'
import { styled } from 'jimu-theme'

interface SerialSeriesProps {
  series: ImmutableArray<WebChartSeries>
  onChange?: (series: ImmutableArray<WebChartSeries>) => void
}

const SeriesContainer = styled.div`
  overflow-y: auto;
  max-height: 340px;
`

export const SerialSeries = (props: SerialSeriesProps): React.ReactElement => {
  const { series: propSeries = Immutable([]), onChange } = props
  const valueLabelVisible = propSeries?.[0]?.dataLabels.visible ?? false

  const [serieIndex, setSerieIndex] = React.useState<number>(-1)
  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)
  const handleClick = (index: number): void => {
    setSerieIndex(index)
  }

  const handleChange = (serie: ImmutableObject<WebChartSeries>): void => {
    const series = Immutable.set(propSeries, serieIndex, serie)
    onChange?.(series)
  }

  const handleStackedTypeChange = (
    evt: React.MouseEvent<HTMLSelectElement>
  ): void => {
    const stackedType = evt.currentTarget.value as WebChartStackedKinds
    const series = propSeries?.map(propSerie => {
      return propSerie.set('stackedType', stackedType)
    })
    onChange?.(series)
  }

  const handleDataLabelsVisibleChange = (evt): void => {
    const visible = evt.target.checked
    const series = propSeries?.map(propSerie => {
      return propSerie.setIn(['dataLabels', 'visible'], visible)
    })
    onChange?.(series)
  }

  return (
    <div className='serial-series w-100'>
      <SettingRow label={translate('stacking')} className="mt-2">
        <Select
          size='sm'
          className='w-50'
          value={getSerialStackedType(propSeries)}
          onChange={handleStackedTypeChange}
        >
          <option value={WebChartStackedKinds.Side}>
            {translate(WebChartStackedKinds.Side)}
          </option>
          <option value={WebChartStackedKinds.Stacked}>
            {translate(WebChartStackedKinds.Stacked)}
          </option>
          <option value={WebChartStackedKinds.Stacked100}>
            {translate(WebChartStackedKinds.Stacked100)}
          </option>
        </Select>
      </SettingRow>
      <SettingRow label={translate('valueLabel')}>
        <Switch
          checked={valueLabelVisible}
          onChange={handleDataLabelsVisibleChange}
        />
      </SettingRow>
      <SeriesContainer className='mt-3'>
        {propSeries?.map((serie, index) => (
          <SettingCollapse
            className={classNames({ 'mt-2': index !== 0 }, 'pr-1')}
            key={index}
            level={1}
            type='primary'
            bottomLine={false}
            label={serie.name}
            isOpen={serieIndex === index}
            onRequestOpen={() => handleClick(index)}
            onRequestClose={() => handleClick(-1)}
          >
            <SerialSerieStyle
              defaultFillColor={getSeriesFillColor(serieIndex)}
              defaultLineColor={DefaultSeriesOutlineColor}
              className='mt-4'
              serie={propSeries?.[serieIndex]}
              onChange={handleChange}
            />
          </SettingCollapse>
        ))}
      </SeriesContainer>
    </div>
  )
}
