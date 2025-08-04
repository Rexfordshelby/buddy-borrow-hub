import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Plus, Search, Heart, Wallet, BarChart3 } from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = [
    {
      icon: Search,
      label: "Browse Items",
      description: "Find items to borrow",
      onClick: () => navigate('/marketplace'),
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Plus,
      label: "List Item",
      description: "Add your items",
      onClick: () => user ? navigate('/add-item') : navigate('/auth'),
      color: "bg-green-50 text-green-600 hover:bg-green-100",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Heart,
      label: "Favorites",
      description: "Saved items",
      onClick: () => user ? navigate('/favorites') : navigate('/auth'),
      color: "bg-red-50 text-red-600 hover:bg-red-100",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: Wallet,
      label: "Wallet",
      description: "Manage earnings",
      onClick: () => user ? navigate('/wallet') : navigate('/auth'),
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <Card className="card-modern">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover-lift transition-all duration-300"
              onClick={action.onClick}
            >
              <div className={`p-3 rounded-xl transition-colors ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};