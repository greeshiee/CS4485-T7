import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import alasql from "alasql";
import "./KPIUploader.css";

function KPIUploader({
  onFileUpload,
  onTableCreated,
  onCommonColumnsChange,
  currentData,
  setCurrentData,
  columnNames,
  setColumnNames,
  fileName,
  setFileName,
  dataSource,
  setIsJoinedData,
  setCurrentPage,
  setIsDataLoaded,
  setIsJoinModalOpen,
  setChartData,
  setCsvData,
  csvData,
  fileUploaded,
  setFileUploaded,
}) {
  const [expression, setExpression] = useState("");
  const [addedColumns, setAddedColumns] = useState([]);
  const [savedColumns, setSavedColumns] = useState([]);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");

  useEffect(() => {
    if (
      currentData &&
      currentData.length > 0 &&
      columnNames &&
      columnNames.length > 0
    ) {
      setFileUploaded(true);
      setSavedColumns(columnNames);
      processData(fileName, currentData, columnNames);
    }
  }, [currentData, columnNames, fileName]);

  const calculateCommonColumns = () => {
    const allTables = Object.keys(alasql.tables);
    if (allTables.length > 1) {
      let common = null;

      allTables.forEach((tableName, index) => {
        const tableColumns = alasql(`SHOW COLUMNS FROM \`${tableName}\``).map(
          (col) => col.columnid
        );
        console.log(`Columns in ${tableName}:`, tableColumns);

        if (index === 0) {
          common = new Set(tableColumns);
        } else {
          common = new Set([...common].filter((x) => tableColumns.includes(x)));
        }
      });

      const commonArray = Array.from(common);
      console.log("Common Columns across all tables:", commonArray);
      onCommonColumnsChange(commonArray);
    } else {
      console.log("Not enough tables to find common columns.");
      onCommonColumnsChange([]);
    }
  };

  const processData = (tableName, data, columns) => {
    if (!data || data.length === 0 || !columns || columns.length === 0) {
      console.error("Invalid data or columns in processData");
      return;
    }

    setCsvData(data);
    setColumnNames(columns);
    setSavedColumns(columns);

    const sanitizedTableName = tableName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_]/g, "_");
    alasql(`DROP TABLE IF EXISTS \`${sanitizedTableName}\``);
    alasql(
      `CREATE TABLE \`${sanitizedTableName}\` (${columns
        .map((col) => `\`${col}\` STRING`)
        .join(", ")})`
    );
    alasql(`INSERT INTO \`${sanitizedTableName}\` SELECT * FROM ?`, [data]);

    onTableCreated(sanitizedTableName);
    calculateCommonColumns();
  };

  const generateChartData = (data) => {
    if (!data || data.length === 0) {
      console.log("No data available for generating chart");
      return { labels: [], datasets: [] };
    }

    console.log("Data for chart:", data);

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
          borderColor: "#99CC33",
          backgroundColor: "#99CC33",
        },
      ],
    };

    console.log("Generated chart data:", chartData);
    return chartData;
  };

  const handleFileUpload = (uploadedFileName, data, columns = null) => {
    if (!data || data.length === 0) {
      console.error("No data to upload");
      return;
    }

    console.log("Uploading file:", uploadedFileName);
    console.log("Data:", data);

    onFileUpload(uploadedFileName, data);
    setFileUploaded(true);
    console.log("File uploaded state set to true in KPIUploader");
  };

  const handleExpression = () => {
    if (!csvData) return;

    const newColumnName = prompt("Enter a name for the new column:");
    if (!newColumnName) {
      alert("Column name cannot be empty.");
      return;
    }

    try {
      console.log("Column Names before update:", columnNames);

      const updatedData = csvData.map((row) => {
        const evaluatedExpression = expression.replace(
          /([a-zA-Z_][a-zA-Z0-9_]*)/g,
          (match) => {
            if (columnNames.includes(match)) {
              const rawValue = row[match];
              const value = parseFloat(rawValue);
              return isNaN(value) ? 0 : value; // Use 0 for non-numeric values
            }
            return match;
          }
        );

        // Evaluate the expression safely
        const newValue = eval(evaluatedExpression);
        return { ...row, [newColumnName]: newValue };
      });

      setCsvData(updatedData);
      setColumnNames([...columnNames, newColumnName]);
      setAddedColumns((prevAddedColumns) => {
        const updatedAddedColumns = [...prevAddedColumns, newColumnName];
        console.log("Updated Added Columns:", updatedAddedColumns);
        return updatedAddedColumns;
      });
      onFileUpload(fileName, updatedData, [...columnNames, newColumnName]);
    } catch (error) {
      console.error("Error in expression:", error.message);
      alert("Error in expression: " + error.message);
    }
  };

  const handleDeleteColumn = (columnName) => {
    const updatedData = csvData.map((row) => {
      const { [columnName]: _, ...rest } = row;
      return rest;
    });

    setCsvData(updatedData);
    setAddedColumns(addedColumns.filter((column) => column !== columnName));
    setColumnNames(columnNames.filter((column) => column !== columnName));
    setSavedColumns(savedColumns.filter((column) => column !== columnName));
    onFileUpload(
      fileName,
      updatedData,
      columnNames.filter((column) => column !== columnName)
    );
  };

  const handleToggleSaveColumn = (columnName) => {
    setSavedColumns((prevSavedColumns) => {
      if (prevSavedColumns.includes(columnName)) {
        return prevSavedColumns.filter((col) => col !== columnName);
      } else {
        return [...prevSavedColumns, columnName];
      }
    });
  };

  const handleExport = () => {
    if (!currentData || currentData.length === 0) return;

    const exportFileName = prompt(
      "Enter a name for the exported file:",
      "exported_data.csv"
    );
    if (!exportFileName) {
      alert("File name cannot be empty.");
      return;
    }

    // Get the original columns and the explicitly saved new columns
    const originalColumns = columnNames.filter(
      (col) => !addedColumns.includes(col)
    );
    const savedNewColumns = addedColumns.filter((col) =>
      savedColumns.includes(col)
    );
    const exportColumns = [...originalColumns, ...savedNewColumns];

    // Filter and order the data based on exportColumns
    const exportData = currentData
      .map((row) => {
        const orderedRow = {};
        exportColumns.forEach((col) => {
          if (row.hasOwnProperty(col)) {
            orderedRow[col] = row[col];
          }
        });
        return orderedRow;
      })
      .filter((row) => {
        // Check if the row has any non-empty values in the original columns
        return originalColumns.some(
          (col) =>
            row[col] !== "" && row[col] !== null && row[col] !== undefined
        );
      });

    const csvContent = Papa.unparse(exportData, {
      columns: exportColumns, // Specify the column order explicitly
      header: true,
      skipEmptyLines: true, // This should help prevent extra empty lines
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      exportFileName.endsWith(".csv") ? exportFileName : `${exportFileName}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!currentData || currentData.length === 0) {
      alert("No data to import");
      return;
    }

    const defaultTableName = fileName.replace(/\.[^/.]+$/, "");
    const tableName = prompt(
      "Enter a name for the database table:",
      defaultTableName
    );
    if (!tableName) {
      alert("Invalid table name");
      return;
    }

    console.log("Data to be imported:", currentData);
    console.log("Table name:", tableName);

    try {
      const response = await fetch("http://localhost:5001/kpi_management/api/import_kpis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: currentData,
          table_name: tableName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${JSON.stringify(
            errorData
          )}`
        );
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Error importing data: " + error.message);
    }
  };

  const handleTableClick = (tableName) => {
    if (alasql.tables[tableName]) {
      const data = alasql(`SELECT * FROM [${tableName}]`);
      setCurrentData(data);
      setColumnNames(Object.keys(data[0] || {}));
    } else {
      fetchTableData(tableName);
    }
  };

  const createAlaSQLTable = (tableName, data) => {
    if (!data || data.length === 0) {
      console.error("No data to create AlaSQL table");
      return;
    }

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
  };

  const fetchTableData = async (tableName) => {
    console.log(`Fetching data for table: ${tableName}`);
    try {
      const response = await fetch(
        `http://localhost:5001/kpi_management/api/kpis?table=${tableName}`,
        {
          headers: {
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

      createAlaSQLTable(tableName, data);
      handleFileUpload(tableName, data, Object.keys(data[0]));

      setIsDataLoaded(true);
      console.log("State updated with new data");
    } catch (error) {
      console.error("Error fetching data from table:", error);
      alert("Error fetching data from table: " + error.message);
    }
  };

  // Function to handle opening the modal
  const handleColumnButtonClick = (column) => {
    setSelectedColumn(column);
    setIsColumnModalOpen(true);
  };

  // Function to handle saving/unsaving the column
  const handleSaveToggle = () => {
    handleToggleSaveColumn(selectedColumn);
    setIsColumnModalOpen(false);
  };

  // Function to handle opening the modal
  const handleManageColumnsClick = () => {
    setIsColumnModalOpen(true);
  };

  // Update the modal styling to include text color
  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "20px",
    zIndex: 1000,
    border: "1px solid #ccc",
    borderRadius: "5px",
    maxWidth: "500px",
    width: "90%",
    color: "black",
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  };

  return (
    <div style={{ marginTop: "0.3em" }}>
      {dataSource === "csv" && (
        <div className="file-upload">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                Papa.parse(file, {
                  complete: (results) => {
                    if (results.data && results.data.length > 0) {
                      handleFileUpload(
                        file.name,
                        results.data,
                        results.meta.fields
                      );
                    } else {
                      console.error("No data parsed from CSV");
                    }
                  },
                  header: true,
                  skipEmptyLines: true,
                });
              }
            }}
          />
        </div>
      )}

      {fileUploaded && (
        <>
          <h3>Enter Expression:</h3>
          <textarea
            rows="4"
            cols="50"
            style={{ width: "300px" }}
            value={expression}
            placeholder="e.g. column1 + column2"
            onChange={(e) => setExpression(e.target.value)}
          />
          <br />
          <div className="no-scrollbar" style={{ width: "100%" }}>
            <button
              onClick={handleExpression}
              style={{ marginRight: "1em", display: "inline-block" }}
              className="myButton"
            >
              Generate New Column
            </button>

            <button
              onClick={handleManageColumnsClick}
              style={{ marginRight: "1em", display: "inline-block" }}
              className="myButton"
            >
              Manage Added Columns
            </button>

            <button
              onClick={() => setIsJoinModalOpen(true)}
              style={{ marginRight: "1em", display: "inline-block" }}
              className="myButton"
            >
              Open Join Table Form
            </button>
            <button
              onClick={handleExport}
              style={{ marginRight: "1em", display: "inline-block" }}
              className="myButton"
            >
              Export CSV
            </button>
            <button
              onClick={handleImport}
              className="myButton"
              style={{ display: "inline-block" }}
            >
              Export to Database
            </button>
          </div>
        </>
      )}

      {isColumnModalOpen && (
        <>
          <div
            style={overlayStyle}
            onClick={() => setIsColumnModalOpen(false)}
          />
          <div style={modalStyle}>
            <span
              className="close"
              onClick={() => setIsColumnModalOpen(false)}
              style={{ cursor: "pointer", float: "right" }}
            >
              &times;
            </span>
            <h3>Manage Added Columns</h3>
            {addedColumns.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {addedColumns.map((column) => (
                  <li key={column} style={{ marginBottom: "10px" }}>
                    <span>{column}</span>
                    <button
                      onClick={() => handleToggleSaveColumn(column)}
                      style={{ marginLeft: "10px" }}
                      className="myButton"
                    >
                      {savedColumns.includes(column) ? "Unsave" : "Save"}
                    </button>
                    <button
                      onClick={() => handleDeleteColumn(column)}
                      className="myButton"
                      style={{ marginLeft: "10px" }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No columns added yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default KPIUploader;
