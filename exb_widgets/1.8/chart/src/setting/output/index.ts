import { DataSourceJson, DataSourceSchema, DataSourceTypes, getAppStore, IMFeatureLayerQueryParams, Immutable, ImmutableArray, JimuFieldType, StatisticType, UseDataSource } from 'jimu-core'
import { ObjectIdField } from '../../../src/constants'
import { getFieldSchema } from '../../utils/common'

const ObjectIdSchema = {
  jimuName: ObjectIdField,
  alias: 'OBJECTID',
  type: JimuFieldType.Number,
  name: ObjectIdField
}

/**
 * Get the initial data source schema.
 * @param label
 */
const getInitSchema = (label: string = ''): DataSourceSchema => {
  return {
    label,
    idField: ObjectIdField,
    fields: {
      [ObjectIdField]: ObjectIdSchema
    }
  } as DataSourceSchema
}

/**
 * Get original fields from output ds schema (without objectid field)
 * @param schema
 */
const getSchemaOriginFields = (schema: DataSourceSchema) => {
  if (!schema?.fields) return
  const fields = Object.entries(schema.fields)?.map(([fieldName, fieldSchema]) => {
    if (fieldName === ObjectIdField && fieldSchema.jimuName === ObjectIdField) {
      return null
    }
    return fieldSchema.originFields?.[0]
  })?.filter(field => !!field)

  return fields
}

const getJimuFieldSchema = (field: string, dataSourceId: string, jimuName?: string) => {
  let schema = getFieldSchema(field, dataSourceId)
  jimuName = jimuName || field
  schema = schema.set('jimuName', jimuName).set('name', jimuName)
  schema = schema.set('originFields', [field])
  return schema
}

/**
 * Get schema for chart data soaurce.
 * @param datasource
 * @param dataSourceId
 */
const getDataSourceSchema = (query: IMFeatureLayerQueryParams, dataSourceId: string): DataSourceSchema => {
  let fields = Immutable({
    [ObjectIdField]: ObjectIdSchema
  })

  if (query?.outFields) {
    const outFields = query.outFields
    outFields?.forEach((outField) => {
      const schema = getJimuFieldSchema(outField, dataSourceId)
      fields = fields.set(outField, schema)
    })
  } else if (query.groupByFieldsForStatistics && query.outStatistics) {
    const categoryField = query.groupByFieldsForStatistics[0]
    if (categoryField) {
      const schema = getJimuFieldSchema(categoryField, dataSourceId)
      fields = fields.set(categoryField, schema)
    }
    query.outStatistics.forEach((statistic) => {
      const originField = statistic.onStatisticField
      if (originField) {
        const jimuName = statistic.outStatisticFieldName
        let schema = getJimuFieldSchema(originField, dataSourceId, jimuName)
        schema = schema.set('alias', jimuName)
        const statisticType = statistic.statisticType
        // defining formats for the schema of output data source https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder/issues/8902
        let format = schema.format
        if (statisticType === StatisticType.Count) {
          format = format || Immutable({})
          format = format.set('places', 0)
        } else if (statisticType === StatisticType.Avg) {
          if (typeof schema.format?.places === 'undefined') {
            format = format || Immutable({})
            format = format.set('places', 3)
          }
        }
        if (format) {
          schema = schema.set('format', format)
        }
        fields = fields.set(jimuName, schema)
      }
    })
  } else if (!query.groupByFieldsForStatistics && query.outStatistics) {
    const outStatistics = query.outStatistics
    outStatistics.forEach((outStatistic) => {
      const originField = outStatistic.onStatisticField
      if (!originField) return
      const jimuName = outStatistic.outStatisticFieldName
      const schema = getJimuFieldSchema(originField, dataSourceId, jimuName)
      //Fix issue https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/6422
      // schema = schema.set('alias', jimuName)
      fields = fields.set(jimuName, schema)
    })
  }

  const schema = {
    idField: ObjectIdSchema.jimuName,
    fields: fields.asMutable({ deep: true })
  } as unknown as DataSourceSchema

  return schema
}

/**
 * Create the initial output data source.
 * @param originalId
 * @param label
 * @param useDataSource
 */
export const createInitOutputDataSource = (id: string, label: string, useDataSource: UseDataSource) => {
  const schema = getInitSchema(label)

  const outputDsJson: DataSourceJson = {
    id,
    type: DataSourceTypes.FeatureLayer,
    label,
    originDataSources: [useDataSource],
    isOutputFromWidget: true,
    isDataInDataSourceInstance: true,
    schema
  }

  return outputDsJson
}

/**
 * Set the fields from output data source to useDataSources.
 * @param useDataSources
 * @param outputDataSource
 */
export const getUseDataSources = (useDataSources: ImmutableArray<UseDataSource>, outputDataSource: DataSourceJson): UseDataSource[] => {
  const schema = outputDataSource.schema
  const fields = getSchemaOriginFields(schema)
  const withFields = Immutable.setIn(useDataSources, ['0', 'fields'], fields).asMutable({ deep: true })
  return withFields
}

/**
 * Set the schema from chart data source to output data source.
 * @param chartDataSource
 * @param dataSourceId
 * @param outputDataSourceId
 */
export const getOutputDataSource = (query: IMFeatureLayerQueryParams, dataSourceId: string, outputDataSourceId: string): DataSourceJson => {
  if (!outputDataSourceId) return null
  let outputDataSource = getAppStore().getState()?.appStateInBuilder?.appConfig.dataSources?.[outputDataSourceId]
  if (!outputDataSource) {
    console.error(`The output data source of ${outputDataSourceId} does not exist`)
    return null
  }
  const schema = getDataSourceSchema(query, dataSourceId)
  outputDataSource = outputDataSource.set('schema', schema)
  return outputDataSource.asMutable({ deep: true })
}
