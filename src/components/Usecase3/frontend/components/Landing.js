// Landing.js
import React, { useState, useEffect } from 'react';
import DashBoard from './DashBoard';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { Tabs, Tab } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import PublicIcon from '@mui/icons-material/Public';
import BadgeIcon from '@mui/icons-material/Badge';
import apiClient from '../../../../services/api';

const Landing = ({ onNavigate, userEmail }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('myDashboards');
  const [open, setOpen] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [ownedDashboards, setOwnedDashboards] = useState([]);
  const [editableDashboards, setEditableDashboards] = useState([]);
  const [viewOnlyDashboards, setViewOnlyDashboards] = useState([]);
  const [publicDashboards, setPublicDashboards] = useState([]);
  const [allUsersDashboards, setAllUsersDashboards] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300, // increase the width for better user input experience
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    p: 4,
  };
  const addDashboard = async () => {
    if (dashboardName.trim()) {
      try {
        const params = new URLSearchParams({
          dashboard_title: dashboardName,
          owner_email: userEmail
        });

        const requestBody = {
          graph_ids: [],
          xy_coords: [],
          width_height: []
        };

        const response = await apiClient.post(`/dashboarding/dashboards?${params.toString()}`, requestBody);
        const newDashboard = response.data;
        
        setDashboardName('');
        handleClose();
        onNavigate('singleDashboard', { dashboardId: newDashboard.dashboard_id });
      } catch (error) {
        console.error('Error creating dashboard:', error);
        alert('Failed to create dashboard. Please try again.');
      }
    }
  };

  const fetchDashboards = async () => {
    try {
      const mapResponse = await apiClient.get(`/dashboarding/dashboards/map?user_email=${userEmail}`);
      const dashboardMetadatas = mapResponse.data.dashboard_metadatas;
      console.log(dashboardMetadatas);
      setOwnedDashboards(dashboardMetadatas.filter(dash => 
        dash.permission_type === 'owner' && dash.created_by === userEmail
      ));
      console.log("owner: ", ownedDashboards);
      setEditableDashboards(dashboardMetadatas.filter(dash => dash.permission_type === 'edit'));
      setViewOnlyDashboards(dashboardMetadatas.filter(dash => dash.permission_type === 'view' && dash.access_level === 'private'));
      setPublicDashboards(dashboardMetadatas.filter(dash => dash.access_level === 'public')); 
      setAllUsersDashboards(dashboardMetadatas.filter(dash => dash.access_level === 'all_users'));
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      alert('Failed to load dashboards. Please try again.');
    }
  };

  const deleteDashboard = async (dashboardId) => {
    try {
      const requestBody = {
        dashboard_id: dashboardId,
        graph_ids: [],    // Empty to delete entire dashboard
        xy_coords: []       // Empty to delete entire dashboard
      };

      //const mapResponse = await apiClient.get(`/dashboarding/dashboards/map?user_email=${userEmail}`);
      await apiClient.delete('/dashboarding/dashboards', { data: requestBody });
      // Refresh the dashboard list after successful deletion
      fetchDashboards();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to delete dashboard. Please try again.');
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  const renderContent = () => {
    switch(selectedTab) {
      case 'myDashboards':
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '30px', color: '#1a1a1a' }}>
              My Dashboards
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {ownedDashboards.map(dashboard => (
                <DashBoard 
                  key={dashboard.dashboard_id} 
                  dashboard={dashboard} 
                  deleteDashboard={deleteDashboard}
                  onNavigate={onNavigate}
                  permissionType={dashboard.permission_type}
                  userEmail={userEmail}
                />
              ))}
            </Box>
          </Box>
        );

      case 'shared':
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '30px', color: '#1a1a1a' }}>
              Shared with Me
            </Typography>
            
            {/* Can Edit Section */}
            {editableDashboards.length > 0 && (
              <Box sx={{ marginBottom: '40px' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 500, 
                    marginBottom: '16px',
                    color: '#2196f3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <EditIcon fontSize="small" />
                  Can Edit
                </Typography>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  {editableDashboards.map(dashboard => (
                    <DashBoard 
                      key={dashboard.dashboard_id} 
                      dashboard={dashboard} 
                      deleteDashboard={null}
                      onNavigate={onNavigate}
                      permissionType={dashboard.permission_type}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* View Only Section */}
            {viewOnlyDashboards.length > 0 && (
              <Box>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 500, 
                    marginBottom: '16px',
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                  View Only
                </Typography>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  {viewOnlyDashboards.map(dashboard => (
                    <DashBoard 
                      key={dashboard.dashboard_id} 
                      dashboard={dashboard} 
                      deleteDashboard={null}
                      onNavigate={onNavigate}
                      permissionType={dashboard.permission_type}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {editableDashboards.length === 0 && viewOnlyDashboards.length === 0 && (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  textAlign: 'center',
                  padding: '20px'
                }}
              >
                No dashboards have been shared with you yet.
              </Typography>
            )}
          </Box>
        );

      case 'public':
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '30px', color: '#1a1a1a' }}>
              Public Dashboards
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {publicDashboards.map(dashboard => (
                <DashBoard 
                  key={dashboard.dashboard_id} 
                  dashboard={dashboard} 
                  deleteDashboard={null}
                  onNavigate={onNavigate}
                  permissionType="view"
                  userEmail={userEmail}
                />
              ))}
              {publicDashboards.length === 0 && (
                <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                  No public dashboards available.
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 'allUsers':
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '30px', color: '#1a1a1a' }}>
              Internal Dashboards
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {allUsersDashboards.map(dashboard => (
                <DashBoard 
                  key={dashboard.dashboard_id} 
                  dashboard={dashboard} 
                  deleteDashboard={null}
                  onNavigate={onNavigate}
                  permissionType="view"
                  userEmail={userEmail}
                />
              ))}
              {allUsersDashboards.length === 0 && (
                <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                  No dashboards available.
                </Typography>
              )}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#ffffff' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '250px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          padding: '20px',
        }}
      >
        {/* Logo */}
        <Box sx={{ padding: '20px 0', marginBottom: '30px' }}>
          <Typography variant="h6" sx={{ color: '#1a1a1a' }}>
            Dashboard
          </Typography>
        </Box>

        {/* Navigation Menu */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            startIcon={<DashboardIcon />}
            sx={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              textTransform: 'none',
              color: '#1a1a1a',
              backgroundColor: selectedTab === 'myDashboards' ? '#f0f7ff' : 'transparent',
              '&:hover': {
                backgroundColor: '#f0f7ff'
              }
            }}
            onClick={() => setSelectedTab('myDashboards')}
          >
            My Dashboards
          </Button>
          <Button
            startIcon={<ShareIcon />}
            sx={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              textTransform: 'none',
              color: '#1a1a1a',
              backgroundColor: selectedTab === 'shared' ? '#f0f7ff' : 'transparent',
              '&:hover': {
                backgroundColor: '#f0f7ff'
              }
            }}
            onClick={() => setSelectedTab('shared')}
          >
            Shared with Me
          </Button>
          <Button
            startIcon={<PublicIcon />}
            sx={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              textTransform: 'none',
              color: '#1a1a1a',
              backgroundColor: selectedTab === 'public' ? '#f0f7ff' : 'transparent',
              '&:hover': { backgroundColor: '#f0f7ff' }
            }}
            onClick={() => setSelectedTab('public')}
          >
            Public Dashboards
          </Button>
          <Button
            startIcon={<BadgeIcon />}
            sx={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              textTransform: 'none',
              color: '#1a1a1a',
              backgroundColor: selectedTab === 'allUsers' ? '#f0f7ff' : 'transparent',
              '&:hover': { backgroundColor: '#f0f7ff' }
            }}
            onClick={() => setSelectedTab('allUsers')}
          >
            Internal Dashboards
          </Button>
          <Button
            startIcon={<AddIcon />}
            sx={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              textTransform: 'none',
              color: '#1a1a1a',
              '&:hover': {
                backgroundColor: '#f0f7ff'
              }
            }}
            onClick={handleOpen}
          >
            Add Dashboard
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        backgroundColor: '#f8f9fa',
        padding: '30px',
        overflowY: 'auto'
      }}>
        <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
          {renderContent()}
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
            Create New Dashboard
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#666666',
              marginBottom: '16px'
            }}
          >
            Enter a name for your new dashboard
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Dashboard name"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
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
              onClick={addDashboard}
              sx={{
                textTransform: 'none',
                backgroundColor: '#2196f3',
                '&:hover': {
                  backgroundColor: '#1976d2'
                }
              }}
            >
              Create Dashboard
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Landing;