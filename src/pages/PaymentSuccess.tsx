
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const sessionId = searchParams.get('session_id');
  const requestId = searchParams.get('request_id');

  useEffect(() => {
    if (sessionId && requestId) {
      verifyPayment();
    }
  }, [sessionId, requestId]);

  const verifyPayment = async () => {
    try {
      // Update the borrow request status to paid
      const { error } = await supabase
        .from('borrow_requests')
        .update({ 
          status: 'paid',
          payment_status: 'completed'
        })
        .eq('id', requestId)
        .eq('payment_session_id', sessionId);

      if (error) throw error;

      setPaymentVerified(true);
      toast({
        title: "Payment Successful!",
        description: "Your rental has been confirmed.",
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Payment Verification Error",
        description: "Please contact support if your payment was charged.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trust-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {paymentVerified ? (
            <>
              <p className="text-gray-600">
                Your rental payment has been processed successfully. 
                You can now chat with the lender to coordinate pickup details.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate(`/request/${requestId}`)}
                  className="w-full"
                >
                  View Request Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600">
                There was an issue verifying your payment. 
                Please check your dashboard or contact support.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
