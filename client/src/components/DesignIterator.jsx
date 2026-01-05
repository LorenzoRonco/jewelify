import React, { useState, useCallback } from "react";
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
  let incomingModelPath = location?.state?.modelPath;
  if (!incomingModelPath) incomingModelPath = "/models/Bracelet.obj";

  const [config, setConfig] = useState({
    design: "geometric",
    material: "palladium",
    style: "pavé",
    materialColor: "gold",
    metalFinish: "hammered",
    stoneColor: "clear",
    polish: 0.8,
    clarity: 0.9,
    modelPath: incomingModelPath || "/models/Bracelet.obj",
  });

  const [history, setHistory] = useState([config]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(1500);
  const [estimatedDays, setEstimatedDays] = useState("30-35");

  // INSTANT updates: Material properties that don't require server
  const handleInstantUpdate = useCallback((key, value) => {
    setConfig((prev) => {
      const updated = { ...prev, [key]: value };
      // Update history for undo/redo
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updated);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return updated;
    });
  }, [history, historyIndex]);

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
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
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
      handleInstantUpdate(key, value);
    } else {
      handleGeometryUpdate(key, value);
    }

    // Update estimated values after any change
    const nextConfig = { ...config, [key]: value };
    setEstimatedDays(getEstimatedDays(nextConfig));
    setEstimatedPrice(getEstimatedPrice(nextConfig));
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
    }
  };

  // Recalculate (refresh current design)
  const handleRecalculate = async () => {
    setIsLoading(true);
    setLoadingMessage("Recalculating design...");

    try {
      const result = await updateGeometry(config);
      setEstimatedPrice(result.price || 1500);
      setEstimatedDays(result.days || "30-35");
    } catch (error) {
      console.error("Recalculation failed:", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
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
        <div className="control-group">
          <button className="btn-icon" title="Undo" onClick={handleUndo} disabled={!canUndo}>↶</button>
          <button className="btn-icon" title="Redo" onClick={handleRedo} disabled={!canRedo}>↷</button>
          <button className="btn-icon" title="Recalculate" onClick={handleRecalculate} disabled={isLoading}>⟳</button>
        </div>
      </div>
    );

    return () => setRight(null);
  }, [config.modelPath, canUndo, canRedo, isLoading]);

  return (
    <div className="design-iterator">
      <main className="iterator-main">
        {/* Left side: 3D Canvas */}
        <section className="canvas-section">
          <ThreeCanvas
            config={config}
            isLoading={isLoading}
          />
          <div className="design-feedback">It's the one!</div>
        </section>

        {/* Right side: Controls */}
        <aside className="controls-section">
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
                handleInstantUpdate("bandDesign", val);
                handleInstantUpdate("bandPath", `http://localhost:5173/models/ring/${bandFile}`);
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
              onChange={(e) => handleConfigChange("materialColor", e.target.value)}
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
                handleInstantUpdate("stoneShape", val);
                handleInstantUpdate("stonePath", `http://localhost:5173/models/ring/${stoneFile}`);
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
              onChange={(e) => handleConfigChange("stoneColor", e.target.value)}
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

          {/* Pricing Info */}
          <div className="pricing-block">
            <h3>Estimated time for creation</h3>
            <p className="estimated-days">{estimatedDays} days</p>

            <h3>Live quote:</h3>
            <p className="live-price">€{estimatedPrice}</p>
            <button className="btn-more-details">... more details</button>
          </div>

          {/* Confirm Order Button */}
          <button
            className="btn-confirm-order"
            onClick={handleConfirmOrder}
            disabled={isLoading}
          >
            Confirm Order
          </button>
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
    </div>
  );
};

export default DesignIterator;
