
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { CreditCard, Landmark, DollarSign, Zap, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawalComplete: () => void;
  savedPaymentMethods?: Array<{
    id: string;
    type: 'bank' | 'card';
    nickname: string;
    last_four: string;
    is_default: boolean;
  }>;
}

const EnhancedWithdrawalModal = ({ 
  isOpen, 
  onClose, 
  availableBalance, 
  onWithdrawalComplete,
  savedPaymentMethods = []
}: EnhancedWithdrawalModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(savedPaymentMethods.find(m => m.is_default)?.id || '');
  const [withdrawalSpeed, setWithdrawalSpeed] = useState<'standard' | 'express'>('standard');
  const [loading, setLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState([0]);

  const maxWithdrawal = Math.min(availableBalance, 5000); // $5000 daily limit
  const expressFeePct = 0.015; // 1.5% for express withdrawal
  const standardFeePct = 0.005; // 0.5% for standard withdrawal

  const withdrawalAmount = amount ? parseFloat(amount) : sliderValue[0];
  const fee = withdrawalAmount * (withdrawalSpeed === 'express' ? expressFeePct : standardFeePct);
  const netAmount = withdrawalAmount - fee;

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value) || 0;
    setSliderValue([Math.min(numValue, maxWithdrawal)]);
  };

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setAmount(value[0].toString());
  };

  const handleWithdrawal = async () => {
    if (!user) return;

    if (withdrawalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMethod && savedPaymentMethods.length === 0) {
      toast({
        title: "No Payment Method",
        description: "Please select a payment method or add one first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const selectedPaymentMethod = savedPaymentMethods.find(m => m.id === selectedMethod);
      const description = selectedPaymentMethod 
        ? `Express withdrawal to ${selectedPaymentMethod.nickname} (••••${selectedPaymentMethod.last_four})`
        : `${withdrawalSpeed === 'express' ? 'Express' : 'Standard'} withdrawal`;

      // Create withdrawal transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: -withdrawalAmount,
          description: description,
          status: withdrawalSpeed === 'express' ? 'processing' : 'pending'
        });

      if (transactionError) throw transactionError;

      // Update wallet balance
      const { data: currentWallet } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (currentWallet) {
        const { error: walletError } = await supabase
          .from('user_wallets')
          .update({
            available_balance: currentWallet.available_balance - withdrawalAmount,
            total_spent: (currentWallet.total_spent || 0) + withdrawalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (walletError) throw walletError;
      }

      const processingTime = withdrawalSpeed === 'express' ? '15-30 minutes' : '1-3 business days';
      
      toast({
        title: "Withdrawal Initiated",
        description: `Your ${withdrawalSpeed} withdrawal of $${withdrawalAmount.toFixed(2)} has been initiated. Expected processing time: ${processingTime}.`,
      });

      // Reset form
      setAmount('');
      setSliderValue([0]);
      
      onWithdrawalComplete();
      onClose();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-green-600" />
            Enhanced Withdrawal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Balance Display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">${availableBalance.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Amount Selection */}
          <div className="space-y-4">
            <Label>Withdrawal Amount</Label>
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAmountChange(quickAmount.toString())}
                  disabled={quickAmount > availableBalance}
                  className="text-xs"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>

            {/* Amount Input */}
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              max={maxWithdrawal}
              step="0.01"
            />

            {/* Amount Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>$0</span>
                <span>${maxWithdrawal}</span>
              </div>
              <Slider
                value={sliderValue}
                onValueChange={handleSliderChange}
                max={maxWithdrawal}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Withdrawal Speed */}
          <div className="space-y-3">
            <Label>Processing Speed</Label>
            <RadioGroup value={withdrawalSpeed} onValueChange={(value: 'standard' | 'express') => setWithdrawalSpeed(value)}>
              <div className="space-y-3">
                <Card className={`cursor-pointer transition-all ${withdrawalSpeed === 'standard' ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="font-medium">Standard (1-3 days)</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            Fee: ${(withdrawalAmount * standardFeePct).toFixed(2)} (0.5%)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">Regular processing time, lower fees</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-all ${withdrawalSpeed === 'express' ? 'ring-2 ring-green-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="express" id="express" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-green-600" />
                            <span className="font-medium">Express (15-30 min)</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            Fee: ${(withdrawalAmount * expressFeePct).toFixed(2)} (1.5%)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">Lightning fast, higher fees</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Method Selection */}
          {savedPaymentMethods.length > 0 && (
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                {savedPaymentMethods.map((method) => (
                  <Card key={method.id} className={`cursor-pointer transition-all ${selectedMethod === method.id ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="flex items-center space-x-2">
                          {method.type === 'bank' ? (
                            <Landmark className="h-4 w-4 text-blue-600" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-purple-600" />
                          )}
                          <span className="font-medium">{method.nickname}</span>
                          <span className="text-sm text-gray-600">••••{method.last_four}</span>
                          {method.is_default && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Transaction Summary */}
          {withdrawalAmount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Withdrawal Amount:</span>
                <span>${withdrawalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Fee:</span>
                <span>-${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>You'll Receive:</span>
                <span>${netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleWithdrawal} 
              disabled={loading || withdrawalAmount <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : `Withdraw $${withdrawalAmount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedWithdrawalModal;
