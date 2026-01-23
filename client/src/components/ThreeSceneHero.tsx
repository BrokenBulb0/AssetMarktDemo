import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeSceneHeroProps {
  className?: string;
}

export function ThreeSceneHero({ className = "" }: ThreeSceneHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points[]>([]);
  const geometryObjectsRef = useRef<THREE.Mesh[]>([]);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL support
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e) {
        return false;
      }
    };

    if (!checkWebGLSupport()) {
      setWebGLSupported(false);
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;

    try {
      // Scene setup
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);
      sceneRef.current = scene;

      // Camera with cinematic settings
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 30);
      cameraRef.current = camera;

      // Renderer with error handling
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (error) {
      console.error('Failed to initialize WebGL renderer:', error);
      setWebGLSupported(false);
      return;
    }

    // Create advanced particle field with multiple patterns
    const createParticleLayer = (scene: THREE.Scene, count: number, spread: number, color: number, size: number, pattern: string = 'tunnel') => {
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = i / count;
        
        switch (pattern) {
          case 'tunnel':
            // Cylindrical tunnel
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * spread;
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = Math.sin(angle) * radius;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;
            break;
          
          case 'spiral':
            // Spiral pattern
            const spiralAngle = t * Math.PI * 8 + Math.random() * 0.5;
            const spiralRadius = 5 + t * spread;
            positions[i3] = Math.cos(spiralAngle) * spiralRadius;
            positions[i3 + 1] = Math.sin(spiralAngle) * spiralRadius;
            positions[i3 + 2] = (t - 0.5) * 150 + (Math.random() - 0.5) * 10;
            break;
          
          case 'wave':
            // Wave pattern
            const waveX = (Math.random() - 0.5) * spread * 2;
            const waveZ = (Math.random() - 0.5) * 200;
            positions[i3] = waveX;
            positions[i3 + 1] = Math.sin(waveX * 0.2 + waveZ * 0.1) * 8;
            positions[i3 + 2] = waveZ;
            break;
          
          case 'sphere':
            // Sphere shell
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;
            const r = 15 + Math.random() * spread;
            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);
            break;
        }
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        color: color,
        size: size,
        transparent: true,
        opacity: pattern === 'sphere' ? 0.6 : 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      particlesRef.current.push(particles);
      return particles;
    };

    // Create multiple particle layers with different patterns
    createParticleLayer(scene, 1000, 20, 0xb854d4, 0.15, 'tunnel');  // Purple tunnel
    createParticleLayer(scene, 700, 15, 0x3dd0e3, 0.1, 'spiral');    // Cyan spiral
    createParticleLayer(scene, 500, 25, 0x8b5cf6, 0.12, 'tunnel');   // Violet tunnel
    createParticleLayer(scene, 400, 30, 0xff6b9d, 0.08, 'wave');     // Pink waves
    createParticleLayer(scene, 300, 12, 0x00ff9d, 0.2, 'sphere');    // Green sphere

    // Add diverse floating 3D objects with advanced geometries
    const createFloatingObjects = () => {
      const colors = [
        { base: 0xb854d4, emissive: 0x6a2a8c },
        { base: 0x3dd0e3, emissive: 0x1a7a8c },
        { base: 0xff6b9d, emissive: 0xcc2866 },
        { base: 0x00ff9d, emissive: 0x00cc7a },
        { base: 0xff9d00, emissive: 0xcc7000 },
        { base: 0x8b5cf6, emissive: 0x4c2889 },
      ];

      const geometries = [
        new THREE.OctahedronGeometry(0.5, 1),
        new THREE.TetrahedronGeometry(0.6, 0),
        new THREE.IcosahedronGeometry(0.4, 1),
        new THREE.TorusGeometry(0.4, 0.15, 16, 32),
        new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16),
        new THREE.DodecahedronGeometry(0.4, 0),
        new THREE.ConeGeometry(0.3, 0.8, 16),
        new THREE.CapsuleGeometry(0.2, 0.6, 8, 16),
      ];

      for (let i = 0; i < 35; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const colorPair = colors[Math.floor(Math.random() * colors.length)];
        
        const material = new THREE.MeshStandardMaterial({
          color: colorPair.base,
          metalness: 0.7 + Math.random() * 0.3,
          roughness: 0.1 + Math.random() * 0.2,
          emissive: colorPair.emissive,
          emissiveIntensity: 0.4 + Math.random() * 0.3,
          transparent: true,
          opacity: 0.7 + Math.random() * 0.3
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Distribute in 3D space with some in tunnel, some scattered
        if (i < 25) {
          // Tunnel distribution
          const angle = Math.random() * Math.PI * 2;
          const radius = 8 + Math.random() * 15;
          mesh.position.x = Math.cos(angle) * radius;
          mesh.position.y = Math.sin(angle) * radius;
          mesh.position.z = (Math.random() - 0.5) * 120;
        } else {
          // Scattered distribution
          mesh.position.x = (Math.random() - 0.5) * 40;
          mesh.position.y = (Math.random() - 0.5) * 40;
          mesh.position.z = (Math.random() - 0.5) * 100;
        }
        
        // Random rotation and scale
        mesh.rotation.x = Math.random() * Math.PI * 2;
        mesh.rotation.y = Math.random() * Math.PI * 2;
        mesh.rotation.z = Math.random() * Math.PI * 2;
        const scale = 0.6 + Math.random() * 0.8;
        mesh.scale.set(scale, scale, scale);
        
        scene.add(mesh);
        geometryObjectsRef.current.push(mesh);
      }

      // Add energy rings
      for (let i = 0; i < 5; i++) {
        const ringGeo = new THREE.TorusGeometry(12 + i * 3, 0.1, 8, 32);
        const ringMat = new THREE.MeshStandardMaterial({
          color: colors[i % colors.length].base,
          emissive: colors[i % colors.length].emissive,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.z = -30 + i * 15;
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
        geometryObjectsRef.current.push(ring);
      }
    };

    createFloatingObjects();

    // Dynamic lighting
    const ambientLight = new THREE.AmbientLight(0x6a4c93, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xb854d4, 2, 50);
    pointLight1.position.set(10, 10, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3dd0e3, 2, 50);
    pointLight2.position.set(-10, -10, 20);
    scene.add(pointLight2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 20, 30);
    scene.add(directionalLight);

    // Scroll-based camera movement
    let targetCameraZ = 30;
    let currentCameraZ = 30;
    let targetCameraY = 0;
    let currentCameraY = 0;
    let targetCameraX = 0;
    let currentCameraX = 0;

    const handleScroll = () => {
      if (!cameraRef.current) return;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress (0 to 1) through the hero section
      const scrollProgress = Math.min(scrollY / (windowHeight * 1.5), 1);
      
      // Move camera forward (decreasing Z) and add some dynamic Y/X movement
      targetCameraZ = 30 - (scrollProgress * 25);
      targetCameraY = Math.sin(scrollProgress * Math.PI) * 3;
      targetCameraX = Math.sin(scrollProgress * Math.PI * 2) * 2;
      
      // Rotate camera slightly based on scroll
      cameraRef.current.rotation.z = scrollProgress * 0.1;
    };

    window.addEventListener('scroll', handleScroll);

    // Mouse parallax effect
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      if (!cameraRef.current || !sceneRef.current || !rendererRef.current) return;
      
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera movement with easing
      currentCameraZ += (targetCameraZ - currentCameraZ) * 0.05;
      currentCameraY += (targetCameraY - currentCameraY) * 0.05;
      currentCameraX += (targetCameraX - currentCameraX) * 0.05;
      
      cameraRef.current.position.z = currentCameraZ;
      cameraRef.current.position.y = currentCameraY + mouseY * 2;
      cameraRef.current.position.x = currentCameraX + mouseX * 2;
      cameraRef.current.lookAt(0, currentCameraY, -100);

      // Animate particles with creative patterns
      particlesRef.current.forEach((particles, index) => {
        const positions = particles.geometry.attributes.position.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          // Different movement patterns based on layer
          if (index === 0 || index === 2) {
            // Tunnel movement
            positions[i + 2] += 0.3 + index * 0.08;
            if (positions[i + 2] > 50) {
              positions[i + 2] = -150;
            }
          } else if (index === 1) {
            // Spiral movement
            positions[i + 2] += 0.25;
            const currentRadius = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2);
            const currentAngle = Math.atan2(positions[i + 1], positions[i]);
            const newAngle = currentAngle + 0.01;
            positions[i] = Math.cos(newAngle) * currentRadius;
            positions[i + 1] = Math.sin(newAngle) * currentRadius;
            if (positions[i + 2] > 50) {
              positions[i + 2] = -100;
            }
          } else if (index === 3) {
            // Wave movement
            positions[i + 2] += 0.2;
            positions[i + 1] = Math.sin(positions[i] * 0.2 + positions[i + 2] * 0.1 + elapsedTime * 2) * 8;
            if (positions[i + 2] > 50) {
              positions[i + 2] = -100;
            }
          } else if (index === 4) {
            // Sphere pulsing
            const distance = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2);
            const targetDistance = 15 + Math.sin(elapsedTime * 2 + i * 0.1) * 3;
            const scale = targetDistance / distance;
            positions[i] *= (1 + (scale - 1) * 0.05);
            positions[i + 1] *= (1 + (scale - 1) * 0.05);
            positions[i + 2] *= (1 + (scale - 1) * 0.05);
          }
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Rotation effects
        if (index === 4) {
          particles.rotation.x = elapsedTime * 0.1;
          particles.rotation.y = elapsedTime * 0.15;
        } else {
          particles.rotation.z = elapsedTime * 0.02 * (index + 1);
        }
      });

      // Animate floating objects with advanced effects
      geometryObjectsRef.current.forEach((mesh, index) => {
        // Varied rotation speeds
        mesh.rotation.x += (0.002 + index * 0.0003) * (index % 2 === 0 ? 1 : -1);
        mesh.rotation.y += (0.004 + index * 0.0005) * (index % 2 === 0 ? 1 : -1);
        mesh.rotation.z += 0.001 * Math.sin(elapsedTime + index);
        
        // Energy rings (last 5 objects) - special animation
        if (index >= geometryObjectsRef.current.length - 5) {
          const ringIndex = index - (geometryObjectsRef.current.length - 5);
          mesh.rotation.z = elapsedTime * (0.2 + ringIndex * 0.1);
          mesh.scale.x = 1 + Math.sin(elapsedTime * 2 + ringIndex) * 0.1;
          mesh.scale.y = 1 + Math.sin(elapsedTime * 2 + ringIndex) * 0.1;
          
          // Pulse opacity
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.opacity = 0.2 + Math.sin(elapsedTime * 3 + ringIndex * 0.5) * 0.15;
        } else {
          // Regular objects - move towards camera
          mesh.position.z += 0.15 + (index % 10) * 0.02;
          
          // Reset objects that have passed the camera
          if (mesh.position.z > 50) {
            mesh.position.z = -70;
          }
          
          // Dynamic scale with variety
          const baseScale = 0.6 + (index % 5) * 0.1;
          const pulseScale = 1 + Math.sin(elapsedTime * (2 + index * 0.1) + index) * 0.15;
          mesh.scale.set(baseScale * pulseScale, baseScale * pulseScale, baseScale * pulseScale);
          
          // Dynamic emissive intensity
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.3 + Math.sin(elapsedTime * 3 + index * 0.5) * 0.2;
        }
      });

      // Animate lights for dynamic atmosphere
      pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 15;
      pointLight1.position.y = Math.cos(elapsedTime * 0.5) * 15;
      
      pointLight2.position.x = Math.cos(elapsedTime * 0.3) * 15;
      pointLight2.position.y = Math.sin(elapsedTime * 0.3) * 15;

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      particlesRef.current.forEach(particles => {
        particles.geometry.dispose();
        (particles.material as THREE.PointsMaterial).dispose();
      });
      
      geometryObjectsRef.current.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.MeshStandardMaterial).dispose();
      });
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        
        if (container && container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  if (!webGLSupported) {
    return (
      <div 
        ref={containerRef} 
        className={className}
        style={{
          background: `
            radial-gradient(ellipse at 50% 20%, rgba(184, 84, 212, 0.15), transparent 50%),
            radial-gradient(ellipse at 80% 60%, rgba(61, 208, 227, 0.1), transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(139, 92, 246, 0.1), transparent 50%),
            linear-gradient(to bottom, #0a0a0a, #0f0f0f)
          `
        }}
      >
        {/* Animated gradient fallback for non-WebGL environments */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
