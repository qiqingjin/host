/** @jsx jsx */
import {
  React,
  ImmutableObject,
  classNames,
  css,
  jsx,
  SerializedStyles
} from 'jimu-core'
import {
  TextInput,
  hooks,
  NumericInput,
  defaultMessages as jimuiDefaultMessage,
  Select,
  Switch
} from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { CategoryFormatOptions, NumberFormatOptions, WebChartAxis } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../../translations/default'
import { LabelFormatSetting, NumericFormatSetting } from '../../../web-chart/components'
import { useTheme } from 'jimu-theme'

export interface AxisStyleProps {
  className?: string
  type: 'category' | 'value'
  rotated: boolean
  axis: ImmutableObject<WebChartAxis>
  onChange?: (axis: ImmutableObject<WebChartAxis>) => void
}

const Alignment = {
  verticalAlignment: ['baseline', 'top', 'middle', 'bottom'],
  horizontalAlignment: ['left', 'right', 'center', 'justify']
}

const useStyle = (): SerializedStyles => {
  const theme = useTheme()
  const dark400 = theme?.colors?.palette?.dark?.[400]

  return React.useMemo(() => {
    return css`
      .label-alignment .jimu-widget-setting--row-label {
        color: ${dark400};
      }
    `
  }, [dark400])
}

const parseNumber = (value: string) => {
  if (value === '' || value == null) return undefined
  const number = +value
  return Number.isNaN(number) ? undefined : number
}

export const getAlignmentName = (type: 'category' | 'value', rotated: boolean) => {
  if (type === 'category') {
    return rotated ? 'verticalAlignment' : 'horizontalAlignment'
  } else if (type === 'value') {
    return rotated ? 'horizontalAlignment' : 'verticalAlignment'
  }
}

export const AxisStyle = (props: AxisStyleProps): React.ReactElement => {
  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)
  const style = useStyle()

  const { className, type = 'category', axis, rotated, onChange } = props
  const titleText = axis.title.content?.text ?? ''
  const valueFormat = axis.valueFormat
  const showGrid = axis.grid?.width > 0
  const minimum = axis.minimum ?? ''
  const maximum = axis.maximum ?? ''
  const alignmentName = getAlignmentName(type, rotated)
  const alignments = Alignment[alignmentName]
  const alignment = axis?.labels.content[alignmentName] ?? alignments[2]

  const handleTitleTextChange = (value: string): void => {
    onChange?.(
      axis.set(
        'title',
        axis.title.set('visible', value !== '').setIn(['content', 'text'], value)
      )
    )
  }

  const handleValueFormatChange = (value: ImmutableObject<CategoryFormatOptions> | ImmutableObject<NumberFormatOptions>): void => {
    onChange?.(axis.set('valueFormat', value))
  }

  const handleShowGridChange = (): void => {
    onChange?.(axis.setIn(['grid', 'width'], showGrid ? 0 : 1))
  }

  const handleMinumumChange = (value: string): void => {
    const minimum = parseNumber(value)
    onChange?.(axis.set('minimum', minimum))
  }

  const handleMaxumumChange = (value: string): void => {
    const maximum = parseNumber(value)
    onChange?.(axis.set('maximum', maximum))
  }

  const handleAlignmentChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    const alignment = evt.currentTarget.value
    onChange?.(axis.setIn(['labels', 'content', alignmentName], alignment))
  }

  return (
    <div
      className={classNames('serial-axis-style w-100', className)}
      css={style}
    >
      {type === 'value' && (
        <SettingRow label={translate('valueRange')} flow='wrap' level={2}>
          <div className='d-flex align-items-center justify-content-between'>
            <NumericInput
              placeholder={translate('min')}
              size='sm'
              showHandlers={false}
              value={minimum}
              style={{ width: '40%' }}
              onAcceptValue={handleMinumumChange}
            />
            <span className='text-truncate'>{translate('to')}</span>
            <NumericInput
              size='sm'
              showHandlers={false}
              placeholder={translate('max')}
              value={maximum}
              style={{ width: '40%' }}
              onAcceptValue={handleMaxumumChange}
            />
          </div>
        </SettingRow>
      )}
      <SettingRow label={translate('axisTitle')} flow='wrap' level={2}>
        <TextInput
          size='sm'
          defaultValue={titleText}
          className='w-100'
          onAcceptValue={handleTitleTextChange}
        />
      </SettingRow>
      <SettingRow label={translate('axisLabel')} flow='wrap' level={2}>
        {type === 'category' && (
          <React.Fragment>
            <LabelFormatSetting
              value={valueFormat as ImmutableObject<CategoryFormatOptions>}
              onChange={handleValueFormatChange}
            />
            <SettingRow
              truncateLabel={true}
              className='label-alignment w-100 mt-2'
              label={translate('alignment')}
              flow='no-wrap'
            >
              <Select
                size='sm'
                className='w-50'
                value={alignment}
                onChange={handleAlignmentChange}
              >
                {alignments.map(alignment => (
                  <option key={alignment} value={alignment}>
                    {translate(alignment)}
                  </option>
                ))}
              </Select>
            </SettingRow>
          </React.Fragment>
        )}
        {type === 'value' && (
          <NumericFormatSetting
            value={valueFormat as ImmutableObject<NumberFormatOptions>}
            onChange={handleValueFormatChange}
          />
        )}
      </SettingRow>
      <SettingRow label={translate('axisGrid')} level={2}>
        <Switch checked={showGrid} onChange={handleShowGridChange} />
      </SettingRow>
    </div>
  )
}
