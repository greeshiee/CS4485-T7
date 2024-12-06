import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Papa from "papaparse";
import apiClient from "../services/api";

export default function DataGeneration() {
  const [file, setFile] = useState(null);
  const [typedSchema, setTypedSchema] = useState(""); // For user-typed schema
  const [numRecords, setNumRecords] = useState(10); // Default value for number of records
  const [interval, setIntervalTime] = useState(1); // Default value for interval (in minutes)
  const [message, setMessage] = useState("");
  const [filename, setFilename] = useState(""); // To store the output filename

  const [mode, setMode] = useState("batch"); // Default is batch
  const [csvContent, setCsvContent] = useState([]); // CSV data for display
  const [customFilename, setCustomFilename] = useState(""); // Custom filename
  const lastAppendedRef = useRef(""); // To store the last appended content for deduplication

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTypedSchema(event.target.result); // Store the file content as string
    };
    reader.readAsText(selectedFile);
  };

  const handleFileUploadAndDownload = async () => {
    const formData = new FormData();

    if (typedSchema) {
      const blob = new Blob([typedSchema], { type: "application/json" });
      formData.append("file", blob, "schema.json");
    } else if (file) {
      formData.append("file", file);
    } else {
      setMessage("Please upload or type a schema.");
      return;
    }

    formData.append("num_records", numRecords);
    formData.append("interval", interval);
    formData.append("mode", mode);
    formData.append("custom_filename", customFilename || "output");

    try {
      const response = await apiClient.post(
        "/data_generation/generate-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message);
      setFilename(response.data.output_file);

      await handleDownloadCSV(response.data.output_file);
    } catch (error) {
      setMessage("Error uploading file");
      console.error(error);
    }
  };

  const handleDownloadCSV = async (filename) => {
    if (!filename) {
      setMessage("No file available for download.");
      return;
    }

    try {
      const response = await apiClient.get(
        `/data_generation/download_csv/?filename=${filename}`,
        {
          responseType: "blob",
        }
      );
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", filename); // Use the filename from the upload
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link); // Clean up after download

      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        Papa.parse(text, {
          header: true,
          complete: function (results) {
            const newData = results.data;

            // Check if newData is the same as lastAppendedRef to avoid duplication
            const newContent = JSON.stringify(newData);
            if (lastAppendedRef.current !== newContent) {
              setCsvContent((prev) => [...prev, ...newData]);
              lastAppendedRef.current = newContent;
            }
          },
        });
      };
      reader.readAsText(new Blob([response.data]));
    } catch (error) {
      setMessage("Error downloading file");
      console.error(error);
    }
  };

  //To downlaod all the CSV content
  const sendToEda = () => {
    if (csvContent.length === 0) {
      setMessage("No CSV content available for download.");
      return;
    }

    const csv = Papa.unparse(csvContent); // Convert JSON array back to CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    // Create a new FormData object
    const formData = new FormData();

    // Append the Blob as a file to FormData
    formData.append('file', blob, (customFilename || "all_content") + '.csv'); // 'file' is the key, blobData is the content, fileName is the name

    // Send the FormData (which includes the Blob as a file) using fetch
    // Using Promises
      apiClient.post('/eda/upload', formData)
      .then(response => {
        console.log('Success:', response.data);
        setMessage('file now available in EDA');
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('could not send file');
      });
  };

  //To downlaod all the CSV content
  const downloadAllCSV = () => {
    if (csvContent.length === 0) {
      setMessage("No CSV content available for download.");
      return;
    }

    const csv = Papa.unparse(csvContent); // Convert JSON array back to CSV

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${customFilename || "all_content"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //useEffect to call the backend API to get new CSV content and append it to the existing CSV content
  useEffect(() => {
    if (mode === "stream" && filename) {
      const intervalId = setInterval(() => {
        handleDownloadCSV(filename);
      }, interval * 60 * 1000); // Interval in milliseconds

      return () => clearInterval(intervalId); // Cleanup the interval on unmount
    }
  }, [mode, interval, filename]);

  return (
    <div className="bg-background h-full text-foreground container mx-auto p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">
        Upload JSON or Type Schema and Generate CSV
      </h1>

      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="border rounded-lg p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Mode:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border text-foreground rounded-lg p-2"
        >
          <option value="batch">Batch</option>
          <option value="stream">Stream</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium">
          Or Type Your JSON Schema (typed JSON will take priority):
        </label>
        <textarea
          value={typedSchema}
          onChange={(e) => setTypedSchema(e.target.value)}
          className="w-full h-40 border text-foreground rounded-lg p-2"
          placeholder="Enter your JSON schema here"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Number of Records:</label>
        <input
          type="number"
          value={numRecords}
          onChange={(e) => setNumRecords(e.target.value)}
          className="border text-background rounded-lg p-2"
        />
      </div>

      {mode === "stream" && (
        <div className="mb-4">
          <label className="block font-medium">Interval (minutes):</label>
          <input
            type="number"
            value={interval}
            onChange={(e) => setIntervalTime(e.target.value)}
            className="border rounded-lg p-2"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block font-medium">Custom Filename:</label>
        <div className="flex items-center">
          <input
            type="text"
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            className="border text-background rounded-lg p-2"
            placeholder="Enter a custom filename"
          />
          <div className="ml-2">.csv</div>
        </div>
      </div>

      <button
        onClick={handleFileUploadAndDownload}
        className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
      >
        Generate
      </button>

      <p className="mt-4 text-red-500">{message}</p>

      {csvContent.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4">CSV Content:</h2>
            <button
              onClick={downloadAllCSV}
              className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 mb-4"
            >
              Download All CSV Content
            </button>

            <button
              onClick={sendToEda}
              className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 mb-4"
            >
              Send to Eda
            </button>
          </div>

          <table className="table-auto w-full">
            <thead>
              <tr>
                {Object.keys(csvContent[0]).map((header) => (
                  <th key={header} className="border px-4 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvContent.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex} className="border px-4 py-2">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

