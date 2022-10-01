import { marine_sweep_widths as marineSweepWidths, marine_sweep_width_weather_corrections as weatherCorrections } from '@canterbury-air-patrol/marine-sweep-width-data'

import React from 'react'
import PropTypes from 'prop-types'

import Table from 'react-bootstrap/Table'
import 'bootstrap/dist/css/bootstrap.min.css'

class MarineSAC {
  constructor (column, assetType) {
    this.column = column
    this.asset_type = assetType
    this.asset_speed = 0
    this.wu = 0
    this.fw = 0
    this.sweep_width = 0
    this.fatigue = false
    this.corrected_sweep_width = 0
    this.practical_track_spacing = 0
    this.search_area = 144
    this.search_hours = 0
    this.available_search_hours = 0
    this.modified_area = 0
    this.whole_area_practical_track_spacing = 0
  }

  recaclculate () {
    this.sweep_width = this.wu * this.fw
    if (this.fatigue) {
      this.corrected_sweep_width = this.sweep_width * 0.9
    } else {
      this.corrected_sweep_width = this.sweep_width
    }
    this.search_hours = this.search_area / (this.asset_speed * this.practical_track_spacing)
    this.modified_area = this.practical_track_spacing * this.asset_speed * this.available_search_hours
    this.whole_area_practical_track_spacing = this.search_area / (this.available_search_hours * this.asset_speed)
  }
}

const tableRows = [
  {
    display_name: 'Uncorrected Sweep Width (Wu) `NM`',
    column_name: 'wu'
  },
  {
    display_name: 'Weather Corrected Factor (Fw)',
    column_name: 'fw'
  },
  {
    display_name: 'Sweep Width (W) (Wu x Fw)',
    column_name: 'sweep_width'
  },
  {
    display_name: 'Fatigue Factor (Ff)',
    column_name: 'fatigue'
  },
  {
    display_name: 'Corrected Sweep Width (W X Ff)',
    column_name: 'corrected_sweep_width'
  },
  {
    display_name: 'Practical Track Spacing `NM`',
    column_name: 'practicalTrackSpacing',
    input: true,
    input_type: 'number'
  },
  {
    display_name: 'Search Area',
    column_name: 'search_area',
    input: true,
    input_type: 'number'
  },
  {
    display_name: 'Search Hours (T) Total',
    column_name: 'search_hours'
  },
  {
    display_name: 'Available Search Hours',
    column_name: 'availableSearchHours',
    input: true,
    input_type: 'number'
  },
  {
    display_name: 'Modified Area at Practical Spacing in Available Hours',
    column_name: 'modified_area'
  },
  {
    display_name: 'Track Spacing for Whole Area in Available Time',
    column_name: 'whole_area_practical_track_spacing'
  }
]

class WeatherDataTable extends React.Component {
  constructor (props) {
    super(props)
    this.windSpeed = 0
    this.seaHeight = 0

    this.updateWeatherImpact()
    this.handleChange = this.handleChange.bind(this)
  }

  updateWeatherImpact () {
    // Update the sea/wind impact category
    let weatherImpact = 'low'
    if (this.windSpeed >= 25 || this.seaHeight >= 1.5) {
      weatherImpact = 'high'
    } else if (this.windSpeed >= 15 || this.seaHeight >= 1.0) {
      weatherImpact = 'medium'
    }
    this.props.weatherImpactChange(weatherImpact)
  }

  handleChange (event) {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    if (name === 'met_visibility') {
      this.props.weatherVisibilityChange(value)
    } else {
      if (name === 'wind_speed') {
        this.windSpeed = value
      } else if (name === 'sea_height') {
        this.seaHeight = value
      }
      this.updateWeatherImpact()
    }
  }

  render () {
    return (
        <tbody>
          <tr>
            <td><label htmlFor="met_visibility">Meteorological Visibility (NM)</label></td>
            <td><input type="number" id="met_visibility" name="met_visibility" onChange={this.handleChange} defaultValue={this.props.metVisibility}></input></td>
          </tr>
          <tr>
            <td><label htmlFor="wind_speed">Wind Speed (knots)</label></td>
            <td><input type="number" id="wind_speed" name="wind_speed" onChange={this.handleChange} defaultValue={this.windSpeed}></input></td>
          </tr>
          <tr>
            <td><label htmlFor="sea_height">Sea Height (meters)</label></td>
            <td><input type="number" id="sea_height" name="sea_height" onChange={this.handleChange} defaultValue={this.seaHeight}></input></td>
          </tr>
        </tbody>)
  }
}
WeatherDataTable.propTypes = {
  weatherImpactChange: PropTypes.func.isRequired,
  weatherVisibilityChange: PropTypes.func.isRequired,
  metVisibility: PropTypes.number.isRequired
}

class TargetTypeSelector extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    const target = event.target
    const value = target.value

    this.props.targetTypeChange(value)
  }

  render () {
    const selectObjects = []
    for (const idx in this.props.possible_targets) {
      const target = this.props.possible_targets[idx]
      selectObjects.push(<option key={target} value={target}>{target}</option>)
    }
    return (
      <tbody>
        <tr>
          <td></td>
          <td>
            <select defaultValue={this.props.selected} onChange={this.handleChange}>
              {selectObjects}
            </select>
          </td>
        </tr>
      </tbody>
    )
  }
}
TargetTypeSelector.propTypes = {
  possible_targets: PropTypes.array.isRequired,
  targetTypeChange: PropTypes.func.isRequired,
  selected: PropTypes.string.isRequired
}

class AssetSpeed extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    const target = event.target
    const value = target.value
    this.props.assetSpeedChange(this.props.assetType, value)
  }

  render () {
    return (
      <tbody>
        <tr>
          <td><label htmlFor={this.props.assetType + '_speed'}>{this.props.assetType} search speed (knots)</label></td>
          <td><input type="number" name="asset_speed" onChange={this.handleChange} /></td>
        </tr>
      </tbody>
    )
  }
}
AssetSpeed.propTypes = {
  assetType: PropTypes.string.isRequired,
  assetSpeedChange: PropTypes.func.isRequired
}

class Fatigue extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    const target = event.target
    const value = target.checked
    this.props.fatigueChanged(value)
  }

  render () {
    return (
      <tbody>
        <tr>
          <td><label htmlFor='fatigue'>Fatigue</label></td>
          <td><input type="checkbox" name='fatigue' id='fatigue' defaultChecked={this.props.fatigue} onChange={this.handleChange} /></td>
        </tr>
      </tbody>
    )
  }
}
Fatigue.propTypes = {
  fatigueChanged: PropTypes.func.isRequired,
  fatigue: PropTypes.bool.isRequired
}

class DataTable extends React.Component {
  constructor (props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    const target = event.target
    const value = target.value
    const name = target.id

    const idParts = name.split('_')
    const assetID = idParts.slice(0, 2).join('_')
    const columnName = idParts.slice(2).join('_')

    this.props.updateData(assetID, columnName, value)
  }

  render () {
    const rows = []

    for (const idx in tableRows) {
      const htmlColumns = []
      htmlColumns.push(<th key="head" >{tableRows[idx].display_name}</th>)
      for (const colIdx in this.props.columns) {
        const column = this.props.columns[colIdx]
        if (tableRows[idx].input) {
          htmlColumns.push((
            <td key={idx + '_' + colIdx}>
              <input type={tableRows[idx].input_type} id={column.asset_type + '_' + column.column + '_' + tableRows[idx].column_name} defaultValue={column[tableRows[idx].column_name]} onChange={this.handleChange} />
            </td>
          ))
        } else if (tableRows[idx].column_name === 'fatigue') {
          htmlColumns.push((
            <td key={idx + '_' + colIdx}>
              {column[tableRows[idx].column_name] ? 0.9 : 1.0}
            </td>
          ))
        } else {
          htmlColumns.push((
            <td key={idx + '_' + colIdx}>
              {column[tableRows[idx].column_name]}
            </td>
          ))
        }
      }

      rows.push((
        <tr key={idx}>
          {htmlColumns}
        </tr>
      ))
    }

    return (
      <form>
        <Table>
          <thead>
            <tr>
              <th></th>
              <th colSpan="2">Height of Eye</th>
              <th colSpan="2">Aircraft</th>
            </tr>
            <tr>
              <th></th>
              <th>2.4m (8ft)</th>
              <th>4.2m (14ft)</th>
              <th>500ft</th>
              <th>1000ft</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </form>
    )
  }
}
DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  updateData: PropTypes.func.isRequired
}

export class MarineSACTable extends React.Component {
  constructor (props) {
    super(props)

    this.possibleTargetsList = Object.keys(marineSweepWidths)

    this.state = {
      columns: [],
      targetType: this.possibleTargetsList[0],
      fatigue: false,
      weatherImpact: 'low',
      assetSpeeds: {
        Boat: 0,
        Aircraft: 0
      },
      metVisibility: 10,
      practicalTrackSpacing: new Map(),
      availableSearchHours: new Map()
    }

    this.weatherImpactChange = this.weatherImpactChange.bind(this)
    this.weatherVisibilityChange = this.weatherVisibilityChange.bind(this)
    this.targetTypeChange = this.targetTypeChange.bind(this)
    this.assetSpeedChange = this.assetSpeedChange.bind(this)
    this.fatigueChange = this.fatigueChange.bind(this)
    this.updateData = this.updateData.bind(this)

    const defaultAssets = [
      { asset_type: 'Boat', search_height: '8ft' },
      { asset_type: 'Boat', search_height: '14ft' },
      { asset_type: 'Aircraft', search_height: '500ft' },
      { asset_type: 'Aircraft', search_height: '1000ft' }]
    for (const assetIdx in defaultAssets) {
      const asset = defaultAssets[assetIdx]
      this.state.columns.push(new MarineSAC(asset.search_height, asset.asset_type))
      this.state.practicalTrackSpacing[`${asset.asset_type}_${asset.search_height}`] = 0
      this.state.availableSearchHours[`${asset.asset_type}_${asset.search_height}`] = 0
    }
  }

  weatherImpactChange (newWeatherImpact) {
    this.setState({ weatherImpact: newWeatherImpact })
  }

  weatherVisibilityChange (metVisibility) {
    this.setState({ metVisibility: parseInt(metVisibility) })
  }

  targetTypeChange (newTargetType) {
    this.setState({ targetType: newTargetType })
  }

  assetSpeedChange (assetType, speed) {
    const currentAssetSpeeds = this.state.assetSpeeds
    currentAssetSpeeds[assetType] = speed
    this.setState({ assetSpeeds: currentAssetSpeeds })
  }

  fatigueChange (value) {
    this.setState({ fatigue: value })
  }

  updateData (assetID, fieldName, value) {
    if ((fieldName === 'practicalTrackSpacing' || fieldName === 'availableSearchHours')) {
      const currentData = this.state[fieldName]
      currentData[assetID] = value
      this.setState({ [fieldName]: currentData })
    }
  }

  recalculate () {
    // Update the uncorrected sweep width and weather correct factors
    const targetData = marineSweepWidths[this.state.targetType]

    for (const colIdx in this.state.columns) {
      const column = this.state.columns[colIdx]
      const searchHeight = column.column
      const assetType = column.asset_type
      const columnName = `${assetType}_${searchHeight}`

      const visibleDistanceData = targetData[assetType][searchHeight]

      let highestSeenSweepWidth = 0
      let highestSeenVis = 0
      for (const idx in visibleDistanceData) {
        const data = visibleDistanceData[idx]
        if (data.vis <= this.state.metVisibility && data.vis > highestSeenVis) {
          highestSeenSweepWidth = data.sw
          highestSeenVis = data.vis
        }
      }
      column.wu = highestSeenSweepWidth
      column.fw = weatherCorrections[targetData.weather_corrections].IAMSAR[this.state.weatherImpact]
      column.fatigue = this.state.fatigue

      column.asset_speed = this.state.assetSpeeds[column.asset_type]
      column.practical_track_spacing = this.state.practicalTrackSpacing[columnName]
      column.available_search_hours = this.state.availableSearchHours[columnName]
      column.recaclculate()
    }
  }

  render () {
    this.recalculate()
    return (
      <div>
        <Table>
          <WeatherDataTable
            weatherImpactChange={this.weatherImpactChange}
            weatherVisibilityChange={this.weatherVisibilityChange}
            metVisibility={this.state.metVisibility} />
          <AssetSpeed
            assetType="Boat"
            assetSpeedChange={this.assetSpeedChange} />
          <AssetSpeed
            assetType="Aircraft"
            assetSpeedChange={this.assetSpeedChange} />
          <TargetTypeSelector
            possible_targets={this.possibleTargetsList}
            targetTypeChange={this.targetTypeChange}
            selected={this.state.targetType} />
          <Fatigue
            fatigueChanged={this.fatigueChange}
            fatigue={this.state.fatigue} />
        </Table>
        <DataTable
          columns={this.state.columns}
          updateData={this.updateData} />
      </div>
    )
  }
}
