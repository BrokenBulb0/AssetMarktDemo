interface LoadingProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function Loading({ size = "md", fullScreen = false }: LoadingProps) {
  const sizes = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
  };

  const spinner = (
    <div
      className={`${sizes[size]} border-primary border-t-transparent rounded-full animate-spin`}
      data-testid="loading-spinner"
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
