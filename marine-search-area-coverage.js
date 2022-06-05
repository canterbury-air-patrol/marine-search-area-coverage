import { marine_sweep_widths, marine_sweep_width_weather_corrections as weather_corrections } from '@canterbury-air-patrol/marine-sweep-width-data';

import React from 'react';
import PropTypes from 'prop-types';

class MarineSAC {
    constructor(column, asset_type)
    {
        this.column = column;
        this.asset_type = asset_type;
        this.asset_speed = 0;
        this.wu = 0;
        this.fw = 0;
        this.sweep_width = 0;
        this.fatigue = false;
        this.corrected_sweep_width = 0;
        this.practical_track_spacing = 0;
        this.search_area = 144;
        this.search_hours = 0;
        this.available_search_hours = 0;
        this.modified_area = 0;
        this.whole_area_practical_track_spacing = 0;
    }

    recaclculate()
    {
        this.sweep_width = this.wu * this.fw;
        if (this.fatigue)
        {
            this.corrected_sweep_width = this.sweep_width * 0.9;
        }
        else
        {
            this.corrected_sweep_width = this.sweep_width;
        }
        this.search_hours = this.search_area / (this.asset_speed * this.practical_track_spacing);
        this.modified_area = this.practical_track_spacing * this.asset_speed * this.available_search_hours;
        this.whole_area_practical_track_spacing = this.search_area / (this.available_search_hours * this.asset_speed);
    }
}

let table_rows = [
    {
        'display_name': 'Uncorrected Sweep Width (Wu) `NM`',
        'column_name': 'wu',
    },
    {
        'display_name': 'Weather Corrected Factor (Fw)',
        'column_name': 'fw',
    },
    {
        'display_name': 'Sweep Width (W) (Wu x Fw)',
        'column_name': 'sweep_width',
    },
    {
        'display_name': 'Fatigue Factor (Ff)',
        'column_name': 'fatigue',
    },
    {
        'display_name': 'Corrected Sweep Width (W X Ff)',
        'column_name': 'corrected_sweep_width',
    },
    {
        'display_name': 'Practical Track Spacing `NM`',
        'column_name': 'practical_track_spacing',
        'input': true,
        'input_type': 'number',
    },
    {
        'display_name': 'Search Area',
        'column_name': 'search_area',
        'input': true,
        'input_type': 'number',
    },
    {
        'display_name': 'Search Hours (T) Total',
        'column_name': 'search_hours',
    },
    {
        'display_name': 'Available Search Hours',
        'column_name': 'available_search_hours',
        'input': true,
        'input_type': 'number',
    },
    {
        'display_name': 'Modified Area at Practical Spacing in Available Hours',
        'column_name': 'modified_area',
    },
    {
        'display_name': 'Track Spacing for Whole Area in Available Time',
        'column_name': 'whole_area_practical_track_spacing',
    },
];

class WeatherDataTable extends React.Component {
    constructor(props) {
        super(props);
        this.wind_speed = 0;
        this.sea_height = 0;

        this.updateWeatherImpact();
        this.handleChange = this.handleChange.bind(this);
    }

    updateWeatherImpact() {
        // Update the sea/wind impact category
        let weather_impact = 'low';
        if (this.wind_speed >= 25 || this.sea_height >= 1.5)
        {
            weather_impact = 'high';
        }
        else if(this.wind_speed >= 15 || this.sea_height >= 1.0)
        {
            weather_impact = 'medium';
        }
        this.props.weatherImpactChange(weather_impact);
    }

    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        if (name === 'met_visibility')
        {
            this.props.weatherVisibilityChange(value);
        }
        else
        {
            if (name === 'wind_speed')
            {
                this.wind_speed = value;
            }
            else if (name === 'sea_height')
            {
                this.sea_height = value;
            }
            this.updateWeatherImpact();
        }
    }

    render() {
        return (<form onChange={ this.handleChange }>
                <table>
                    <tbody>
                        <tr>
                            <td><label htmlFor="met_visibility">Meteorological Visibility (NM)</label></td>
                            <td><input type="number" id="met_visibility" name="met_visibility" defaultValue={this.props.metVisibility}></input></td>
                        </tr>
                        <tr>
                            <td><label htmlFor="wind_speed">Wind Speed (knots)</label></td>
                            <td><input type="number" id="wind_speed" name="wind_speed" defaultValue={this.wind_speed}></input></td>
                        </tr>
                        <tr>
                            <td><label htmlFor="sea_height">Sea Height (meters)</label></td>
                            <td><input type="number" id="sea_height" name="sea_height" defaultValue={this.sea_height}></input></td>
                        </tr>
                    </tbody>
                </table>
        </form>);
    }
}
WeatherDataTable.propTypes = {
    weatherImpactChange: PropTypes.func.isRequired,
    weatherVisibilityChange: PropTypes.func.isRequired,
    metVisibility: PropTypes.number.isRequired,
}

class TargetTypeSelector extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;

        this.props.targetTypeChange(value);
    }

    render() {
        let select_objects = []
        for (let idx in this.props.possible_targets)
        {
            let target = this.props.possible_targets[idx];
            select_objects.push(<option key={target} value={target}>{target}</option>);
        }
        return (
        <select defaultValue={this.props.selected} onChange={this.handleChange}>
            {select_objects}
        </select>
        );
    }
}
TargetTypeSelector.propTypes = {
    possible_targets: PropTypes.array.isRequired,
    targetTypeChange: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired,
}

class AssetSpeed extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        const target = event.target;
        const value = target.value;
        this.props.assetSpeedChange(this.props.assetType, value);
    }
    render() {
        return (
            <div>
                <label htmlFor={this.props.assetType + '_speed'}>{this.props.assetType} search speed (knots)</label>
                <input type="number" name="asset_speed" onChange={this.handleChange} />
            </div>
        );
    }
}
AssetSpeed.propTypes = {
    assetType: PropTypes.string.isRequired,
    assetSpeedChange: PropTypes.func.isRequired,
}

class Fatigue extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        const target = event.target;
        const value = target.checked;
        this.props.fatigueChanged(value);
    }
    render() {
        return (
            <div>
                <label htmlFor='fatigue'>Fatigue</label>
                <input type="checkbox" name='fatigue' id='fatigue' defaultChecked={this.props.fatigue} onChange={this.handleChange} />
            </div>
        );
    }
}
Fatigue.propTypes = {
    fatigueChanged: PropTypes.func.isRequired,
    fatigue: PropTypes.bool.isRequired,
}

class DataTable extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.id;

        let id_parts = name.split('_')
        let asset_id = id_parts.slice(0, 2).join('_')
        let column_name = id_parts.slice(2).join('_')

        this.props.updateData(asset_id, column_name, value);
    }

    render() {
        let rows = [];

        for (let idx in table_rows)
        {
            let html_columns = [];
            html_columns.push (<th key="head" >{ table_rows[idx].display_name }</th>);
            for (let col_idx in this.props.columns)
            {
                let column = this.props.columns[col_idx];
                if (table_rows[idx].input)
                {
                    html_columns.push( (
                        <td key={ idx + '_' + col_idx }>
                            <input type={ table_rows[idx].input_type } id={ column.asset_type + '_' + column.column + '_' + table_rows[idx].column_name } defaultValue={ column[table_rows[idx].column_name] } onChange={this.handleChange} />
                        </td>
                    ) );
                }
                else if(table_rows[idx].column_name === 'fatigue')
                {
                    html_columns.push( (
                        <td key={ idx + '_' + col_idx }>
                            { column[table_rows[idx].column_name] ? 0.9 : 1.0 }
                        </td>
                    ) );
                }
                else
                {
                    html_columns.push( (
                        <td key={ idx + '_' + col_idx }>
                            { column[table_rows[idx].column_name] }
                        </td>
                    ) );
                }
            }

            rows.push( (
                <tr key={ idx }>
                    { html_columns }
                </tr>
            ) );
        }

        return (
        <form>
            <table>
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
                    { rows }
                </tbody>
            </table>
        </form>
        );
    }
}
DataTable.propTypes = {
    columns: PropTypes.array.isRequired,
    updateData: PropTypes.func.isRequired,
}


export class MarineSACTable extends React.Component {
    constructor(props) {
        super(props)

        this.possible_targets_list = Object.keys(marine_sweep_widths);

        this.state = {
            columns: [],
            target_type: this.possible_targets_list[0],
            fatigue: false,
            weather_impact: 'low',
            asset_speeds: {
                "Boat": 0,
                "Aircraft": 0,
            },
            met_visibility: 10,
            practical_track_spacing: {},
            available_search_hours: {},
        };

        this.weatherImpactChange = this.weatherImpactChange.bind(this);
        this.weatherVisibilityChange = this.weatherVisibilityChange.bind(this);
        this.targetTypeChange = this.targetTypeChange.bind(this);
        this.assetSpeedChange = this.assetSpeedChange.bind(this);
        this.fatigueChange = this.fatigueChange.bind(this);
        this.updateData = this.updateData.bind(this);

        let default_assets = [{asset_type: "Boat", "search_height": "8ft"}, {"asset_type": "Boat", "search_height": "14ft"}, {"asset_type": "Aircraft", "search_height": "500ft"}, {"asset_type": "Aircraft", "search_height": "1000ft"}];
        for (let asset_idx in default_assets)
        {
            let asset = default_assets[asset_idx];
            this.state.columns.push(new MarineSAC(asset.search_height, asset.asset_type));
            this.state.practical_track_spacing[`${asset.asset_type}_${asset.search_height}`] = 0;
            this.state.available_search_hours[`${asset.asset_type}_${asset.search_height}`] = 0;
        }
    }

    weatherImpactChange(weather_impact) {
        this.setState({weather_impact: weather_impact});
    }

    weatherVisibilityChange(met_visibility) {
        this.setState( {met_visibility: parseInt(met_visibility) });
    }

    targetTypeChange(target_type) {
        this.setState({ target_type: target_type });
    }

    assetSpeedChange(assetType, speed) {
        let current_asset_speeds = this.state.asset_speeds;
        current_asset_speeds[assetType] = speed;
        this.setState({ asset_speeds: current_asset_speeds });
    }

    fatigueChange(value) {
        this.setState({fatigue: value});
    }

    updateData(asset_id, field_name, value) {
        let current_data = this.state[field_name];
        current_data[asset_id] = value;
        this.setState({[field_name]: current_data});
    }

    recalculate()
    {
        // Update the uncorrected sweep width and weather correct factors
        let target_data = marine_sweep_widths[this.state.target_type];

        for (let col_idx in this.state.columns)
        {
            let column = this.state.columns[col_idx]
            let search_height = column.column;
            let asset_type = column.asset_type;
            let column_name = `${asset_type}_${search_height}`;

            let visible_distance_data = target_data[asset_type][search_height];

            let highest_seen_sweep_width = 0;
            let highest_seen_vis = 0;
            for (let idx in visible_distance_data)
            {
                let data = visible_distance_data[idx];
                if (data.vis <= this.state.met_visibility && data.vis > highest_seen_vis)
                {
                    highest_seen_sweep_width = data.sw;
                    highest_seen_vis = data.vis;
                }
            }
            column.wu = highest_seen_sweep_width;
            column.fw = weather_corrections[target_data.weather_corrections].IAMSAR[this.state.weather_impact];
            column.fatigue = this.state.fatigue;

            column.asset_speed = this.state.asset_speeds[column.asset_type];
            column.practical_track_spacing = this.state.practical_track_spacing[column_name];
            column.available_search_hours = this.state.available_search_hours[column_name];
            column.recaclculate();
        }
    }

    render()
    {
        this.recalculate();
        return(
            <div>
                <WeatherDataTable
                    weatherImpactChange={this.weatherImpactChange}
                    weatherVisibilityChange={this.weatherVisibilityChange}
                    metVisibility={this.state.met_visibility} />
                <AssetSpeed
                    assetType="Boat"
                    assetSpeedChange={this.assetSpeedChange} />
                <AssetSpeed
                    assetType="Aircraft"
                    assetSpeedChange={this.assetSpeedChange} />
                <TargetTypeSelector
                    possible_targets={this.possible_targets_list}
                    targetTypeChange={this.targetTypeChange}
                    selected={this.state.target_type} />
                <Fatigue
                    fatigueChanged={this.fatigueChange}
                    fatigue={this.state.fatigue} />
                <DataTable
                    columns={this.state.columns}
                    updateData={this.updateData} />
            </div>
        );
    }
}
