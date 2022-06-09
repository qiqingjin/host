import {
  DataRecord, DataSource, DataSourceComponent, FeatureDataRecord,
  Immutable, ImmutableObject, IMState, QueriableDataSource, QueryParams, React, ReactRedux, UseDataSource, DataSourceStatus, IMFeatureLayerQueryParams
} from 'jimu-core'
import { hooks } from 'jimu-ui'
import { ChartDataSource } from '../../../config'
import { ObjectIdField } from '../../../constants'
import { useChartRuntimeDispatch, useChartRuntimeState, SourceStatus } from '../state'

export interface DataSourceManagerProps {
  widgetId: string
  recordslimited?: number
  chartDataSource: ImmutableObject<ChartDataSource>
  useDataSource: ImmutableObject<UseDataSource>
  outputDataSourceId: string
}

/**
 * Check whether a data source instance is valid (whether the corresponding data source is deleted)
 * @param dataSource
 */
const isDataSourceValid = (dataSource: DataSource): boolean => {
  if (!dataSource) return false
  const info = dataSource.getInfo()
  return info && Object.keys(info).length > 0
}

/**
 * Check whether the query in chart data source is valid.
 * @param dataSource
 */
const isValidQuery = (query: IMFeatureLayerQueryParams): boolean => {
  return !!query?.outStatistics?.[0]?.onStatisticField || !!query?.outFields?.[1]
}

/**
 * Check whether a data source instance can be used to load data
 * @param dataSource
 */
const isDataSourceReady = (dataSource: DataSource): boolean => {
  if (!isDataSourceValid(dataSource)) return false
  const status = dataSource.getStatus()
  //The dats source is ready to use
  return status && status !== DataSourceStatus.NotReady
}

const getOutputSourceRecords = (records: DataRecord[]) => {
  const _records = records?.map((r, i) => {
    const featureDataRecord = r as FeatureDataRecord
    const data = featureDataRecord.getData()
    data[ObjectIdField] = i
    featureDataRecord.feature.attributes = data
    return r
  })
  return _records
}

const fetchRecords = async (dataSource, outputDataSource, query, recordslimited, dispatch) => {
  if (!isDataSourceReady(dataSource) || !isDataSourceValid(outputDataSource) || query == null) {
    return
  }
  try {
    dispatch({ type: 'SET_SOURCE_STATUS', value: SourceStatus.Loading })
    const result = await (dataSource as QueriableDataSource).query(query)
    const records = result.records
    if (recordslimited && records.length > recordslimited) {
      outputDataSource.setStatus(DataSourceStatus.NotReady)
      outputDataSource.setCountStatus(DataSourceStatus.NotReady)
      dispatch({ type: 'SET_SOURCE_STATUS', value: SourceStatus.ExceedLimit })
    } else {
      const sourceRecords = getOutputSourceRecords(records)
      outputDataSource.setSourceRecords(sourceRecords)
      outputDataSource.setStatus(DataSourceStatus.Unloaded)
      outputDataSource.setCountStatus(DataSourceStatus.Unloaded)
      if (records.length === 0) {
        dispatch({ type: 'SET_SOURCE_STATUS', value: SourceStatus.LoadEmpty })
      } else {
        dispatch({ type: 'SET_SOURCE_STATUS', value: SourceStatus.Loaded })
      }
    }
  } catch (error) {
    outputDataSource.setStatus(DataSourceStatus.NotReady)
    outputDataSource.setCountStatus(DataSourceStatus.NotReady)
    dispatch({ type: 'SET_SOURCE_STATUS', value: SourceStatus.LoadError })
    console.error(error)
  }
}

const getDataSourceQuery = (query: IMFeatureLayerQueryParams) => {
  if (!isValidQuery(query)) return null
  if (query.outStatistics?.length && !query.groupByFieldsForStatistics) {
    return query.without('orderByFields')
  }
  return query
}

export const DataSourceManager = (props: DataSourceManagerProps) => {
  const {
    widgetId,
    recordslimited,
    chartDataSource,
    useDataSource,
    outputDataSourceId
  } = props
  const { dataSource, outputDataSource, sourceStatus, filter } = useChartRuntimeState()
  const sourceStatusRef = hooks.useRefValue(sourceStatus)
  const dataSourceRef = hooks.useRefValue(dataSource)
  const dispatch = useChartRuntimeDispatch()
  const originSourceStatus = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[useDataSource?.dataSourceId]?.status)
  const originSourceStatusReady = originSourceStatus !== DataSourceStatus.NotReady
  //Query parameters of the output data source
  const query = React.useMemo(() => getDataSourceQuery(chartDataSource?.query), [chartDataSource?.query])
  React.useEffect(() => {
    fetchRecords(dataSource, outputDataSource, query, recordslimited, dispatch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, dataSource, outputDataSource, originSourceStatusReady])

  const handleQueryRequiredChange = async () => {
    fetchRecords(dataSource, outputDataSource, query, recordslimited, dispatch)
  }

  //When the original data source state changes, update it to the `sourceStatus` of runtime state
  React.useEffect(() => {
    //When useDataSource is empty, set the `sourceStatus` to `UnLoaded`
    if (!useDataSource) {
      dispatch({ type: 'SET_SOURCE_STATUS', value: SourceStatus.UnLoaded })
    }
    //When query is empty, set the `sourceStatus` to `Ready`
    if (query == null && sourceStatusRef.current !== SourceStatus.UnLoaded) {
      dispatch({ type: 'SET_SOURCE_STATUS', value: SourceStatus.UnLoaded })
    }
  }, [dispatch, originSourceStatus, useDataSource, query, sourceStatusRef])

  //When the filter is modified, update it to the data source
  React.useEffect(() => {
    if (dataSourceRef.current) {
      (dataSourceRef.current as QueriableDataSource).updateQueryParams({ where: filter?.sql ?? '1=1' } as QueryParams, widgetId)
    }
  }, [dataSourceRef, filter, widgetId])

  const outputUseDataSource: ImmutableObject<UseDataSource> = React.useMemo(() => {
    if (outputDataSourceId) {
      return Immutable({
        dataSourceId: outputDataSourceId,
        mainDataSourceId: outputDataSourceId
      })
    }
  }, [outputDataSourceId])

  const handleOutputDataSourceSchemaChange = () => {
    if (!outputDataSource) return
    if (outputDataSource.getStatus() !== DataSourceStatus.NotReady) {
      outputDataSource.setStatus(DataSourceStatus.NotReady)
      outputDataSource.setCountStatus(DataSourceStatus.NotReady)
    }
  }

  const handleDataSouceCreated = (dataSouce: DataSource) => {
    dispatch({ type: 'SET_DATA_SOURCE', value: dataSouce })
  }

  const handleOutputDataSouceCreated = (dataSouce: DataSource) => {
    dispatch({ type: 'SET_OUTPUT_DATA_SOURCE', value: dataSouce })
  }

  return <>
    <DataSourceComponent
      widgetId={widgetId}
      onQueryRequired={handleQueryRequiredChange}
      useDataSource={useDataSource}
      onDataSourceCreated={handleDataSouceCreated}
    />
    <DataSourceComponent
      widgetId={widgetId}
      useDataSource={outputUseDataSource}
      onDataSourceCreated={handleOutputDataSouceCreated}
      onDataSourceSchemaChange={handleOutputDataSourceSchemaChange}
    />
  </>
}
