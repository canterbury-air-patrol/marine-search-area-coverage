import { marine_sweep_widths as marineSweepWidths, marine_sweep_width_weather_corrections as weatherCorrections } from '@canterbury-air-patrol/marine-sweep-width-data'

import React from 'react'

import Table from 'react-bootstrap/Table'
import 'bootstrap/dist/css/bootstrap.min.css'

class MarineSAC {
  column: string
  asset_type: string
  asset_speed: number
  wu: number
  speed_correction: number
  fw: number
  sweep_width: number
  fatigue: boolean
  corrected_sweep_width: number
  practical_track_spacing: number
  search_area: number
  search_hours: number
  available_search_hours: number
  modified_area: number
  whole_area_practical_track_spacing: number

  constructor(column: string, assetType: string) {
    this.column = column
    this.asset_type = assetType
    this.asset_speed = 0
    this.wu = 0
    this.speed_correction = 1
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

  recaclculate() {
    this.sweep_width = this.wu * this.speed_correction * this.fw
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

interface TableRowsInterface {
  display_name: string
  column_name: string
  input?: boolean
  input_type?: string
}

const tableRows: TableRowsInterface[] = [
  {
    display_name: 'Uncorrected Sweep Width (Wu) `NM`',
    column_name: 'wu'
  },
  {
    display_name: 'Speed Correction Factor (Sc)',
    column_name: 'speed_correction'
  },
  {
    display_name: 'Weather Corrected Factor (Fw)',
    column_name: 'fw'
  },
  {
    display_name: 'Sweep Width (W) (Wu x Sc x Fw)',
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

interface WeatherDataTableProps {
  weatherImpactChange: (impact: string) => void
  weatherVisibilityChange: (vis: number) => void
  metVisibility: number
}

class WeatherDataTable extends React.Component<WeatherDataTableProps, never> {
  windSpeed: number
  seaHeight: number

  constructor(props: WeatherDataTableProps) {
    super(props)
    this.windSpeed = 0
    this.seaHeight = 0

    this.updateWeatherImpact()
    this.handleChange = this.handleChange.bind(this)
  }

  updateWeatherImpact() {
    // Update the sea/wind impact category
    let weatherImpact = 'low'
    if (this.windSpeed >= 25 || this.seaHeight >= 1.5) {
      weatherImpact = 'high'
    } else if (this.windSpeed >= 15 || this.seaHeight >= 1.0) {
      weatherImpact = 'medium'
    }
    this.props.weatherImpactChange(weatherImpact)
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const value = target.value
    const name = target.name
    if (name === 'met_visibility') {
      this.props.weatherVisibilityChange(parseFloat(value))
    } else {
      if (name === 'wind_speed') {
        this.windSpeed = parseFloat(value)
      } else if (name === 'sea_height') {
        this.seaHeight = parseFloat(value)
      }
      this.updateWeatherImpact()
    }
  }

  render() {
    return (
      <tbody>
        <tr>
          <td>
            <label htmlFor="met_visibility">Meteorological Visibility (NM)</label>
          </td>
          <td>
            <input type="number" id="met_visibility" name="met_visibility" onChange={this.handleChange} defaultValue={this.props.metVisibility}></input>
          </td>
        </tr>
        <tr>
          <td>
            <label htmlFor="wind_speed">Wind Speed (knots)</label>
          </td>
          <td>
            <input type="number" id="wind_speed" name="wind_speed" onChange={this.handleChange} defaultValue={this.windSpeed}></input>
          </td>
        </tr>
        <tr>
          <td>
            <label htmlFor="sea_height">Sea Height (meters)</label>
          </td>
          <td>
            <input type="number" id="sea_height" name="sea_height" onChange={this.handleChange} defaultValue={this.seaHeight}></input>
          </td>
        </tr>
      </tbody>
    )
  }
}

interface TargetTypeSelectorProps {
  possible_targets: string[]
  targetTypeChange: (type: string) => void
  selected: string
}

class TargetTypeSelector extends React.Component<TargetTypeSelectorProps, never> {
  constructor(props: TargetTypeSelectorProps) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const target = event.target
    const value = target.value

    this.props.targetTypeChange(value)
  }

  render() {
    const selectObjects = []
    for (const idx in this.props.possible_targets) {
      const target = this.props.possible_targets[idx]
      selectObjects.push(
        <option key={target} value={target}>
          {target}
        </option>
      )
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

interface AssetSpeedProps {
  assetType: string
  assetSpeedChange: (assetType: string, speed: number) => void
}

class AssetSpeed extends React.Component<AssetSpeedProps, never> {
  constructor(props: AssetSpeedProps) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const value = target.value
    this.props.assetSpeedChange(this.props.assetType, parseFloat(value))
  }

  render() {
    return (
      <tbody>
        <tr>
          <td>
            <label htmlFor={this.props.assetType + '_speed'}>{this.props.assetType} search speed (knots)</label>
          </td>
          <td>
            <input type="number" name="asset_speed" onChange={this.handleChange} />
          </td>
        </tr>
      </tbody>
    )
  }
}

interface FatigueProps {
  fatigueChanged: (fatigue: boolean) => void
  fatigue: boolean
}

class Fatigue extends React.Component<FatigueProps, never> {
  constructor(props: FatigueProps) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const value = target.checked
    this.props.fatigueChanged(value)
  }

  render() {
    return (
      <tbody>
        <tr>
          <td>
            <label htmlFor="fatigue">Fatigue</label>
          </td>
          <td>
            <input type="checkbox" name="fatigue" id="fatigue" defaultChecked={this.props.fatigue} onChange={this.handleChange} />
          </td>
        </tr>
      </tbody>
    )
  }
}

interface DataTableProps {
  columns: MarineSAC[]
  updateData: (assetID: string, column: string, value: number) => void
}

class DataTable extends React.Component<DataTableProps, never> {
  constructor(props: DataTableProps) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const value = target.value
    const name = target.id

    const idParts = name.split('_')
    const assetID = idParts.slice(0, 2).join('_')
    const columnName = idParts.slice(2).join('_')

    this.props.updateData(assetID, columnName, parseFloat(value))
  }

  render() {
    const rows = []
    const assetTypes = [<th key="head">Asset Type:</th>]
    const assetHeights = [<th key="head">Height of Eye:</th>]

    for (const idx in tableRows) {
      const htmlColumns = []
      htmlColumns.push(<th key="head">{tableRows[idx].display_name}</th>)
      for (const colIdx in this.props.columns) {
        const column = this.props.columns[colIdx]
        if (tableRows[idx].input) {
          htmlColumns.push(
            <td key={idx + '_' + colIdx}>
              <input
                type={tableRows[idx].input_type}
                id={column.asset_type + '_' + column.column + '_' + tableRows[idx].column_name}
                // @ts-expect-error need to accept the column name from tableRows
                defaultValue={column[tableRows[idx].column_name]}
                onChange={this.handleChange}
              />
            </td>
          )
        } else if (tableRows[idx].column_name === 'fatigue') {
          htmlColumns.push(<td key={idx + '_' + colIdx}>{column[tableRows[idx].column_name] ? 0.9 : 1.0}</td>)
        } else {
          // @ts-expect-error need to accept the column name from tableRows
          htmlColumns.push(<td key={idx + '_' + colIdx}>{column[tableRows[idx].column_name]}</td>)
        }
      }

      rows.push(<tr key={idx}>{htmlColumns}</tr>)
    }

    for (const colIdx in this.props.columns) {
      const column = this.props.columns[colIdx]
      assetTypes.push(<th key={colIdx}>{column.asset_type}</th>)
      assetHeights.push(<th key={colIdx}>{column.column}</th>)
    }

    return (
      <form>
        <Table>
          <thead>
            <tr>{assetTypes}</tr>
            <tr>{assetHeights}</tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </form>
    )
  }
}

interface MarineSACTableState {
  columns: MarineSAC[]
  targetType: string
  fatigue: boolean
  weatherImpact: string
  assetSpeeds: {
    [assetType: string]: number
  }
  metVisibility: number
  practicalTrackSpacing: Map<string, number>
  availableSearchHours: Map<string, number>
}

export class MarineSACTable extends React.Component<never, MarineSACTableState> {
  possibleTargetsList: string[]

  constructor(props: never) {
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
      practicalTrackSpacing: new Map<string, number>(),
      availableSearchHours: new Map<string, number>()
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
      { asset_type: 'Aircraft', search_height: '1000ft' }
    ]
    for (const assetIdx in defaultAssets) {
      const asset = defaultAssets[assetIdx]
      this.state.columns.push(new MarineSAC(asset.search_height, asset.asset_type))
      this.state.practicalTrackSpacing.set(`${asset.asset_type}_${asset.search_height}`, 0)
      this.state.availableSearchHours.set(`${asset.asset_type}_${asset.search_height}`, 0)
    }
  }

  weatherImpactChange(newWeatherImpact: string) {
    this.setState({ weatherImpact: newWeatherImpact })
  }

  weatherVisibilityChange(metVisibility: number) {
    this.setState({ metVisibility: metVisibility })
  }

  targetTypeChange(newTargetType: string) {
    this.setState({ targetType: newTargetType })
  }

  assetSpeedChange(assetType: string, speed: number) {
    this.setState(function (oldState) {
      const currentAssetSpeeds = oldState.assetSpeeds
      currentAssetSpeeds[assetType] = speed
      return { assetSpeeds: currentAssetSpeeds }
    })
  }

  fatigueChange(value: boolean) {
    this.setState({ fatigue: value })
  }

  updateData(assetID: string, fieldName: string, value: number) {
    if (fieldName === 'practicalTrackSpacing') {
      this.setState(function (oldState) {
        const currentData = oldState.practicalTrackSpacing
        currentData.set(assetID, value)
        return { practicalTrackSpacing: currentData }
      })
    }
    if (fieldName === 'availableSearchHours') {
      this.setState(function (oldState) {
        const currentData = oldState.availableSearchHours
        currentData.set(assetID, value)
        return { availableSearchHours: currentData }
      })
    }
  }

  recalculate() {
    // Update the uncorrected sweep width and weather correct factors
    const targetData = marineSweepWidths[this.state.targetType]

    for (const colIdx in this.state.columns) {
      const column = this.state.columns[colIdx]
      const searchHeight = column.column
      const assetType = column.asset_type
      const columnName = `${assetType}_${searchHeight}`
      const visibleDistanceData =
        assetType == 'Boat'
          ? targetData.Boat[searchHeight]
          : assetType === 'Heliocopter'
            ? targetData.Helicopter[searchHeight]
            : assetType === 'Aircraft'
              ? targetData.Aircraft[searchHeight]
              : null
      const speedCorrections = assetType === 'Aircraft' ? targetData.speed_corrections.Aircraft : assetType === 'Helicopter' ? targetData.speed_corrections.Helicopter : null

      column.asset_speed = Number(this.state.assetSpeeds[column.asset_type])

      let lowerSpeedSeen = null
      let higherSpeedSeen = null
      if (speedCorrections === null) {
        column.speed_correction = 1.0
      } else {
        for (const idx in speedCorrections) {
          const data = speedCorrections[idx]
          if ((lowerSpeedSeen === null || data.speed > lowerSpeedSeen.speed) && data.speed <= column.asset_speed) {
            lowerSpeedSeen = data
          }
          if ((higherSpeedSeen === null || data.speed < higherSpeedSeen.speed) && data.speed >= column.asset_speed) {
            higherSpeedSeen = data
          }
        }
        if (lowerSpeedSeen === null && higherSpeedSeen !== null) {
          column.speed_correction = higherSpeedSeen.correction
        } else if (lowerSpeedSeen !== null && higherSpeedSeen === null) {
          column.speed_correction = lowerSpeedSeen.correction
        } else if (lowerSpeedSeen !== null && higherSpeedSeen !== null) {
          if (lowerSpeedSeen.correction === higherSpeedSeen.correction) {
            column.speed_correction = lowerSpeedSeen.correction
          } else {
            const speedRange = higherSpeedSeen.speed - lowerSpeedSeen.speed
            const correctionRange = higherSpeedSeen.correction - lowerSpeedSeen.correction
            const assetSpeedOffset = column.asset_speed - lowerSpeedSeen.speed
            const ratio = assetSpeedOffset / speedRange
            column.speed_correction = lowerSpeedSeen.correction + ratio * correctionRange
          }
        } else {
          column.speed_correction = 1.0
        }
      }

      let highestSeenSweepWidth = 0
      let highestSeenVis = 0
      if (visibleDistanceData) {
        for (const idx in visibleDistanceData) {
          const data = visibleDistanceData[idx]
          if (data.vis <= this.state.metVisibility && data.vis > highestSeenVis) {
            highestSeenSweepWidth = data.sw
            highestSeenVis = data.vis
          }
        }
      }
      column.wu = highestSeenSweepWidth
      const weatherCorrectionsTable = targetData.weather_corrections === 'large' ? weatherCorrections.large : weatherCorrections.small
      if (this.state.weatherImpact === 'low' || this.state.weatherImpact === 'medium' || this.state.weatherImpact === 'high') {
        column.fw = weatherCorrectionsTable.IAMSAR[this.state.weatherImpact]
      }
      column.fatigue = this.state.fatigue

      column.practical_track_spacing = this.state.practicalTrackSpacing.get(columnName)!
      column.available_search_hours = this.state.availableSearchHours.get(columnName)!
      column.recaclculate()
    }
  }

  render() {
    this.recalculate()
    return (
      <div>
        <Table>
          <WeatherDataTable weatherImpactChange={this.weatherImpactChange} weatherVisibilityChange={this.weatherVisibilityChange} metVisibility={this.state.metVisibility} />
          <AssetSpeed assetType="Boat" assetSpeedChange={this.assetSpeedChange} />
          <AssetSpeed assetType="Aircraft" assetSpeedChange={this.assetSpeedChange} />
          <TargetTypeSelector possible_targets={this.possibleTargetsList} targetTypeChange={this.targetTypeChange} selected={this.state.targetType} />
          <Fatigue fatigueChanged={this.fatigueChange} fatigue={this.state.fatigue} />
        </Table>
        <DataTable columns={this.state.columns} updateData={this.updateData} />
      </div>
    )
  }
}
