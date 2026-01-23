import { useThreeScene } from "@/hooks/useThreeScene";

interface ThreeSceneProps {
  className?: string;
  animationType?: "logo" | "cube" | "sphere" | "torus";
}

export function ThreeScene({ className = "", animationType = "cube" }: ThreeSceneProps) {
  const { containerRef } = useThreeScene({
    animationType,
    autoRotate: true,
    enableParticles: animationType === "logo",
    particleCount: 200,
  });

  return <div ref={containerRef} className={className} />;
}
