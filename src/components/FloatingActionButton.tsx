
import { useState } from 'react';
import { Plus, Package, Wrench, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: Package,
      label: 'List Item',
      path: '/add-item',
      color: 'bg-trust-600 hover:bg-trust-700',
    },
    {
      icon: Wrench,
      label: 'Add Service',
      path: '/add-service',
      color: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      icon: MessageCircle,
      label: 'Get Help',
      path: '/help',
      color: 'bg-warm-600 hover:bg-warm-700',
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      <div className="relative">
        {/* Action buttons */}
        <div className={cn(
          "absolute bottom-16 right-0 space-y-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className="flex items-center space-x-3"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full shadow-lg",
                    action.color
                  )}
                  onClick={() => {
                    navigate(action.path);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Main FAB */}
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            "bg-gradient-to-r from-trust-600 to-trust-700 hover:from-trust-700 hover:to-trust-800",
            isOpen && "rotate-45"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
