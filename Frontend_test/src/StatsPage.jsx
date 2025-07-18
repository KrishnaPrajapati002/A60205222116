// src/StatsPage.js
import React, { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Collapse, Alert } from '@mui/material';
import { log } from './logs';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [shortcode, setShortcode] = useState('');
  const [error, setError] = useState('');
  const [expandedIdx, setExpandedIdx] = useState(null);

  const handleGetStats = async () => {
    setError('');
    if(!shortcode) {
      setError('Enter a shortcode to view stats.');
      return;
    }
    await log('frontend','info','component',`View stats for ${shortcode}`);
    try{
      const res = await fetch(`http://localhost:3000/shorturls/${shortcode}/stats`);
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Failed fetching stats');
      setStats(data);
      await log('frontend','info','component', 'Stats loaded');
    }catch(err){
      setError(err.message);
      setStats(null);
      await log('frontend','error','component', err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5 }}>
      <Typography variant="h4">Shortened URL Stats</Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <input
          style={{ flex: 1, fontSize: '1rem', padding: '0.5rem' }}
          value={shortcode}
          onChange={e => setShortcode(e.target.value)}
          placeholder="Enter shortcode"
        />
        <Button variant="contained" onClick={handleGetStats}>Get Stats</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {stats && (
        <Box sx={{ mt: 3 }}>
          <Typography>Shortened: <b>{shortcode}</b></Typography>
          <Typography>Original URL: <a href={stats.original_url} target="_blank" rel="noreferrer">{stats.original_url}</a></Typography>
          <Typography>Created: {new Date(stats.created).toLocaleString()}</Typography>
          <Typography>Expires: {new Date(stats.expiry).toLocaleString()}</Typography>
          <Typography>Total Clicks: <b>{stats.total_clicks}</b></Typography>
          
          <Typography variant="h6" sx={{ mt: 2 }}>Click Events:</Typography>
          <List>
            {stats.clicks.map((c, idx) => (
              <ListItem key={idx} sx={{ mb: 1 }}>
                <ListItemText
                  primary={`Timestamp: ${new Date(c.timestamp).toLocaleString()}`}
                  secondary={`Source: ${c.userAgent || 'N/A'}, IP: ${c.ip || 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
