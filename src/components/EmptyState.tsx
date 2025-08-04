import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) => {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="mx-auto w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gradient-primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};