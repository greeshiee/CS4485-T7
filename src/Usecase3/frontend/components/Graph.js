import React from 'react';
import Plot from 'react-plotly.js';

const Graph = ({ headers, data, chartType, x, y, filters, width, height }) => {
    // Helper function to convert date strings to consistent format
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        
        // Handle MM/DD/YYYY format
        if (dateStr.includes('/')) {
            const [month, day, year] = dateStr.split('/');
            return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        }
        // Handle YYYY-MM-DD format
        return new Date(dateStr);
    };

    // Add this helper function after parseDate
    const getAveragesByGroup = (data, xColumn, yColumn) => {
        // Group and calculate averages
        const groups = {};
        
        data.forEach(row => {
            const xValue = row[xColumn];
            const yValue = row[yColumn];

            
            if (!groups[xValue]) {
                groups[xValue] = {
                    sum: 0,
                    count: 0
                };
            }
            
            if (!isNaN(yValue)) {
                groups[xValue].sum += yValue;
                groups[xValue].count++;
            }
        });

        // Get unique x values and their corresponding averages
        const uniqueX = Object.keys(groups);
        const averages = uniqueX.map(x => ({
            x: x,
            y: groups[x].count ? groups[x].sum / groups[x].count : 0,
            count: groups[x].count
        }));

        return averages;
    };

    // Apply filters to the data if they exist
    const filteredData = filters && filters.length > 0 ? data.filter(row => {
        return filters.some(filter => {
            const { column, type, value, range } = filter;
            
            if (type === 'string') {
                return row[0].toString().toLowerCase() === value.toLowerCase();
            } else if (type === 'date') {
                const rowDate = parseDate(row[0]);
                if (!rowDate) return false;

                // Set rowDate to noon to avoid timezone issues
                rowDate.setHours(12, 0, 0, 0);

                if (range.min && range.max) {
                    const minDate = parseDate(range.min);
                    const maxDate = parseDate(range.max);
                    
                    // Set times to ensure inclusive range
                    minDate.setHours(0, 0, 0, 0);
                    maxDate.setHours(23, 59, 59, 999);

                    return rowDate >= minDate && rowDate <= maxDate;
                } else if (range.min) {
                    const minDate = parseDate(range.min);
                    minDate.setHours(0, 0, 0, 0);
                    return rowDate >= minDate;
                } else if (range.max) {
                    const maxDate = parseDate(range.max);
                    maxDate.setHours(23, 59, 59, 999);
                    return rowDate <= maxDate;
                }
                return true;
            } else {
                // For numbers
                const cellValue = parseFloat(row[0]);
                const { min, max } = range;
                
                if (min && max) {
                    return cellValue >= min && cellValue <= max;
                }       
                else if (min) {
                    return cellValue >= min;
                }
                else if (max) {
                    return cellValue <= max;
                }
                return true;
            }
        });
    }) : data;

    const labels = filteredData.map(row => row[x]);

    // Update the color scheme for graphs
    const pastelColors = [
        '#B4D4FF', // Light blue
        '#FFB4B4', // Light red
        '#B4FFB4', // Light green
        '#FFD4B4', // Light orange
        '#D4B4FF', // Light purple
        '#B4FFD4', // Light mint
        '#FFB4D4', // Light pink
        '#D4FFB4'  // Light lime
    ];

    

    const plotData = y.map((col, index) => {
        console.log("col", col);
        const averagedData = getAveragesByGroup(filteredData, x, col);
        console.log("averagedData", averagedData);
        return {
            x: averagedData.map(d => d.x),
            y: averagedData.map(d => d.y),
            text: averagedData.map(d => `Count: ${d.count}`),
            type: chartType.toLowerCase(),
            name: col.label,
            marker: {
                color: pastelColors[index % pastelColors.length],
            },
            hovertemplate: `%{x}<br>Average: %{y:.2f}<br>%{text}<extra></extra>`
        };
    });

    // Use width and height if provided, otherwise use defaults
    const chartWidth = width || 400;  // default width
    const chartHeight = height || 300; // default height

    // Add this helper function before the return statement
    const preparePieData = () => {
        // Create a map to count occurrences of each unique x value
        const valueCount = {};
        filteredData.forEach(row => {
            const key = row[x];
            valueCount[key] = (valueCount[key] || 0) + 1;
        });

        return [{
            values: Object.values(valueCount),
            labels: Object.keys(valueCount),
            type: 'pie',
            hole: 0.4,  // This creates the donut effect
            marker: {
                colors: pastelColors,
                line: {
                    color: '#ffffff',
                    width: 2
                }
            },
            textinfo: 'label+percent',
            textposition: 'outside',
            automargin: true,
            hoverinfo: 'label+value+percent',
            hoverlabel: {
                bgcolor: '#FFF',
                bordercolor: '#333',
                font: { size: 14 }
            }
        }];
    };

    return (
        console.log("chartType", chartType),
       <div style={{ width: width, height: height, margin: [0, 0], padding: 0 }}> 
            {console.log(width)}
            {console.log(filteredData)}
            {chartType === 'Bar' && (
                console.log("plotData", plotData),
                <Plot
                    data={plotData}
                    layout={{ 
                        title: `${headers[x]} ${y && y[0] ? 'vs ' + headers[y[0].value] : ''} Chart`, 
                        barmode: 'stack',
                        width: width, 
                        height: height,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                    }}
                />
            )}
            {chartType === 'Line' && (
                <Plot
                    data={plotData.map(trace => ({ ...trace, type: 'scatter', mode: 'lines+markers'}))}
                    layout={{ 
                        title: `${headers[x]} ${y && y[0] ? 'vs ' + headers[y[0].value] : ''} Chart`,
                        width: width, 
                        height: height,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                    }}
                />
            )}
            {chartType === 'Pie' && (
                <Plot
                    data={preparePieData()}
                    layout={{ 
                        title: {
                            text: `Distribution of ${headers[x]}`,
                            font: { size: 20, color: '#333' }
                        },
                        width: width, 
                        height: height,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        showlegend: true,
                        legend: { 
                            orientation: 'h',
                            y: -0.2,
                            font: { size: 12 }
                        },
                        margin: { t: 50, b: 50, l: 50, r: 50 },
                        annotations: [{
                            text: 'Total',
                            showarrow: false,
                            font: { size: 20 }
                        }]
                    }}
                />
            )}
        </div>
    );
};

export default Graph;

