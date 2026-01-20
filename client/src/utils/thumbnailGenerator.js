import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * Thumbnail generator for 3D models
 * Optimized for iPad performance with offscreen rendering
 */
class ThumbnailGenerator {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.loader = new GLTFLoader();
    this.initialized = false;
  }

  /**
   * Initialize the offscreen renderer (reused for all thumbnails)
   */
  initialize(size = 384) {
    if (this.initialized) return;

    try {
      // Ensure document body is available
      if (!document || !document.body) {
        console.error("Document body not available for thumbnail generation");
        return;
      }

      // Create hidden canvas
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.style.display = "none";
      document.body.appendChild(canvas);

      // Create renderer with minimal settings for performance
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true, // Required for toDataURL
      });
      this.renderer.setSize(size, size);
      this.renderer.setPixelRatio(1); // Keep pixel ratio low for iPad
      this.renderer.setClearColor(0xffffff, 0); // Transparent background

      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = null; // Transparent background

      // Create camera
      this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      this.camera.position.set(0, 0, 3);
      this.camera.lookAt(0, 0, 0);

      // Add simple lighting (no shadows for performance)
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
      directionalLight.position.set(5, 5, 5);
      this.scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight2.position.set(-5, 5, -5);
      this.scene.add(directionalLight2);

      // Add fill light to brighten dark areas
      const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
      fillLight.position.set(0, -5, 3);
      this.scene.add(fillLight);

      this.initialized = true;

      console.log("ThumbnailGenerator initialized successfully");
    } catch (error) {
      console.error("Failed to initialize ThumbnailGenerator:", error);
      this.initialized = false;
    }
  }

  /**
   * Normalize model: center it and scale to fit in view
   */
  normalizeModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the model
    model.position.sub(center);

    // Scale model to fit in frame
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.8 / maxDim; // Default 1.8 unless overridden
    model.scale.multiplyScalar(scale);

    // Position model lower for better framing
    model.position.y -= 0.9;
  }

  /**
   * Apply material properties to model
   */
  applyMaterials(model, config) {
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

    model.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = child.material.clone();
        const meshName = child.name.toLowerCase();

        // Determine type based on mesh name - stone model should only have stone meshes
        const isStone =
          meshName.includes("stone") ||
          meshName.includes("gem") ||
          meshName.includes("brilliant") ||
          meshName.includes("diamond");
        const isBandOrHead =
          meshName.includes("band") ||
          meshName.includes("head") ||
          meshName.includes("prong");

        if (isStone) {
          // Stone material
          mat.color.setHex(
            stoneColorMap[config.stoneColor] || stoneColorMap.clear,
          );
          mat.metalness = 0;
          mat.roughness = 0.1;
          mat.transparent = true;
          mat.opacity = 0.5 + (config.clarity || 0.5) * 0.5;
        } else if (
          isBandOrHead ||
          meshName.includes("shank") ||
          meshName.includes("setting")
        ) {
          // Metal material (band, head, or other metal parts)
          mat.color.setHex(colorMap[config.materialColor] || colorMap.gold);
          mat.metalness = 0.7; // Reduced from 1.0 for better visibility
          mat.roughness =
            typeof config.polish === "number"
              ? (1 - config.polish) * 0.6 + 0.15
              : 0.35;
        } else {
          // Default to metal for unknown meshes
          mat.color.setHex(colorMap[config.materialColor] || colorMap.gold);
          mat.metalness = 0.7; // Reduced from 1.0 for better visibility
          mat.roughness =
            typeof config.polish === "number"
              ? (1 - config.polish) * 0.6 + 0.15
              : 0.35;
        }

        mat.needsUpdate = true;
        child.material = mat;
      }
    });
  }

  /**
   * Load a GLTF model
   */
  loadModel(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => resolve(gltf.scene),
        undefined,
        (error) => reject(error),
      );
    });
  }

  /**
   * Generate thumbnail for a single model
   * Returns base64 data URL
   */
  async generateThumbnail(bandPath, stonePath, config) {
    // Ensure initialization is complete
    if (!this.initialized) {
      this.initialize();
    }

    // Verify scene exists before proceeding
    if (!this.scene || !this.renderer || !this.camera) {
      console.error("ThumbnailGenerator not properly initialized");
      return null;
    }

    try {
      // Load band, head, and stone models
      const [band, head, stone] = await Promise.all([
        this.loadModel(bandPath),
        config.headPath
          ? this.loadModel(config.headPath)
          : Promise.resolve(null),
        this.loadModel(stonePath),
      ]);

      // Create group to hold all models
      const group = new THREE.Group();
      group.add(band);
      if (head) group.add(head);
      group.add(stone);

      // Apply materials
      this.applyMaterials(band, config);
      if (head) this.applyMaterials(head, config);
      this.applyMaterials(stone, config);

      // Normalize and add to scene
      this.normalizeModel(group);

      // Apply custom scaling if specified (e.g., for Concept 2)
      if (config.thumbnailScale && config.thumbnailScale !== 1.8) {
        const scaleRatio = config.thumbnailScale / 1.8;
        group.scale.multiplyScalar(scaleRatio);
      }

      this.scene.add(group);

      // Rotate for better angle (fixed angle for consistency)
      group.rotation.y = Math.PI / 6; // 30 degrees left
      group.rotation.x = Math.PI / 6; // 30 degrees up

      // Render single frame
      this.renderer.render(this.scene, this.camera);

      // Extract image as base64
      const dataURL = this.renderer.domElement.toDataURL("image/png", 0.9);

      // Clean up: remove model from scene
      this.scene.remove(group);
      group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      return dataURL;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return null;
    }
  }

  /**
   * Generate thumbnails for multiple models in batch
   * Returns array of base64 data URLs in same order as input
   */
  async generateBatch(models) {
    const thumbnails = [];

    for (const model of models) {
      const thumbnail = await this.generateThumbnail(
        model.bandPath,
        model.stonePath,
        model.config,
      );
      thumbnails.push(thumbnail);
    }

    return thumbnails;
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(
          this.renderer.domElement,
        );
      }
    }

    // Clear lights from scene before disposing
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      this.scene.clear();
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.initialized = false;

    console.log("ThumbnailGenerator disposed");
  }
}

// Create singleton instance
const thumbnailGenerator = new ThumbnailGenerator();

export default thumbnailGenerator;
