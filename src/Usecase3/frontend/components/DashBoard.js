import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from "react-router-dom";
import DashboardIcon from '@mui/icons-material/Dashboard'; // Import dashboard icon

function DashBoard({ dashboard, deleteDashboard }) {
  const navigate = useNavigate();

  const viewDashboard = (e) => {
    e.stopPropagation();
    navigate(`/UC3/read_only/${dashboard.dashboard_id}`); 
  };

  const editDashboard = (e) => {
    e.stopPropagation();
    navigate(`/UC3/${dashboard.dashboard_id}`); 
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (deleteDashboard) {
      deleteDashboard(dashboard.dashboard_id);
    }
  };


  return (
    <Box 
      onClick={viewDashboard}
      className="dashboard-card"
      sx={{
        padding: 4,
        marginBottom: 3,
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '250px',
        width: '300px', // Fixed width for tile-like appearance
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 25px rgba(180,212,255,0.5)'
        }
      }}
    >
      {/* Icon Container */}
      <Box 
        sx={{ 
          backgroundColor: 'var(--pastel-primary)',
          borderRadius: '50%',
          padding: 2,
          marginBottom: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'var(--pastel-secondary)'
          }
        }}
      >
        <DashboardIcon 
          sx={{ 
            fontSize: 40,
            color: 'var(--text-primary)'
          }} 
        />
      </Box>

      {/* Title */}
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3,
          color: 'var(--text-primary)',
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.3
        }}
      >
        {dashboard.dashboard_title}
      </Typography>

      {/* Action Buttons */}
      {deleteDashboard && (
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2,
            justifyContent: 'center',
            width: '100%',
            marginTop: 'auto' // Push buttons to bottom
          }}
        >
          <Button 
            variant="contained" 
            className="custom-button"
            sx={{ 
              backgroundColor: 'var(--pastel-secondary)',
              color: 'var(--text-primary)',
              flex: 1,
              maxWidth: '120px',
              '&:hover': {
                backgroundColor: 'var(--pastel-accent)',
                color: '#ffffff'
              }
            }}
            onClick={editDashboard}
          >
            Edit
          </Button>

          <Button 
            variant="contained" 
            className="custom-button"
            sx={{ 
              backgroundColor: 'var(--pastel-danger)',
              color: 'var(--text-primary)',
              flex: 1,
              maxWidth: '120px',
              '&:hover': {
                backgroundColor: '#ff8080',
                color: '#ffffff'
              }
            }}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default DashBoard;
