
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Star, User, MessageCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price_per_day: number;
  deposit_amount: number;
  location: string;
  images: string[];
  owner_id: string;
  profiles: {
    full_name: string;
    rating: number;
    total_reviews: number;
    avatar_url: string;
    bio: string;
  };
}

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [message, setMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles!items_owner_id_fkey (
            full_name,
            rating,
            total_reviews,
            avatar_url,
            bio
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setItem(data);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast({
        title: "Error",
        description: "Failed to load item details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!startDate || !endDate || !item) return 0;
    const days = differenceInDays(endDate, startDate) + 1;
    return days * item.price_per_day;
  };

  const handleBorrowRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a borrow request.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Dates Required",
        description: "Please select start and end dates.",
        variant: "destructive",
      });
      return;
    }

    if (!item) return;

    setRequestLoading(true);
    try {
      const { data: requestData, error } = await supabase.from('borrow_requests').insert({
        item_id: item.id,
        borrower_id: user.id,
        lender_id: item.owner_id,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        total_amount: calculateTotal(),
        message: message,
        status: 'pending',
        original_price_per_day: item.price_per_day
      }).select().single();

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: "Your borrow request has been sent to the owner for approval.",
      });

      // Navigate to the request detail page
      navigate(`/request/${requestData.id}`);
    } catch (error) {
      console.error('Error creating borrow request:', error);
      toast({
        title: "Error",
        description: "Failed to send borrow request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trust-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Item not found</p>
            <Button onClick={() => navigate('/marketplace')}>
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === item.owner_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/marketplace')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Item Details */}
          <div className="space-y-6">
            <Card>
              <div className="h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                  <Badge variant="secondary">
                    {item.condition.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-5 w-5 text-trust-600" />
                    <span className="text-2xl font-bold text-trust-600">
                      ${item.price_per_day}/day
                    </span>
                  </div>
                  {item.deposit_amount > 0 && (
                    <div className="text-gray-600">
                      + ${item.deposit_amount} deposit
                    </div>
                  )}
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{item.location || 'Location not specified'}</span>
                </div>

                <Badge variant="outline" className="mb-4">
                  {item.category}
                </Badge>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{item.description || 'No description provided.'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Owner Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {item.profiles.avatar_url ? (
                      <img 
                        src={item.profiles.avatar_url} 
                        alt={item.profiles.full_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.profiles.full_name || 'Anonymous User'}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{item.profiles.rating.toFixed(1)}</span>
                      <span>({item.profiles.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                {item.profiles.bio && (
                  <p className="text-gray-700 text-sm">{item.profiles.bio}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Section */}
          <div className="space-y-6">
            {!isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Request to Borrow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {startDate ? format(startDate, 'MMM dd, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              setStartDate(date);
                              if (date && endDate && date > endDate) {
                                setEndDate(undefined);
                              }
                            }}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {endDate ? format(endDate, 'MMM dd, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => 
                              date < new Date() || (startDate && date < startDate)
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Owner
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the owner about your plans for the item..."
                      rows={3}
                    />
                  </div>

                  {startDate && endDate && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Rental Period:</span>
                        <span>{differenceInDays(endDate, startDate) + 1} days</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Daily Rate:</span>
                        <span>${item.price_per_day}</span>
                      </div>
                      {item.deposit_amount > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span>Security Deposit:</span>
                          <span>${item.deposit_amount}</span>
                        </div>
                      )}
                      <hr className="my-2" />
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Estimated Total:</span>
                        <span>${calculateTotal()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        *Final amount may change based on negotiations and approval
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleBorrowRequest}
                    disabled={requestLoading || !startDate || !endDate}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {requestLoading ? 'Sending Request...' : 'Send Borrow Request'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 mb-4">This is your item listing</p>
                  <Button onClick={() => navigate('/dashboard')}>
                    View in Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
