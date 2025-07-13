
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, CreditCard, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProviderWithdrawalCardProps {
  availableBalance: number;
  pendingBalance: number;
  onWithdraw: () => void;
  recentWithdrawals: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
    description: string;
  }>;
}

const ProviderWithdrawalCard = ({ 
  availableBalance, 
  pendingBalance, 
  onWithdraw, 
  recentWithdrawals 
}: ProviderWithdrawalCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleQuickWithdraw = (amount: number) => {
    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough available balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }
    onWithdraw();
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <TrendingUp className="h-5 w-5 mr-2" />
            Provider Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${availableBalance.toFixed(2)}
              </p>
              <p className="text-sm text-green-700">Available to Withdraw</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                ${pendingBalance.toFixed(2)}
              </p>
              <p className="text-sm text-yellow-700">Pending Clearance</p>
            </div>
          </div>
          
          {/* Quick Withdraw Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Quick Withdraw:</p>
            <div className="grid grid-cols-3 gap-2">
              {[25, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickWithdraw(amount)}
                  disabled={availableBalance < amount}
                  className="text-xs"
                >
                  ${amount}
                </Button>
              ))}
            </div>
            
            <Button
              onClick={onWithdraw}
              disabled={availableBalance <= 0}
              className="w-full bg-green-600 hover:bg-green-700 transform transition-all duration-200 hover:scale-105"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Landmark className={`h-4 w-4 mr-2 transition-transform ${isHovered ? 'scale-110' : ''}`} />
              Withdraw All Available
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Withdrawals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWithdrawals.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No withdrawals yet</p>
              <p className="text-sm">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWithdrawals.slice(0, 5).map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="font-medium">${Math.abs(withdrawal.amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-600">{withdrawal.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={withdrawal.status === 'completed' ? 'default' : 'secondary'}
                      className="mb-1"
                    >
                      {withdrawal.status}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderWithdrawalCard;
