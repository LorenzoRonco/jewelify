import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router";
import Home from "./Home.jsx";
//import API from "./API/API.mjs";
import "./App.css"


function App() {

  return (
    <>
      <Routes>
        <Route path="/*" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
      </Routes> 
    </>
  );
}

export default App;
