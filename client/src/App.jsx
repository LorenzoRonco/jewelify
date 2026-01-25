import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import Home from "./Home.jsx";
import { HeaderProvider } from "./components/HeaderContext";
import Navbar from "./components/Navbar";
import SetupSurvey from "./components/SetupSurvey.jsx";
import DesignIterator from "./components/DesignIterator.jsx";
import GeneratingPage from "./components/GeneratingPage.jsx";
import ConceptSelectionPage from "./components/ConceptSelectionPage.jsx";
import InspirationPage from "./components/InspirationPage.jsx";
import "./App.css"

const STORAGE_KEY_SURVEY = 'jewelify_survey_answers';

function App() {
  // Load survey answers from localStorage on mount
  const [surveyAnswers, setSurveyAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SURVEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading survey from localStorage:', error);
      return null;
    }
  });
  const navigate = useNavigate();

  // Save survey answers to localStorage whenever they change
  useEffect(() => {
    if (surveyAnswers) {
      localStorage.setItem(STORAGE_KEY_SURVEY, JSON.stringify(surveyAnswers));
    }
  }, [surveyAnswers]);

  const handleSurveyComplete = (answers) => {
    setSurveyAnswers(answers);
    navigate('/generating', { state: { from: 'survey', surveyAnswers: answers } });
  };

  const handleExitDesign = () => {
    setSurveyAnswers(null);
    // Clear all saved progress
    localStorage.removeItem(STORAGE_KEY_SURVEY);
    localStorage.removeItem('jewelify_design_config');
    localStorage.removeItem('jewelify_design_history');
    navigate('/');
  };

  return (
    <HeaderProvider>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home onStartDesign={() => navigate('/survey')} />} />
        <Route path="/survey" element={<SetupSurvey onComplete={handleSurveyComplete} />} />
        <Route path="/concepts" element={<ConceptSelectionPage surveyAnswers={surveyAnswers} />} />
        <Route path="/inspiration/:category" element={<InspirationPage />} />
        <Route path="/generating" element={<GeneratingPage />} />
        <Route path="/design" element={<DesignIterator surveyAnswers={surveyAnswers} onExit={handleExitDesign}/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HeaderProvider>
  );
}

export default App;
