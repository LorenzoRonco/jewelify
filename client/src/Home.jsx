import React from "react";
import "./styles/Home.css";
import earringsImg from "../images/earrings.png";
import necklaceImg from "../images/necklace.png";
import ringImg from "../images/ring.png";
import braceletImg from "../images/bracelet.png";

function Home({ onStartDesign }) {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>JEWELIFY</h1>
      </header>
      <main className="home-main">
        <section className="home-hero">
          <h2>Design YOUR jewelry</h2>
          <p>Create bespoke jewelry pieces tailored to your unique style.</p>
          <button className="btn-start-design" onClick={onStartDesign}>
            Start Designing
          </button>
        </section>
        <section className="home-features">
          <div className="feature-card">
            <div className="feature-icon">
              <img src={ringImg} alt="Ring Icon" className="ring-icon"/>
            </div>
            <h3>Rings</h3>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <img src={braceletImg} alt="Bracelet Icon" className="bracelet-icon"/>
            </div>
            <h3>Bracelets</h3>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <img src={necklaceImg} alt="Necklace Icon" className="necklace-icon"/>
            </div>
            <h3>Necklaces</h3>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <img src={earringsImg} alt="Earrings Icon" className="earrings-icon"/>
            </div>
            <h3>Earrings</h3>
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <p>&copy; 2025 Jewelify - Premium Custom Jewelry Design</p>
      </footer>
    </div>
  );
}

export default Home;
