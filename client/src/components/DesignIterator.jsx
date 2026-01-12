import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import ThreeCanvas from "./ThreeCanvas";
import { useHeader } from "./HeaderContext";
import "../styles/DesignIterator.css";
import { updateGeometry } from "../API/geometryAPI";

const DesignIterator = ({ surveyAnswers, onExit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location?.state?.from || null;

  // Utility: pick random from array
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Mock AI prompt parser - extracts keywords from user prompt
  function parseAiPrompt(prompt) {
    const result = {};
    const promptLower = prompt.toLowerCase();

    // Material colors
    const materialColors = {
      gold: ['gold', 'golden', 'yellow'],
      silver: ['silver', 'white metal', 'platinum-like'],
      rose: ['rose', 'rose gold', 'copper', 'blush'],
      platinum: ['platinum', 'white', 'cool']
    };

    for (const [color, keywords] of Object.entries(materialColors)) {
      if (keywords.some(keyword => promptLower.includes(keyword))) {
        result.materialColor = color;
        break;
      }
    }

    // Stone colors
    const stoneColors = {
      clear: ['clear', 'white', 'transparent', 'colorless', 'diamond'],
      pink: ['pink', 'blush', 'rose quartz', 'morganite'],
      blue: ['blue', 'sapphire', 'sky blue', 'deep blue'],
      green: ['green', 'emerald', 'jade', 'light green'],
      red: ['red', 'ruby', 'crimson', 'deep red']
    };

    for (const [color, keywords] of Object.entries(stoneColors)) {
      if (keywords.some(keyword => promptLower.includes(keyword))) {
        result.stoneColor = color;
        break;
      }
    }

    // Stone shapes
    const shapes = {
      brilliant: ['round', 'brilliant', 'classic', 'sparkly'],
      diamond: ['square', 'cushion', 'asscher', 'angular', 'geometric'],
      gem: ['oval', 'emerald cut', 'elongated', 'pear', 'teardrop']
    };

    for (const [shape, keywords] of Object.entries(shapes)) {
      if (keywords.some(keyword => promptLower.includes(keyword))) {
        result.stoneShape = shape;
        break;
      }
    }

    // Band designs
    const bandDesigns = {
      Classic: ['classic', 'traditional', 'timeless', 'simple', 'elegant'],
      Knife: ['knife', 'sharp', 'thin', 'modern', 'sleek'],
      Flat: ['flat', 'wide', 'bold', 'chunky', 'statement']
    };

    for (const [design, keywords] of Object.entries(bandDesigns)) {
      if (keywords.some(keyword => promptLower.includes(keyword))) {
        result.bandDesign = design;
        break;
      }
    }

    // Metal finishes
    const finishes = {
      polished: ['polished', 'shiny', 'bright', 'glossy', 'smooth'],
      matte: ['matte', 'matt', 'dull', 'brushed'],
      hammered: ['hammered', 'textured', 'rough', 'vintage', 'artisan']
    };

    for (const [finish, keywords] of Object.entries(finishes)) {
      if (keywords.some(keyword => promptLower.includes(keyword))) {
        result.metalFinish = finish;
        break;
      }
    }

    // Design styles
    const designs = {
      delicate: ['delicate', 'dainty', 'fine', 'subtle', 'minimal'],
      geometric: ['geometric', 'angular', 'modern', 'contemporary', 'architectural'],
      organic: ['organic', 'flowing', 'natural', 'wavy', 'curved'],
      statement: ['statement', 'bold', 'dramatic', 'standout', 'eye-catching']
    };

    for (const [designStyle, keywords] of Object.entries(designs)) {
      if (keywords.some(keyword => promptLower.includes(keyword))) {
        result.design = designStyle;
        break;
      }
    }

    // Quality modifiers
    if (promptLower.includes('high quality') || promptLower.includes('clarity') || promptLower.includes('flawless')) {
      result.clarity = 0.85;
      result.polish = 0.85;
    } else if (promptLower.includes('vintage') || promptLower.includes('antique')) {
      result.clarity = 0.6;
      result.polish = 0.65;
    }

    return result;
  }

  // If surveyAnswers is present, generate a random config (stoneColor from survey if present)
  function getRandomConfigFromSurvey(survey) {
    let stoneColor = 'clear';
    if (survey && survey.stoneColor) stoneColor = survey.stoneColor;
    else if (survey && survey.survey && survey.survey.q2) {
      switch (survey.survey.q2) {
        case 'warm': stoneColor = 'red'; break;
        case 'cool': stoneColor = 'blue'; break;
        case 'neutral': stoneColor = 'clear'; break;
        case 'vibrant': stoneColor = 'pink'; break;
        default: stoneColor = pickRandom(['clear', 'pink', 'blue', 'green', 'red']);
      }
    }
    // Material logic from survey (q4)
    let material = pickRandom(['palladium', 'gold', 'silver', 'platinum', 'rose']);
    let materialColor = pickRandom(['gold', 'silver', 'rose', 'platinum']);
    if (survey && survey.survey && survey.survey.q4) {
      switch (survey.survey.q4) {
        case 'gold':
          material = 'gold';
          materialColor = 'gold';
          break;
        case 'silver':
          material = 'silver';
          materialColor = 'silver';
          break;
        case 'platinum':
          material = 'platinum';
          materialColor = 'platinum';
          break;
        case 'mixed':
          material = pickRandom(['gold', 'silver', 'platinum', 'rose']);
          // If mixed, keep color and material in sync if not rose
          if (material === 'gold' || material === 'silver' || material === 'platinum') {
            materialColor = material;
          } else {
            materialColor = pickRandom(['gold', 'silver', 'rose', 'platinum']);
          }
          break;
        default:
          break;
      }
    }
    return {
      design: pickRandom(['geometric', 'organic', 'delicate', 'statement']),
      material,
      style: pickRandom(['pavé', 'solitaire', 'halo', 'vintage']),
      materialColor,
      metalFinish: pickRandom(['hammered', 'polished', 'matte']),
      stoneColor,
      polish: Math.round((Math.random() * 0.6 + 0.3) * 10) / 10, // 0.3-0.9
      clarity: Math.round((Math.random() * 0.6 + 0.3) * 10) / 10, // 0.3-0.9
      bandDesign: pickRandom(['Classic', 'Knife', 'Flat']),
      stoneShape: pickRandom(['brilliant', 'diamond', 'gem']),
      modelPath: "/models/ring/BAND_CLASSIC.glb",
    };
  }

  let initialConfig;
  if (surveyAnswers) {
    const baseConfig = getRandomConfigFromSurvey(surveyAnswers);
    // Set bandPath and stonePath to match bandDesign and stoneShape
    let bandFile = "BAND_CLASSIC.glb";
    if (baseConfig.bandDesign === "Knife") bandFile = "BAND_KNIFE.glb";
    if (baseConfig.bandDesign === "Flat") bandFile = "BAND_FLAT.glb";
    let stoneFile = "STONE_BRILLIANT.glb";
    if (baseConfig.stoneShape === "diamond") stoneFile = "STONE_DIAMOND.glb";
    if (baseConfig.stoneShape === "gem") stoneFile = "STONE_GEM.glb";
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    initialConfig = {
      ...baseConfig,
      bandPath: `${baseUrl}/models/ring/${bandFile}`,
      stonePath: `${baseUrl}/models/ring/${stoneFile}`,
    };
  } else {
    let incomingModelPath = location?.state?.modelPath;
    if (!incomingModelPath) incomingModelPath = "/models/Bracelet.obj";
    initialConfig = {
      design: "geometric",
      material: "palladium",
      style: "pavé",
      materialColor: "gold",
      metalFinish: "hammered",
      stoneColor: "clear",
      polish: 0.8,
      clarity: 0.9,
      modelPath: incomingModelPath || "/models/Bracelet.obj",
    };
  }

  const [config, setConfig] = useState(initialConfig);

  const [historyState, setHistoryState] = useState({ history: [initialConfig], historyIndex: 0 });
  const { history, historyIndex } = historyState;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(1500);
  const [estimatedDays, setEstimatedDays] = useState("30-35");
  const [dropdownToast, setDropdownToast] = useState(null);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null); // Per il modale di customizzazione
  const [aiPrompt, setAiPrompt] = useState(""); // Per il prompt AI
  const [showRecalculateModal, setShowRecalculateModal] = useState(false); // Per il modale di recalculate
  const popupTimerRef = useRef(null);
  const updateDelayRef = useRef(null);

  const runAfterPopup = useCallback((message, action) => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    if (updateDelayRef.current) clearTimeout(updateDelayRef.current);
    const duration = 500 + Math.random() * 1000; // 0.5s to 1.5s
    setDropdownToast(message || "Generating...");
    popupTimerRef.current = setTimeout(() => setDropdownToast(null), duration);
    updateDelayRef.current = setTimeout(() => {
      action();
    }, duration);
  }, []);

  // INSTANT updates: Material properties that don't require server
  const handleInstantUpdates = useCallback((updates, afterUpdate) => {
    setConfig((prevConfig) => {
      const updated = { ...prevConfig, ...updates };
      setHistoryState((prevHistory) => {
        const newHistory = prevHistory.history.slice(0, prevHistory.historyIndex + 1);
        newHistory.push(updated);
        return { history: newHistory, historyIndex: newHistory.length - 1 };
      });
      if (afterUpdate) afterUpdate(updated);
      return updated;
    });
  }, []);

  const handleInstantUpdate = useCallback((key, value, afterUpdate) => {
    handleInstantUpdates({ [key]: value }, afterUpdate);
  }, [handleInstantUpdates]);

  // ASYNC updates: Geometry changes that require server
  const handleGeometryUpdate = useCallback(
    async (key, value) => {
      setIsLoading(true);
      setLoadingMessage(`Updating ${key}...`);

      try {
        // Call server API for geometry changes
        const result = await updateGeometry({
          ...config,
          [key]: value,
        });

        // Simulate different messages based on the change
        const messages = {
          design: "Reshaping metal...",
          material: "Processing material...",
          style: "Refining details...",
        };
        setLoadingMessage(messages[key] || `Updating ${key}...`);

        // Update config with result
        const updated = { ...config, [key]: value, modelPath: result.modelPath };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(updated);
        setHistoryState({ history: newHistory, historyIndex: newHistory.length - 1 });
        setConfig(updated);
      } catch (error) {
        console.error("Geometry update failed:", error);
        alert("Failed to update geometry. Please try again.");
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
    },
    [config, history, historyIndex]
  );
  {/* Band Design */ }

  // Utility: Generate estimated days and price based on config
  function getEstimatedDays(config) {
    // Simple logic: more polish/clarity = less days, platinum = more days, handwork = more days
    let days = 60;
    if (config.polish > 0.7) days -= 8;
    if (config.clarity > 0.7) days -= 7;
    if (config.materialColor === 'platinum') days += 5;
    if (config.materialColor === 'rose') days += 2;
    if (config.stoneColor !== 'clear') days += 2;
    days -= Math.round((config.polish + config.clarity) * 5);
    if (days < 25) days = 25;
    if (days > 60) days = 60;
    return `${days}-${days + 5}`;
  }

  function getEstimatedPrice(config) {
    // Simple logic: platinum/rose = more expensive, polish/clarity = more expensive, colored stones = more expensive
    let price = 1200;
    if (config.materialColor === 'platinum') price += 600;
    if (config.materialColor === 'rose') price += 200;
    if (config.polish > 0.7) price += 150;
    if (config.clarity > 0.7) price += 120;
    if (config.stoneColor !== 'clear') price += 180;
    price += Math.round((config.polish + config.clarity) * 100);
    if (price > 2500) price = 2500;
    if (price < 1200) price = 1200;
    return price;
  }

  function getPriceBreakdown(config) {
    // Mirror the pricing logic to create line items that sum to estimatedPrice
    const items = [];
    let base = 1200;
    items.push({ label: "Base craftsmanship", amount: base });

    if (config.materialColor === 'platinum') items.push({ label: "Platinum material upcharge", amount: 600 });
    if (config.materialColor === 'rose') items.push({ label: "Rose alloy premium", amount: 200 });
    if (config.polish > 0.7) items.push({ label: "High polish finish", amount: 150 });
    if (config.clarity > 0.7) items.push({ label: "Stone clarity selection", amount: 120 });
    if (config.stoneColor !== 'clear') items.push({ label: "Colored gemstone", amount: 180 });

    const dynamic = Math.round((config.polish + config.clarity) * 100);
    if (dynamic) items.push({ label: "Detailing & QC (polish/clarity)", amount: dynamic });

    // Cap/Bounds are applied on total later, but for transparency we show the raw items
    return items;
  }

  const updateEstimates = useCallback((nextConfig) => {
    setEstimatedDays(getEstimatedDays(nextConfig));
    setEstimatedPrice(getEstimatedPrice(nextConfig));
  }, []);

  // Handle config changes (route to instant or async)
  const handleConfigChange = (key, value) => {
    const instantKeys = [
      "materialColor",
      "polish",
      "clarity",
      "stoneColor",
      "metalFinish",
    ];

    if (instantKeys.includes(key)) {
      handleInstantUpdate(key, value, updateEstimates);
      return;
    }

    // Update estimated values after any change
    const nextConfig = { ...config, [key]: value };
    updateEstimates(nextConfig);

    handleGeometryUpdate(key, value);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryState({ ...historyState, historyIndex: newIndex });
      setConfig(history[newIndex]);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryState({ ...historyState, historyIndex: newIndex });
      setConfig(history[newIndex]);
    }
  };

  React.useEffect(() => {
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      if (updateDelayRef.current) clearTimeout(updateDelayRef.current);
    };
  }, []);

  // Recalculate: randomize all config parameters
  const handleRecalculate = () => {
    // Apri il modale di recalculate con prompt
    setShowRecalculateModal(true);
    setAiPrompt("");
  };

  // Applica recalculate con prompt AI
  const handleRecalculateWithPrompt = () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a prompt for the design");
      return;
    }

    console.log("Recalculate with prompt:", aiPrompt);

    // Parse the prompt to extract keywords
    const parsedKeywords = parseAiPrompt(aiPrompt);
    console.log("Parsed keywords:", parsedKeywords);

    setIsLoading(true);
    setLoadingMessage("Recalculating design...");
    setTimeout(() => {
      const newConfig = getRandomConfigFromSurvey(surveyAnswers);

      // Apply parsed keywords to the new config ONLY if keywords were found
      if (Object.keys(parsedKeywords).length > 0) {
        Object.assign(newConfig, parsedKeywords);
      }
      // If no keywords found, use the completely random config as-is

      // Update bandPath and stonePath to match bandDesign and stoneShape
      let bandFile = "BAND_CLASSIC.glb";
      if (newConfig.bandDesign === "Knife") bandFile = "BAND_KNIFE.glb";
      if (newConfig.bandDesign === "Flat") bandFile = "BAND_FLAT.glb";
      let stoneFile = "STONE_BRILLIANT.glb";
      if (newConfig.stoneShape === "diamond") stoneFile = "STONE_DIAMOND.glb";
      if (newConfig.stoneShape === "gem") stoneFile = "STONE_GEM.glb";
      const fullConfig = {
        ...newConfig,
        bandPath: `${baseUrl}/models/ring/${bandFile}`,
        stonePath: `${baseUrl}/models/ring/${stoneFile}`,
      };
      setConfig(fullConfig);
      setEstimatedDays(getEstimatedDays(fullConfig));
      setEstimatedPrice(getEstimatedPrice(fullConfig));
      setHistoryState({ history: [fullConfig], historyIndex: 0 });
      setIsLoading(false);
      setLoadingMessage("");
      setShowRecalculateModal(false);
      setAiPrompt("");
    }, 500);
  };

  // Confirm order - show safety confirmation modal
  const handleConfirmOrder = () => {
    setShowConfirmModal(true);
  };

  // Execute purchase
  const handleExecutePurchase = () => {
    setShowConfirmModal(false);
    alert("Order confirmed! (Mock implementation)");
    onExit?.();
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const { setLeft, setRight } = useHeader();

  // Handle 3D model part click
  const handlePartClick = (partName) => {
    setSelectedPart(partName);
    setAiPrompt(""); // Reset prompt quando apri un nuovo modale
  };

  // Handle AI prompt submit
  const handleAiPromptSubmit = () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a prompt for the AI");
      return;
    }

    console.log(`AI Prompt for ${selectedPart}:`, aiPrompt);

    // Applica cambiamenti simulati in base al pezzo selezionato
    applyAiChanges(selectedPart, aiPrompt);

    setAiPrompt("");
    setSelectedPart(null);
  };

  // Applica cambiamenti simulati basati sul prompt AI
  const applyAiChanges = (part, prompt) => {
    const updates = {};
    const parsedKeywords = parseAiPrompt(prompt);

    if (part === "stone") {
      // Controlla se ci sono keywords rilevanti per la stone
      const relevantKeywords = ['stoneShape', 'stoneColor', 'clarity'];
      const hasStoneKeywords = relevantKeywords.some(k => k in parsedKeywords);

      if (hasStoneKeywords) {
        // Applica SOLO i cambiamenti estratti dal parsing
        if (parsedKeywords.stoneShape && parsedKeywords.stoneShape !== config.stoneShape) {
          handleConfigChange("stoneShape", parsedKeywords.stoneShape);
        }

        if (parsedKeywords.stoneColor && parsedKeywords.stoneColor !== config.stoneColor) {
          updates.stoneColor = parsedKeywords.stoneColor;
        }

        if (parsedKeywords.clarity && parsedKeywords.clarity !== config.clarity) {
          updates.clarity = parsedKeywords.clarity;
        }
      } else {
        // Fallback: genera a caso
        const shapes = ["brilliant", "diamond", "gem"];
        const currentShape = config.stoneShape || "brilliant";
        const availableShapes = shapes.filter(s => s !== currentShape);
        const randomShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];

        handleConfigChange("stoneShape", randomShape);

        const colors = ["clear", "pink", "blue", "green", "red"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        if (randomColor !== config.stoneColor) {
          updates.stoneColor = randomColor;
        }

        const newClarity = Math.min(config.clarity + 0.1, 1);
        if (newClarity !== config.clarity) {
          updates.clarity = newClarity;
        }
      }

      if (Object.keys(updates).length > 0) {
        handleInstantUpdates(updates, updateEstimates);
      }
    } else if (part === "band") {
      // Controlla se ci sono keywords rilevanti per la band
      const relevantKeywords = ['bandDesign', 'metalFinish', 'polish'];
      const hasBandKeywords = relevantKeywords.some(k => k in parsedKeywords);

      if (hasBandKeywords) {
        // Applica SOLO i cambiamenti estratti dal parsing
        if (parsedKeywords.bandDesign && parsedKeywords.bandDesign !== config.bandDesign) {
          handleConfigChange("bandDesign", parsedKeywords.bandDesign);
        }

        if (parsedKeywords.metalFinish && parsedKeywords.metalFinish !== config.metalFinish) {
          updates.metalFinish = parsedKeywords.metalFinish;
        }

        if (parsedKeywords.polish && parsedKeywords.polish !== config.polish) {
          updates.polish = parsedKeywords.polish;
        }
      } else {
        // Fallback: genera a caso
        const designs = ["Classic", "Knife", "Flat"];
        const currentDesign = config.bandDesign || "Classic";
        const availableDesigns = designs.filter(d => d !== currentDesign);
        const randomDesign = availableDesigns[Math.floor(Math.random() * availableDesigns.length)];

        handleConfigChange("bandDesign", randomDesign);

        const newPolish = Math.min(config.polish + 0.15, 1);
        if (newPolish !== config.polish) {
          updates.polish = newPolish;
        }
      }

      if (Object.keys(updates).length > 0) {
        handleInstantUpdates(updates, updateEstimates);
      }
    } else if (part === "head") {
      // Controlla se ci sono keywords rilevanti per la head (non metalFinish - quello è del band)
      const relevantKeywords = ['materialColor', 'clarity'];
      const hasHeadKeywords = relevantKeywords.some(k => k in parsedKeywords);

      if (hasHeadKeywords) {
        // Applica SOLO i cambiamenti estratti dal parsing
        if (parsedKeywords.materialColor && parsedKeywords.materialColor !== config.materialColor) {
          updates.materialColor = parsedKeywords.materialColor;
        }

        if (parsedKeywords.clarity && parsedKeywords.clarity !== config.clarity) {
          updates.clarity = parsedKeywords.clarity;
        }
      } else {
        // Fallback: genera a caso
        const colors = ["gold", "silver", "rose", "platinum"];
        const currentColor = config.materialColor || "gold";
        const availableColors = colors.filter(c => c !== currentColor);
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];

        if (randomColor !== currentColor) {
          updates.materialColor = randomColor;
        }

        const newClarity = Math.min(config.clarity + 0.05, 1);
        if (newClarity !== config.clarity) {
          updates.clarity = newClarity;
        }
      }

      if (Object.keys(updates).length > 0) {
        handleInstantUpdates(updates, updateEstimates);
      }
    }
  };

  // Ottieni informazioni per il modale in base alla parte selezionata
  const getPartInfo = (partName) => {
    const partInfo = {
      stone: {
        title: "Stone Customization",
        icon: "💎",
        description: "Customize your gemstone with different shapes, colors, and clarity levels.",
        options: [
          { label: "Shape", value: config.stoneShape || "brilliant" },
          { label: "Color", value: config.stoneColor || "clear" },
          { label: "Clarity", value: `${(config.clarity * 100).toFixed(0)}%` },
        ]
      },
      head: {
        title: "Head Customization",
        icon: "✨",
        description: "The head holds your gemstone securely in place. Choose your prong style and metal finish.",
        options: [
          { label: "Style", value: "4-Prong" },
          { label: "Metal", value: config.materialColor || "gold" },
          { label: "Finish", value: config.metalFinish || "polished" },
        ]
      },
      band: {
        title: "Band Customization",
        icon: "⭐",
        description: "Customize the band design, width, and metal type to match your style.",
        options: [
          { label: "Design", value: config.bandDesign || "Classic" },
          { label: "Metal", value: config.materialColor || "gold" },
          { label: "Polish", value: `${(config.polish * 100).toFixed(0)}%` },
        ]
      }
    };
    return partInfo[partName] || {};
  };

  React.useEffect(() => {
    setLeft(
      <div>
        <button className="back-btn btn-back" onClick={() => {
          if (from === 'concepts') navigate('/concepts');
          else if (from === 'inspiration') navigate(-1);
          else if (from === 'survey') navigate('/survey', { state: { step: 2 } });
          else navigate('/concepts');
        }}>
          ← Back
        </button>
      </div>
    );

    return () => setLeft(null);
  }, [from]);

  React.useEffect(() => {
    setRight(
      <div className="design-header-right">
        <div className="model-tag">Model: {config.modelPath || 'default'}</div>
      </div>
    );

    return () => setRight(null);
  }, [config.modelPath]);

  return (
    <div className="design-iterator">
      {dropdownToast && (
        <div className="dropdown-toast">
          <span className="spinner" aria-hidden="true"></span>
          <span>{dropdownToast}</span>
        </div>
      )}
      <main className="iterator-main">
        {/* Left side: 3D Canvas */}
        <section className="canvas-section">
          <ThreeCanvas
            config={config}
            isLoading={isLoading}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            onRecalculate={handleRecalculate}
            onConfirmOrder={handleConfirmOrder}
            onPartClick={handlePartClick}
          />
          <div className="design-feedback">It's the one!</div>
        </section>

        {/* Right side: Controls */}
        <aside className="controls-section">
          {/* Pricing Info */}
          <div className="pricing-block">
            <h3>Estimated time for creation</h3>
            <p className="estimated-days">{estimatedDays} days</p>

            <h3>Live quote:</h3>
            <p className="live-price">€{estimatedPrice}</p>
            <button className="btn-more-details" onClick={() => setShowPriceDetails(true)}>... more details</button>
          </div>

          {/* Clickable Ring Parts */}
          <div className="ring-parts-section">
            <h3>Customize</h3>

            {/* Stone */}
            <div
              className="clickable-part head-part"
              onClick={() => handlePartClick("stone")}
              title="Click to customize the stone"
            >
              <span className="part-icon">💎</span>
              <span className="part-name">Stone</span>
            </div>

            {/* Head */}
            <div
              className="clickable-part ring-part"
              onClick={() => handlePartClick("head")}
              title="Click to customize the head"
            >
              <span className="part-icon">✨</span>
              <span className="part-name">Head</span>
            </div>

            {/* Band */}
            <div
              className="clickable-part band-part"
              onClick={() => handlePartClick("band")}
              title="Click to customize the band"
            >
              <span className="part-icon">⭐</span>
              <span className="part-name">Band</span>
            </div>
          </div>
        </aside>


      </main>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <>
          <div className="modal-overlay">
            <div className="modal-content">
              <button
                className="modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                ✕
              </button>
              <h2>Confirm Your Order</h2>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>
                  Edit Design
                </button>
                <button className="btn-purchase" onClick={handleExecutePurchase}>
                  Complete Purchase
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Price Details Modal */}
      {showPriceDetails && (
        <>
          <div className="modal-overlay">
            <div className="modal-content">
              <button
                className="modal-close"
                onClick={() => setShowPriceDetails(false)}
              >
                ✕
              </button>
              <h2>Price Breakdown</h2>

              <div className="order-summary">
                {getPriceBreakdown(config).map((it, idx) => (
                  <div key={idx} className="summary-item">
                    <span>{it.label}</span>
                    <strong>€{it.amount}</strong>
                  </div>
                ))}
                <div className="summary-divider"></div>
                <div className="summary-item summary-price">
                  <span>Estimated Total</span>
                  <strong>€{estimatedPrice}</strong>
                </div>
              </div>

              <div className="modal-actions" style={{ gridTemplateColumns: '1fr' }}>
                <button className="btn-cancel" onClick={() => setShowPriceDetails(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Part Customization Modal */}
      {selectedPart && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedPart(null)}>
            <div className="modal-content part-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setSelectedPart(null)}
              >
                ✕
              </button>

              <div className="part-modal-header">
                <span className="part-modal-icon">{getPartInfo(selectedPart).icon}</span>
                <h2>{getPartInfo(selectedPart).title}</h2>
              </div>

              <p className="part-modal-description">
                {getPartInfo(selectedPart).description}
              </p>

              <div className="part-modal-options">
                <h3>Current Configuration</h3>
                {getPartInfo(selectedPart).options?.map((option, idx) => (
                  <div key={idx} className="part-option-item">
                    <span className="option-label">{option.label}:</span>
                    <span className="option-value">{option.value}</span>
                  </div>
                ))}
              </div>

              <div className="ai-prompt-section">
                <h3>Customize with AI</h3>
                <p className="ai-prompt-hint">Describe how you'd like to modify this {selectedPart}</p>
                <textarea
                  className="ai-prompt-input"
                  placeholder={`e.g., "Make the ${selectedPart} more elegant and vintage-inspired"`}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setSelectedPart(null)}>
                  Cancel
                </button>
                <button className="btn-purchase" onClick={handleAiPromptSubmit}>
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recalculate Modal */}
      {showRecalculateModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowRecalculateModal(false)}>
            <div className="modal-content part-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setShowRecalculateModal(false)}
              >
                ✕
              </button>

              <div className="part-modal-header">
                <span className="part-modal-icon">🎨</span>
                <h2>Redesign Your Jewelry</h2>
              </div>

              <p className="part-modal-description">
                Describe your dream jewelry design. Tell us about the style, materials, and overall aesthetic you envision.
              </p>

              <div className="ai-prompt-section">
                <h3>Describe Your Vision</h3>
                <p className="ai-prompt-hint">e.g., "I want a delicate vintage-style ring with a cushion-cut diamond and rose gold band"</p>
                <textarea
                  className="ai-prompt-input"
                  placeholder="Describe your ideal jewelry design..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowRecalculateModal(false)}>
                  Cancel
                </button>
                <button className="btn-purchase" onClick={handleRecalculateWithPrompt}>
                  Redesign
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DesignIterator;
