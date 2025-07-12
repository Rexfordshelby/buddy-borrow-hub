
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet as WalletIcon, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

const Wallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(250.75);
  const [pendingEarnings, setPendingEarnings] = useState(120.50);

  const transactions = [
    {
      id: '1',
      type: 'payment_received',
      amount: 45.00,
      description: 'Payment for Camera Rental',
      date: '2024-01-15',
      status: 'completed',
      from: 'John Doe'
    },
    {
      id: '2',
      type: 'payment_sent',
      amount: -25.00,
      description: 'Drill Rental Payment',
      date: '2024-01-14',
      status: 'completed',
      to: 'Mike Wilson'
    },
    {
      id: '3',
      type: 'service_payment',
      amount: 120.00,
      description: 'House Cleaning Service',
      date: '2024-01-13',
      status: 'pending',
      from: 'Sarah Johnson'
    },
    {
      id: '4',
      type: 'withdrawal',
      amount: -100.00,
      description: 'Bank Transfer',
      date: '2024-01-12',
      status: 'completed',
      to: 'Bank Account ***1234'
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
      case 'service_payment':
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
          <p className="text-gray-600">Manage your payments and earnings</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-trust-600 to-trust-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <WalletIcon className="h-6 w-6 mr-2" />
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">${balance.toFixed(2)}</div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Add Funds
                </Button>
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-trust-600">
                  Withdraw
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
              <div className="text-3xl font-bold mb-4 text-yellow-600">${pendingEarnings.toFixed(2)}</div>
              <p className="text-sm text-gray-600">
                Earnings from completed services that will be available after the hold period.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods & Transactions */}
        <Tabs defaultValue="transactions" className="space-y-6">
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
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {transaction.from && `From: ${transaction.from}`}
                            {transaction.to && `To: ${transaction.to}`}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <div className="flex items-center">
                            {getStatusIcon(transaction.status)}
                            <Badge 
                              variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                              className="ml-1"
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">Visa ending in 1234</p>
                        <p className="text-sm text-gray-600">Expires 12/25</p>
                      </div>
                    </div>
                    <Badge>Primary</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Add Payment Method
                  </Button>
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
                    <p className="text-2xl font-bold text-green-600">$1,245.50</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">$3,567.25</p>
                    <p className="text-sm text-gray-600">Last 3 Months</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">$8,945.75</p>
                    <p className="text-sm text-gray-600">All Time</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Earnings Breakdown</h4>
                  <div className="flex justify-between">
                    <span>Item Rentals</span>
                    <span className="font-medium">$745.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Payments</span>
                    <span className="font-medium">$500.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total This Month</span>
                      <span>$1,245.50</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Wallet;
