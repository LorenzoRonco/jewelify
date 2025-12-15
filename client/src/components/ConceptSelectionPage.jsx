import React from "react";
import { useNavigate, useLocation } from "react-router";
import "../styles/ConceptSelectionPage.css";
import { useHeader } from "./HeaderContext";
// Images are referenced directly from /images/ path; replace when ready

const concepts = [
  { id: 1, name: "Concept 1", image: "/images/concept_01.png", modelPath: "/models/concept_01.obj" },
  { id: 2, name: "Concept 2", image: "/images/concept_02.png", modelPath: "/models/concept_02.obj" },
  { id: 3, name: "Concept 3", image: "/images/concept_03.png", modelPath: "/models/concept_03.obj" },
];

const ConceptSelectionPage = ({ surveyAnswers }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.state?.from || null;

  const handleSelect = (modelPath) => {
    // Navigate to design and pass the modelPath and where we came from
    navigate("/design", { state: { modelPath, from: 'concepts' } });
  };

  const handleBack = () => {
    // If we came here from the survey flow, go back to step 2; otherwise, go to home
    if (from === 'survey') {
      navigate('/survey', { state: { step: 2 } });
    } else {
      navigate('/');
    }
  };

  const { setLeft, setRight } = useHeader();

  React.useEffect(() => {
    setLeft(<button className="back-btn btn-back-small" onClick={handleBack}>← Back</button>);
    setRight(null);
    return () => {
      setLeft(null);
      setRight(null);
    };
  }, []);

  return (
    <div className="concepts-page">
      <main className="concepts-main">
        <h2>Take a look at each one</h2>
        <div className="concepts-grid">
          {concepts.map((c) => (
            <div key={c.id} className="concept-card" onClick={() => handleSelect(c.modelPath)}>
              <div className="concept-image-wrap">
                <img src={c.image} alt={c.name} onError={(e) => (e.currentTarget.src = "/images/concept_placeholder.png")} />
              </div>
              <div className="concept-label">{c.name}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ConceptSelectionPage;
