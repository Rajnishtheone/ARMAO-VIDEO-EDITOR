import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';

function App() {
  const [ping, setPing] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/ping')
      .then(res => res.json())
      .then(data => setPing(data.message))
      .catch(() => setPing('Error connecting to backend'));
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>Video Editor</h1>
      <Button variant="contained" color="primary">Hello Material-UI</Button>
      <div style={{ marginTop: 24 }}>
        <strong>Backend says:</strong> {ping}
      </div>
    </div>
  );
}

export default App; 