import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Tile from './Tile';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import apiClient from '../../../../services/api';
const GridLayout = WidthProvider(Responsive);

function Read_OnlyDash({ dashboardId, onNavigate, userEmail }) {
  //const { dashboardId } = useParams();
  const [currentLayout, setCurrentLayout] = useState([]);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [dashboard, setDashboard] = useState(null);
  const [tiles, setTiles] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
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
    

    if (dashboardId) {
      fetchDashboard();
    }
  }, [dashboardId]);

  // Generate layout from dashboard data
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
  if (!dashboard) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const tileStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '20px',
    height: 'calc(100% - 20px)',
    width: 'calc(100% - 20px)',
    position: 'relative',
    overflow: 'visible',
  };

  const returnToDashboard = () => {
    if (onNavigate) {
      onNavigate('landing');
    } else {
      window.location.href = 'http://localhost:3000/public-dashboards';
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
          onClick={returnToDashboard}
        >
          Return to Dashboard
        </Button>
      </Box>

      <GridLayout
        className="layout"
        layout={currentLayout}
        breakpoints={{ lg: 0 }}
        cols={{ lg: 12 }}
        rowHeight={100}
        onWidthChange={(width, margin, cols) => {
          setContainerWidth(width);
        }}
        compactType={null}
        preventCollision={false}
        isResizable={false}
        isDraggable={false}
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

export default Read_OnlyDash;
