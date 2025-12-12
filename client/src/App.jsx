import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router";
import Home from "./Home.jsx";
import SetupSurvey from "./components/SetupSurvey.jsx";
import DesignIterator from "./components/DesignIterator.jsx";
import "./App.css"

function App() {
  const [surveyAnswers, setSurveyAnswers] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");

  const handleSurveyComplete = (answers) => {
    setSurveyAnswers(answers);
    setCurrentPage("design");
  };

  const handleExitDesign = () => {
    setSurveyAnswers(null);
    setCurrentPage("home");
  };

  return (
    <>
      {currentPage === "survey" && (
        <SetupSurvey onComplete={handleSurveyComplete} />
      )}
      {currentPage === "design" && surveyAnswers && (
        <DesignIterator 
          surveyAnswers={surveyAnswers} 
          onExit={handleExitDesign}
        />
      )}
      {currentPage === "home" && (
        <Home onStartDesign={() => setCurrentPage("survey")} />
      )}
    </>
  );
}

export default App;
