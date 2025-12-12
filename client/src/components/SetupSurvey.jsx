import React, { useState } from "react";
import "../styles/SetupSurvey.css";
import ringImg from "../../images/ring.png";
import braceletImg from "../../images/bracelet.png";
import necklaceImg from "../../images/necklace.png";
import earringsImg from "../../images/earrings.png";

const SetupSurvey = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    category: null,
    survey: {},
  });

  const categoryOptions = [
    { id: "ring", label: "Ring", img: ringImg, description: "Timeless bands" },
    { id: "bracelet", label: "Bracelet", img: braceletImg, description: "Elegant wrists" },
    { id: "necklace", label: "Necklace", img: necklaceImg, description: "Statement pendants" },
    { id: "earrings", label: "Earrings", img: earringsImg, description: "Delicate drops" },
  ];

  // Define 10 survey questions with options (multi-select)
  const surveyQuestions = [
    {
      id: "q1",
      label: "Preferred style",
      options: [
        { id: "classic", label: "Classic & Elegant" },
        { id: "modern", label: "Modern & Minimal" },
        { id: "vintage", label: "Vintage & Ornate" },
        { id: "bold", label: "Bold & Artistic" },
      ],
    },
    {
      id: "q2",
      label: "Favorite colors",
      options: [
        { id: "warm", label: "Warm tones" },
        { id: "cool", label: "Cool tones" },
        { id: "neutral", label: "Neutrals" },
        { id: "vibrant", label: "Bright & Vibrant" },
      ],
    },
    {
      id: "q3",
      label: "Preferred shapes",
      options: [
        { id: "geometric", label: "Geometric" },
        { id: "organic", label: "Organic" },
        { id: "delicate", label: "Delicate" },
        { id: "statement", label: "Statement" },
      ],
    },
    {
      id: "q4",
      label: "Materials",
      options: [
        { id: "gold", label: "Gold" },
        { id: "silver", label: "Silver" },
        { id: "platinum", label: "Platinum" },
        { id: "mixed", label: "Mixed metals" },
      ],
    },
    {
      id: "q5",
      label: "Stone preference",
      options: [
        { id: "diamond", label: "Diamond" },
        { id: "emerald", label: "Emerald" },
        { id: "sapphire", label: "Sapphire" },
        { id: "none", label: "No stone" },
      ],
    },
    {
      id: "q6",
      label: "Budget range",
      options: [
        { id: "under100", label: "Under €100" },
        { id: "100to500", label: "€100 - €500" },
        { id: "500to1000", label: "€500 - €1000" },
        { id: "1000plus", label: "€1000+" },
      ],
    },
    {
      id: "q7",
      label: "Occasion",
      options: [
        { id: "everyday", label: "Everyday" },
        { id: "special", label: "Special events" },
        { id: "gift", label: "Gift" },
        { id: "heirloom", label: "Heirloom" },
      ],
    },
    {
      id: "q8",
      label: "Finish",
      options: [
        { id: "polished", label: "Polished" },
        { id: "hammered", label: "Hammered" },
        { id: "brushed", label: "Brushed" },
        { id: "matte", label: "Matte" },
      ],
    },
    {
      id: "q9",
      label: "Engraving",
      options: [
        { id: "none", label: "No engraving" },
        { id: "initials", label: "Initials" },
        { id: "date", label: "Date" },
        { id: "message", label: "Short message" },
      ],
    },
    {
      id: "q10",
      label: "Delivery timeline",
      options: [
        { id: "rush", label: "Rush" },
        { id: "standard", label: "Standard" },
        { id: "flexible", label: "Flexible" },
        { id: "unknown", label: "Not sure" },
      ],
    },
  ];

  // Initialize survey answers if not already present
  React.useEffect(() => {
    // If survey answers empty, initialize with null selections
    if (Object.keys(answers.survey).length === 0) {
      const map = {};
      surveyQuestions.forEach((q) => {
        map[q.id] = null;
      });
      setAnswers((prev) => ({ ...prev, survey: map }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSelectAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const selectSurveyOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      survey: { ...prev.survey, [questionId]: optionId },
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    // If on step 2, we're ready to complete
    onComplete(answers);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="survey-step">
            <h2>STEP 1</h2>
            <p className="survey-subtitle">What are we going to design?</p>
            <div className="options-grid">
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  className={`option-card ${
                    answers.category === option.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectAnswer("category", option.id)}
                >
                  <img src={option.img} alt={option.label} className="option-image" />
                  <div className="option-label">{option.label}</div>
                  <div className="option-description">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="survey-step">
            <h2>Step 2</h2>
            <p className="survey-subtitle">Tell us your preferences</p>
            <div className="question-list">
              {surveyQuestions.map((q) => (
                <div key={q.id} className="question-card">
                  <h3 className="question-title">{q.label}</h3>
                  <div className="options-grid">
                    {q.options.map((option) => {
                      const selected = answers.survey[q.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          className={`option-card ${selected ? "selected" : ""}`}
                          onClick={() => selectSurveyOption(q.id, option.id)}
                        >
                          <div className="option-label">{option.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isAnswerSelected = () => {
    if (step === 1) return answers.category !== null;
    if (step === 2) {
      // ensure all questions have a single selected option
      return Object.values(answers.survey || {}).every((val) => val !== null && val !== undefined);
    }
    return false;
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <button className="back-btn" onClick={handleBack} disabled={step === 1}>
          ← Go back
        </button>
        <h1>JEWELIFY</h1>
      </header>

      <main className="survey-main">
        {renderStep()}
      </main>

      <footer className="survey-footer">
        <button
          className="btn-send"
          onClick={handleNext}
          disabled={!isAnswerSelected()}
        >
          {step === 2 ? "Start Design" : "Next Step"}
        </button>
      </footer>
    </div>
  );
};

export default SetupSurvey;
