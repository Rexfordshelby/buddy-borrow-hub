
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Download, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const requestId = searchParams.get('request_id');
  const serviceRequestId = searchParams.get('service_request_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (sessionId && (requestId || serviceRequestId || bookingId)) {
      verifyPayment();
    }
  }, [sessionId, requestId, serviceRequestId, bookingId]);

  const verifyPayment = async () => {
    try {
      if (requestId) {
        await handleItemRentalPayment();
      } else if (serviceRequestId) {
        await handleServicePayment();
      } else if (bookingId) {
        await handleServiceBookingPayment();
      }
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

  const handleItemRentalPayment = async () => {
    // Update borrow request status
    const { data: requestData, error: updateError } = await supabase
      .from('borrow_requests')
      .update({ 
        status: 'paid',
        payment_status: 'completed'
      })
      .eq('id', requestId)
      .eq('payment_session_id', sessionId)
      .select(`
        *,
        items (title, owner_id),
        profiles!borrow_requests_borrower_id_fkey (full_name)
      `)
      .single();

    if (updateError) throw updateError;

    // Create notification for lender
    await supabase.from('notifications').insert({
      user_id: requestData.items.owner_id,
      type: 'rental_payment_received',
      title: 'Payment Received!',
      message: `${requestData.profiles.full_name} has paid for "${requestData.items.title}". Please prepare the item for delivery.`,
      request_id: requestId
    });

    // Create wallet transaction for lender
    await supabase.from('wallet_transactions').insert({
      user_id: requestData.lender_id,
      type: 'payment_received',
      amount: requestData.total_amount,
      description: `Payment received for renting "${requestData.items.title}"`,
      related_request_id: requestId,
      from_user_id: requestData.borrower_id,
      to_user_id: requestData.lender_id,
      status: 'completed'
    });

    // Update lender's wallet balance
    await updateWalletBalance(requestData.lender_id, requestData.total_amount, true);

    setReceiptData({
      type: 'rental',
      title: requestData.items.title,
      amount: requestData.total_amount,
      dates: `${requestData.start_date} to ${requestData.end_date}`,
      id: requestId
    });

    setPaymentVerified(true);
    toast({
      title: "Payment Successful!",
      description: "Your rental has been confirmed. The lender has been notified.",
    });
  };

  const handleServicePayment = async () => {
    // Update service request status
    const { data: serviceData, error: updateError } = await supabase
      .from('service_requests')
      .update({ 
        status: 'accepted',
        payment_status: 'paid'
      })
      .eq('id', serviceRequestId)
      .eq('payment_session_id', sessionId)
      .select(`
        *,
        services (title, provider_id)
      `)
      .single();

    if (updateError) throw updateError;

    // Get customer profile for notification
    const { data: customerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', serviceData.customer_id)
      .single();

    // Create notification for service provider
    await supabase.from('notifications').insert({
      user_id: serviceData.services.provider_id,
      type: 'service_booking',
      title: 'New Service Booking!',
      message: `${customerProfile?.full_name || 'A customer'} has booked your "${serviceData.services.title}" service. Check your dashboard for details.`,
      request_id: serviceRequestId
    });

    // Create wallet transaction for provider
    await supabase.from('wallet_transactions').insert({
      user_id: serviceData.provider_id,
      type: 'service_payment',
      amount: serviceData.total_amount,
      description: `Payment received for "${serviceData.services.title}" service`,
      related_service_id: serviceData.service_id,
      from_user_id: serviceData.customer_id,
      to_user_id: serviceData.provider_id,
      status: 'completed'
    });

    // Update provider's wallet balance
    await updateWalletBalance(serviceData.provider_id, serviceData.total_amount, true);

    setReceiptData({
      type: 'service',
      title: serviceData.services.title,
      amount: serviceData.total_amount,
      date: serviceData.requested_date,
      time: serviceData.requested_time,
      id: serviceRequestId
    });

    setPaymentVerified(true);
    toast({
      title: "Payment Successful!",
      description: "Your service booking has been confirmed. The provider has been notified.",
    });
  };

  const handleServiceBookingPayment = async () => {
    // Update service booking status
    const { data: bookingData, error: updateError } = await supabase
      .from('service_bookings')
      .update({ 
        status: 'confirmed',
        payment_status: 'paid'
      })
      .eq('id', bookingId)
      .select(`
        *,
        service:services(title, provider_id),
        customer:profiles!service_bookings_customer_id_fkey(full_name, email),
        provider:profiles!service_bookings_provider_id_fkey(full_name, email)
      `)
      .single();

    if (updateError) throw updateError;

    // Create notification for service provider
    await supabase.from('notifications').insert({
      user_id: bookingData.provider_id,
      type: 'service_booking_paid',
      title: 'Payment Received!',
      message: `${bookingData.customer.full_name} has paid for your "${bookingData.service.title}" service booking on ${bookingData.booking_date}.`,
    });

    // Create wallet transaction for provider
    await supabase.from('wallet_transactions').insert({
      user_id: bookingData.provider_id,
      type: 'service_payment',
      amount: bookingData.total_amount,
      description: `Payment received for "${bookingData.service.title}" service`,
      from_user_id: bookingData.customer_id,
      to_user_id: bookingData.provider_id,
      status: 'completed'
    });

    // Update provider's wallet balance
    await updateWalletBalance(bookingData.provider_id, bookingData.total_amount, true);

    setReceiptData({
      type: 'service_booking',
      title: bookingData.service.title,
      amount: bookingData.total_amount,
      date: bookingData.booking_date,
      time: `${bookingData.start_time} - ${bookingData.end_time}`,
      id: bookingId
    });

    setPaymentVerified(true);
    toast({
      title: "Payment Successful!",
      description: "Your service booking has been confirmed and paid. The provider has been notified.",
    });
  };

  const updateWalletBalance = async (userId: string, amount: number, isEarning: boolean) => {
    // Get current wallet or create if doesn't exist
    const { data: currentWallet } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    const currentBalance = currentWallet?.available_balance || 0;
    const currentEarned = currentWallet?.total_earned || 0;
    const currentSpent = currentWallet?.total_spent || 0;

    await supabase
      .from('user_wallets')
      .upsert({
        user_id: userId,
        available_balance: isEarning ? currentBalance + amount : currentBalance - amount,
        total_earned: isEarning ? currentEarned + amount : currentEarned,
        total_spent: !isEarning ? currentSpent + amount : currentSpent,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id'
      });
  };

  const downloadReceipt = () => {
    if (!receiptData) return;
    
    const receiptContent = `
PAYMENT RECEIPT
===============

${receiptData.type === 'rental' ? 'ITEM RENTAL' : 'SERVICE BOOKING'}
${receiptData.title}

Amount Paid: $${receiptData.amount}
${receiptData.type === 'rental' ? `Rental Period: ${receiptData.dates}` : `Service Date: ${receiptData.date} ${receiptData.time || ''}`}
Transaction ID: ${receiptData.id}

Thank you for your payment!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Bell className="h-5 w-5 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 text-sm">
                  {receiptData?.type === 'rental' 
                    ? "The lender has been notified and will prepare your item for delivery."
                    : "The service provider has been notified about your booking."
                  }
                </p>
              </div>
              
              <p className="text-gray-600">
                {receiptData?.type === 'rental'
                  ? "Your rental payment has been processed successfully. You can now chat with the lender to coordinate pickup details."
                  : "Your service booking has been confirmed. The provider will contact you soon to schedule the service."
                }
              </p>

              <div className="space-y-3">
                {receiptData && (
                  <Button 
                    onClick={downloadReceipt}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
                
                <Button 
                  onClick={() => {
                    if (receiptData?.type === 'rental') {
                      navigate(`/request/${requestId}`)
                    } else if (receiptData?.type === 'service_booking') {
                      navigate('/dashboard')
                    } else {
                      navigate('/dashboard')
                    }
                  }}
                  className="w-full"
                >
                  {receiptData?.type === 'rental' ? 'View Request Details' : 'Go to Dashboard'}
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
