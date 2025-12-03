import React from "react";
import "./App.css";

function Home() {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Benvenuto su Jewelify!</h1>
                <p>Questa è una pagina di home di prova.</p>
            </header>
            <main>
                <section className="home-section">
                    <h2>Scopri le funzionalità</h2>
                    <ul>
                        <li>Visualizza le carte</li>
                        <li>Gestisci il tuo profilo</li>
                        <li>Esplora le collezioni</li>
                    </ul>
                </section>
            </main>
            <footer className="home-footer">
                <p>&copy; 2025 Jewelify</p>
            </footer>
        </div>
    );
}

export default Home;
