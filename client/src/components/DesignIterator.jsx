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
    initialConfig = {
      ...baseConfig,
      bandPath: `http://localhost:5173/models/ring/${bandFile}`,
      stonePath: `http://localhost:5173/models/ring/${stoneFile}`,
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
    setIsLoading(true);
    setLoadingMessage("Recalculating design...");
    setTimeout(() => {
      const newConfig = getRandomConfigFromSurvey(surveyAnswers);
      // Update bandPath and stonePath to match bandDesign and stoneShape
      let bandFile = "BAND_CLASSIC.glb";
      if (newConfig.bandDesign === "Knife") bandFile = "BAND_KNIFE.glb";
      if (newConfig.bandDesign === "Flat") bandFile = "BAND_FLAT.glb";
      let stoneFile = "STONE_BRILLIANT.glb";
      if (newConfig.stoneShape === "diamond") stoneFile = "STONE_DIAMOND.glb";
      if (newConfig.stoneShape === "gem") stoneFile = "STONE_GEM.glb";
      const fullConfig = {
        ...newConfig,
        bandPath: `http://localhost:5173/models/ring/${bandFile}`,
        stonePath: `http://localhost:5173/models/ring/${stoneFile}`,
      };
      setConfig(fullConfig);
      setEstimatedDays(getEstimatedDays(fullConfig));
      setEstimatedPrice(getEstimatedPrice(fullConfig));
      setHistoryState({ history: [fullConfig], historyIndex: 0 });
      setIsLoading(false);
      setLoadingMessage("");
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

          {/* Band Design */}
          <div className="control-block">
            <label htmlFor="bandDesign">Band Design</label>
            <select
              id="bandDesign"
              value={config.bandDesign || "Classic"}
              onChange={e => {
                const val = e.target.value;
                let bandFile = "BAND_CLASSIC.glb";
                if (val === "Knife") bandFile = "BAND_KNIFE.glb";
                if (val === "Flat") bandFile = "BAND_FLAT.glb";
                const updates = {
                  bandDesign: val,
                  bandPath: `http://localhost:5173/models/ring/${bandFile}`,
                };
                runAfterPopup(`Generating band update...`, () => {
                  handleInstantUpdates(updates, updateEstimates);
                });
              }}
              disabled={isLoading}
            >
              <option value="Classic">Classic</option>
              <option value="Knife">Knife</option>
              <option value="Flat">Flat</option>
            </select>
          </div>


          {/* Material Color - INSTANT */}
          <div className="control-block">
            <label htmlFor="materialColor">Metal</label>
            <select
              id="materialColor"
              value={config.materialColor}
              onChange={(e) => {
                const val = e.target.value;
                runAfterPopup(`Generating metal update...`, () => {
                  handleConfigChange("materialColor", val);
                });
              }}
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="rose">Rose</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>

          {/* Polish Level - INSTANT slider */}
          <div className="control-block">
            <label htmlFor="polish">Polish Level</label>
            <input
              id="polish"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.polish}
              onChange={(e) =>
                handleConfigChange("polish", parseFloat(e.target.value))
              }
              className="slider"
            />
            <div className="slider-value">{(config.polish * 100).toFixed(0) === "0" ? "0% (matte)" : (config.polish * 100).toFixed(0) + "% (shiny)"}</div>
          </div>

          {/* Stone Shape */}
          <div className="control-block">
            <label htmlFor="stoneShape">STONE SHAPE</label>
            <select
              id="stoneShape"
              value={config.stoneShape || "brilliant"}
              onChange={e => {
                const val = e.target.value;
                let stoneFile = "STONE_BRILLIANT.glb";
                if (val === "diamond") stoneFile = "STONE_DIAMOND.glb";
                if (val === "gem") stoneFile = "STONE_GEM.glb";
                const updates = {
                  stoneShape: val,
                  stonePath: `http://localhost:5173/models/ring/${stoneFile}`,
                };
                runAfterPopup(`Generating stone shape...`, () => {
                  handleInstantUpdates(updates, updateEstimates);
                });
              }}
              disabled={isLoading}
            >
              <option value="brilliant">Brilliant</option>
              <option value="diamond">Diamond</option>
              <option value="gem">Gem</option>
            </select>
          </div>

          {/* Stone Color - INSTANT */}
          <div className="control-block">
            <label htmlFor="stoneColor">Stone Color</label>
            <select
              id="stoneColor"
              value={config.stoneColor}
              onChange={(e) => {
                const val = e.target.value;
                runAfterPopup(`Generating stone color...`, () => {
                  handleConfigChange("stoneColor", val);
                });
              }}
            >
              <option value="clear">Clear</option>
              <option value="pink">Pink</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
            </select>
          </div>

          {/* Clarity - INSTANT slider */}
          <div className="control-block">
            <label htmlFor="clarity">Clarity</label>
            <input
              id="clarity"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.clarity}
              onChange={(e) =>
                handleConfigChange("clarity", parseFloat(e.target.value))
              }
              className="slider"
            />
            <div className="slider-value">{(config.clarity * 100).toFixed(0)}%</div>
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
    </div>
  );
};

export default DesignIterator;
