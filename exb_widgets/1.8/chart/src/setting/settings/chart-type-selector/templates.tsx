import { React, classNames } from 'jimu-core'
import { hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { Card } from '../components'
import { IWebChart } from '../../../config'
import defaultMessages from '../../translations/default'
import { UnControlledSettingCollapse, SettingRow } from 'jimu-ui/advanced/setting-components'

const CardStyle = {
  width: '68px',
  height: '56px',
  marginRight: '11px'
}

export const TemplateTranslation = {
  bar: 'bar',
  'stacked-bar': 'stackedBar',
  'stacked100-bar': 'stacked100bar',
  column: 'column',
  'stacked-column': 'stackedColumn',
  'stacked100-column': 'stacked100column',
  line: 'line',
  'smooth-line': 'smoothLine',
  area: 'area',
  'smooth-area': 'smoothArea',
  pie: 'pie',
  donut: 'donut',
  'scatter-plot': 'scatterPlot'
}

const Thumbnails = {
  column: require('../../assets/thumbnail/column.svg'),
  'stacked-column': require('../../assets/thumbnail/stacked-column.svg'),
  'stacked100-column': require('../../assets/thumbnail/stacked100-column.svg'),
  bar: require('../../assets/thumbnail/bar.svg'),
  'stacked-bar': require('../../assets/thumbnail/stacked-bar.svg'),
  'stacked100-bar': require('../../assets/thumbnail/stacked100-bar.svg'),
  line: require('../../assets/thumbnail/line.svg'),
  'smooth-line': require('../../assets/thumbnail/smooth-line.svg'),
  area: require('../../assets/thumbnail/area.svg'),
  'smooth-area': require('../../assets/thumbnail/smooth-area.svg'),
  pie: require('../../assets/thumbnail/pie.svg'),
  donut: require('../../assets/thumbnail/donut.svg'),
  'scatter-plot': require('../../assets/thumbnail/scatter-plot.svg')
}

export const BuildInTemplateJson = {
  column: require('../../template/column.json'),
  'stacked-column': require('../../template/stacked-column.json'),
  'stacked100-column': require('../../template/stacked100-column.json'),
  bar: require('../../template/bar.json'),
  'stacked-bar': require('../../template/stacked-bar.json'),
  'stacked100-bar': require('../../template/stacked100-bar.json'),
  line: require('../../template/line.json'),
  'smooth-line': require('../../template/smooth-line.json'),
  area: require('../../template/area.json'),
  'smooth-area': require('../../template/smooth-area.json'),
  pie: require('../../template/pie.json'),
  donut: require('../../template/donut.json'),
  'scatter-plot': require('../../template/scatter-plot.json')
}

export const BuildInTemplates = [{
  id: 'column',
  icon: require('../../assets/icons/column.svg'),
  templates: [
    {
      id: 'column',
      thumbnail: Thumbnails.column,
      content: BuildInTemplateJson.column
    },
    {
      id: 'stacked-column',
      thumbnail: Thumbnails['stacked-column'],
      content: BuildInTemplateJson['stacked-column']
    },
    {
      id: 'stacked100-column',
      thumbnail: Thumbnails['stacked100-column'],
      content: BuildInTemplateJson['stacked100-column']
    }
  ]
}, {
  id: 'bar',
  icon: require('../../assets/icons/bar.svg'),
  templates: [
    {
      id: 'bar',
      thumbnail: Thumbnails.bar,
      content: BuildInTemplateJson.bar
    },
    {
      id: 'stacked-bar',
      thumbnail: Thumbnails['stacked-bar'],
      content: BuildInTemplateJson['stacked-bar']
    },
    {
      id: 'stacked100-bar',
      thumbnail: Thumbnails['stacked100-bar'],
      content: BuildInTemplateJson['stacked100-bar']
    }
  ]
}, {
  id: 'line',
  icon: require('../../assets/icons/line.svg'),
  templates: [
    {
      id: 'line',
      thumbnail: Thumbnails.line,
      content: BuildInTemplateJson.line
    },
    {
      id: 'smooth-line',
      thumbnail: Thumbnails['smooth-line'],
      content: BuildInTemplateJson['smooth-line']
    }
  ]
}, {
  id: 'area',
  icon: require('../../assets/icons/area.svg'),
  templates: [
    {
      id: 'area',
      thumbnail: Thumbnails.area,
      content: BuildInTemplateJson.area
    },
    {
      id: 'smooth-area',
      thumbnail: Thumbnails['smooth-area'],
      content: BuildInTemplateJson['smooth-area']
    }
  ]
}, {
  id: 'pie',
  icon: require('../../assets/icons/pie.svg'),
  templates: [
    {
      id: 'pie',
      thumbnail: Thumbnails.pie,
      content: BuildInTemplateJson.pie
    },
    {
      id: 'donut',
      thumbnail: Thumbnails.donut,
      content: BuildInTemplateJson.donut
    }
  ]
}, {
  id: 'scatter-plot',
  icon: require('../../assets/icons/scatter-plot.svg'),
  templates: [
    {
      id: 'scatter-plot',
      thumbnail: Thumbnails['scatter-plot'],
      content: BuildInTemplateJson['scatter-plot']
    }
  ]
}]

export const getUsedGroupId = (templateId: string) => {
  const groupId = BuildInTemplates.find((value) => {
    return value.templates.find((item) => item.id === templateId)
  })?.id

  return groupId
}

export interface ChartTemplate {
  id: string
  thumbnail: any
  content: any
}

export interface ChartTemplateGroup {
  id: string
  icon: any
  templates: ChartTemplate[]
}

export interface ChartTemplatesProps {
  className?: string
  templateId: string
  onChange: (config: IWebChart) => void
}

export const ChartTemplates = (props: ChartTemplatesProps): React.ReactElement => {
  const { className, templateId, onChange } = props
  const translate = hooks.useTranslate(defaultMessages, jimuiDefaultMessage)

  return (
    <div className={classNames('chart-templates', className)}>
      <SettingRow flow="wrap">
        {
          BuildInTemplates.map((value) => {
            const { id: groupId, icon, templates } = value
            return (<UnControlledSettingCollapse
              className="mb-2"
              key={groupId}
              leftIcon={icon}
              label={translate(TemplateTranslation[groupId])}
              defaultIsOpen={true}>
              <div className="d-flex mt-2">
                {
                  templates.map(({ thumbnail, content }) => {
                    return (
                      <Card
                        key={content.id}
                        label={translate(TemplateTranslation[content.id])}
                        style={CardStyle}
                        icon={thumbnail}
                        active={content.id === templateId}
                        onClick={() => onChange(content)}
                      />
                    )
                  })
                }
              </div>
            </UnControlledSettingCollapse>)
          })
        }
      </SettingRow>
    </div>
  )
}
