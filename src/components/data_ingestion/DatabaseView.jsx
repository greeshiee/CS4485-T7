import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import apiClient from '../../services/api';

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 rounded bg-gray-800 border-gray-700 text-gray-100 flex justify-between items-center"
      >
        Select Y-Axes
        <span className="ml-2">▼</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label key={option} className="flex items-center p-2 hover:bg-gray-700 text-gray-100">
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

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await apiClient.get('/data_ingestion/databases');
        setDatabases(response.data);
      } catch (error) {
        console.error("Error fetching databases:", error);
      }
    };
    fetchDatabases();
  }, []);

  useEffect(() => {
    if (selectedDatabase) {
      const fetchTables = async () => {
        try {
          const response = await apiClient.get(`/data_ingestion/tables/${selectedDatabase.id}`);
          setTables(response.data);
        } catch (error) {
          console.error("Error fetching tables:", error);
        }
      };
      fetchTables();
    }
  }, [selectedDatabase]);

  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      const fetchTableData = async () => {
        try {
          const response = await apiClient.get(`/data_ingestion/table-data/${selectedDatabase.id}/${selectedTable}`);
          const data = response.data;
          setTableData(data);
          if (data.length > 0) {
            setColumns(Object.keys(data[0]));
          }
        } catch (error) {
          console.error("Error fetching table data:", error);
        }
      };
      fetchTableData();
    }
  }, [selectedDatabase, selectedTable]);

  useEffect(() => {
    if (xAxis && yAxes.length > 0) {
      formatChartData();
    }
  }, [xAxis, yAxes, tableData]);

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
      labels,
      datasets,
    });
  };

  const handleYAxisChange = (option) => {
    setYAxes(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      }
      return [...prev, option];
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="rounded-lg shadow p-6 text-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">Database Visualization</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Select Database</label>
            <select
              className="w-full p-2 rounded bg-gray-800 border-gray-700 text-gray-100"
              onChange={(e) => setSelectedDatabase(databases[e.target.value])}
            >
              <option value="">Select a database</option>
              {databases.map((db, index) => (
                <option key={db.id} value={index}>{db.name}</option>
              ))}
            </select>
          </div>

          {selectedDatabase && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Select Table</label>
              <select
                className="w-full p-2 rounded bg-gray-800 border-gray-700 text-gray-100"
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                <option value="">Select a table</option>
                {tables.map((table) => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>
          )}

          {columns.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">X-Axis</label>
                <select
                  className="w-full p-2 rounded bg-gray-800 border-gray-700 text-gray-100"
                  onChange={(e) => setXAxis(e.target.value)}
                  value={xAxis}
                >
                  <option value="">Select X-Axis</option>
                  {columns.map((column) => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Y-Axes</label>
                <CheckboxDropdown
                  options={columns}
                  selected={yAxes}
                  onChange={handleYAxisChange}
                />
              </div>
            </div>
          )}

          {chartData && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 text-gray-100">Visualization</h3>
              <div className="h-96 bg-gray-800 rounded p-4">
                <Line 
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: { display: true, text: xAxis, color: '#9CA3AF' },
                        ticks: { color: '#9CA3AF' },
                        grid: { color: '#374151' }
                      },
                      y: {
                        title: { display: true, text: 'Values', color: '#9CA3AF' },
                        ticks: { color: '#9CA3AF' },
                        grid: { color: '#374151' }
                      }
                    },
                    plugins: {
                      legend: {
                        labels: { color: '#9CA3AF' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {tableData.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 text-gray-100">Table Data</h3>
              <div className="overflow-x-auto rounded">
                <table className="min-w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      {columns.map((column) => (
                        <th key={column} className="p-2 text-left text-gray-300 border border-gray-700">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800">
                    {tableData.map((row, index) => (
                      <tr key={index} className="border-t border-gray-700">
                        {columns.map((column) => (
                          <td key={column} className="p-2 text-gray-100 border border-gray-700">
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseView;