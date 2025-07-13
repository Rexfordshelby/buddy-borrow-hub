
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Landmark, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawalComplete: () => void;
}

const WithdrawalModal = ({ isOpen, onClose, availableBalance, onWithdrawalComplete }: WithdrawalModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank' | 'card'>('bank');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    accountHolderName: ''
  });
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cardHolderName: ''
  });
  const [loading, setLoading] = useState(false);

  const handleWithdrawal = async () => {
    if (!user) return;

    const withdrawalAmount = parseFloat(amount);
    
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

    if (method === 'bank' && (!bankDetails.accountNumber || !bankDetails.routingNumber || !bankDetails.accountHolderName)) {
      toast({
        title: "Missing Bank Details",
        description: "Please fill in all bank account details.",
        variant: "destructive",
      });
      return;
    }

    if (method === 'card' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cardHolderName)) {
      toast({
        title: "Missing Card Details",
        description: "Please fill in all card details.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create withdrawal transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: -withdrawalAmount, // Negative for withdrawal
          description: `Withdrawal to ${method === 'bank' ? 'bank account' : 'card'} - ${method === 'bank' ? bankDetails.accountNumber.slice(-4) : cardDetails.cardNumber.slice(-4)}`,
          status: 'pending'
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

      toast({
        title: "Withdrawal Initiated",
        description: `Your withdrawal of $${withdrawalAmount.toFixed(2)} has been initiated. It will be processed within 1-3 business days.`,
      });

      // Reset form
      setAmount('');
      setBankDetails({ accountNumber: '', routingNumber: '', accountHolderName: '' });
      setCardDetails({ cardNumber: '', expiryDate: '', cardHolderName: '' });
      
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-green-600" />
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Available Balance</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">${availableBalance.toFixed(2)}</p>
          </div>

          <div>
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={availableBalance}
              step="0.01"
            />
          </div>

          <div>
            <Label>Withdrawal Method</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Card 
                className={`cursor-pointer transition-all ${method === 'bank' ? 'ring-2 ring-trust-600' : 'hover:bg-gray-50'}`}
                onClick={() => setMethod('bank')}
              >
                <CardContent className="flex flex-col items-center p-4">
                  <Landmark className="h-8 w-8 mb-2 text-gray-600" />
                  <span className="text-sm font-medium">Bank Account</span>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${method === 'card' ? 'ring-2 ring-trust-600' : 'hover:bg-gray-50'}`}
                onClick={() => setMethod('card')}
              >
                <CardContent className="flex flex-col items-center p-4">
                  <CreditCard className="h-8 w-8 mb-2 text-gray-600" />
                  <span className="text-sm font-medium">Debit Card</span>
                </CardContent>
              </Card>
            </div>
          </div>

          {method === 'bank' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  placeholder="John Doe"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  placeholder="021000021"
                  value={bankDetails.routingNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                />
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardHolderName">Card Holder Name</Label>
                <Input
                  id="cardHolderName"
                  placeholder="John Doe"
                  value={cardDetails.cardHolderName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardHolderName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Processing Time:</strong> Withdrawals typically take 1-3 business days to process. 
              A small processing fee may apply depending on your withdrawal method.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleWithdrawal} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
