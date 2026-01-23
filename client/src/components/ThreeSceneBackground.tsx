import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneBackgroundProps {
  className?: string;
  variant?: 'browse' | 'cart';
}

export function ThreeSceneBackground({ className = '', variant = 'browse' }: ThreeSceneBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "low-power"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const particles: THREE.Points[] = [];
    const floatingObjects: THREE.Mesh[] = [];

    // Create particle systems based on variant
    if (variant === 'browse') {
      // Subtle floating particles for browse page
      const particleCount = 500;
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 60;
        positions[i3 + 1] = (Math.random() - 0.5) * 60;
        positions[i3 + 2] = (Math.random() - 0.5) * 40;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xb854d4,
        size: 0.15,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particleSystem);
      particles.push(particleSystem);

      // Add some floating geometric shapes for visual interest
      const geometries = [
        new THREE.OctahedronGeometry(0.4, 0),
        new THREE.TetrahedronGeometry(0.5, 0),
        new THREE.IcosahedronGeometry(0.3, 0),
      ];

      for (let i = 0; i < 15; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xb854d4 : 0x3dd0e3,
          transparent: true,
          opacity: 0.15,
          wireframe: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 50;
        mesh.position.y = (Math.random() - 0.5) * 40;
        mesh.position.z = (Math.random() - 0.5) * 30;
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        scene.add(mesh);
        floatingObjects.push(mesh);
      }
    } else if (variant === 'cart') {
      // More dynamic particles for cart page
      const particleCount = 600;
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = (i / particleCount) * Math.PI * 4;
        const radius = 15 + Math.random() * 10;
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = (Math.random() - 0.5) * 40;
        positions[i3 + 2] = Math.sin(angle) * radius;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0x00ff9d,
        size: 0.2,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particleSystem);
      particles.push(particleSystem);

      // Add cart-themed floating shapes
      for (let i = 0; i < 12; i++) {
        const geometry = new THREE.TorusGeometry(0.5, 0.15, 12, 24);
        const material = new THREE.MeshBasicMaterial({
          color: 0xff6b9d,
          transparent: true,
          opacity: 0.2,
          wireframe: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 40;
        mesh.position.y = (Math.random() - 0.5) * 30;
        mesh.position.z = (Math.random() - 0.5) * 20;
        
        scene.add(mesh);
        floatingObjects.push(mesh);
      }
    }

    // Ambient lighting
    const ambientLight = new THREE.AmbientLight(0x6a4c93, 0.5);
    scene.add(ambientLight);

    // Animation loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate particles
      particles.forEach((particleSystem, index) => {
        if (variant === 'browse') {
          particleSystem.rotation.y = elapsedTime * 0.05;
          particleSystem.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
        } else {
          particleSystem.rotation.y = elapsedTime * 0.1;
        }
      });

      // Animate floating objects
      floatingObjects.forEach((mesh, index) => {
        mesh.rotation.x += 0.002 * (index % 2 === 0 ? 1 : -1);
        mesh.rotation.y += 0.003 * (index % 2 === 0 ? 1 : -1);
        
        // Gentle bobbing motion
        mesh.position.y += Math.sin(elapsedTime * 0.5 + index) * 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      particles.forEach(p => {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
      
      floatingObjects.forEach(obj => {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      });
      
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [variant]);

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 -z-10 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}
