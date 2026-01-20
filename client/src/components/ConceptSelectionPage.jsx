import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import "../styles/ConceptSelectionPage.css";
import { useHeader } from "./HeaderContext";
import { deriveConfigFromSurveyAnswers, withSurveyDefaults } from "../utils/surveyMapping";
import thumbnailGenerator from "../utils/thumbnailGenerator";

const ConceptSelectionPage = ({ surveyAnswers }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.state?.from || null;

  const answers = surveyAnswers || location?.state?.surveyAnswers || null;

  // State to hold generated thumbnails
  const [thumbnails, setThumbnails] = React.useState({});
  const [isGenerating, setIsGenerating] = React.useState(true);

  const buildPaths = (baseConfig) => {
    let bandFile = "BAND_CLASSIC.glb";
    if (baseConfig.bandDesign === "Knife") bandFile = "BAND_KNIFE.glb";
    if (baseConfig.bandDesign === "Flat") bandFile = "BAND_FLAT.glb";

    let stoneFile = "STONE_BRILLIANT.glb";
    if (baseConfig.stoneShape === "diamond") stoneFile = "STONE_DIAMOND.glb";
    if (baseConfig.stoneShape === "gem") stoneFile = "STONE_GEM.glb";

    let headFile = "HEAD_4PRONGS.glb";
    if (baseConfig.headModel === "2prongs") headFile = "HEAD_2PRONGS.glb";
    if (baseConfig.headModel === "twirl") headFile = "HEAD_TWIRL.glb";

    return {
      ...baseConfig,
      bandPath: `/models/ring/${bandFile}`,
      headPath: `/models/ring/${headFile}`,
      stonePath: `/models/ring/${stoneFile}`,
    };
  };

  const baseConfig = answers ? buildPaths(deriveConfigFromSurveyAnswers(answers)) : null;

  const concepts = React.useMemo(() => {
    // Use baseConfig if available, otherwise use sensible defaults
    const defaultConfig = baseConfig || buildPaths(withSurveyDefaults({
      material: "gold",
      materialColor: "gold",
      stoneColor: "clear",
      polish: 0.8,
      clarity: 0.8,
      bandDesign: "Classic",
      stoneShape: "brilliant",
      headModel: "4prongs",
    }));

    // Build three intentionally distinct variants
    const conceptA = withSurveyDefaults({
      ...defaultConfig,
      label: "Signature match",
    });

    const conceptB = withSurveyDefaults({
      ...defaultConfig,
      design: "delicate",
      style: "solitaire",
      bandDesign: "Classic",
      stoneShape: "brilliant",
      metalFinish: "polished",
      headModel: "4prongs",
      stoneColor: defaultConfig.stoneColor === "clear" ? "clear" : defaultConfig.stoneColor,
      polish: Math.max(defaultConfig.polish || 0.8, 0.85),
      clarity: Math.max(defaultConfig.clarity || 0.8, 0.85),
      material: defaultConfig.material === "silver" ? "platinum" : defaultConfig.material,
      materialColor: defaultConfig.material === "silver" ? "platinum" : defaultConfig.materialColor,
      label: "Refined minimal",
      thumbnailScale: 2.0,
    });

    const conceptC = withSurveyDefaults({
      ...defaultConfig,
      design: "statement",
      style: "halo",
      bandDesign: "Flat",
      stoneShape: "gem",
      headModel: "twirl",
      metalFinish: defaultConfig.metalFinish === "matte" ? "matte" : "hammered",
      stoneColor: defaultConfig.stoneColor === "clear" ? "red" : defaultConfig.stoneColor,
      material: defaultConfig.material === "gold" ? "rose" : defaultConfig.material,
      materialColor: defaultConfig.material === "gold" ? "rose" : defaultConfig.materialColor,
      polish: Math.min(defaultConfig.polish || 0.8, 0.65),
      clarity: Math.min(defaultConfig.clarity || 0.8, 0.7),
      label: "Bold spotlight",
    });

    const cA = buildPaths(conceptA);
    const cB = buildPaths(conceptB);
    const cC = buildPaths(conceptC);

    return [
      { id: 1, name: "Concept 1", config: cA, modelPath: cA.bandPath },
      { id: 2, name: "Concept 2", config: cB, modelPath: cB.bandPath },
      { id: 3, name: "Concept 3", config: cC, modelPath: cC.bandPath },
    ];
  }, [baseConfig]);

  const handleSelect = useCallback((concept) => {
    const payload = {
      from: "concepts",
      modelPath: concept.modelPath,
      conceptConfig: concept.config,
      surveyAnswers: answers,
    };
    navigate("/design", { state: payload });
  }, [navigate, answers]);

  const handleBack = useCallback(() => {
    // If we came here from the survey flow, go back to step 2; otherwise, go to home
    if (from === 'survey') {
      navigate('/survey', { state: { step: 2 } });
    } else {
      navigate('/');
    }
  }, [from, navigate]);

  const { setLeft, setRight } = useHeader();

  // Use ref to track if thumbnails have been generated
  const hasGenerated = React.useRef(false);

  // Generate thumbnails when component mounts
  React.useEffect(() => {
    // Only generate once
    if (hasGenerated.current || concepts.length === 0) {
      return;
    }

    hasGenerated.current = true;

    const generateThumbnails = async () => {
      setIsGenerating(true);
      const startTime = performance.now();

      try {
        // Generate thumbnails for all concepts
        const thumbnailData = {};
        for (const concept of concepts) {
          const thumbnail = await thumbnailGenerator.generateThumbnail(
            concept.config.bandPath,
            concept.config.stonePath,
            concept.config
          );
          thumbnailData[concept.id] = thumbnail;
        }

        setThumbnails(thumbnailData);

        const endTime = performance.now();
        console.log(`Thumbnails generated in ${Math.round(endTime - startTime)}ms`);
      } catch (error) {
        console.error('Failed to generate thumbnails:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateThumbnails();

    // Note: Don't dispose the generator here as it's a singleton
    // and might be needed if component remounts
  }, []);

  React.useEffect(() => {
    setLeft(<button className="back-btn btn-back-small" onClick={handleBack}>← Back</button>);
    setRight(null);
    return () => {
      setLeft(null);
      setRight(null);
    };
  }, [setLeft, setRight, handleBack]);

  return (
    <div className="concepts-page">
      <main className="concepts-main">
        <section className="concepts-hero">
          <h2>Jewels created for YOU</h2>
          <p>Choose a starting concept to begin customizing your piece.</p>
        </section>

        <section className="concepts-grid">
          {concepts.map((c) => (
            <div key={c.id} className="concept-card" onClick={() => handleSelect(c)}>
              <div className="concept-preview-wrapper">
                {isGenerating ? (
                  <div className="thumbnail-loading">
                    <div className="spinner"></div>
                    <p>Generating preview...</p>
                  </div>
                ) : thumbnails[c.id] ? (
                  <img
                    src={thumbnails[c.id]}
                    alt={c.name}
                    className="concept-thumbnail"
                  />
                ) : (
                  <div className="thumbnail-error">
                    <p>Preview unavailable</p>
                  </div>
                )}
              </div>
              <h3 className="concept-label">{c.name}</h3>
              {c.config?.label && <p className="concept-subtitle">{c.config.label}</p>}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ConceptSelectionPage;
