import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShareIcon from '@mui/icons-material/Share';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import Read_OnlyDash from './Read_OnlyDash';  // adjust the import path as needed
import ReactDOM from 'react-dom';
import BadgeIcon from '@mui/icons-material/Badge';
import apiClient from '../../../../services/api';

// Add this helper function at the top of the file, before the DashBoard component
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

function DashBoard({ dashboard, deleteDashboard, onNavigate, permissionType, userEmail }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [managePermissionsOpen, setManagePermissionsOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [accessLevelModalOpen, setAccessLevelModalOpen] = useState(false);
  const [currentAccessLevel, setCurrentAccessLevel] = useState(dashboard.access_level || 'private');
  const [confirmAccessChange, setConfirmAccessChange] = useState(false);
  const [pendingAccessLevel, setPendingAccessLevel] = useState(null);

  const viewDashboard = (e) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate('readOnlyDash', { dashboardId: dashboard.dashboard_id });
    } else {
      const root = document.getElementById('root');
      ReactDOM.render(
        <Read_OnlyDash dashboardId={dashboard.dashboard_id} />,
        root
      );
    }
  };

  const editDashboard = (e) => {
    e.stopPropagation();
    onNavigate('singleDashboard', { dashboardId: dashboard.dashboard_id });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (deleteDashboard) {
      deleteDashboard(dashboard.dashboard_id);
    }
  };

  const handleShare = async () => {
    try {
      //make sure the format of the email is valid
      if (!isValidEmail(shareEmail)) {
        alert('Please enter a valid email address.');
        return;
      }
      
      if (shareEmail === userEmail) {
        alert('You cannot share a dashboard with yourself.');
        return;
      }
      const requestBody = {
        dashboard_id: dashboard.dashboard_id,
        permissions: [
          {
            user_email: shareEmail,
            permission_type: sharePermission
          }
        ],
        requester_email: userEmail
      };

      const response = await apiClient.put(
        '/dashboarding/dashboards/permissions',
        requestBody  // Send the properly structured request body
      );
      
      if (response.data.status === 'success') {
        setShareModalOpen(false);
        setShareEmail('');
        setSharePermission('view');
        //alert('Dashboard shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing dashboard:', error);
      alert('Failed to share dashboard. Please try again.');
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await apiClient.get(
        `/dashboarding/dashboards/${dashboard.dashboard_id}/permissions?requester_email=${userEmail}`
      );
      setCurrentPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      alert('Failed to fetch permissions');
    }
  };

  const handleDeletePermission = async (emailToDelete) => {
    try {
      await apiClient.delete('/dashboarding/dashboards/permissions', {
        data: {
          dashboard_id: dashboard.dashboard_id,
          user_email: emailToDelete,
          requester_email: userEmail
        }
      });
      
      fetchPermissions();
      alert('Permission deleted successfully');
    } catch (error) {
      console.error('Error deleting permission:', error);
      alert('Failed to delete permission');
    }
  };

  const handleAccessLevelChangeRequest = (newLevel) => {
    setPendingAccessLevel(newLevel);
    setConfirmAccessChange(true);
  };

  const handleAccessLevelUpdate = async (newLevel) => {
    try {
      const response = await apiClient.put(
        '/dashboarding/dashboards/access-level',
        {
          dashboard_id: dashboard.dashboard_id,
          access_level: newLevel,
          requester_email: userEmail
        }
      );
      
      if (response.data.status === 'success') {
        setCurrentAccessLevel(newLevel);
        setAccessLevelModalOpen(false);
        setConfirmAccessChange(false);
        setPendingAccessLevel(null);
      }
      window.location.href = window.location.pathname;
    } catch (error) {
      console.error('Error updating access level:', error);
      alert('Failed to update access level. Please try again.');
    }
  };

  const getAccessLevelIcon = () => {
    switch (currentAccessLevel) {
      case 'public':
        return <PublicIcon sx={{ color: 'var(--text-primary)' }} />;
      case 'all_users':
        return <BadgeIcon sx={{ color: 'var(--text-primary)' }} />;
      default:
        return <LockIcon sx={{ color: 'var(--text-primary)' }} />;
    }
  };

  useEffect(() => {
    if (managePermissionsOpen) {
      fetchPermissions();
    }
  }, [managePermissionsOpen]);

  return (
    <Box
      onClick={viewDashboard}
      className="dashboard-card"
      sx={{
        padding: '24px',
        marginBottom: 3,
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '300px',
        width: '300px',
        position: 'relative',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px) skew(-1deg)',
          boxShadow: '0 8px 16px rgba(26,35,126,0.2)'
        }
      }}
    >
      {/* Access Control Buttons */}
      {(permissionType === 'owner' || permissionType === 'OWNER') && (
      <Box sx={{ 
        width: '100%',
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: 1,
        height: '40px',  // Fixed height for the buttons container
        marginBottom: '20px'  // Space between buttons and content
      }}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setAccessLevelModalOpen(true);
          }}
          title={`Access: ${currentAccessLevel}`}
          size="small"
        >
          {getAccessLevelIcon()}
        </IconButton>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setShareModalOpen(true);
          }}
          title={`Share Dashboard`}
          size="small"
        >
          <ShareIcon />
        </IconButton>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setManagePermissionsOpen(true);
          }}
          title={`Shared with ${(currentPermissions.length)-1} users`}
          size="small"
        >
          <PeopleIcon />
          </IconButton>
        </Box>
      )}

      {/* Content Container */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,  // Consistent spacing between elements
        flex: 1,
        justifyContent: 'center',
        width: '100%'
      }}>
        {/* Icon Container */}
        <Box 
          sx={{ 
            backgroundColor: 'rgba(26,35,126,0.08)',
            borderRadius: '8px',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            transition: 'all 0.3s ease',
            transform: 'skew(-3deg)',
            '&:hover': {
              backgroundColor: 'rgba(26,35,126,0.15)',
              transform: 'skew(-5deg)'
            }
          }}
        >
          <DashboardIcon 
            sx={{ 
              fontSize: 40,
              color: '#1a237e'
            }} 
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            color: '#1a237e',
            fontSize: '1.8rem',  // Slightly reduced font size
            position: 'relative',
            display: 'inline-block',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(180deg, transparent 65%, rgba(26,35,126,0.15) 65%)',
            padding: '0 10px',
            borderRadius: '4px',
            transform: 'skew(-3deg)',
            textAlign: 'center',
            maxWidth: '90%',  // Prevent text from overflowing
            wordWrap: 'break-word',
            '&:hover': {
              background: 'linear-gradient(180deg, transparent 65%, rgba(26,35,126,0.25) 65%)',
              transition: 'all 0.3s ease'
            }
          }}
        >
          {dashboard.dashboard_title}
        </Typography>

        {/* Action Buttons */}
        {deleteDashboard && (permissionType === 'owner' || permissionType === 'OWNER') && (
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2,
              justifyContent: 'center',
              width: '100%',
              marginTop: 'auto'
            }}
          >
            <Button 
              variant="contained" 
              className="custom-button"
              sx={{ 
                backgroundColor: '#1a237e',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#000051',
                  transform: 'skew(-3deg)',
                },
                padding: '10px 20px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
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
        {!deleteDashboard && permissionType === 'edit' && (
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
                backgroundColor: '#1a237e',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#000051',
                  transform: 'skew(-3deg)',
                },
                padding: '10px 20px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
              onClick={editDashboard}
            >
              Edit
            </Button>
          </Box>
        )}
      </Box>

      {/* Share Modal */}
      <Modal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onClick={(e) => e.stopPropagation()}
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
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Share Dashboard
          </Typography>
          
          <TextField
            fullWidth
            label="Email Address"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            select
            label="Permission Type"
            value={sharePermission}
            onChange={(e) => setSharePermission(e.target.value)}
            sx={{ mb: 3 }}
          >
            <MenuItem value="view">View Only</MenuItem>
            <MenuItem value="edit">Can Edit</MenuItem>
          </TextField>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={(e) => {
                e.stopPropagation();
                setShareModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              disabled={!shareEmail}
            >
              Share
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add new Manage Permissions Modal */}
      <Modal
        open={managePermissionsOpen}
        onClose={() => setManagePermissionsOpen(false)}
        onClick={(e) => e.stopPropagation()}
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
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Manage Permissions
          </Typography>
          
          {currentPermissions.length === 0 ? (
            <Typography color="text.secondary">
              No shared permissions
            </Typography>
          ) : (
            <List>
              {currentPermissions.map((permission) => (
                <ListItem
                  key={permission.user_email}
                  secondaryAction={
                    permission.permission_type !== 'owner' && (
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDeletePermission(permission.user_email)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={permission.user_email}
                    secondary={`Permission: ${permission.permission_type}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={(e) => {
                e.stopPropagation();
                setManagePermissionsOpen(false);
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add Access Level Modal */}
      <Modal
        open={accessLevelModalOpen}
        onClose={() => setAccessLevelModalOpen(false)}
        onClick={(e) => e.stopPropagation()}
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
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Update Access Level
          </Typography>
          
          <List>
            <ListItem 
              button 
              onClick={() => handleAccessLevelChangeRequest('private')}
              selected={currentAccessLevel === 'private'}
            >
              <ListItemText 
                primary="Private" 
                secondary="Only shared users can access"
                sx={{ mr: 2 }}
              />
              <LockIcon />
            </ListItem>
            
            <ListItem 
              button 
              onClick={() => handleAccessLevelChangeRequest('all_users')}
              selected={currentAccessLevel === 'all_users'}
            >
              <ListItemText 
                primary="All Users" 
                secondary="All authenticated users can access"
                sx={{ mr: 2 }}
              />
              <BadgeIcon />
            </ListItem>
            
            <ListItem 
              button 
              onClick={() => handleAccessLevelChangeRequest('public')}
              selected={currentAccessLevel === 'public'}
            >
              <ListItemText 
                primary="Public" 
                secondary="Anyone can access"
                sx={{ mr: 2 }}
              />
              <PublicIcon />
            </ListItem>
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={(e) => {
                e.stopPropagation();
                setAccessLevelModalOpen(false);
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Confirm Access Level Change Modal */}
      <Modal
        open={confirmAccessChange}
        onClose={() => setConfirmAccessChange(false)}
        onClick={(e) => e.stopPropagation()}
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
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Confirm Access Level Change
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Are you sure you want to change the access level to {pendingAccessLevel === 'all_users' ? 'ALL USERS' : pendingAccessLevel}?
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={(e) => {
                e.stopPropagation();
                setConfirmAccessChange(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={(e) => {
                e.stopPropagation();
                handleAccessLevelUpdate(pendingAccessLevel);
              }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>

    </Box>
  );
}

export default DashBoard;
