import React, {useState, useEffect, useRef } from "react";
import axios from 'axios';
import Graph from './Graph'; 
import { 
  Box, 
  Button, 
  IconButton, 
  Modal, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Tile({ tile, deleteTile, dashboardId, width, height }) {
  const [headers, setHeaders] = useState([]);
  const defaultFilters = Array.isArray(tile?.filters) ? tile.filters : [];
  const [filters, setFilters] = useState(defaultFilters);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [filterRange, setFilterRange] = useState({ min: '', max: '' });
  const [showManageFiltersModal, setShowManageFiltersModal] = useState(false);
  const tileRef = useRef(null);
  const [showActions, setShowActions] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [openManageModal, setOpenManageModal] = useState(false);


  // useEffect(() => {
  //   const fetchdata = async () => {
  //   try {
  //     // Assuming your backend has a GET /tables endpoint to retrieve saved tables
  //     const response = await axios.get(`http://127.0.0.1:8000/get_column/${tile.filename}`);
  //       setData(response.data.rows); // Assuming response contains a list of tables
  //       setHeaders(response.data.headers);
  //   } catch (error) {
  //     console.error('Error fetching table data:', error);
  //   }
  //   };

  //   fetchdata();
  // }, []);

  useEffect(() => {
    const filterKey = `filters_${dashboardId}_${tile.graph_id}`;
    const savedFilters = localStorage.getItem(filterKey);
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, [dashboardId, tile.graph_id]);

  const getColumnType = (column) => {
    if (!tile.rows) return 'string';
    const value = tile.rows[0][0];
    if (!isNaN(value)) return 'number';
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  };

  const handleAddFilter = () => {
    setShowFilterModal(true);
  };

  const updateTileFilters = (newFilters) => {
    // Update local state
    setFilters(newFilters);
    
    // Create a unique key for this tile's filters
    const filterKey = `filters_${dashboardId}_${tile.graph_id}`;
    
    // Store the filters in localStorage
    localStorage.setItem(filterKey, JSON.stringify(newFilters));
  };

  const applyFilter = () => {
    if (!Array.isArray(filters)) return; // Guard clause
    
    const newFilter = {
      column: selectedColumn,
      type: getColumnType(selectedColumn),
      ...(getColumnType(selectedColumn) === 'string' 
        ? { value: filterValue }
        : { range: filterRange }
      )
    };

    const updatedFilters = [...filters, newFilter];
    updateTileFilters(updatedFilters);
    
    // Reset filter modal
    setSelectedColumn('');
    setFilterValue('');
    setFilterRange({ min: '', max: '' });
    setOpenFilterModal(false);
  };

  const renderFilterInput = () => {
    const type = getColumnType(selectedColumn);
    
    switch(type) {
      case 'number':
        return (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Min"
              value={filterRange.min}
              onChange={(e) => setFilterRange({...filterRange, min: e.target.value})}
              size="small"
            />
            <TextField
              fullWidth
              type="number"
              label="Max"
              value={filterRange.max}
              onChange={(e) => setFilterRange({...filterRange, max: e.target.value})}
              size="small"
            />
          </Box>
        );
      case 'date':
        return (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={filterRange.min}
              onChange={(e) => setFilterRange({...filterRange, min: e.target.value})}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={filterRange.max}
              onChange={(e) => setFilterRange({...filterRange, max: e.target.value})}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Box>
        );
      default:
        return (
          <TextField
            fullWidth
            label="Filter Value"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            sx={{ mt: 2 }}
            size="small"
          />
        );
    }
  };

  const removeFilter = (indexToRemove) => {
    if (!Array.isArray(filters)) return;
    const updatedFilters = filters.filter((_, index) => index !== indexToRemove);
    updateTileFilters(updatedFilters);
    
    // If no filters remain, remove the entry from localStorage
    if (updatedFilters.length === 0) {
      const filterKey = `filters_${dashboardId}_${tile.graph_id}`;
      localStorage.removeItem(filterKey);
    }
  };

  // Calculate graph dimensions, accounting for padding and controls
  const graphWidth = width ? width - 20 : 400;  // Subtract padding
  const graphHeight = height ? height - 60 : 300;  // Subtract space for controls
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%'
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action Buttons Container */}
      {showActions && (
        <Box
        className="cancelSelectorName"
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            display: 'flex',
            gap: 1,
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '4px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              setOpenFilterModal(true);
            }}
            sx={{
              minWidth: 'auto',
              padding: '4px 8px',
              backgroundColor: '#2196f3',
              '&:hover': {
                backgroundColor: '#1976d2'
              }
            }}
          >
            Add Filter
          </Button>
          
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              setOpenManageModal(true);
            }}
            sx={{
              minWidth: 'auto',
              padding: '4px 8px',
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#388e3c'
              }
            }}
          >
            Manage Filters
          </Button>
          {deleteTile && (
            <IconButton
              size="small"
              onClick={deleteTile}  // Direct prop usage, no wrapper function needed
              sx={{
                backgroundColor: '#ff5252',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#d32f2f'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}

      {/* Graph Content */}
      <Box sx={{ 
        height: '100%', 
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <Graph
          headers={tile.ax}
          data={tile.rows}
          chartType={tile.graph_type}
          x={0}
          y={[1]}
          filters={filters}
          width={graphWidth}
          height={graphHeight}
        />
      </Box>

      {/* Add Filter Modal */}
      <Modal
        open={openFilterModal}
        onClose={() => setOpenFilterModal(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Add Filter</Typography>
          
          <FormControl fullWidth>
            <InputLabel>Select Column</InputLabel>
            <Select
              value={selectedColumn}
              label="Select Column"
              onChange={(e) => setSelectedColumn(e.target.value)}
            >
              <MenuItem value={tile.ax[0]}>{tile.ax[0]}</MenuItem>
            </Select>
          </FormControl>

          {selectedColumn !== '' && renderFilterInput()}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button onClick={() => setOpenFilterModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={applyFilter}>Add Filter</Button>
          </Box>
        </Box>
      </Modal>

      {/* Manage Filters Modal */}
      <Modal
        open={openManageModal}
        onClose={() => setOpenManageModal(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Manage Filters</Typography>
          
          {(!Array.isArray(filters) || filters.length === 0) ? (
            <Typography color="text.secondary">No filters applied</Typography>
          ) : (
            <List>
              {filters.map((filter, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={headers[filter.column]}
                    secondary={
                      filter.type === 'string'
                        ? `Value: ${filter.value}`
                        : `Range: ${filter.range.min || 'Min'} - ${filter.range.max || 'Max'}`
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => removeFilter(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={() => setOpenManageModal(false)}>Close</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default Tile;

