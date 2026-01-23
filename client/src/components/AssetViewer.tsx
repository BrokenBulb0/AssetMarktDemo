import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Grid3x3, 
  Sun, 
  Moon,
  Sparkles
} from "lucide-react";

interface AssetViewerProps {
  modelUrl: string;
  className?: string;
  category?: string;
}

export function AssetViewer({ modelUrl, className = "", category = "props" }: AssetViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [darkLighting, setDarkLighting] = useState(false);
  const [showEnvMap, setShowEnvMap] = useState(true);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const isTouchRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene with gradient background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f0f);
    scene.fog = new THREE.Fog(0x0f0f0f, 15, 35);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer with enhanced settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create environment map for reflections
    const envMapTexture = new THREE.CubeTextureLoader().load([
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    ]);

    // Create category-specific geometry and materials
    let geometry: THREE.BufferGeometry;
    let materialColor = 0xb854d4;
    let emissiveColor = 0x4a1568;

    switch (category) {
      case 'characters':
        // Humanoid-like capsule for character assets
        geometry = new THREE.CapsuleGeometry(0.5, 2, 16, 32);
        materialColor = 0xff6b9d;
        emissiveColor = 0x8b2252;
        break;
      
      case 'environments':
        // Layered terrain-like structure
        geometry = new THREE.BoxGeometry(3, 0.5, 3);
        materialColor = 0x3dd0e3;
        emissiveColor = 0x1a5f6b;
        break;
      
      case 'props':
        // Interesting geometric prop
        geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 128, 32);
        materialColor = 0xb854d4;
        emissiveColor = 0x4a1568;
        break;
      
      case 'effects':
        // Particle-like sphere cluster
        geometry = new THREE.IcosahedronGeometry(1.3, 2);
        materialColor = 0xff9d00;
        emissiveColor = 0xcc7000;
        break;
      
      case 'animations':
        // Dynamic figure-eight shape
        geometry = new THREE.TorusGeometry(1.2, 0.4, 24, 48);
        materialColor = 0x00ff9d;
        emissiveColor = 0x00cc7a;
        break;
      
      case 'ui':
        // Clean geometric UI element
        geometry = new THREE.BoxGeometry(2, 1.2, 0.2, 8, 8, 1);
        materialColor = 0x8b5cf6;
        emissiveColor = 0x4c2889;
        break;
      
      default:
        geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 128, 32);
        materialColor = 0xb854d4;
        emissiveColor = 0x4a1568;
    }

    const material = new THREE.MeshStandardMaterial({
      color: materialColor,
      metalness: 0.85,
      roughness: 0.15,
      wireframe: wireframe,
      envMap: showEnvMap ? envMapTexture : null,
      envMapIntensity: 1.5,
      emissive: emissiveColor,
      emissiveIntensity: 0.2,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    // Grid helper with better colors
    const gridHelper = new THREE.GridHelper(12, 20, 0x666666, 0x2a2a2a);
    gridHelper.position.y = -2.5;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Add circular platform for better presentation
    const platformGeometry = new THREE.CylinderGeometry(2, 2, 0.1, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.3,
      roughness: 0.7,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -2.5;
    platform.receiveShadow = true;
    scene.add(platform);

    // Professional three-point lighting setup
    const ambientLight = new THREE.AmbientLight(0x6a4c93, darkLighting ? 0.4 : 0.7);
    scene.add(ambientLight);

    // Key Light (main light)
    const keyLight = new THREE.DirectionalLight(0xffffff, darkLighting ? 0.8 : 1.5);
    keyLight.position.set(6, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Fill Light (softens shadows)
    const fillLight = new THREE.DirectionalLight(0x3dd0e3, darkLighting ? 0.3 : 0.6);
    fillLight.position.set(-6, 4, -5);
    scene.add(fillLight);

    // Rim/Back Light (creates depth)
    const rimLight = new THREE.DirectionalLight(0xb854d4, darkLighting ? 0.4 : 0.7);
    rimLight.position.set(0, 4, -8);
    scene.add(rimLight);

    // Accent lights for dynamic atmosphere
    const accentLight1 = new THREE.PointLight(0xb854d4, darkLighting ? 0.5 : 1, 15);
    accentLight1.position.set(4, 2, 2);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x3dd0e3, darkLighting ? 0.5 : 1, 15);
    accentLight2.position.set(-4, 2, -2);
    scene.add(accentLight2);

    // Mouse controls
    // Mouse controls with smooth damping
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      isTouchRef.current = false;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !meshRef.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      meshRef.current.rotation.y += deltaX * 0.008;
      meshRef.current.rotation.x += deltaY * 0.008;

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch controls for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        isTouchRef.current = true;
        previousMousePosition.current = { 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !meshRef.current || e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const deltaX = touch.clientX - previousMousePosition.current.x;
      const deltaY = touch.clientY - previousMousePosition.current.y;

      meshRef.current.rotation.y += deltaX * 0.01;
      meshRef.current.rotation.x += deltaY * 0.01;

      previousMousePosition.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      isTouchRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      
      const zoomSpeed = 0.1;
      const direction = e.deltaY > 0 ? 1 : -1;
      
      camera.position.z += direction * zoomSpeed;
      camera.position.z = Math.max(3, Math.min(15, camera.position.z));
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', handleTouchEnd);

    // Animation with subtle auto-rotation when idle
    let animationFrameId: number;
    let idleTime = 0;
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      if (!isDraggingRef.current) {
        idleTime += delta;
        // Subtle auto-rotation after 2 seconds of idle
        if (idleTime > 2 && meshRef.current) {
          meshRef.current.rotation.y += 0.002;
        }
      } else {
        idleTime = 0;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      renderer.domElement.removeEventListener('touchmove', handleTouchMove);
      renderer.domElement.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      envMapTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [wireframe, darkLighting, showEnvMap, modelUrl, category]);

  const resetCamera = () => {
    if (cameraRef.current && meshRef.current) {
      cameraRef.current.position.set(0, 2, 8);
      meshRef.current.rotation.set(0, 0, 0);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(3, cameraRef.current.position.z - 1);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(15, cameraRef.current.position.z + 1);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />
      
      <Card className="absolute bottom-4 left-4 p-2 bg-background/80 backdrop-blur">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetCamera}
            title="Reset View"
            data-testid="button-reset-view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            title="Zoom In"
            data-testid="button-zoom-in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            title="Zoom Out"
            data-testid="button-zoom-out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant={wireframe ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Wireframe"
            data-testid="button-wireframe"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={darkLighting ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setDarkLighting(!darkLighting)}
            title="Toggle Lighting"
            data-testid="button-lighting"
          >
            {darkLighting ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button
            variant={showEnvMap ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowEnvMap(!showEnvMap)}
            title="Toggle Reflections"
            data-testid="button-reflections"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur rounded-lg px-3 py-2 text-sm text-muted-foreground">
        <p>Drag to rotate • Scroll to zoom</p>
        <p className="text-xs mt-1 opacity-75">Touch supported on mobile</p>
      </div>
    </div>
  );
}
