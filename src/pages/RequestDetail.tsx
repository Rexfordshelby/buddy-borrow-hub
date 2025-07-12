
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageCircle, DollarSign, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface RequestData {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  message: string;
  original_price_per_day: number;
  negotiated_price_per_day: number;
  negotiation_message: string;
  payment_status: string;
  created_at: string;
  items: {
    id: string;
    title: string;
    price_per_day: number;
    images: string[];
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface Negotiation {
  id: string;
  proposed_price_per_day: number;
  message: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [request, setRequest] = useState<RequestData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [negotiationPrice, setNegotiationPrice] = useState('');
  const [negotiationMessage, setNegotiationMessage] = useState('');

  useEffect(() => {
    if (id && user) {
      fetchRequestData();
    }
  }, [id, user]);

  const fetchRequestData = async () => {
    try {
      // Fetch request details
      const { data: requestData, error: requestError } = await supabase
        .from('borrow_requests')
        .select(`
          *,
          items (id, title, price_per_day, images),
          profiles!borrow_requests_borrower_id_fkey (full_name, email)
        `)
        .eq('id', id)
        .single();

      if (requestError) throw requestError;

      // Check if user has access to this request
      if (requestData.borrower_id !== user?.id && requestData.lender_id !== user?.id) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this request.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setRequest(requestData);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('request_id', id)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);

      // Fetch negotiations
      const { data: negotiationsData } = await supabase
        .from('negotiations')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('request_id', id)
        .order('created_at', { ascending: false });

      setNegotiations(negotiationsData || []);

    } catch (error) {
      console.error('Error fetching request data:', error);
      toast({
        title: "Error",
        description: "Failed to load request details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async () => {
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .update({ 
          status: 'payment_pending',
          original_price_per_day: request?.items.price_per_day
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: "The borrower can now proceed with payment.",
      });

      fetchRequestData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async () => {
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "The request has been rejected.",
      });

      fetchRequestData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          request_id: id,
          sender_id: user?.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      fetchRequestData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const handleNegotiation = async () => {
    if (!negotiationPrice || !negotiationMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both price and message for negotiation.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('negotiations')
        .insert({
          request_id: id,
          sender_id: user?.id,
          proposed_price_per_day: parseFloat(negotiationPrice),
          message: negotiationMessage.trim()
        });

      if (error) throw error;

      // Update request status to negotiating
      await supabase
        .from('borrow_requests')
        .update({ status: 'negotiating' })
        .eq('id', id);

      toast({
        title: "Negotiation Sent",
        description: "Your price negotiation has been sent.",
      });

      setNegotiationPrice('');
      setNegotiationMessage('');
      fetchRequestData();
    } catch (error) {
      console.error('Error sending negotiation:', error);
      toast({
        title: "Error",
        description: "Failed to send negotiation.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!request) return;

    try {
      const finalPrice = request.negotiated_price_per_day || request.original_price_per_day || request.items.price_per_day;
      const days = Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalAmount = finalPrice * days;

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          item_id: request.items.id,
          request_id: request.id,
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: 'usd',
          description: `Rental: ${request.items.title}`,
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'negotiating': return 'bg-blue-100 text-blue-800';
      case 'payment_pending': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trust-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Request not found</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLender = user?.id === request.lender_id;
  const isBorrower = user?.id === request.borrower_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Request Details</span>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{request.items.title}</h3>
                  <p className="text-gray-600">
                    {isLender ? 'Requested by' : 'Lending from'}: {request.profiles.full_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{format(new Date(request.start_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">{format(new Date(request.end_date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Original Price</p>
                  <p className="font-medium">${request.items.price_per_day}/day</p>
                </div>

                {request.negotiated_price_per_day && (
                  <div>
                    <p className="text-sm text-gray-600">Negotiated Price</p>
                    <p className="font-medium text-green-600">${request.negotiated_price_per_day}/day</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg">${request.total_amount}</p>
                </div>

                {request.message && (
                  <div>
                    <p className="text-sm text-gray-600">Request Message</p>
                    <p className="text-gray-800">{request.message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  {isLender && request.status === 'pending' && (
                    <>
                      <Button onClick={handleApproveRequest} className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button onClick={handleRejectRequest} variant="outline" className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}

                  {isBorrower && request.status === 'payment_pending' && (
                    <Button onClick={handlePayment} className="w-full">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Negotiations */}
            {negotiations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Price Negotiations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {negotiations.map((negotiation) => (
                      <div key={negotiation.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">${negotiation.proposed_price_per_day}/day</p>
                            <p className="text-sm text-gray-600">by {negotiation.profiles.full_name}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(negotiation.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        {negotiation.message && (
                          <p className="text-sm mt-2">{negotiation.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat and Negotiations */}
          <div className="space-y-6">
            {/* New Negotiation */}
            {(request.status === 'pending' || request.status === 'negotiating') && (
              <Card>
                <CardHeader>
                  <CardTitle>Price Negotiation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Price per Day ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={negotiationPrice}
                      onChange={(e) => setNegotiationPrice(e.target.value)}
                      placeholder="Enter your proposed price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Negotiation Message
                    </label>
                    <Textarea
                      value={negotiationMessage}
                      onChange={(e) => setNegotiationMessage(e.target.value)}
                      placeholder="Explain your price proposal..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleNegotiation} className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Send Negotiation
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center">No messages yet</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-trust-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
