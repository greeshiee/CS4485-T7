import { useParams } from 'react-router-dom';
import Graph from './Graph';
import DataTable from './DataTable';
import { useEffect } from 'react';
import { Box, Tab, Tabs, FormControl, MenuItem, InputLabel, Select, Typography, Button, Container, IconButton} from '@mui/material';
import { TabPanel, TabContext } from '@mui/lab';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import React, { useState } from "react";
import { DateRangePicker } from '@mui/lab';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import apiClient from '../../../../services/api';
function AddTilePage({ dashboardId, onNavigate, userEmail }) {
  //const { dashboardId } = useParams();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [file, setFile] = useState('');
  const [savedFiles, setSavedFiles] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [chartType, setChartType] = useState('');
  const [y, setY] = useState([]);
  const [x, setX] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [data, setData] = useState([]);
  const [singleValue, setSingleValue] = useState(null);
  const handleChange = (event, value) => {
    if (value.length > 1) {
      alert('Multiple Y-axis selection will be supported in a future update. Please select only one value for now.');
      // If there was already one value selected, keep it
      if (y.length > 0) {
        setY([y[0]]);
      }
      return;
    }
    setY(value);
  };
  const handleChartTypeChange = (e) => setChartType(e.target.value);
  const [tableMap, setTableMap] = useState({ ids: [], names: [] });
  const [selectedTableId, setSelectedTableId] = useState(null);

  useEffect(() => {
    fetchSavedFiles();
  }, [file]);


  useEffect(() => {
    const fetchData = async () => {
      if (!selectedFile) return;
      
      // Find the table_id for the selected file
      const fileIndex = tableMap.names.indexOf(selectedFile);
      if (fileIndex === -1) return;
      
      const tableId = tableMap.ids[fileIndex];
      setSelectedTableId(tableId);

      try {
        const response = await apiClient.get(`/dashboarding/tables?table_id=${tableId}`);
        setData(response.data.rows);
        setHeaders(response.data.column_names);
        setFileUploaded(true);
      } catch (error) {
        console.error('Error fetching table data:', error);
      }
    };

    fetchData();
  }, [selectedFile, tableMap]);


  const fetchSavedFiles = async () => {
    try {
      const response = await apiClient.get('/dashboarding/tables/map');
      if (response.status === 200) {
        setTableMap({
          ids: response.data.table_ids,
          names: response.data.table_names
        });
        setSavedFiles(response.data.table_names);
      }
    } catch (error) {
      console.error('Error fetching saved tables:', error);
    }
  };

  const addFiles = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('table_name', file.name.split('.')[0]);
    try {
      const response = await apiClient.post('/dashboarding/tables', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
      });
      fetchSavedFiles();
      setSelectedFile(file.name.split('.')[0]);
    } catch (error) {
      console.error('Error uploading file:', error.response?.data || error.message);
    }
    setFile('');
  };

  

  const handleFileSelect = (event) => {
    const selectedFileName = event.target.value;
    setSelectedFile(selectedFileName);
  };

  const handleAddTile = async () => {
    
    // Validate required fields
    if (!selectedTableId || !chartType || x === undefined || !y) {
        console.error('Missing required values:', { selectedTableId, chartType, x, y });
        return;
    }

    // Prepare the parameters as query string parameters
    const params = {
        table_id: selectedTableId,
        graph_title: `${chartType} of ${headers[x]} vs ${y.map(yAxis => headers[yAxis.value]).join(', ')}`,
        graph_type: chartType,
        ax0: headers[x],
        ax1: y.map(yAxis => headers[yAxis.value]).join(', ')
    };
    console.log(params);
    
    
    try {
        const response = await apiClient.post('/dashboarding/graphs', null, {
            params: params  // Send as query parameters instead of body
        });
        
        
        //now put the graph into the dashboard using the graph_id and the put request
        const dashboardParams = {
          graph_ids: [response.data.graph_id],
          xy_coords: [[0, -1]],
          width_height: [[5, 5]],
        };

        
        // call the put request
        try {
            const dashboardResponse = await apiClient.put(`/dashboarding/dashboards?dashboard_id=${parseInt(dashboardId)}&requester_email=${userEmail}`, dashboardParams);
        } catch (error) {
            console.error('Dashboard update failed:', {
              sentParams: dashboardParams,
              error: error.response?.data || error.message,
              status: error.response?.status
            });
        }
    } catch (error) {
        console.error('Graph creation failed:', {
            sentParams: params,
            error: error.response?.data || error.message,
            status: error.response?.status
        });
    }

    //navigate to the dashboard
    onNavigate('singleDashboard', { dashboardId: dashboardId });

  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  return (
    <Box sx={{ 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Replace AppBar with modern header */}
      <Box 
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 24px'
        }}
      >
        <Container>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: '#1a1a1a'
              }}
            >
              Create New Tile
            </Typography>
            <Button 
              variant="outlined"
              onClick={() => onNavigate('singleDashboard', { dashboardId: dashboardId })}
              sx={{
                textTransform: 'none',
                borderColor: '#e0e0e0',
                color: '#666666'
              }}
            >
              Cancel
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ mt: 4 }}>
        {/* File Selection Section */}
        <Box 
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #eaeaea'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              marginBottom: '16px',
              color: '#1a1a1a',
              fontWeight: 500
            }}
          >
            Select Dataset
          </Typography>

          <FormControl fullWidth>
            <InputLabel id="file-select-label">Select Data</InputLabel>
            <Select
              labelId="file-select-label"
              value={selectedFile}
              label="Select File"
              onChange={handleFileSelect}
              sx={{
                backgroundColor: '#f8f9fa',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0'
                }
              }}
            >
              {savedFiles.map((file, index) => (
                <MenuItem key={index} value={file}>{file}</MenuItem>
              ))}
            </Select>
            
            <Box 
              mt={2}
              sx={{
                '& input': {
                  display: 'none'
                }
              }}
            >
              <Button
                component="label"
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  borderColor: '#e0e0e0',
                  color: '#666666'
                }}
              >
                Upload Here
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={(e) => addFiles(e.target.files[0])}
                />
              </Button>
            </Box>
          </FormControl>
        </Box>

        {fileUploaded && (
          <Box 
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #eaeaea'
            }}
          >
            <TabContext value={activeTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      color: '#666666',
                      '&.Mui-selected': {
                        color: '#2196f3'
                      }
                    }
                  }}
                >
                  <Tab label="Data Table" value="1" />
                  <Tab label="Create Graph" value="2" />
                </Tabs>
              </Box>

              {/* Table Panel */}
              <TabPanel value="1">

              <DataTable headers={headers} data={data} />
              </TabPanel>

              {/* Graph Panel */}
              <TabPanel value="2">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: '600px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Chart Type</InputLabel>
                      <Select
                        value={chartType}
                        label="Chart Type"
                        onChange={handleChartTypeChange}
                      >
                        <MenuItem value="Bar">Bar Chart</MenuItem>
                        <MenuItem value="Line">Line Chart</MenuItem>
                        <MenuItem value="Pie">Pie Chart</MenuItem>
                        <MenuItem value="Scatter">Scatter Plot</MenuItem>
                        <MenuItem value="Scorecard">Scorecard</MenuItem>
                      </Select>
                    </FormControl>

                    {['Bar', 'Line', 'Scatter'].includes(chartType) && (
                      <FormControl fullWidth>
                        <InputLabel>X-Axis</InputLabel>
                        <Select
                          value={x}
                          label="X-Axis"
                          onChange={(e) => setX(e.target.value)}
                        >
                          {headers.map((header, index) => (
                            <MenuItem key={index} value={index}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {['Bar', 'Line', 'Scatter'].includes(chartType) && (
                      <Autocomplete
                        multiple
                        options={headers.map((header, index) => ({ label: header, value: index }))}
                        onChange={handleChange}
                        getOptionLabel={(option) => option.label}
                        value={y}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Y-Axis" 
                            placeholder="Select one column"
                            helperText="Currently limited to one Y-axis selection"
                          />
                        )}
                      />
                    )}

                    {chartType === 'Pie' && (
                      <FormControl fullWidth>
                        <InputLabel>Categories</InputLabel>
                        <Select
                          value={x}
                          label="Categories"
                          onChange={(e) => {
                            setX(e.target.value);
                            // Set a random y value for Pie chart
                            const randomIndex = Math.floor(Math.random() * headers.length);
                            setY([{ label: headers[randomIndex], value: randomIndex }]);
                          }}
                        >
                          {headers.map((header, index) => (
                            <MenuItem key={index} value={index}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {chartType === 'Scorecard' && (
                      <FormControl fullWidth>
                        <InputLabel>Value</InputLabel>
                        <Select
                          value={singleValue}
                          label="Value"
                          onChange={(e) => {
                            setSingleValue(e.target.value);
                            // Set a random y value for Scorecard
                            const randomIndex = Math.floor(Math.random() * headers.length);
                            setY([{ label: headers[randomIndex], value: randomIndex }]);
                            setX(e.target.value); // For consistency with backend
                          }}
                        >
                          {headers.map((header, index) => (
                            <MenuItem key={index} value={index}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>

                  { x !== undefined && x !== '' && 
                    chartType !== '' && 
                    y && 
                    y.length > 0 && (
                    <Box sx={{ height: '400px', flex: 1 }}>
                      <Graph 
                        headers={headers} 
                        data={data} 
                        chartType={chartType} 
                        x={x} 
                        y={y.map(y => y.value)} 
                      />
                    </Box>
                  )}

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    mt: 'auto', 
                    pt: 2,
                    borderTop: '1px solid #eaeaea'
                  }}>
                    <Button
                      variant="contained"
                      onClick={handleAddTile}
                      sx={{
                        textTransform: 'none',
                        backgroundColor: '#2196f3',
                        '&:hover': {
                          backgroundColor: '#1976d2'
                        }
                      }}
                    >
                      Add Tile to Dashboard
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
            </TabContext>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default AddTilePage;