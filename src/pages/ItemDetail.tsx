
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Star, 
  Shield, 
  CreditCard, 
  Package,
  User,
  Clock,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

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
  profiles: {
    id: string;
    full_name: string;
    rating: number;
    total_reviews: number;
    avatar_url?: string;
    bio?: string;
  };
}

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  // Request form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      // First fetch the item
      const { data: itemData, error: itemError } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .eq("availability", true)
        .maybeSingle();

      if (itemError) throw itemError;
      if (!itemData) {
        toast({
          title: "Item not found",
          description: "This item may have been removed or is no longer available.",
          variant: "destructive"
        });
        navigate("/marketplace");
        return;
      }

      // Fetch the owner's profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, rating, total_reviews, avatar_url, bio")
        .eq("id", itemData.owner_id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Combine item with profile data
      const itemWithProfile = {
        ...itemData,
        profiles: profileData || {
          id: itemData.owner_id,
          full_name: 'Unknown User',
          rating: 0,
          total_reviews: 0,
          avatar_url: null,
          bio: null
        }
      };

      setItem(itemWithProfile);
    } catch (error) {
      console.error("Error fetching item:", error);
      toast({
        title: "Error",
        description: "Failed to load item details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createBorrowRequest = async () => {
    if (!user || !item || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }

    if (user.id === item.profiles.id) {
      toast({
        title: "Cannot Borrow Own Item",
        description: "You cannot borrow your own item",
        variant: "destructive"
      });
      return;
    }

    setRequesting(true);

    try {
      const days = differenceInDays(new Date(endDate), new Date(startDate));
      const totalAmount = days * item.price_per_day;

      const { data: requestData, error: requestError } = await supabase
        .from("borrow_requests")
        .insert({
          item_id: item.id,
          borrower_id: user.id,
          lender_id: item.profiles.id,
          start_date: startDate,
          end_date: endDate,
          total_amount: totalAmount,
          original_price_per_day: item.price_per_day,
          message,
          status: "pending"
        })
        .select()
        .maybeSingle();

      if (requestError || !requestData) {
        throw new Error(`Failed to create request: ${requestError?.message}`);
      }

      // Create payment session
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-item-payment',
        {
          body: {
            requestId: requestData.id,
            amount: totalAmount,
            currency: 'usd'
          }
        }
      );

      if (paymentError || !paymentData?.url) {
        await supabase.from("borrow_requests").delete().eq("id", requestData.id);
        throw new Error(paymentError?.message || "Failed to create payment session");
      }

      // Create notification for owner
      await supabase
        .from("notifications")
        .insert({
          user_id: item.profiles.id,
          title: "New Borrow Request",
          message: `${user.email} wants to borrow your ${item.title}`,
          type: "borrow_request"
        });

      toast({
        title: "Request Created!",
        description: "Redirecting to payment...",
      });

      // Redirect to payment
      const link = document.createElement('a'); 
      link.href = paymentData.url; 
      link.target = '_blank'; 
      link.rel = 'noopener noreferrer'; 
      link.click();

      setIsRequestModalOpen(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create request",
        variant: "destructive"
      });
    } finally {
      setRequesting(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "like_new": return "bg-blue-100 text-blue-800 border-blue-200";
      case "good": return "bg-green-100 text-green-800 border-green-200";
      case "fair": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const days = differenceInDays(new Date(endDate), new Date(startDate));
    return days * (item?.price_per_day || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Item not found</h2>
          <Button onClick={() => navigate("/marketplace")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/marketplace")}
          className="mb-6 hover-scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Carousel className="w-full">
              <CarouselContent>
                {item.images && item.images.length > 0 ? (
                  item.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="h-96 rounded-lg overflow-hidden shadow-elegant">
                        <img
                          src={image}
                          alt={`${item.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover-scale transition-transform duration-300"
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {item.images && item.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold gradient-text mb-2">{item.title}</h1>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={getConditionColor(item.condition)}>
                      {item.condition.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold gradient-text">
                    ${item.price_per_day}
                  </div>
                  <div className="text-sm text-muted-foreground">per day</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{item.location}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                    {item.profiles.full_name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.profiles.full_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{item.profiles.rating.toFixed(1)}</span>
                      </div>
                      <span>•</span>
                      <span>{item.profiles.total_reviews} reviews</span>
                    </div>
                    {item.profiles.bio && (
                      <p className="text-sm text-muted-foreground mt-2">{item.profiles.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deposit Information */}
            <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Security Deposit Required</span>
                  <span className="font-semibold">${item.deposit_amount}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Refundable upon return in good condition
                </p>
              </AlertDescription>
            </Alert>

            {/* Request Button */}
            {user ? (
              user.id !== item.profiles.id ? (
                <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gradient-primary shadow-elegant" size="lg">
                      <Package className="h-5 w-5 mr-2" />
                      Request to Borrow
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="gradient-text">Request to Borrow</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={format(new Date(), "yyyy-MM-dd")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || format(addDays(new Date(), 1), "yyyy-MM-dd")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Add a message to the owner..."
                          className="resize-none"
                        />
                      </div>
                      {startDate && endDate && (
                        <Alert className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                          <DollarSign className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Duration:</span>
                                <span>{differenceInDays(new Date(endDate), new Date(startDate))} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Daily Rate:</span>
                                <span>${item.price_per_day}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Security Deposit:</span>
                                <span>${item.deposit_amount}</span>
                              </div>
                              <hr className="my-2" />
                              <div className="flex justify-between font-bold text-lg">
                                <span>Total Cost:</span>
                                <span className="gradient-text">${calculateTotal()}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Deposit will be refunded upon return
                              </p>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button 
                        onClick={createBorrowRequest} 
                        disabled={requesting || !startDate || !endDate}
                        className="w-full gradient-primary"
                      >
                        {requesting ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Continue to Payment
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    This is your item. You can manage it from your dashboard.
                  </AlertDescription>
                </Alert>
              )
            ) : (
              <Button 
                onClick={() => navigate("/auth")} 
                className="w-full gradient-primary" 
                size="lg"
              >
                Sign In to Borrow
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
