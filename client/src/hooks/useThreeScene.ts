import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface ThreeSceneOptions {
  animationType?: "logo" | "cube" | "sphere" | "torus";
  autoRotate?: boolean;
  particleCount?: number;
  enableParticles?: boolean;
  cameraDistance?: number;
  color?: number;
  metalness?: number;
  roughness?: number;
}

export function useThreeScene(options: ThreeSceneOptions = {}) {
  const {
    animationType = "cube",
    autoRotate = true,
    particleCount = 200,
    enableParticles = false,
    cameraDistance = 5,
    color = 0xb854d4,
    metalness = 0.6,
    roughness = 0.2,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Dispose of Three.js resources
    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach(m => m.dispose());
      } else {
        meshRef.current.material.dispose();
      }
    }

    if (particlesRef.current) {
      particlesRef.current.geometry.dispose();
      if (Array.isArray(particlesRef.current.material)) {
        particlesRef.current.material.forEach(m => m.dispose());
      } else {
        particlesRef.current.material.dispose();
      }
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (containerRef.current?.contains(rendererRef.current.domElement)) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    }

    sceneRef.current = null;
    rendererRef.current = null;
    cameraRef.current = null;
    meshRef.current = null;
    particlesRef.current = null;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = cameraDistance;
    cameraRef.current = camera;

    // Renderer with optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create geometry based on type
    let geometry: THREE.BufferGeometry;
    switch (animationType) {
      case "cube":
        geometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(1.5, 32, 32);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100);
        break;
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2);
    }

    // Material
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x3dd0e3, 0.5);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Particles
    if (enableParticles) {
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        color,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      particlesRef.current = particles;
    }

    // Animation
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (autoRotate && meshRef.current) {
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.01;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [animationType, autoRotate, particleCount, enableParticles, cameraDistance, color, metalness, roughness, cleanup]);

  return { containerRef, sceneRef, cameraRef, meshRef };
}
