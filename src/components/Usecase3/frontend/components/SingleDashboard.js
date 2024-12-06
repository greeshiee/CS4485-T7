import { useParams } from 'react-router-dom';
import { Box, Typography, Button, TextField } from '@mui/material';
import React, { useState, useEffect } from "react";
import Modal from '@mui/material/Modal';
import Tile from './Tile';
import { WidthProvider, Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import axios from 'axios';
import apiClient from '../../../../services/api';
const GridLayout = WidthProvider(Responsive);

function SingleDashboard({dashboardId, onNavigate, userEmail }) {
  //const { dashboardId } = useParams();

  const [tiles, setTiles] = useState([]);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [currentLayout, setCurrentLayout] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [layouts, setLayouts] = useState([]);
  
  // Find dashboard and layout
  useEffect(() => {
    if (dashboardId) {
      fetchDashboard();
    }
  }, [dashboardId]);

  const fetchDashboard = async () => {
  try {
    const response = await apiClient.get('/dashboarding/dashboards', {
      params: {
        dashboard_id: dashboardId,
        user_email: userEmail,
      },
    });
    const data = response.data;
    setDashboard(data);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
  }
};


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
      setCurrentLayout(generatedLayout);
      setTiles(dashboard.graphs);

      // Add this: Trigger a window resize event after layout changes
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, [dashboard, containerWidth]);


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

      await apiClient.delete('/dashboarding/dashboards', { data: requestBody });
      fetchDashboard();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to delete dashboard. Please try again.');
    }
  };

  const onLayoutChange = async (layout) => {
    setCurrentLayout(layout);
  
    try {
      await apiClient.put('/dashboarding/dashboards/layout', {
        dashboard_id: dashboard.dashboard_id,
        graph_ids: layout.map((tile) => tile.i),
        xy_coords: layout.map((tile) => [tile.x, tile.y]),
        width_height: layout.map((tile) => [tile.w, tile.h]),
      });
    } catch (error) {
      console.error('Failed to update layout:', error);
    }
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
      <Box className="dashboard-header" sx={{ 
        mb: 3, 
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            margin: 0,
            fontWeight: 700,
            color: '#1a237e',
            fontSize: '2.2rem',
            position: 'relative',
            display: 'inline-block',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(180deg, transparent 65%, rgba(26,35,126,0.15) 65%)',
            padding: '0 10px',
            borderRadius: '4px',
            transform: 'skew(-3deg)',
            '&:hover': {
              background: 'linear-gradient(180deg, transparent 65%, rgba(26,35,126,0.25) 65%)',
              transition: 'all 0.3s ease'
            }
          }}
        >
          {dashboard.dashboard_title}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center' 
        }}>
          <Button 
            variant="outlined" 
            className="custom-button"
            sx={{ 
              borderColor: '#1a237e',
              color: '#1a237e',
              '&:hover': {
                backgroundColor: '#1a237e15',
                borderColor: '#000051',
              },
              padding: '10px 20px',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={returnDashboard}
          >
            Return to Dashboard
          </Button>
          <Button 
            variant="contained" 
            className="custom-button"
            sx={{ 
              backgroundColor: '#1a237e',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#000051',
              },
              padding: '10px 20px',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={addTile}
          >
            Add Tile
          </Button>
        </Box>
      </Box>



      <GridLayout
        className="layout"
        layout={currentLayout}
        breakpoints={{ lg: 0 }}
        cols={{ lg: 12 }}
        rowHeight={100}
        onLayoutChange={(layout) => onLayoutChange(layout)}
        onWidthChange={(width, margin, cols) => {
          setContainerWidth(width);
        }}
        compactType={null}
        preventCollision={true}
        isResizable={true}
        isDraggable={true}
        margin={[20, 20]}
        containerPadding={[20, 20]}
        useCSSTransforms={true}
        draggableCancel=".cancelSelectorName"
      >
        {tiles.map((tile) => {
          const layoutItem = currentLayout.find(item => item.i === tile.graph_id.toString());
          const gridItemWidth = layoutItem ? (layoutItem.w / 12) * containerWidth - 40 : undefined;
          const gridItemHeight = layoutItem ? layoutItem.h * 100 - 40 : undefined;
          
          return (
            <Box 
              key={tile.graph_id} 
              sx={{
                ...tileStyle,
                position: 'relative',
                overflow: 'hidden',
                padding: '10px',
              }}
              data-grid={{
                i: String(tile.graph_id),
                x: tile.xy_coords[0],
                y: tile.xy_coords[1],
                w: tile.plotsize[0],
                h: tile.plotsize[1],
              }}
            >
              <Tile
                tile={tile}
                deleteTile={() => deleteTile(tile)}
                dashboardId={dashboard.dashboard_id}
                width={gridItemWidth}
                height={gridItemHeight}
              />
            </Box>
          );
        })}
      </GridLayout>
    </Box>
  );
}

export default SingleDashboard;