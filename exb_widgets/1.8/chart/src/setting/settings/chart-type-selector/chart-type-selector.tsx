/** @jsx jsx */
import { React, css, jsx, polished, SerializedStyles, ImmutableObject } from 'jimu-core'
import { Button, hooks, defaultMessages as jimuiDefaultMessage, Icon } from 'jimu-ui'
import { IWebChart } from '../../../config'
import defaultMessages from '../../translations/default'
import { compeleteChart } from '../../../utils/default'
import { SidePopper } from 'jimu-ui/advanced/setting-components'
import { ChartTemplates, TemplateTranslation } from './templates'
import { useTheme } from 'jimu-theme'

export interface ChartTypeSelectorProps {
  templateId: string
  onChange: (template: string, webChart: ImmutableObject<IWebChart>) => void
}

const useStyle = (): SerializedStyles => {
  const theme = useTheme()
  const dark100 = theme?.colors?.palette.dark[100]
  const dark400 = theme?.colors?.palette.dark[400]
  const primary700 = theme?.colors?.palette.primary[700]
  const primary800 = theme?.colors?.palette.primary[800]

  return React.useMemo(
    () => css`
    button.btn-link {
      height: ${polished.rem(32)};
      line-height: ${polished.rem(32)};
      padding: 0;
      border: 1px dashed ${dark100};
      border-radius: ${polished.rem(2)};
      cursor: pointer;
      color: ${primary700};
      font-size: ${polished.rem(14)};
      text-decoration: none;
      &:hover{
        border-color: ${dark400};
        color: ${primary800};
      }
    }`,
    [dark100, dark400, primary700, primary800]
  )
}

const TemplateIcons = {
  column: require('../../assets/icons/column.svg'),
  bar: require('../../assets/icons/bar.svg'),
  line: require('../../assets/icons/line.svg'),
  area: require('../../assets/icons/area.svg'),
  pie: require('../../assets/icons/pie.svg'),
  'scatter-plot': require('../../assets/icons/scatter-plot.svg')
}

const getTemplateType = (templateId: string) => {
  if (!templateId) {
    return 'column'
  } else if (templateId.includes('column')) {
    return 'column'
  } else if (templateId.includes('bar')) {
    return 'bar'
  } else if (templateId.includes('line')) {
    return 'line'
  } else if (templateId.includes('area')) {
    return 'area'
  } else if (templateId.includes('scatter-plot')) {
    return 'scatter-plot'
  } else if (templateId.includes('pie') || templateId === 'donut') {
    return 'pie'
  }
}

export const ChartTypeSelector = (props: ChartTypeSelectorProps): React.ReactElement => {
  const { templateId, onChange } = props
  const style = useStyle()
  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)
  const [open, setOpen] = React.useState(false)
  const templateLabel = templateId && translate(TemplateTranslation[templateId])

  const templateIcon = React.useMemo(() => {
    const templateType = getTemplateType(templateId)
    return TemplateIcons[templateType]
  }, [templateId])

  const ref = React.useRef<HTMLDivElement>(null)

  const handleTemplateChange = (template: IWebChart): void => {
    const webChart = compeleteChart(template)
    onChange?.(template.id, webChart)
    setOpen(false)
  }

  return (
    <React.Fragment>
      <div className="chart-type-selector w-100" css={style} ref={ref}>
        {!templateId && <Button className='w-100' type='link' onClick={() => setOpen(v => !v)}>
          {translate('selectChart')}
        </Button>}
        {templateId && <Button
          type='default'
          title={templateLabel}
          className='w-100 text-left pl-2 pr-2'
          onClick={() => setOpen(v => !v)}>
          <Icon icon={templateIcon} />
          {templateLabel}
        </Button>}
      </div>

      <SidePopper isOpen={open} position="right" toggle={() => setOpen(false)} trigger={ref?.current} title={translate('chartType')}>
        <ChartTemplates className='px-3' templateId={templateId} onChange={handleTemplateChange} />
      </SidePopper>
    </React.Fragment>
  )
}
