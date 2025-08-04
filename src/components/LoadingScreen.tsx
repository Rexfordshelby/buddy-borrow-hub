import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen = ({ message = "Loading...", fullScreen = false }: LoadingScreenProps) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" 
    : "py-12";

  return (
    <div className={`flex items-center justify-center ${containerClass}`}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-muted rounded-full animate-pulse"></div>
          <Loader2 className="w-8 h-8 text-primary animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
};