
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchBar from "./FrontEnd/SearchBar";
import Learn from "./FrontEnd/Learn";
import "./FrontEnd/SearchBar.css"; 


function App() {
  return (
    <Router>
      <div className="App">
        <SearchBar />
        {/* Other components and routes */}
      </div>
    </Router>
  );
}

export default App;