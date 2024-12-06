import React, { useState, useEffect } from "react";
import "./KPIUploader.css";
import KPIUploader from "./sidebar";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import alasql from "alasql";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const getAccessToken = () => {
  // Retrieve the access token from local storage or wherever you store it
  return localStorage.getItem('access_token');
};

function App() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [dbData, setDbData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataSource, setDataSource] = useState("csv");
  const [tableNames, setTableNames] = useState([]);
  const rowsPerPage = 10;
  const [joinedData, setJoinedData] = useState(null);
  const [commonColumns, setCommonColumns] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [isJoinedData, setIsJoinedData] = useState(false);
  const [columnNames, setColumnNames] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedJoinType, setSelectedJoinType] = useState("INNER JOIN");
  const [firstTable, setFirstTable] = useState("");
  const [secondTable, setSecondTable] = useState("");
  const [selectedCommonColumn, setSelectedCommonColumn] = useState("");
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const joinTypes = [
    "INNER JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "FULL OUTER JOIN",
  ];

  // Function to handle when a new table is created
  const handleTableCreated = (tableName) => {
    console.log(`Attempting to add table: ${tableName}`);
    setTableNames((prevTableNames) => {
      if (!prevTableNames.includes(tableName)) {
        console.log(`Adding new table: ${tableName}`);
        return [...prevTableNames, tableName];
      }
      console.log(`Table ${tableName} already exists, not adding`);
      return prevTableNames;
    });
    calculateCommonColumns();
  };

  // Function to handle table removal
  const handleRemoveTable = (tableName) => {
    setTableNames((prevTableNames) =>
      prevTableNames.filter((name) => name !== tableName)
    );

    setCurrentData([]);
    setColumnNames([]);
  };

  const handleTableClick = (tableName) => {
    if (alasql.tables[tableName]) {
      const data = alasql(`SELECT * FROM [${tableName}]`);
      setCurrentData(data);
      setColumnNames(Object.keys(data[0] || {}));
      setIsJoinedData(tableName === "Joined_Data");
      setFileName(tableName);
      setCurrentPage(1);
    } else {
      fetchTableData(tableName);
    }
  };

  // Fetch available tables from the database
  const fetchAvailableTables = async () => {
    const url = "http://localhost:5001/kpi_management/api/tables";
    console.log(`Fetching tables from: ${url}`);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const tables = await response.json();
      console.log("Fetched tables:", tables);
      setAvailableTables(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      alert("Error fetching tables: " + error.message);
    }
  };

  // Fetch data from the selected table
  const fetchTableData = async (tableName) => {
    console.log(`Fetching data for table: ${tableName}`);
    try {
      const token = getAccessToken();
      const response = await fetch(
        `http://localhost:5001/kpi_management/api/kpis?table=${tableName}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched data:", data);

      // Use handleFileUpload to process the data
      handleFileUpload(tableName, data, Object.keys(data[0]));

      setIsDataLoaded(true);
      console.log("State updated with new data");
    } catch (error) {
      console.error("Error fetching data from table:", error);
      alert("Error fetching data from table: " + error.message);
    }
  };

  // Use effect to fetch data from the selected table
  useEffect(() => {
    if (dataSource === "db" && selectedTable) {
      console.log(`Fetching data for selected table: ${selectedTable}`);
      fetchTableData(selectedTable);
    }
  }, [selectedTable, dataSource]);

  // New function to create AlaSQL table
  const createAlaSQLTable = (tableName, data) => {
    if (data && data.length > 0) {
      try {
        alasql(`DROP TABLE IF EXISTS [${tableName}]`);
        const createTableQuery = `CREATE TABLE [${tableName}] (${Object.keys(
          data[0]
        )
          .map((col) => `[${col}] STRING`)
          .join(", ")})`;
        alasql(createTableQuery);
        alasql(`INSERT INTO [${tableName}] SELECT * FROM ?`, [data]);
        console.log(`Data inserted into AlaSQL table: ${tableName}`);
      } catch (e) {
        console.error("Error in AlaSQL operations:", e);
      }
    }
  };

  // Modify the useEffect for data source change
  useEffect(() => {
    if (dataSource === "db") {
      fetchAvailableTables();
    } else {
      setIsDataLoaded(false);
      setFileUploaded(false);
      setFileName("");
      setCurrentData([]);
      setColumnNames([]);
    }
  }, [dataSource]);

  // Modify handleFileUpload to accept data directly
  const handleFileUpload = (uploadedFileName, data, columns = null) => {
    setFileUploaded(true);
    setFileName(uploadedFileName);
    setCsvData(data);
    setCurrentData(data);
    setColumnNames(columns || Object.keys(data[0]));
    setIsJoinedData(uploadedFileName.startsWith("Joined_Data"));
    setCurrentPage(1);
    setIsDataLoaded(true);

    // Create a unique table name for the file
    const tableName = uploadedFileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_]/g, "_");
    createAlaSQLTable(tableName, data);
    handleTableCreated(tableName);
  };

  // Example SQL operation: Join CSV and DB data
  const performJoinOperation = () => {
    try {
      if (!alasql.tables.csvData || !alasql.tables.dbData) {
        console.log("Tables not ready for join operation");
        return;
      }
      const result = alasql(
        "SELECT csvData.*, dbData.department FROM csvData JOIN dbData ON csvData.id = dbData.id"
      );
      console.log("Joined Data:", result);
    } catch (error) {
      console.error("Error performing join operation:", error.message);
    }
  };

  // Call performJoinOperation when data is ready
  useEffect(() => {
    if (fileUploaded && csvData.length > 0 && dbData.length > 0) {
      performJoinOperation();
    }
  }, [fileUploaded, csvData, dbData]);

  const handleCommonColumnsChange = (columns) => {
    setCommonColumns(columns);
  };

  useEffect(() => {
    console.log("Current Data:", currentData);
    console.log("CSV Data:", csvData);
    setChartData(generateChartData());
  }, [currentData, csvData]);

  const generateChartData = () => {
    const data = dataSource === "csv" ? csvData : currentData;
    console.log("Data source for chart:", dataSource);
    console.log("Data used for chart generation:", data);

    if (!data || data.length === 0) {
      console.log("No data available for generating chart");
      return { labels: [], datasets: [] };
    }

    const labels = data.map((row) => row["Timestamp"]);
    const dataValues = data.map((row) => row["Signal_Strength"]);

    if (labels.length === 0 || dataValues.length === 0) {
      console.log("No valid labels or data values for chart");
      return { labels: [], datasets: [] };
    }

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Signal Strength Over Time",
          data: dataValues,
          borderColor: "#4361ee",
          backgroundColor: "rgba(67, 97, 238, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: "#4cc9f0",
          pointBorderColor: "#4cc9f0",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#4cc9f0",
        },
      ],
    };

    console.log("Generated chart data:", chartData);
    return chartData;
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Timestamp",
          color: "#4cc9f0",
        },
        ticks: {
          color: "#e9ecef",
        },
        grid: {
          color: "rgba(76, 201, 240, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Signal Strength",
          color: "#4cc9f0",
        },
        ticks: {
          color: "#e9ecef",
        },
        grid: {
          color: "rgba(76, 201, 240, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#4cc9f0",
          font: {
            family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const renderTable = () => {
    const data = currentData;

    if (!data || data.length === 0) {
      console.log("No data available for rendering table");
      return null;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(currentData.length / rowsPerPage);

    return (
      <div className="csv-table-container" style={{ width: "65%" }}>
        <table className="csv-table">
          <thead>
            <tr>
              {columnNames.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columnNames.map((column) => (
                  <td key={column}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="myButton"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="myButton"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const handleClearDataInApp = () => {
    setFileUploaded(false);
    setFileName("");
    setCsvData([]);
    setCurrentPage(1);
    setTableNames([]); // Clear all table names
  };

  const handleJoinButtonClick = () => {
    setIsJoinModalOpen(true);
  };

  const calculateCommonColumns = () => {
    if (!firstTable || !secondTable) return;

    const firstTableColumns = alasql(`SHOW COLUMNS FROM [${firstTable}]`).map(
      (col) => col.columnid
    );
    const secondTableColumns = alasql(`SHOW COLUMNS FROM [${secondTable}]`).map(
      (col) => col.columnid
    );

    const common = firstTableColumns.filter((col) =>
      secondTableColumns.includes(col)
    );
    setCommonColumns(common);
    setSelectedCommonColumn(common[0] || ""); // Default to the first common column
  };

  useEffect(() => {
    calculateCommonColumns();
  }, [firstTable, secondTable]);

  const handleJoinSubmit = () => {
    if (!firstTable || !secondTable || !selectedCommonColumn) {
      alert("Please select two tables and a common column.");
      return;
    }

    const joinedTableName = prompt("Enter a name for the joined table:");
    if (!joinedTableName) {
      alert("Table name cannot be empty.");
      return;
    }

    try {
      const joinQuery = `SELECT * FROM [${firstTable}] ${selectedJoinType} [${secondTable}] ON ${firstTable}.${selectedCommonColumn} = ${secondTable}.${selectedCommonColumn}`;
      console.log("Join Query:", joinQuery);

      const result = alasql(joinQuery);
      console.log(`Joined result: ${result.length} rows`);

      alasql(`DROP TABLE IF EXISTS [${joinedTableName}]`);
      alasql(`CREATE TABLE [${joinedTableName}]`);
      alasql(`SELECT * INTO [${joinedTableName}] FROM ?`, [result]);

      setColumnNames(Object.keys(result[0]));
      setCurrentData(result);
      setFileName(joinedTableName);
      setIsJoinedData(true);
      handleTableCreated(joinedTableName);
      setCurrentPage(1);

      console.log(`Joined data processed as new table: ${joinedTableName}`);
    } catch (error) {
      console.error("Error performing join operation:", error);
      alert(`Error performing join: ${error.message}`);
    }

    setIsJoinModalOpen(false);
  };

  const handleDataSourceChange = (e) => {
    const newDataSource = e.target.value;
    setDataSource(newDataSource);
    if (newDataSource === "db") {
      fetchAvailableTables();
      setSelectedTable(""); // Reset selected table
    } else {
      // Reset states for CSV option
      setFileUploaded(false);
      setFileName("");
      setCurrentData([]);
      setColumnNames([]);
      setAvailableTables([]); // Clear available tables
      setSelectedTable(""); // Reset selected table
    }
  };

  const handleTableSelectionChange = (event) => {
    const selectedTableName = event.target.value;
    setSelectedTable(selectedTableName);
    console.log(`Selected table: ${selectedTableName}`); // Log the selected table
  };

  return (
    <div
      className="App"
      style={{
        paddingLeft: "20px",
        paddingRight: "20px",
        marginTop: "0.5em",
        width: "100%",
      }}
    >
      <div className="kpi-formula-container">
        <div className="kpi-formula-sidebar">
          <h2>Welcome to the KPI Uploader!</h2>

          <label>Select Data Source:</label>
          <select value={dataSource} onChange={handleDataSourceChange}>
            <option value="csv">CSV File</option>
            <option value="db">Database Table</option>
          </select>

          {dataSource === "db" && availableTables.length > 0 && (
            <div>
              <label>Select Table:</label>
              <select
                value={selectedTable}
                onChange={handleTableSelectionChange}
              >
                <option value="">Select a table</option>
                {availableTables.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(dataSource === "csv" || (dataSource === "db" && fileUploaded)) && (
            <KPIUploader
              onFileUpload={handleFileUpload}
              onClearData={handleClearDataInApp}
              onTableCreated={handleTableCreated}
              onCommonColumnsChange={handleCommonColumnsChange}
              currentData={currentData}
              setCurrentData={setCurrentData}
              columnNames={columnNames}
              setColumnNames={setColumnNames}
              fileName={fileName}
              setFileName={setFileName}
              dataSource={dataSource}
              setIsJoinedData={setIsJoinedData}
              setCurrentPage={setCurrentPage}
              setIsDataLoaded={setIsDataLoaded}
              setIsJoinModalOpen={setIsJoinModalOpen}
              setChartData={setChartData}
              csvData={csvData}
              setCsvData={setCsvData}
              fileUploaded={fileUploaded}
              setFileUploaded={setFileUploaded}
            />
          )}

          {tableNames.length > 0 && (
            <div className="current-table" style={{ marginTop: "1em" }}>
              <h3>History</h3>
              <ul>
                {tableNames.map((name, index) => (
                  <li key={index}>
                    <a href="#" onClick={() => handleTableClick(name)}>
                      {name}
                    </a>
                    <button
                      onClick={() => handleRemoveTable(name)}
                      className="delete-button"
                      style={{ marginLeft: "0.3em", marginBottom: "0.2em" }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="kpi-formula-content">
          {!isDataLoaded ? (
            <div className="card" style={{ background: "black" }}>
              {dataSource === "db" && <p>Loading data from database...</p>}
            </div>
          ) : (
            <div className="card" style={{ background: "black" }}>
              <p style={{ color: "#4cc9f0" }}>
                Current Table: <strong>{fileName}</strong>
              </p>

              {renderTable()}

              <div className="Line_chart" style={{ width: "65%" }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>
      </div>

      {isJoinModalOpen && (
        <div
          className="modal"
          style={{ position: "absolute", opacity: "1", right: "0" }}
        >
          <div className="modal-content">
            <span className="close" onClick={() => setIsJoinModalOpen(false)}>
              &times;
            </span>
            <h3>Select Tables and Join Type</h3>
            <div>
              <label>First Table:</label>
              <select
                value={firstTable}
                onChange={(e) => setFirstTable(e.target.value)}
              >
                <option value="">Select a table</option>
                {tableNames.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Second Table:</label>
              <select
                value={secondTable}
                onChange={(e) => setSecondTable(e.target.value)}
              >
                <option value="">Select a table</option>
                {tableNames.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Common Column:</label>
              <select
                value={selectedCommonColumn}
                onChange={(e) => setSelectedCommonColumn(e.target.value)}
              >
                <option value="">Select a common column</option>
                {commonColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Join Type:</label>
              <select
                value={selectedJoinType}
                onChange={(e) => setSelectedJoinType(e.target.value)}
              >
                {joinTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleJoinSubmit}
              style={{ marginBottom: "0.5em" }}
              className="myButton"
            >
              Submit
            </button>
            <button
              onClick={() => setIsJoinModalOpen(false)}
              className="myButton"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
