import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './SearchBar.css';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipe, setRecipe] = useState(''); // Holds the transcribed recipe response
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // useEffect to handle recording logic
  useEffect(() => {
    if (recording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);

          // Store audio data when recording stops
          const audioChunks = [];
          recorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };

          // Send audio to backend once recording is stopped
          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            sendAudioToBackend(audioBlob);
          };

          recorder.start();
        })
        .catch(err => {
          console.error('Error accessing media devices.', err);
        });
    } else if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }, [recording]);

  // Function to send audio Blob to Flask backend
  const sendAudioToBackend = (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");

    setLoading(true);  // Show loader while sending data to backend
    axios.post('http://localhost:5000/process-speech', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(response => {
        setRecipe(response.data.recipe);  // Set received recipe in state
        setLoading(false);
      })
      .catch(error => {
        console.error('Error in transcription:', error);
        setLoading(false);
      });
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setLoading(true);
      axios.post('http://localhost:5000/generate-recipe', { ingredients: searchTerm })
        .then(response => {
          setRecipe(response.data.recipe); // Set received recipe in state
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching recipe:', error);
          setLoading(false);
        });
    } else {
      alert('Please enter ingredients to search.');
    }
  };

  // Toggle recording state
  const handleRecordToggle = () => {
    setRecording(!recording);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    // Process the uploaded image file if needed
  };

  return (
    <div className="search-container">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Recipe Generator
      </motion.h1>

      <motion.div
        className="search-bar"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.input
          type="text"
          placeholder="Enter ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.button
          onClick={handleSearch}
          className="search-button"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Searching...' : 'Search'}
        </motion.button>
        <motion.button
          onClick={handleRecordToggle}
          className="record-button"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          {recording ? 'Stop Recording' : 'Record Voice'}
        </motion.button>
      </motion.div>

      {recording && <div className="recording-animation">Recording...</div>}

      {loading && (
        <motion.div
          className="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.div>
      )}

      {/* Display recipe text if available */}
      {recipe && (
        <motion.div
          className="recipe-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Generated Recipe:
          </motion.h2>
          <motion.div className="recipe-content">
            <pre style={{ whiteSpace: 'pre-wrap' }}>{recipe}</pre>  {/* Render recipe with pre-wrap style */}
          </motion.div>
        </motion.div>
      )}

      {/* Image Upload Button */}
      <motion.input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="upload-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      />
    </div>
  );
};

export default SearchBar;
