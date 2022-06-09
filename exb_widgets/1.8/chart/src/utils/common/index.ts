import { IMFieldSchema, DataSourceManager } from 'jimu-core'

const cacheObjectIdField = {}
/**
 * get objectid
 * @param dataSourceId
 */
export const getObjectIdField = (dataSourceId: string): string | undefined => {
  if (cacheObjectIdField[dataSourceId] != null) return cacheObjectIdField[dataSourceId]
  const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
  if (ds == null) {
    console.error(`Invalid data source id: ${dataSourceId}`)
    return
  }
  const objectId = ds.getIdField()
  cacheObjectIdField[dataSourceId] = objectId
  return objectId
}

const cacheFieldSchema = {}
/**
 * Get the schema of a single field
 * @param jimuFieldName
 * @param dataSourceId
 */
export const getFieldSchema = (
  jimuFieldName: string,
  dataSourceId: string
): IMFieldSchema | undefined => {
  if (cacheFieldSchema[jimuFieldName] != null) return cacheFieldSchema[jimuFieldName]
  const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
  const dsSchema = ds?.getSchema()
  const fieldSchema = dsSchema?.fields?.[jimuFieldName]
  cacheFieldSchema[jimuFieldName] = fieldSchema
  return fieldSchema
}

const cacheFieldsSchema = {}

/**
 * Get all the field schema in a data source
 * @param dataSourceId
 */
export const getFieldsSchema = (
  dataSourceId: string
): { [jimuName: string]: IMFieldSchema } | undefined => {
  if (cacheFieldsSchema[dataSourceId] != null) return cacheFieldsSchema[dataSourceId]
  const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
  const dsSchema = ds?.getSchema()
  const fieldsSchema = dsSchema?.fields
  cacheFieldsSchema[dataSourceId] = fieldsSchema
  return fieldsSchema
}
