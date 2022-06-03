import { marine_sweep_widths, marine_sweep_width_weather_corrections as weather_corrections } from '@canterbury-air-patrol/marine-sweep-width-data';
import $ from 'jquery';

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
        this.search_area = 0;
        this.search_hours = 0;
        this.available_search_hours = 0;
        this.modified_area = 0;
        this.whole_area_practical_track_spacing = 0;
    }

    recaclculate()
    {
        this.asset_speed = $("#" + this.asset_type + "_search_speed").val();
        this.wu = parseFloat($("#wu_" + this.column).text());
        this.fw = parseFloat($("#fw_" + this.column).text());
        this.fatigue = $("#fatigue").is(':checked');
        this.practical_track_spacing = parseFloat($("#practical_track_spacing_" + this.column).val());
        this.search_area = parseInt($("#search_area_" + this.column).val());
        this.available_search_hours = parseInt($("#available_search_hours_" + this.column).val());

        this.sweep_width = this.wu * this.fw;
        $("#sweep_width_" + this.column).text(this.sweep_width);
        if (this.fatigue)
        {
            $("#ff_" + this.column).text("0.9");
            this.corrected_sweep_width = this.sweep_width * 0.9;
        }
        else
        {
            $("#ff_" + this.column).text("1.0");
            this.corrected_sweep_width = this.sweep_width;
        }
        $("#corrected_sweep_width_" + this.column).text(this.corrected_sweep_width);

        this.search_hours = this.search_area / (this.asset_speed * this.practical_track_spacing);
        $("#search_hours_total_" + this.column).text(this.search_hours);

        this.modified_area = this.practical_track_spacing * this.asset_speed * this.available_search_hours;
        $("#practical_search_area_" + this.column).text(this.modified_area);

        this.whole_area_practical_track_spacing = this.search_area / (this.available_search_hours * this.asset_speed);
        $("#achievable_track_spacing_" + this.column).text(this.whole_area_practical_track_spacing);
    }
}

let table_rows = [
    {
        'display_name': 'Uncorrected Sweep Width (Wu) `NM`',
        'id_prefix': 'wu',
    },
    {
        'display_name': 'Weather Corrected Factor (Fw)',
        'id_prefix': 'fw',
    },
    {
        'display_name': 'Sweep Width (W) (Wu x Fw)',
        'id_prefix': 'sweep_width',
    },
    {
        'display_name': 'Fatigue Factor (Ff)',
        'id_prefix': 'ff',
    },
    {
        'display_name': 'Corrected Sweep Width (W X Ff)',
        'id_prefix': 'corrected_sweep_width',
    },
    {
        'display_name': 'Practical Track Spacing `NM`',
        'id_prefix': 'practical_track_spacing',
        'input': true,
        'input_type': 'number',
    },
    {
        'display_name': 'Search Area',
        'id_prefix': 'search_area',
        'input': true,
        'input_type': 'number',
        'input_default': 144,
    },
    {
        'display_name': 'Search Hours (T) Total',
        'id_prefix': 'search_hours_total',
    },
    {
        'display_name': 'Available Search Hours',
        'id_prefix': 'available_search_hours',
        'input': true,
        'input_type': 'number',
    },
    {
        'display_name': 'Modified Area at Practical Spacing in Available Hours',
        'id_prefix': 'practical_search_area',
    },
    {
        'display_name': 'Track Spacing for Whole Area in Available Time',
        'id_prefix': 'achievable_track_spacing',
    },
];

let input_rows = [
    {
        'display_name': 'Target Description',
        'form_field': 'target_description',
        'input_type': 'text',
    },
    {
        'display_name': 'Meteorological Visibility (km)',
        'form_field': 'met_visibility',
        'input_type': 'number',
    },
    {
        'display_name': 'Wind Speed (knots)',
        'form_field': 'wind_speed',
        'input_type': 'number',
    },
    {
        'display_name': 'Sea Height (meters)',
        'form_field': 'sea_height',
        'input_type': 'number',
    },
    {
        'display_name': 'Boat Search Speed (knots)',
        'form_field': 'Boat_search_speed',
        'input_type': 'number',
    },
    {
        'display_name': 'Aircraft Search Speed (knots)',
        'form_field': 'Aircraft_search_speed',
        'input_type': 'number',
    },
    {
        'display_name': 'Target Type',
        'form_field': 'target_type',
        'input_type': 'select',
    },
    {
        'display_name': 'Fatigue',
        'form_field': 'fatigue',
        'input_type': 'checkbox',
    },
];

export class MarineSACTable {
    constructor(input_table_id, table_id)
    {
        this.input_table_id = input_table_id;
        this.table_id = table_id;
        this.columns = [new MarineSAC("8ft", "Boat"), new MarineSAC("14ft", "Boat"), new MarineSAC("500ft", "Aircraft"), new MarineSAC("1000ft", "Aircraft")];
    }
    recaclculate()
    {
        let visibility = $("#met_visibility").val();
        let wind_speed = parseInt($("#wind_speed").val());
        let sea_height = parseFloat($("#sea_height").val());

        // Determine sea/wind impact category
        let weather_impact = 'low';
        if (wind_speed >= 25 || sea_height >= 1.5)
        {
            weather_impact = 'high';
        }
        else if(wind_speed >= 15 || sea_height >= 1.0)
        {
            weather_impact = 'medium';
        }

        // Update the uncorrected sweep width and weather correct factors
        let target_type = $("#" + this.target_type_id).val();
        let target_data = marine_sweep_widths[target_type];

        for (let col_idx in this.columns)
        {
            let column_name = this.columns[col_idx].column;
            let asset_type = this.columns[col_idx].asset_type;

            let visible_distance_data = target_data[asset_type][column_name];

            let highest_seen_sweep_width = 0;
            let highest_seen_vis = 0;
            for (let idx in visible_distance_data)
            {
                let data = visible_distance_data[idx];
                if (data.vis <= visibility && data.vis > highest_seen_vis)
                {
                    highest_seen_sweep_width = data.sw;
                    highest_seen_vis = data.vis;
                }
            }
            $("#wu_" + column_name).text(highest_seen_sweep_width);

            $("#fw_" + column_name).text(weather_corrections[target_data.weather_corrections].IAMSAR[weather_impact]);
        }

        // Recalculate each column
        for (let col_idx in this.columns)
        {
            this.columns[col_idx].recaclculate();
        }
    }

    populate_input_table()
    {
        let sac_table = this;

        for (let idx in input_rows)
        {
            let row = input_rows[idx];

            let html = '<tr>';

            html += '<td><label for="' + row.form_field + '">' + row.display_name + '</label></td>';
            if (row.input_type == 'select')
            {
                html += '<td><select id="' + row.form_field + '" name="' + row.form_field + '"></select></td>';
            }
            else
            {
                html += '<td><input type="' + row.input_type + '" id="' + row.form_field + '" name="' + row.form_field + '"></input></td>';
            }
            html += '</tr>';
            $("#" + this.input_table_id).append(html);
            $("#" + row.form_field).change(function()
            {
                sac_table.recaclculate();
            });
        }

        this.target_type_id = 'target_type';
        this.populate_target_types();
    }

    populate_target_types()
    {
        let sac_table = this;

        for (let idx in marine_sweep_widths)
        {
            $("#" + this.target_type_id).append('<option value="' + idx + '">' + idx + '</option>');
        }

        $("#" + this.target_type_id).change(function() {
            sac_table.recaclculate();
        });
    }

    populate_table()
    {
        let sac_table = this;

        let html = '<thead><th></th><th colspan="2">Height of Eye</th><th colspan="2">Aircraft</th></thead><thead><th></th><th>2.4m (8ft)</th><th>4.2m (14ft)</th><th>500ft</th><th>1000ft</th></thead>';
        $("#" + this.table_id).html(html);
        for (let idx in table_rows)
        {
            let html = '<tr>';
            html += '<th>' + table_rows[idx].display_name + '</th>';
            for (let col_idx in this.columns)
            {
                let column = this.columns[col_idx];
                if (table_rows[idx].input)
                {
                    html += '<td>';
                    html += '<input type="' + table_rows[idx].input_type + '" id="' + table_rows[idx].id_prefix + '_' + column.column + '" value="' + table_rows[idx].input_default + '" />';
                }
                else
                {
                    html += '<td id="' + table_rows[idx].id_prefix + '_' + column.column + '">';
                }
                html += '</td>';
            }
            $("#" + this.table_id).append(html);
            if (table_rows[idx].input)
            {
                for (let col_idx in this.columns)
                {
                    let column = this.columns[col_idx];
                    $('#' + table_rows[idx].id_prefix + '_' + column.column).change(
                        function()
                        {
                            sac_table.recaclculate();
                        }
                    );
                }
            }
        }
    }
}
