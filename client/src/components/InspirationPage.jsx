import React from "react";
import { useNavigate, useParams } from "react-router";
import "../styles/InspirationPage.css";
import { useHeader } from "./HeaderContext";
import ringIcon from "../../images/ring.png";
import braceletIcon from "../../images/bracelet.png";
import necklaceIcon from "../../images/necklace.png";
import earringsIcon from "../../images/earrings.png";

const categories = {
  rings: {
    label: "Rings",
    icon: ringIcon,
    filePrefix: "ring",
  },
  bracelets: {
    label: "Bracelets",
    icon: braceletIcon,
    filePrefix: "bracelet",
  },
  necklaces: {
    label: "Necklaces",
    icon: necklaceIcon,
    filePrefix: "necklace",
  },
  earrings: {
    label: "Earrings",
    icon: earringsIcon,
    filePrefix: "earrings",
  },
};

const makeImages = (prefix) => {
  // For rings we show a curated set of 8 images (2 rows x 4 per row).
  if (prefix === 'ring') {
    const ringIndexes = [6, 22, 9, 10, 14, 13, 16, 7];
    const modelFile = `/models/${prefix}.obj`;

    // Predefined concept configs for each ring tile (index matched to ringIndexes order)
    const ringConcepts = [
      { material:'platinum', materialColor: 'platinum', stoneColor: 'pink', bandDesign: 'Knife', stoneShape: 'brilliant', headModel: 'twirl', metalFinish: 'matte', polish: 0.85, clarity: 0.9},
      { material: 'silver', materialColor: 'silver', stoneColor: 'clear', bandDesign: 'Classic', stoneShape: 'diamond', headModel: '4prongs', metalFinish: 'hammered', polish: 0.7, clarity: 0.7, design: 'organic', style: 'vintage' },
      { material: 'rose', materialColor: 'rose', stoneColor: 'red', bandDesign: 'Flat', stoneShape: 'gem', headModel: '2prongs', metalFinish: 'polished', polish: 0.9, clarity: 0.95, design: 'geometric', style: 'pavé' },
      { material: 'silver', materialColor: 'silver', stoneColor: 'clear', bandDesign: 'Classic', stoneShape: 'diamond', headModel: 'twirl', metalFinish: 'polished', polish: 0.8, clarity: 0.85, design: 'delicate', style: 'solitaire' },
      { material: 'platinum', materialColor: 'platinum', stoneColor: 'green', bandDesign: 'Classic', stoneShape: 'gem', headModel: '4prongs', metalFinish: 'polished', polish: 0.65, clarity: 0.7, design: 'statement', style: 'halo' },
      { material: 'gold', materialColor: 'gold', stoneColor: 'blue', bandDesign: 'Flat', stoneShape: 'brilliant', headModel: '4prongs', metalFinish: 'hammered', polish: 0.8, clarity: 0.8, design: 'delicate', style: 'solitaire' },
      { material: 'silver', materialColor: 'silver', stoneColor: 'clear', bandDesign: 'Knife', stoneShape: 'diamond', headModel: '2prongs', metalFinish: 'matte', polish: 0.75, clarity: 0.8, design: 'statement', style: 'halo' },
      { material: 'gold', materialColor: 'gold', stoneColor: 'clear', bandDesign: 'Classic', stoneShape: 'gem', headModel: '4prongs', metalFinish: 'polished', polish: 0.9, clarity: 0.9, design: 'delicate', style: 'pavé' },
    ];

    return ringIndexes.map((i, idx) => ({ imageFile: `/images/${prefix}${i}.png`, modelFile, conceptConfig: ringConcepts[idx] || {} }));
  }

  // Build 8 image objects for inspirations grid (default)
  const arr = [];
  const modelFile = `/models/${prefix}.obj`; // Use same model for all
  for (let i = 1; i <= 8; i++) {
    const imageFile = `/images/${prefix}${i}.png`;
    arr.push({ imageFile, modelFile });
  }
  return arr;
};

const InspirationPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const current = categories[category] || categories["rings"];

  const images = makeImages(current.filePrefix);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSelect = (item) => {
    // Go directly to the designer and include a conceptConfig (if available)
    navigate("/design", { state: { modelPath: item.modelFile, from: 'inspiration', conceptConfig: item.conceptConfig } });
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
    <div className="inspiration-page">
      <main className="inspiration-main">
        <h2>{current.label} Inspiration</h2>
        <div className="inspiration-grid">
          {images.map((item, idx) => {
            const isRing = current.filePrefix === 'ring';
            return (
              <div
                key={idx}
                className={`inspiration-tile ${isRing ? '' : 'not-clickable'}`}
                onClick={() => isRing && handleSelect(item)}
                aria-disabled={!isRing}
                tabIndex={isRing ? 0 : -1}
              >
                <img
                  src={item.imageFile}
                  alt={`${current.filePrefix} ${idx + 1}`}
                  onError={(e) => (e.currentTarget.src = current.icon)}
                />
                {!isRing && (
                  <div className="coming-soon-badge">Available Soon</div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default InspirationPage;
