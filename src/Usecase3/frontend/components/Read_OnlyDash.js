import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Tile from './Tile';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

function Read_OnlyDash({ dashboardId, onNavigate }) {
  //const { dashboardId } = useParams();
  const [currentLayout, setCurrentLayout] = useState([]);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [dashboard, setDashboard] = useState(null);
  const [tiles, setTiles] = useState([]);

  // Fetch dashboard data
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
      console.log('Generated layout from graph coordinates:', generatedLayout);
      setCurrentLayout(generatedLayout);
      setTiles(dashboard.graphs);
    }
  }, [dashboard]);

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
    onNavigate('landing');
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Box className="dashboard-header" sx={{ mb: 3, borderRadius: '10px' }}>
        <Typography variant="h4" gutterBottom>
          {dashboard.dashboard_title}
        </Typography>
        
        <Button 
          variant="contained" 
          className="custom-button"
          sx={{ backgroundColor: '#ffffff', color: '#1a237e' }}
          onClick={returnToDashboard}
        >
          Return to Dashboard
        </Button>
      </Box>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: currentLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        margin={[20, 20]}
        containerPadding={[20, 20]}
        isDraggable={false}
        isResizable={false}
        onWidthChange={(width) => setContainerWidth(width)}
        useCSSTransforms={true}
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

export default Read_OnlyDash;
