import React from 'react'
console.log('Main executing');
document.body.innerHTML += '<div style="position:fixed;top:0;left:0;z-index:9999;background:red;color:white;padding:20px;">Main Executing</div>';
import ReactDOM from 'react-dom/client'
import App from './App'
// import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
