/* eslint-disable camelcase */
import { DataRecord, IMFeatureLayerQueryParams, Immutable } from 'jimu-core'
import { CategoryType, ColorMatches } from '../../src/config'
import { convertData } from '../../src/runtime/runtimes/chart/web-chart/utils'

jest.mock('../../src/utils/common', () => {
  return {
    ...jest.requireActual<Record<string, any>>('../../src/utils/common'),
    getFieldSchema: field => ({ field, alias: `${field}-1` })
  }
})

const makeDummyRecord = (attribute): DataRecord => {
  return {
    getData: () => attribute,
    getFieldValue: (field) => attribute[field],
    getFormattedFieldValue: (field) => attribute[field] + '!'
  } as unknown as DataRecord
}

describe('src/runtime/serial/utils', () => {
  it('convertData', () => {
    let query: IMFeatureLayerQueryParams = Immutable({
      groupByFieldsForStatistics: ['x'],
      outStatistics: [{
        onStatisticField: 'v',
        outStatisticFieldName: 'v',
        statisticType: 'sum'
      }]
    })
    let data = [{ x: 'a', v: 0 }, { x: 'b', v: 1 }]
    let records = data.map(makeDummyRecord)
    let colorMatches = {} as ColorMatches
    let result = convertData('serial', records, query, colorMatches, CategoryType.ByGroup, null)
    expect(result).toEqual([{ x: 'a!', v: 0 }, { x: 'b!', v: 1 }])

    data = [{ x: 'a', v: 0 }, { x: 'b', v: 1 }, { x: null, v: 2 }]
    records = data.map(makeDummyRecord)
    result = convertData('serial', records, query, colorMatches, CategoryType.ByGroup, null)
    expect(result).toEqual([{ x: 'a!', v: 0 }, { x: 'b!', v: 1 }])

    colorMatches = { a: { _fillColor: 'red' } }
    data = [{ x: 'a', v: 0 }, { x: 'b', v: 1 }, { x: null, v: 2 }]
    records = data.map(makeDummyRecord)
    result = convertData('serial', records, query, colorMatches, CategoryType.ByGroup, null)
    expect(result).toEqual([{ x: 'a!', v: 0, _fillColor_v: 'red' }, { x: 'b!', v: 1 }])

    query = Immutable({
      outStatistics: [{
        onStatisticField: 'v',
        outStatisticFieldName: 'v',
        statisticType: 'sum'
      },
      {
        onStatisticField: 'v1',
        outStatisticFieldName: 'v1',
        statisticType: 'sum'
      }, {
        onStatisticField: 'v2',
        outStatisticFieldName: 'v',
        statisticType: 'sum'
      }]
    })

    data = [{ v: 0, v1: 1, v2: null }] as any
    records = data.map(makeDummyRecord)
    result = convertData('serial', records, query, colorMatches, CategoryType.ByField, null)
    expect(result).toEqual([{
      objectid: 0,
      FieldName: 'v-1',
      FieldValue: 0
    }, {
      objectid: 1,
      FieldName: 'v1-1',
      FieldValue: 1
    }, {
      objectid: 2,
      FieldName: 'v2-1',
      FieldValue: 0
    }])

    colorMatches = { v1: { _fillColor: 'red' } }
    records = data.map(makeDummyRecord)
    result = convertData('serial', records, query, colorMatches, CategoryType.ByField, null)
    expect(result).toEqual([{
      objectid: 0,
      FieldName: 'v-1',
      FieldValue: 0
    }, {
      objectid: 1,
      FieldName: 'v1-1',
      FieldValue: 1,
      _fillColor_FieldValue: 'red'
    }, {
      objectid: 2,
      FieldName: 'v2-1',
      FieldValue: 0
    }])
  })
})
