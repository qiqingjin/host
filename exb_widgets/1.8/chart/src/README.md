## There are three types of `WebChart` in the `Chart widget`:

- First: Fully follow the structure defined by the `WebChart` type (the `template` selected from `service definition`)

- Second: Extended types based on `WebChart` (the `config.webChart` passed from `setting` to `runtime`)

  - Remove `dataSource` (use `usedataSource` in ExB to store data source related information)
  - Change the type of `series.query` from `WebChartQuery` to `FeatureLayerQueryParams` (using the `query` structure in ExB)
  - All colors are stored as `string` type (it's the color types supported in ExB)

- Third, it basically follow the structure defined by the `WebChart` type (the `WebChart` passed to the `ChartComponent`)
  - `dataSource` uses the `WebChartInlinedataSource` structure. ExB uses its own data source to process data, and converts the processed data into an inline data source structure
  - The `query` in `series` is taken out and passed to `DataSourceCompnent` to request data. It will be removed before passing to `ChartComponent` (the inline data source does not need to `series.query`）
  - All colors are stored as `string` type (`ChartComponent` will convert them to `Symbol color` type)

## How is the style of a series generated:

- If there is a corresponding series in the template, use the styles in the template（get by index）
- If it is not in the template, use the first series of the template to get the necessary series information(e.g, type), and randomly generate styles for it

## The explanation of split by field:

If you have such a chart, the category field is `city`, the number field is `pop`, now the chart is statistic population by city, the series is like this:

```
[{
  x: 'city',
  y: 'pop',
   query: {
      groupByFieldsForStatistics: ['city']
      outStatistics: [{
        statisticType: 'sum',
        onStatisticField: 'pop',
        outStatisticFieldName: 'pop'
      }]
}]
```

On the basis of the existing chart, if you want to analyze the population by `gender`, you can choose a split by field: `gender`, now the chart is statistic population by city, each city will be displayed as two bars, men and women, the series is like this:

```
[{
  x: 'city',
  y: 'pop-man',
  query: {
    groupByFieldsForStatistics: ['city']
    outStatistics: [{
      statisticType: 'sum',
      onStatisticField: 'pop',
      outStatisticFieldName: 'pop-man'
    }],
    where: 'gender=\'man\''
  }
},{
  x: 'city',
  y: 'pop-woman',
  query: {
    groupByFieldsForStatistics: ['city']
    outStatistics: [{
      statisticType: 'sum',
      onStatisticField: 'pop',
      outStatisticFieldName: 'pop-woman'
    }],
    where: 'gender=\'woman\''
  }
}]
```

However, in the actual request data, we will merge multiple series of queries into one query to send, query after merging:

```
query: {
    groupByFieldsForStatistics: ['city', 'gender']
    outStatistics: [{
      statisticType: 'sum',
      onStatisticField: 'pop',
      outStatisticFieldName: 'pop_0'
    }]
  }
```

So the data returned might look like this:

```
[{
  city: 'city_a',
  gender: 'man',
  pop_0: 1000
},{
  city: 'city_b',
  gender: 'man',
  pop_0: 800
},{
  city: 'city_a',
  gender: 'woman',
  pop_0: 800
},{
  city: 'city_b',
  gender: 'woman',
  pop_0: 1000
}]
```

This data is not recognized by the current `series`, So we need to convert it into data that series can recognize. We need to match `series[i].y` with the `gender` of the current `data`. If we can match it, change the pop_0 in this data to `series[i].y`(pop_man).

The converted data is like this:

```
[{
  city: 'city_a',
  pop_man: 1000
  pop_woman: 800
},{
  city: 'city_b',
  pop_man: 800
  pop_woman: 1000
}]
```
