import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet as WalletIcon, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WithdrawalModal from '@/components/WithdrawalModal';
import ProviderWithdrawalCard from '@/components/ProviderWithdrawalCard';
import SavedPaymentMethods from '@/components/SavedPaymentMethods';
import EnhancedWithdrawalModal from '@/components/EnhancedWithdrawalModal';
import type { Tables } from '@/integrations/supabase/types';

type WalletData = Tables<'user_wallets'>;
type Transaction = Tables<'wallet_transactions'>;

const Wallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [enhancedWithdrawalOpen, setEnhancedWithdrawalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchTransactions();
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setWallet(newWallet);
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error loading wallet",
        description: "Failed to load wallet data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error loading transactions",
        description: "Failed to load transaction history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
      case 'service_payment':
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'payment_sent':
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTransactionType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const amount = Math.abs(Number(transaction.amount));
    const isPositive = ['payment_received', 'service_payment', 'deposit'].includes(transaction.type);
    return {
      amount,
      isPositive,
      sign: isPositive ? '+' : '-'
    };
  };

  const handleWithdrawalComplete = () => {
    fetchWalletData();
    fetchTransactions();
  };

  // Filter transactions for recent withdrawals
  const recentWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .slice(0, 5);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access your wallet.</p>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trust-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Wallet</h1>
          <p className="text-gray-600">Manage your earnings and withdrawals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Enhanced Withdrawal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Withdrawal Card */}
            <ProviderWithdrawalCard
              availableBalance={Number(wallet?.available_balance || 0)}
              pendingBalance={Number(wallet?.pending_balance || 0)}
              onWithdraw={() => setEnhancedWithdrawalOpen(true)}
              recentWithdrawals={recentWithdrawals}
            />

            {/* Original Balance Cards for Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-r from-trust-600 to-trust-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <WalletIcon className="h-6 w-6 mr-2" />
                    Available Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    ${wallet ? Number(wallet.available_balance).toFixed(2) : '0.00'}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-white border-white hover:bg-white hover:text-trust-600"
                      onClick={() => setWithdrawalModalOpen(true)}
                      disabled={!wallet || Number(wallet.available_balance) <= 0}
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Quick Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-6 w-6 mr-2 text-yellow-600" />
                    Pending Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4 text-yellow-600">
                    ${wallet ? Number(wallet.pending_balance).toFixed(2) : '0.00'}
                  </div>
                  <p className="text-sm text-gray-600">
                    Earnings from completed services that will be available after the hold period.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Saved Payment Methods */}
          <div className="space-y-6">
            <SavedPaymentMethods />
          </div>
        </div>

        {/* Payment Methods & Transactions */}
        <Tabs defaultValue="transactions" className="space-y-6 mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions yet</p>
                    <p className="text-sm text-gray-400">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => {
                      const { amount, isPositive, sign } = getTransactionAmount(transaction);
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-600">
                                Type: {formatTransactionType(transaction.type)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className={`font-semibold ${
                                isPositive ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {sign}${amount.toFixed(2)}
                              </p>
                              <div className="flex items-center">
                                {getStatusIcon(transaction.status || 'completed')}
                                <Badge 
                                  variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                                  className="ml-1"
                                >
                                  {transaction.status || 'completed'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-methods" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No payment methods added yet</p>
                    <Button variant="outline" className="w-full">
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${wallet ? Number(wallet.total_earned).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-sm text-gray-600">Total Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ${wallet ? Number(wallet.total_spent).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      ${wallet ? (Number(wallet.available_balance) + Number(wallet.pending_balance)).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-sm text-gray-600">Total Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Original Withdrawal Modal */}
      <WithdrawalModal
        isOpen={withdrawalModalOpen}
        onClose={() => setWithdrawalModalOpen(false)}
        availableBalance={Number(wallet?.available_balance || 0)}
        onWithdrawalComplete={handleWithdrawalComplete}
      />

      {/* Enhanced Withdrawal Modal */}
      <EnhancedWithdrawalModal
        isOpen={enhancedWithdrawalOpen}
        onClose={() => setEnhancedWithdrawalOpen(false)}
        availableBalance={Number(wallet?.available_balance || 0)}
        onWithdrawalComplete={handleWithdrawalComplete}
        savedPaymentMethods={[
          {
            id: '1',
            type: 'bank',
            nickname: 'Main Checking',
            last_four: '1234',
            is_default: true
          },
          {
            id: '2',
            type: 'card',
            nickname: 'Business Card',
            last_four: '5678',
            is_default: false
          }
        ]}
      />
    </div>
  );
};

export default Wallet;
