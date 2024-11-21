import { useParams } from 'react-router-dom';
import { Box, Typography, Button, TextField } from '@mui/material';
import React, { useState, useEffect } from "react";
import Modal from '@mui/material/Modal';
import Tile from './Tile';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import axios from 'axios';
const ResponsiveGridLayout = WidthProvider(Responsive);

function SingleDashboard({dashboardId, onNavigate }) {
  //const { dashboardId } = useParams();

  const [tiles, setTiles] = useState([]);
  const [tileContent, setTileContent] = useState('');
  const [open, setOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [currentLayout, setCurrentLayout] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [layouts, setLayouts] = useState([]);
  
  // Find dashboard and layout
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`http://localhost:8000/dashboards?dashboard_id=${dashboardId}`);
        if (!response.ok) throw new Error('Failed to fetch dashboard');
        const data = await response.json();
        setDashboard(data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      }
    };

    if (dashboardId) {
      fetchDashboard();
    }
  }, [dashboardId]);

  useEffect(() => {
    if (dashboard?.graphs) {
      const generatedLayout = dashboard.graphs.map((graph) => ({
        i: String(graph.graph_id),
        x: graph.xy_coords?.[0] || 0,
        y: graph.xy_coords?.[1] || 0,
        w: graph.plotsize?.[0] || 4,
        h: graph.plotsize?.[1] || 4,
        minW: 2,
        minH: 2,
      }));
      console.log('Generated layout from graph coordinates:', generatedLayout);
      setCurrentLayout(generatedLayout);
      setTiles(dashboard.graphs);
    }
  }, [dashboard]);


  // Loading state
  if (!dashboard || !layouts) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Error state
  if (!dashboard) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography variant="h5">Dashboard not found</Typography>
        <Button 
          variant="contained" 
          onClick={() => onNavigate('landing')}
          sx={{ mt: 2 }}
        >
          Return to Dashboard List
        </Button>
      </Box>
    );
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addTile = () => {
    onNavigate('addTile', { dashboardId: dashboard.dashboard_id });
  };

  const returnDashboard = () => {
    onNavigate('landing');
  };

  const deleteTile = async (tile) => {
    try {
      const requestBody = {
        dashboard_id: dashboardId,
        graph_ids: [tile.graph_id],    
        xy_coords: [[tile.xy_coords[0], tile.xy_coords[1]]]     
      };

      await axios.delete('http://127.0.0.1:8000/dashboards', { data: requestBody });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to delete dashboard. Please try again.');
    }
  };

  const onLayoutChange = async (layout, allLayouts) => {
    // We receive the layout for all breakpoints, but we only want 'lg'
    const lgLayout = allLayouts.lg || layout;
    setCurrentLayout(lgLayout);

    try {
      const response = await fetch(`http://localhost:8000/dashboards/layout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dashboard_id: dashboard.dashboard_id,
          graph_ids: lgLayout.map(tile => tile.i),
          xy_coords: lgLayout.map(tile => [tile.x, tile.y]),
          width_height: lgLayout.map(tile => [tile.w, tile.h])
        })
      });
      if (!response.ok) throw new Error('Failed to update layout');
    } catch (error) {
      console.error('Failed to update layout:', error);
    }
    console.log("layouts", currentLayout);
  };

  const tileStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '20px',
    height: 'calc(100% - 20px)',
    width: 'calc(100% - 20px)',
    position: 'relative',
    overflow: 'visible',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Box className="dashboard-header" sx={{ mb: 3, borderRadius: '10px' }}>
        <Typography variant="h4" gutterBottom>
          {dashboard.dashboard_title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            className="custom-button"
            sx={{ backgroundColor: '#ffffff', color: '#1a237e' }}
            onClick={returnDashboard}
          >
            Return to Dashboard
          </Button>
          <Button 
            variant="contained" 
            className="custom-button"
            sx={{ backgroundColor: '#3949ab' }}
            onClick={handleOpen}
          >
            Add Tile
          </Button>
        </Box>
      </Box>

      <Modal 
        open={open} 
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            width: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #eaeaea',
            '& .MuiTextField-root': {
              marginTop: '24px',
              marginBottom: '24px',
            }
          }}
        >
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              color: '#1a1a1a',
              fontWeight: 600,
              marginBottom: '8px'
            }}
          >
            Add New Tile
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#666666',
              marginBottom: '16px'
            }}
          >
            Choose your visualization type
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter tile content"
            value={tileContent}
            onChange={(e) => setTileContent(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8f9fa',
                '&:hover fieldset': {
                  borderColor: '#2196f3',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2196f3',
                }
              }
            }}
          />

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2,
              marginTop: 3
            }}
          >
            <Button 
              variant="outlined" 
              onClick={handleClose}
              sx={{
                textTransform: 'none',
                borderColor: '#e0e0e0',
                color: '#666666',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e0e0e0'
                }
              }}
            >
              Cancel
            </Button>
            
            <Button 
              variant="contained" 
              onClick={addTile}
              sx={{
                textTransform: 'none',
                backgroundColor: '#2196f3',
                '&:hover': {
                  backgroundColor: '#1976d2'
                }
              }}
            >
              Create Tile
            </Button>
          </Box>
        </Box>
      </Modal>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: currentLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={(layout, layouts) => onLayoutChange(layout, layouts)}
        onWidthChange={(width, margin, cols) => {
          setContainerWidth(width);
        }}
        compactType={null}
        preventCollision={false}
        isResizable={true}
        isDraggable={true}
        margin={[20, 20]}
        containerPadding={[20, 20]}
        useCSSTransforms={true}
        draggableCancel=".cancelSelectorName"
      >
        {tiles.map((tile) => {
          const layoutItem = currentLayout.find(item => item.i === tile.graph_id.toString());
          const gridItemWidth = layoutItem ? (layoutItem.w / 12) * containerWidth : undefined;
          
          return (
            <Box 
              key={tile.graph_id} 
              sx={{
                ...tileStyle,
                position: 'relative',
                overflow: 'visible'
              }}
            >
              <Tile
                tile={tile}
                deleteTile={() => deleteTile(tile)}
                dashboardId={dashboard.dashboard_id}
                width={gridItemWidth-45}
                height={layoutItem ? layoutItem.h * 100: undefined}
                layoutItem={layoutItem}
              />
            </Box>
          );
        })}
      </ResponsiveGridLayout>
    </Box>
  );
}

export default SingleDashboard;