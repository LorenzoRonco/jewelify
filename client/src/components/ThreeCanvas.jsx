import React, { useRef, useEffect, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

/**
 * JewelModel Component
 * Handles the 3D model with HYBRID rendering strategy:
 * - INSTANT changes: Material, Color, Polish (Frontend only)
 * - ASYNC changes: Geometry (Server API with loading state)
 */
const OBJModel = ({ modelPath }) => {
  const object = useLoader(OBJLoader, modelPath);
  return <primitive object={object} scale={0.01} />;
};

const GLTFModel = ({ modelPath, scale = 1, materialColor, config }) => {
  const { scene } = useGLTF(modelPath);

  // Applica colore metallo, polish e colore stone
  useEffect(() => {
    if (!scene) return;
    const colorMap = {
      gold: 0xffd700,
      silver: 0xf5f3e7,
      rose: 0xb76e79,
      platinum: 0xc0e0ff,
    };
    const stoneColorMap = {
      clear: 0xe0f7ff,
      pink: 0xffc0cb,
      blue: 0x0000ff,
      green: 0x00ff00,
      red: 0xff0000,
      yellow: 0xffe066,
    };
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = Array.isArray(child.material) ? child.material[0] : child.material;
        const childNameLower = child.name.toLowerCase();
        const isStone = childNameLower.includes("stone") || childNameLower.includes("gem");

        // METAL (solo se non è stone e materialColor è passato)
        if (!isStone && materialColor) {
          if (mat && mat.isMeshStandardMaterial) {
            mat.color.setHex(colorMap[materialColor] || 0xffd700);
            const MIN_ROUGHNESS = 0.08;
            const MAX_ROUGHNESS = 0.6;
            if (typeof config?.polish === 'number') {
              mat.roughness = MIN_ROUGHNESS + (1 - config.polish) * (MAX_ROUGHNESS - MIN_ROUGHNESS);
            }
            mat.metalness = 1.0;
            // Do NOT set opacity for metal
            mat.needsUpdate = true;
          }
        }

        // STONE (applica sempre colore stone a tutti i mesh del modello stone)
        if (!materialColor && config?.stoneColor) {
          // Se non c'è materialColor, questo è il modello stone: colora tutti i mesh
          if (mat && mat.isMeshStandardMaterial) {
            mat.color.setHex(stoneColorMap[config.stoneColor] || 0xffffff);
            mat.roughness = 0.0;
            mat.metalness = 0.0;
            mat.transparent = true;
            // Apply clarity (opacity) only to stone
            if (typeof config?.clarity === 'number') {
              // Set minimum opacity to 0.7 (so stone never gets too transparent)
              mat.opacity = 0.7 + config.clarity * 0.3; // 0.7 (min) to 1.0 (max)
            } else {
              mat.opacity = 0.9;
            }
            mat.needsUpdate = true;
          }
        }
      }
    });
  }, [scene, materialColor, config?.polish, config?.stoneColor, config?.clarity]);

  // Usa direttamente primitive per renderizzare la scene
  return <primitive object={scene} scale={scale} />;
};

const JewelModel = ({
  modelPath = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
  config,
  onMaterialUpdate,
}) => {
  const groupRef = useRef();
  const [materialStore, setMaterialStore] = useState({
    baseColor: new THREE.Color(0xffd700), // Gold default
    polishLevel: 1.0, // 0-1
    metalColor: "gold",
    stoneColor: new THREE.Color(0xffffff), // White default
  });

  // The model loading is handled by child components (GLTFModel/OBJModel)

  // previously we added the loaded glTF scene directly to the groupRef when it changed.
  // Now GLTF/OBJ models are rendered as children of this group, so there's no direct
  // reference to a scene object here.

  // INSTANT: Update material colors and properties (Frontend-only)
  useEffect(() => {

    // Debug: log ogni volta che cambia polish
    let foundMesh = false;
    if (groupRef.current) {
      groupRef.current.traverse((mesh) => {
        if (mesh.isMesh && mesh.material) {
          if (
            mesh.name.toLowerCase().includes("band") ||
            mesh.name.toLowerCase().includes("metal") ||
            mesh.name.toLowerCase().includes("head")
          ) {
            foundMesh = true;
          }
        }
      });
    }
    if (config?.polish !== undefined) {
      if (foundMesh) {
        console.log(`[JewelModel] Polish: ${config.polish}`);
      } else {
        console.log(`[JewelModel] Polish: ${config.polish} (no mesh found)`);
      }
    }
    if (!groupRef.current) return;

    groupRef.current.traverse((mesh) => {
      if (mesh.isMesh && mesh.material) {
        // --- METAL MATERIAL (band, head, ecc.) ---
        if (
          mesh.name.toLowerCase().includes("band") ||
          mesh.name.toLowerCase().includes("metal") ||
          mesh.name.toLowerCase().includes("head")
        ) {
          let material = mesh.material instanceof Array ? mesh.material[0] : mesh.material;
          // Se non è già MeshPhysicalMaterial, convertilo
          if (material && !material.isMeshPhysicalMaterial && THREE.MeshPhysicalMaterial) {
            const newMat = new THREE.MeshPhysicalMaterial();
            newMat.copy(material);
            mesh.material = newMat;
            material = newMat;
          }
          if (material && (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial)) {
            // Colore metallo
            if (config?.materialColor) {
              const colorMap = {
                gold: 0xffd700,
                silver: 0xf5f3e7,
                rose: 0xb76e79,
                platinum: 0xc0e0ff,
              };
              material.color.setHex(colorMap[config.materialColor] || 0xffd700);
            }
            // Aspetto metallico ancora più realistico
            material.metalness = 1.0;
            // Polish: 0 (matte) -> roughness 1, 1 (mirror) -> roughness 0
            if (typeof config?.polish === 'number') {
              material.roughness = 1 - config.polish;
              console.log(`[JewelModel] mesh: ${mesh.name}, polish: ${config.polish}, roughness: ${material.roughness}`);
            } else {
              material.roughness = 0.08;
              console.log(`[JewelModel] mesh: ${mesh.name}, polish: default, roughness: 0.08`);
            }
            material.clearcoat = 1.0;
            material.clearcoatRoughness = 0.05;
            material.reflectivity = 1.0;
            material.envMapIntensity = 1.5;
            material.needsUpdate = true;
            // Applica una envMap semplice per riflessi (se non già presente)
            if (!material.envMap) {
              const envMap = new THREE.TextureLoader().load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/cube/SwedishRoyalCastle/px.jpg");
              material.envMap = envMap;
              material.envMapIntensity = 1.5;
            }
          }
        }
        // --- STONE/GEM MATERIAL ---
        if (mesh.name.toLowerCase().includes("stone") || mesh.name.toLowerCase().includes("gem")) {
          const material = mesh.material instanceof Array ? mesh.material[0] : mesh.material;
          if (material && material.isMeshStandardMaterial) {
            // Update stone color instantly
            if (config?.stoneColor) {
              const stoneColorMap = {
                clear: 0xe0f7ff,   // Clear: azzurro molto chiaro
                pink: 0xffc0cb,
                blue: 0x0000ff,
                green: 0x00ff00,
                red: 0xff0000,
                yellow: 0xffe066,  // Yellow: più caldo, giallo intenso
              };
              material.color.setHex(
                stoneColorMap[config.stoneColor] || 0xffffff
              );
            }

            // Update stone transparency
            if (config?.clarity !== undefined) {
              material.transparent = true;
              material.opacity = 0.5 + config.clarity * 0.5; // 50-100% opacity
            }
          }
        }
      }
    });

    // Store for reference
    setMaterialStore({
      metalColor: config?.materialColor || "gold",
      stoneColor: config?.stoneColor || "clear",
      polishLevel: config?.polish || 1.0,
    });

    if (onMaterialUpdate) {
      onMaterialUpdate(materialStore);
    }
  }, [config?.materialColor, config?.polish, config?.stoneColor, config?.clarity, onMaterialUpdate, materialStore]);

  const cleanPath = (modelPath || "").split("?")[0].toLowerCase();
  const ext = cleanPath.split(".").pop();
  const isObj = ext === "obj";
  const isBraceletPlaceholder = cleanPath.includes("bracelet");

  // If using the placeholder Bracelet.obj, render a simple torus so the user sees a bracelet
  if (isBraceletPlaceholder) {
    return (
      <group ref={groupRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.6, 1.6, 1.6]}>
        <mesh name="band" castShadow receiveShadow position={[0, 0, 0]}>
          <torusGeometry args={[0.7, 0.14, 32, 160]} />
          <meshStandardMaterial
            metalness={0.95}
            roughness={0.12}
            color={
              ({ gold: 0xffd700, silver: 0xe8e8e8, rose: 0xb76e79 }[config?.materialColor] || 0xffd700)
            }
          />
        </mesh>
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 10, 10]} intensity={0.9} />
      </group>
    );
  }

  // Forza il remount del gruppo 3D quando cambia polish
  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, 0, 0]} key={`polish-${config?.polish}`}>
      {isObj ? (
        <OBJModel modelPath={modelPath} />
      ) : (
        <GLTFModel modelPath={modelPath} />
      )}
    </group>
  );
};

/**
 * ThreeCanvas Component
 * Main 3D rendering component with orbit controls and responsive sizing
 * Optimized for tablet touch interaction
 */
const ThreeCanvas = ({ config = {}, isLoading = false }) => {
  const canvasRef = useRef();
  const [zoomLevel, setZoomLevel] = useState(30);
  const MAX_ZOOM = 100;

  // Combined ring models from local public folder
  const bandPath = config.bandPath || "http://localhost:5173/models/ring/BAND_CLASSIC.glb";
  const headPath = "http://localhost:5173/models/ring/HEAD_4PRONGS.glb";
  const stonePath = config.stonePath || "http://localhost:5173/models/ring/STONE_BRILLIANT.glb";

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 2, MAX_ZOOM));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 2, 2));

  return (
    <div className="three-canvas-container">
      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            width: '50px',
            height: '50px',
            fontSize: '24px',
            borderRadius: '50%',
            border: '2px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: '50px',
            height: '50px',
            fontSize: '24px',
            borderRadius: '50%',
            border: '2px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          −
        </button>
      </div>
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 4], fov: 50 }}
        className="canvas-main"
        gl={{ antialias: true, alpha: true }}
      >
        {/* HDRI Environment for realistic reflections */}
        <React.Suspense fallback={null}>
          <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr" background={false} />
        </React.Suspense>
        {/* Lighting setup for jewelry */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 7]} intensity={1} />
        <directionalLight position={[-5, -10, -7]} intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.8} />

        {/* Render combined ring model */}
        <React.Suspense fallback={null}>
          <GLTFModel modelPath={bandPath} scale={zoomLevel} materialColor={config.materialColor} config={config} />
          <GLTFModel modelPath={headPath} scale={zoomLevel} materialColor={config.materialColor} config={config} />
          <GLTFModel modelPath={stonePath} scale={zoomLevel} config={config} />
        </React.Suspense>

        {/* Orbit controls for touch interaction */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={100}
        />
      </Canvas>

      {/* Loading overlay for geometry changes */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">Reshaping metal...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeCanvas;
