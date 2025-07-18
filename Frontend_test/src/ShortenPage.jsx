// src/ShortenPage.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, List, ListItem, ListItemText } from '@mui/material';
import { log } from './logs';

export default function ShortenPage() {
  const [url, setUrl] = useState('');
  const [shortcode, setShortcode] = useState('');
  const [validity, setValidity] = useState(30);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  
  const MAX_URLS = 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if(results.length >= MAX_URLS) return setError('Max 5 URLs per session.');
    if(!/^https?:\/\/[^ "]+$/.test(url)) return setError('Enter valid URL');
    if(shortcode && !/^[a-zA-Z0-9]+$/.test(shortcode)) return setError('Shortcode: only letters/numbers');
    if(shortcode && shortcode.length > 20) return setError('Shortcode: max 20 chars');
    if(!Number.isInteger(Number(validity)) || validity < 1) return setError('Validity must be integer >0');

    // Logging attempt
    await log('frontend','info','component','Attempting to create short URL');

    try{
      const res = await fetch('http://localhost:3000/shorturls', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ url, validity, shortcode })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Failed');
      setResults([{ ...data, url, shortcode }, ...results]);
      setUrl(''); setShortcode(''); setValidity(30);

      // Logging success
      await log('frontend','info','component','Short URL created');
    }catch(err){
      setError(err.message);
      await log('frontend','error','component', err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 5 }}>
      <Typography variant="h4" gutterBottom>Shorten a URL</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Long URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          fullWidth margin="normal"
          required
        />
        <TextField
          label="Custom Shortcode (optional)"
          value={shortcode}
          onChange={e => setShortcode(e.target.value)}
          fullWidth margin="normal"
        />
        <TextField
          label="Validity (minutes)"
          type="number"
          value={validity}
          onChange={e => setValidity(e.target.value)}
          fullWidth margin="normal"
          required
        />
        <Button disabled={results.length>=MAX_URLS} type="submit" variant="contained" sx={{ mt: 2 }}>
          Shorten
        </Button>
      </form>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Typography variant="h6" sx={{ mt: 3 }}>Your Shortened URLs:</Typography>
      <List>
        {results.map((item, idx) => (
          <ListItem key={idx}>
            <ListItemText
              primary={<>
                <a>{item.shortLink}</a>
                <br />
                Expires: {new Date(item.expiry).toLocaleString()}
              </>}
              secondary={`Original: ${item.url}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
