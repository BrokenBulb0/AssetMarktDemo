import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  X,
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Grid3x3, 
  Sun, 
  Moon,
  Maximize2,
  Move
} from "lucide-react";

interface FullScreenViewerProps {
  modelUrl: string;
  assetTitle: string;
  category?: string;
  onClose: () => void;
}

export function FullScreenViewer({ modelUrl, assetTitle, category = "props", onClose }: FullScreenViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [darkLighting, setDarkLighting] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Category-specific geometry
    let geometry: THREE.BufferGeometry;
    let materialColor = 0xb854d4;
    let emissiveColor = 0x4a1568;

    switch (category) {
      case 'characters':
        geometry = new THREE.CapsuleGeometry(0.6, 2, 16, 32);
        materialColor = 0xff6b9d;
        emissiveColor = 0x8b2252;
        break;
      case 'environments':
        geometry = new THREE.BoxGeometry(4, 0.6, 4);
        materialColor = 0x3dd0e3;
        emissiveColor = 0x1a5f6b;
        break;
      case 'props':
        geometry = new THREE.TorusKnotGeometry(2, 0.6, 128, 32);
        materialColor = 0xb854d4;
        emissiveColor = 0x4a1568;
        break;
      case 'effects':
        geometry = new THREE.IcosahedronGeometry(2, 3);
        materialColor = 0xff9d00;
        emissiveColor = 0xcc7000;
        break;
      case 'animations':
        geometry = new THREE.TorusGeometry(2, 0.6, 32, 64);
        materialColor = 0x00ff9d;
        emissiveColor = 0x00cc7a;
        break;
      case 'ui':
        geometry = new THREE.BoxGeometry(3, 1.8, 0.3, 12, 12, 2);
        materialColor = 0x8b5cf6;
        emissiveColor = 0x4c2889;
        break;
      default:
        geometry = new THREE.TorusKnotGeometry(2, 0.6, 128, 32);
        materialColor = 0xb854d4;
        emissiveColor = 0x4a1568;
    }

    const material = new THREE.MeshStandardMaterial({
      color: materialColor,
      metalness: 0.8,
      roughness: 0.2,
      emissive: emissiveColor,
      emissiveIntensity: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x1a1a1a);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    const ambientLight = new THREE.AmbientLight(0xffffff, darkLighting ? 0.4 : 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, darkLighting ? 0.7 : 1.2);
    keyLight.position.set(8, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x3dd0e3, darkLighting ? 0.3 : 0.5);
    fillLight.position.set(-8, 5, -8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xb854d4, darkLighting ? 0.2 : 0.4);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      setAutoRotate(false);
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

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      
      const zoomSpeed = 0.5;
      const direction = e.deltaY > 0 ? 1 : -1;
      
      camera.position.z += direction * zoomSpeed;
      camera.position.z = Math.max(4, Math.min(20, camera.position.z));
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      if (autoRotate && meshRef.current && !isDraggingRef.current) {
        meshRef.current.rotation.y += 0.003;
      }
      
      renderer.render(scene, camera);
    };
    animate();

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
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, category]);

  useEffect(() => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).wireframe = wireframe;
    }
  }, [wireframe]);

  useEffect(() => {
    if (sceneRef.current) {
      const lights = sceneRef.current.children.filter(child => child instanceof THREE.Light);
      lights.forEach(light => {
        if (light instanceof THREE.AmbientLight) {
          light.intensity = darkLighting ? 0.4 : 0.7;
        } else if (light instanceof THREE.DirectionalLight) {
          if (light.color.getHex() === 0xffffff) {
            light.intensity = darkLighting ? 0.7 : 1.2;
          } else if (light.color.getHex() === 0x3dd0e3) {
            light.intensity = darkLighting ? 0.3 : 0.5;
          } else if (light.color.getHex() === 0xb854d4) {
            light.intensity = darkLighting ? 0.2 : 0.4;
          }
        }
      });
    }
  }, [darkLighting]);

  const resetCamera = () => {
    if (cameraRef.current && meshRef.current) {
      cameraRef.current.position.set(0, 3, 10);
      meshRef.current.rotation.set(0, 0, 0);
      setAutoRotate(true);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(4, cameraRef.current.position.z - 1.5);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(20, cameraRef.current.position.z + 1.5);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <Maximize2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{assetTitle}</h2>
            <span className="text-sm text-muted-foreground">Full Screen Preview</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-fullscreen"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 relative">
          <div ref={containerRef} className="w-full h-full" />

          <Card className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 bg-background/90 backdrop-blur-md shadow-2xl">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetCamera}
                title="Reset View"
                data-testid="button-reset-view-fullscreen"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomIn}
                title="Zoom In"
                data-testid="button-zoom-in-fullscreen"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomOut}
                title="Zoom Out"
                data-testid="button-zoom-out-fullscreen"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="w-px bg-border mx-1" />
              <Button
                variant={wireframe ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setWireframe(!wireframe)}
                title="Toggle Wireframe"
                data-testid="button-wireframe-fullscreen"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={darkLighting ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setDarkLighting(!darkLighting)}
                title="Toggle Lighting"
                data-testid="button-lighting-fullscreen"
              >
                {darkLighting ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button
                variant={autoRotate ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setAutoRotate(!autoRotate)}
                title="Toggle Auto-Rotate"
                data-testid="button-autorotate-fullscreen"
              >
                <Move className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          <div className="absolute top-6 left-6 bg-background/90 backdrop-blur-md rounded-lg px-4 py-3 text-sm shadow-lg">
            <div className="space-y-1 text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Drag to rotate
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Scroll to zoom
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                ESC to exit
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
