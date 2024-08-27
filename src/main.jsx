import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import "bootswatch/dist/quartz/bootstrap.min.css";
import 'bootswatch/dist/quartz/bootstrap.css';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App getElementById="body" />
  </React.StrictMode>
)
