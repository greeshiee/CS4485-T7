import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import DashBoard from './DashBoard';
import apiClient from '../../../../services/api';
function PublicDashboards({ onNavigate = () => {} }) {
  const [publicDashboards, setPublicDashboards] = useState([]);

  useEffect(() => {
    const fetchPublicDashboards = async () => {
      try {
        const response = await apiClient.get('/dashboarding/public-dashboards');
        setPublicDashboards(response.data.dashboard_metadatas);
      } catch (error) {
        console.error('Error fetching public dashboards:', error);
      }
    };

    fetchPublicDashboards();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Public Dashboards
      </Typography>
      
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {publicDashboards.map(dashboard => (
          console.log(dashboard.dashboard_id),
          <DashBoard 
            key={dashboard.dashboard_id} 
            dashboard={dashboard} 
            onNavigate={null}
            permissionType="view"
            userEmail={null}
          />
        ))}
      </Box>
    </Box>
  );
}

export default PublicDashboards;
