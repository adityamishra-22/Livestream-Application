import React, { useState, useEffect } from 'react';
import './App.css'; // Import your CSS file
import Axios from 'axios'; // Import Axios for HTTP requests

function App() {
  // State to manage video playback
  const [isPlaying, setIsPlaying] = useState(false);

  // State to manage overlays
  const [overlays, setOverlays] = useState([]);

  // State for overlay form input
  const [overlayInput, setOverlayInput] = useState({
    content: '',
    positionX: 50,
    positionY: 50,
    width: 100,
    height: 50,
  });

  // Function to toggle video playback
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Function to fetch overlays from the Flask backend
  useEffect(() => {
    Axios.get('/api/overlays') // Replace with your API endpoint
      .then((response) => {
        setOverlays(response.data);
      })
      .catch((error) => {
        console.error('Error fetching overlays:', error);
      });
  }, []); // The empty dependency array ensures this effect runs only once on component mount

  // Function to add a new overlay
  const addOverlay = () => {
    Axios.post('/api/overlays', overlayInput) // Replace with your API endpoint
      .then((response) => {
        // Update the overlays state with the newly created overlay
        setOverlays([...overlays, response.data.overlay]);
        // Clear the form input
        setOverlayInput({
          content: '',
          positionX: 50,
          positionY: 50,
          width: 100,
          height: 50,
        });
      })
      .catch((error) => {
        console.error('Error adding overlay:', error);
      });
  };

  // Function to delete an overlay by ID
  const deleteOverlay = (overlayId) => {
    Axios.delete(`/api/overlays/${overlayId}`) // Replace with your API endpoint
      .then(() => {
        // Remove the deleted overlay from the overlays state
        const updatedOverlays = overlays.filter((overlay) => overlay.id !== overlayId);
        setOverlays(updatedOverlays);
      })
      .catch((error) => {
        console.error('Error deleting overlay:', error);
      });
  };

  // Function to update overlay content, position, or size
  const updateOverlay = (overlayId, updatedOverlay) => {
    Axios.put(`/api/overlays/${overlayId}`, updatedOverlay) // Replace with your API endpoint
      .then((response) => {
        // Update the overlays state with the updated overlay
        const updatedOverlays = overlays.map((overlay) => {
          if (overlay.id === overlayId) {
            return response.data.overlay;
          }
          return overlay;
        });
        setOverlays(updatedOverlays);
      })
      .catch((error) => {
        console.error('Error updating overlay:', error);
      });
  };

  // URL of the RTSP stream (replace with your actual URL)
  const videoURL = 'rtsp://zephyr.rtsp.stream/movie?streamKey=9cd4f37df5c11434c6ff024e93d9cfa0';

  return (
    <div className="App">
      <header className="header">
        <h1>Live Video Stream</h1>
      </header>
      <div className="video-container">
        <video
          src={videoURL}
          controls
          autoPlay
          muted
          style={{ width: '100%' }}
        ></video>
        <div className="video-overlay">
          {overlays.map((overlay) => (
            <div
              key={overlay.id}
              style={{
                position: 'absolute',
                left: `${overlay.position.x}%`,
                top: `${overlay.position.y}%`,
                width: `${overlay.size.width}%`,
                height: `${overlay.size.height}%`,
              }}
            >
              {overlay.content}
              <button onClick={() => deleteOverlay(overlay.id)}>Delete</button>
            </div>
          ))}

          {/* Overlay customization form */}
          <div className="overlay-form">
            <h2>Add Overlay</h2>
            <input
              type="text"
              placeholder="Overlay Text"
              value={overlayInput.content}
              onChange={(e) => setOverlayInput({ ...overlayInput, content: e.target.value })}
            />
            <div>
              Position X: 
              <input
                type="number"
                value={overlayInput.positionX}
                onChange={(e) => setOverlayInput({ ...overlayInput, positionX: e.target.value })}
              />
              Position Y: 
              <input
                type="number"
                value={overlayInput.positionY}
                onChange={(e) => setOverlayInput({ ...overlayInput, positionY: e.target.value })}
              />
            </div>
            <div>
              Width: 
              <input
                type="number"
                value={overlayInput.width}
                onChange={(e) => setOverlayInput({ ...overlayInput, width: e.target.value })}
              />
              Height: 
              <input
                type="number"
                value={overlayInput.height}
                onChange={(e) => setOverlayInput({ ...overlayInput, height: e.target.value })}
              />
            </div>
            <button onClick={addOverlay}>Add Overlay</button>
          </div>
        </div>
      </div>
      <div className="controls">
        <button onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue="1"
          onChange={(e) => {
            const volume = parseFloat(e.target.value);
            // Update video volume
          }}
        />
      </div>
    </div>
  );
}

export default App;
