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
  console.log("DesignIterator loaded modelPath:", incomingModelPath);
  const [config, setConfig] = useState({
    design: "geometric",
    material: "palladium",
    style: "pavé",
    materialColor: "gold",
    metalFinish: "hammered",
    engraving: "laser",
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
          engraving: "Engraving precision...",
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
          <ThreeCanvas config={config} isLoading={isLoading} />
          <div className="design-feedback">It's the one!</div>
        </section>

        {/* Right side: Controls */}
        <aside className="controls-section">
          {/* Design Type */}
          <div className="control-block">
            <label htmlFor="design">Design</label>
            <select
              id="design"
              value={config.design}
              onChange={(e) => handleConfigChange("design", e.target.value)}
              disabled={isLoading}
            >
              <option value="geometric">Geometric</option>
              <option value="organic">Organic</option>
              <option value="delicate">Delicate</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          {/* Material */}
          <div className="control-block">
            <label htmlFor="material">Material</label>
            <select
              id="material"
              value={config.material}
              onChange={(e) => handleConfigChange("material", e.target.value)}
              disabled={isLoading}
            >
              <option value="palladium">Palladium</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>

          {/* Style */}
          <div className="control-block">
            <label htmlFor="style">Style</label>
            <select
              id="style"
              value={config.style}
              onChange={(e) => handleConfigChange("style", e.target.value)}
              disabled={isLoading}
            >
              <option value="pavé">Pavé</option>
              <option value="solitaire">Solitaire</option>
              <option value="halo">Halo</option>
              <option value="three-stone">Three Stone</option>
            </select>
          </div>

          {/* Material Color - INSTANT */}
          <div className="control-block">
            <label htmlFor="materialColor">Metal Color</label>
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
            <div className="slider-value">{(config.polish * 100).toFixed(0)}%</div>
          </div>

          {/* Metal Finish */}
          <div className="control-block">
            <label htmlFor="metalFinish">Metal Finish</label>
            <select
              id="metalFinish"
              value={config.metalFinish}
              onChange={(e) => handleConfigChange("metalFinish", e.target.value)}
            >
              <option value="polished">Polished</option>
              <option value="hammered">Hammered</option>
              <option value="brushed">Brushed</option>
              <option value="satin">Satin</option>
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

          {/* Engraving */}
          <div className="control-block">
            <label htmlFor="engraving">Engraving</label>
            <select
              id="engraving"
              value={config.engraving}
              onChange={(e) => handleConfigChange("engraving", e.target.value)}
              disabled={isLoading}
            >
              <option value="laser">Laser</option>
              <option value="hand">Hand</option>
              <option value="machine">Machine</option>
              <option value="etched">Etched</option>
              <option value="deep">Deep</option>
            </select>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setShowConfirmModal(false)}
            >
              ✕
            </button>
            <h2>Confirm Your Order</h2>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-item">
                <span>Material:</span>
                <strong>{config.material}</strong>
              </div>
              <div className="summary-item">
                <span>Style:</span>
                <strong>{config.style}</strong>
              </div>
              <div className="summary-item">
                <span>Metal Color:</span>
                <strong>{config.materialColor}</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item summary-price">
                <span>Total Price:</span>
                <strong>€{estimatedPrice}</strong>
              </div>
              <div className="summary-item">
                <span>Estimated Days:</span>
                <strong>{estimatedDays}</strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Edit Design
              </button>
              <button className="btn-purchase" onClick={handleExecutePurchase}>
                Complete Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignIterator;
