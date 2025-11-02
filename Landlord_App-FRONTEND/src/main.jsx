/**
 * Main Entry Point - Property Management System
 * 
 * This is the entry point of our React application.
 * It renders the App component and applies global styles.
 * 
 * Learning Goals Demonstrated:
 * - React 18 createRoot API
 * - CSS imports and styling
 * - Application bootstrapping
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Create root element and render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);