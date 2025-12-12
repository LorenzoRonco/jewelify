import React, { useRef, useEffect, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
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
  return <primitive object={object.clone()} />;
};

const GLTFModel = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene.clone()} />;
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
    if (!groupRef.current) return;

    groupRef.current.traverse((mesh) => {
      if (mesh.isMesh && mesh.material) {
        // Handle metal material
        if (mesh.name.includes("metal") || mesh.name.includes("band")) {
          const material =
            mesh.material instanceof Array ? mesh.material[0] : mesh.material;

          if (material && material.isMeshStandardMaterial) {
            // Update metal color instantly
            if (config?.materialColor) {
              const colorMap = {
                gold: 0xffd700,
                silver: 0xe8e8e8,
                rose: 0xb76e79,
                platinum: 0xe5e4e2,
              };
              material.color.setHex(
                colorMap[config.materialColor] || 0xffd700
              );
            }

            // Update metallic polish instantly
            if (config?.polish !== undefined) {
              material.roughness = 1 - config.polish; // Inverse: high polish = low roughness
              material.metalness = 0.8 + config.polish * 0.2;
            }
          }
        }

        // Handle stone/gemstone material
        if (mesh.name.includes("stone") || mesh.name.includes("gem")) {
          const material =
            mesh.material instanceof Array ? mesh.material[0] : mesh.material;

          if (material && material.isMeshStandardMaterial) {
            // Update stone color instantly
            if (config?.stoneColor) {
              const stoneColorMap = {
                clear: 0xffffff,
                pink: 0xffc0cb,
                blue: 0x0000ff,
                green: 0x00ff00,
                red: 0xff0000,
                yellow: 0xffff00,
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
  }, [config?.materialColor, config?.polish, config?.stoneColor, config?.clarity, onMaterialUpdate]);

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

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
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

  return (
    <div className="three-canvas-container">
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 3], fov: 50 }}
        className="canvas-main"
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting setup for jewelry */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 7]} intensity={1} />
        <directionalLight position={[-5, -10, -7]} intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.8} />

        {/* Model with hybrid material logic */}
        <JewelModel
          modelPath={
            config.modelPath ||
            "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"
          }
          config={config}
        />

        {/* Orbit controls for touch interaction */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
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
