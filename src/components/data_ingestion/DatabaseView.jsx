import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

// Custom Checkbox Dropdown component
const CheckboxDropdown = ({ options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border rounded flex justify-between items-center"
      >
        Select Y-Axes
        <span className="ml-2">▼</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label key={option} className="flex items-center p-2 hover:bg-gray-100">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onChange(option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const DatabaseView = () => {
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxes, setYAxes] = useState([]);

  // Fetch databases from the backend
  useEffect(() => {
    fetch("http://localhost:8000/databases")
      .then(response => response.json())
      .then(data => setDatabases(data))
      .catch(error => console.error("Error fetching databases:", error));
  }, []);

  // Fetch tables when a database is selected
  useEffect(() => {
    if (selectedDatabase) {
      fetch(`http://localhost:8000/tables/${selectedDatabase.id}`)
        .then(response => response.json())
        .then(data => setTables(data))
        .catch(error => console.error("Error fetching tables:", error));
    }
  }, [selectedDatabase]);

  // Fetch table data when a table is selected
  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      fetch(`http://localhost:8000/table-data/${selectedDatabase.id}/${selectedTable}`)
        .then(response => response.json())
        .then(data => {
          setTableData(data);
          if (data.length > 0) {
            setColumns(Object.keys(data[0]));
          }
        })
        .catch(error => console.error("Error fetching table data:", error));
    }
  }, [selectedDatabase, selectedTable]);

  // Update chart when axes are selected
  useEffect(() => {
    if (xAxis && yAxes.length > 0) {
      formatChartData();
    }
  }, [xAxis, yAxes, tableData]);

  // Function to format data for the chart
  const formatChartData = () => {
    if (tableData.length === 0 || !xAxis || yAxes.length === 0) return;

    const labels = tableData.map(row => row[xAxis]);
    const datasets = yAxes.map((yAxis, index) => ({
      label: yAxis,
      data: tableData.map(row => row[yAxis]),
      fill: false,
      backgroundColor: `hsl(${index * 137.5}, 70%, 50%)`,
      borderColor: `hsla(${index * 137.5}, 70%, 50%, 0.2)`,
    }));

    setChartData({
      labels: labels,
      datasets: datasets,
    });
  };

  // Handle Y-axis selection
  const handleYAxisChange = (option) => {
    setYAxes(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-xl font-semibold mb-4">Database and Table Viewer</h2>

      {/* Database selection */}
      <div className="mb-4">
        <label className="block mb-2">Select Database:</label>
        <select
          className="border p-2 w-full"
          onChange={(e) => setSelectedDatabase(databases[e.target.value])}
        >
          <option value="">Select a database</option>
          {databases.map((db, index) => (
            <option key={db.id} value={index}>{db.name}</option>
          ))}
        </select>
      </div>

      {/* Table selection */}
      {selectedDatabase && (
        <div className="mb-4">
          <label className="block mb-2">Select Table:</label>
          <select
            className="border p-2 w-full"
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="">Select a table</option>
            {tables.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>
      )}

      {/* Axis selection */}
      {columns.length > 0 && (
        <div className="mb-4 flex space-x-4">
          <div className="w-1/2">
            <label className="block mb-2">X-Axis:</label>
            <select
              className="border p-2 w-full"
              onChange={(e) => setXAxis(e.target.value)}
              value={xAxis}
            >
              <option value="">Select X-Axis</option>
              {columns.map((column) => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>
          </div>
          <div className="w-1/2">
            <label className="block mb-2">Y-Axes:</label>
            <CheckboxDropdown
              options={columns}
              selected={yAxes}
              onChange={handleYAxisChange}
            />
          </div>
        </div>
      )}

      {/* Display chart */}
      {chartData && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Table Data Visualization</h3>
          <div style={{ height: '400px' }}>
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: xAxis
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Values'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      )}

      {/* Display table data */}
      {tableData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Table Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="py-2 px-4 border">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column} className="py-2 px-4 border">{row[column]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseView;