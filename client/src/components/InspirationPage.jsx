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
  // Build 8 image objects (imageUrl, modelPath) for a 4x2 grid
  const arr = [];
  for (let i = 1; i <= 8; i++) {
    const idx = String(i).padStart(2, "0");
    const imageFile = `/images/${prefix}_${idx}.png`;
    const modelFile = `/models/${prefix}_${idx}.obj`;
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

  const handleSelect = () => {
    // Route through generating splash then into the DesignIterator
    navigate("/generating", { state: { modelPath: "/models/Bracelet.obj", from: 'inspiration' } });
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
          {images.map((item, idx) => (
            <div
              key={idx}
              className="inspiration-tile"
              onClick={() => handleSelect()}
            >
              <img
                src={item.imageFile}
                alt={`${current.filePrefix} ${idx + 1}`}
                onError={(e) => (e.currentTarget.src = current.icon)}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default InspirationPage;
