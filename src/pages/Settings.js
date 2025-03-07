import React from 'react';
import { Box, Typography, Button, Paper, Divider, TextField, FormControlLabel, Switch } from '@mui/material';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 3 }}>Settings</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>Path Settings</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Default Avatars Path" 
            fullWidth 
            defaultValue="D:/VRChat/Avatars" 
          />
          <TextField 
            label="Default Assets Path" 
            fullWidth 
            defaultValue="D:/VRChat/Assets" 
          />
          <TextField 
            label="Unity Editor Path" 
            fullWidth 
            defaultValue="C:/Program Files/Unity/Hub/Editor/2022.3.6f1/Editor/Unity.exe" 
          />
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>Appearance</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel 
            control={<Switch defaultChecked />} 
            label="Dark Mode" 
          />
          <FormControlLabel 
            control={<Switch defaultChecked />} 
            label="Show File Paths" 
          />
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>Backup Settings</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <TextField
            select
            label="Backup Frequency"
            defaultValue="weekly"
            fullWidth
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="manual">Manual Only</option>
          </TextField>
          <TextField 
            label="Backup Location" 
            fullWidth 
            defaultValue="D:/VRChat/Backups" 
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained">
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;