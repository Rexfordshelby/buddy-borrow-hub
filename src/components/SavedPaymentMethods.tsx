
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Landmark, Plus, Edit, Trash2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethod {
  id: string;
  type: 'bank' | 'card';
  nickname: string;
  last_four: string;
  is_default: boolean;
  bank_name?: string;
  card_brand?: string;
}

const SavedPaymentMethods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'bank' as 'bank' | 'card',
    nickname: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    cardNumber: '',
    expiryDate: '',
    cardBrand: ''
  });

  useEffect(() => {
    // In a real app, this would fetch from your database
    // For now, we'll use mock data
    setPaymentMethods([
      {
        id: '1',
        type: 'bank',
        nickname: 'Main Checking',
        last_four: '1234',
        is_default: true,
        bank_name: 'Chase Bank'
      },
      {
        id: '2',
        type: 'card',
        nickname: 'Business Card',
        last_four: '5678',
        is_default: false,
        card_brand: 'Visa'
      }
    ]);
  }, []);

  const handleAddMethod = async () => {
    if (!newMethod.nickname) {
      toast({
        title: "Missing Information",
        description: "Please provide a nickname for this payment method.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Note: In production, encrypt sensitive payment data
      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: user?.id,
          type: newMethod.type,
          nickname: newMethod.nickname,
          last_four: newMethod.type === 'bank' ? newMethod.accountNumber.slice(-4) : newMethod.cardNumber.slice(-4),
          is_default: paymentMethods.length === 0,
          bank_name: newMethod.type === 'bank' ? newMethod.bankName : undefined,
          card_brand: newMethod.type === 'card' ? newMethod.cardBrand : undefined
        })
        .select()
        .single();

      if (error) throw error;
      
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
      return;
    }
    setIsAddingMethod(false);
    setNewMethod({
      type: 'bank',
      nickname: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      cardNumber: '',
      expiryDate: '',
      cardBrand: ''
    });

    toast({
      title: "Payment Method Added",
      description: "Your payment method has been saved successfully.",
    });
  };

  const setAsDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        is_default: method.id === id
      }))
    );

    toast({
      title: "Default Payment Method Updated",
      description: "This payment method is now your default for withdrawals.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Saved Payment Methods</span>
          <Dialog open={isAddingMethod} onOpenChange={setIsAddingMethod}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Method Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={newMethod.type === 'bank' ? 'default' : 'outline'}
                      onClick={() => setNewMethod({ ...newMethod, type: 'bank' })}
                      className="w-full"
                    >
                      <Landmark className="h-4 w-4 mr-2" />
                      Bank
                    </Button>
                    <Button
                      variant={newMethod.type === 'card' ? 'default' : 'outline'}
                      onClick={() => setNewMethod({ ...newMethod, type: 'card' })}
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    placeholder="e.g., Main Checking"
                    value={newMethod.nickname}
                    onChange={(e) => setNewMethod({ ...newMethod, nickname: e.target.value })}
                  />
                </div>

                {newMethod.type === 'bank' ? (
                  <>
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g., Chase Bank"
                        value={newMethod.bankName}
                        onChange={(e) => setNewMethod({ ...newMethod, bankName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Account number"
                        value={newMethod.accountNumber}
                        onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        placeholder="Routing number"
                        value={newMethod.routingNumber}
                        onChange={(e) => setNewMethod({ ...newMethod, routingNumber: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="Card number"
                        value={newMethod.cardNumber}
                        onChange={(e) => setNewMethod({ ...newMethod, cardNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={newMethod.expiryDate}
                        onChange={(e) => setNewMethod({ ...newMethod, expiryDate: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsAddingMethod(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleAddMethod} className="flex-1">
                    Add Method
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No saved payment methods</p>
            <p className="text-sm">Add a payment method to enable quick withdrawals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  {method.type === 'bank' ? (
                    <Landmark className="h-5 w-5 text-blue-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  )}
                  <div>
                    <p className="font-medium flex items-center">
                      {method.nickname}
                      {method.is_default && (
                        <Badge variant="default" className="ml-2 text-xs">
                          Default
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {method.type === 'bank' ? method.bank_name : method.card_brand} ••••{method.last_four}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.is_default && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAsDefault(method.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedPaymentMethods;
