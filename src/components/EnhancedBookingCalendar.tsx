import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, CalendarDays, DollarSign, User, MapPin, Star, CheckCircle, XCircle, MessageSquare, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, addHours, parseISO } from "date-fns";

interface Service {
  id: string;
  title: string;
  price: number;
  price_type: string;
  provider_id: string;
  location?: string;
  description?: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    phone?: string;
    rating?: number;
  };
}

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: number;
  notes?: string;
  payment_session_id?: string;
  payment_status?: string;
  order_number?: string;
  confirmation_code?: string;
  customer_rating?: number;
  provider_rating?: number;
  customer_review?: string;
  provider_review?: string;
  service: {
    title: string;
  };
  customer: {
    full_name: string;
    phone?: string;
  };
  provider?: {
    full_name: string;
    phone?: string;
  };
}

interface EnhancedBookingCalendarProps {
  service?: Service;
  isProvider?: boolean;
}

export function EnhancedBookingCalendar({ service, isProvider = false }: EnhancedBookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Booking form state
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [notes, setNotes] = useState("");
  
  // Review form state
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState("");

  const fetchBookings = async () => {
    if (!user) return;

    try {
      // First fetch service bookings
      let query = supabase
        .from("service_bookings")
        .select("*");

      if (isProvider) {
        query = query.eq("provider_id", user.id);
      } else {
        query = query.eq("customer_id", user.id);
      }

      if (service) {
        query = query.eq("service_id", service.id);
      }

      const { data: bookingsData, error: bookingsError } = await query
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      // Get unique service IDs, customer IDs, and provider IDs
      const serviceIds = [...new Set(bookingsData.map(b => b.service_id))];
      const customerIds = [...new Set(bookingsData.map(b => b.customer_id))];
      const providerIds = [...new Set(bookingsData.map(b => b.provider_id))];
      const userIds = [...new Set([...customerIds, ...providerIds])];

      // Fetch services data
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("id, title")
        .in("id", serviceIds);

      if (servicesError) throw servicesError;

      // Fetch profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create lookup maps
      const servicesMap = new Map(
        (servicesData || []).map(service => [service.id, service])
      );
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      // Combine data
      const bookingsWithDetails = bookingsData.map(booking => ({
        ...booking,
        service: servicesMap.get(booking.service_id) || { title: 'Unknown Service' },
        customer: profilesMap.get(booking.customer_id) || { full_name: 'Unknown Customer', phone: null },
        provider: profilesMap.get(booking.provider_id) || { full_name: 'Unknown Provider', phone: null }
      }));

      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const createBooking = async () => {
    if (!user || !service || !selectedDate || !startTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const bookingDate = format(selectedDate, "yyyy-MM-dd");
      const endTime = format(
        addHours(new Date(`${bookingDate}T${startTime}`), parseInt(duration)),
        "HH:mm"
      );

      const totalAmount = service.price_type === "per_hour" 
        ? service.price * parseInt(duration)
        : service.price;

      // Check for conflicts
      const { data: conflicts } = await supabase
        .from("service_bookings")
        .select("*")
        .eq("service_id", service.id)
        .eq("booking_date", bookingDate)
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)
        .neq("status", "cancelled");

      if (conflicts && conflicts.length > 0) {
        toast({
          title: "Time Conflict",
          description: "This time slot is already booked",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("service_bookings")
        .insert({
          service_id: service.id,
          customer_id: user.id,
          provider_id: service.provider_id,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          total_amount: totalAmount,
          notes,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .maybeSingle();

      if (bookingError || !bookingData) {
        throw new Error(`Failed to create booking: ${bookingError?.message}`);
      }

      // Create payment session
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-service-payment',
        {
          body: {
            bookingId: bookingData.id,
            amount: totalAmount,
            currency: 'usd'
          }
        }
      );

      if (paymentError || !paymentData?.url) {
        await supabase.from("service_bookings").delete().eq("id", bookingData.id);
        throw new Error(paymentError?.message || "Failed to create payment session");
      }

      // Create notification for provider
      await supabase
        .from("notifications")
        .insert({
          user_id: service.provider_id,
          title: "New Booking Request",
          message: `You have a new booking request for ${service.title} on ${format(selectedDate, "PPP")}`,
          type: "booking_request"
        });

      toast({
        title: "Booking Created!",
        description: `Order #${bookingData.order_number} - Redirecting to payment...`,
      });

      // Redirect to payment
      const link = document.createElement('a'); 
      link.href = paymentData.url; 
      link.target = '_blank'; 
      link.rel = 'noopener noreferrer'; 
      link.click();

      setIsBookingModalOpen(false);
      resetForm();
      fetchBookings();
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string, reason?: string) => {
    const updates: any = { 
      status,
      provider_response_at: new Date().toISOString()
    };

    if (reason) {
      updates.cancellation_reason = reason;
    }

    const { error } = await supabase
      .from("service_bookings")
      .update(updates)
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
      return;
    }

    // Create notification for customer
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      // We need to get the actual user IDs, not the profile names
      // Since we have the booking data from fetchBookings, we need to use the original data structure
      const targetUserId = isProvider 
        ? (booking as any).customer_id 
        : (booking as any).provider_id;
        
      if (targetUserId) {
        await supabase
          .from("notifications")
          .insert({
            user_id: targetUserId,
            title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your booking for ${booking.service.title} has been ${status}`,
            type: "booking_update"
          });
      }
    }

    toast({
      title: "Booking Updated",
      description: `Booking ${status} successfully`
    });

    fetchBookings();
  };

  const submitReview = async () => {
    if (!selectedBooking || !user) return;

    const updates = isProvider 
      ? { provider_rating: rating, provider_review: review }
      : { customer_rating: rating, customer_review: review };

    const { error } = await supabase
      .from("service_bookings")
      .update(updates)
      .eq("id", selectedBooking.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!"
    });

    setIsReviewModalOpen(false);
    setSelectedBooking(null);
    setRating(5);
    setReview("");
    fetchBookings();
  };

  const resetForm = () => {
    setStartTime("");
    setDuration("1");
    setNotes("");
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookings.filter(booking => booking.booking_date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-500 text-white";
      case "pending": return "bg-amber-500 text-white";
      case "cancelled": case "rejected": return "bg-red-500 text-white";
      case "completed": return "bg-blue-500 text-white";
      case "in_progress": return "bg-purple-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-emerald-600 bg-emerald-50";
      case "pending": return "text-amber-600 bg-amber-50";
      case "failed": return "text-red-600 bg-red-50";
      case "refunded": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user, service, isProvider]);

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div className="space-y-6">
      {/* Service Info Card (for customers) */}
      {!isProvider && service && (
        <Card className="glass-effect shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold gradient-text mb-2">{service.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {service.profiles?.full_name}
                  </div>
                  {service.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {service.location}
                    </div>
                  )}
                  {service.profiles?.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {service.profiles.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                {service.description && (
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold gradient-text">
                  ${service.price}
                </div>
                <div className="text-sm text-muted-foreground">
                  per {service.price_type.replace('_', ' ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-effect shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {isProvider ? "Manage Bookings" : "Book Service"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border shadow-card"
                disabled={(date) => date < new Date()}
                modifiers={{
                  booked: (date) => getBookingsForDate(date).length > 0
                }}
                modifiersStyles={{
                  booked: { backgroundColor: "hsl(var(--primary))", color: "white" }
                }}
              />
              
              {!isProvider && service && (
                <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full gradient-primary shadow-elegant" 
                      disabled={!selectedDate}
                      size="lg"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Book This Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="gradient-text">Book {service.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input 
                          id="date"
                          value={selectedDate ? format(selectedDate, "PPP") : ""}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Start Time</Label>
                        <Select value={startTime} onValueChange={setStartTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (hours)</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 8].map(hours => (
                              <SelectItem key={hours} value={hours.toString()}>
                                {hours} hour{hours > 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="notes">Special Requirements</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any special requirements or notes..."
                          className="resize-none"
                        />
                      </div>
                      <Alert className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                        <DollarSign className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between font-medium">
                            <span>Total Cost:</span>
                            <span className="text-lg font-bold gradient-text">
                              ${service.price_type === "per_hour" 
                                ? (service.price * parseInt(duration)).toFixed(2)
                                : service.price.toFixed(2)
                              }
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={createBooking} 
                        disabled={loading || !startTime}
                        className="w-full gradient-primary"
                        size="lg"
                      >
                        {loading ? "Creating Booking..." : "Confirm & Pay"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Bookings for selected date */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">
                {selectedDate ? `Bookings for ${format(selectedDate, "PPP")}` : "Select a date"}
              </h3>
              
              {selectedDateBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No bookings for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateBookings.map((booking) => (
                    <Card key={booking.id} className="hover-lift transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {booking.start_time} - {booking.end_time}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <Badge variant="outline" className={getPaymentStatusColor(booking.payment_status)}>
                              {booking.payment_status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-medium">{booking.service.title}</p>
                          {booking.order_number && (
                            <p className="text-sm text-muted-foreground">
                              Order: #{booking.order_number}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {isProvider ? booking.customer.full_name : booking.provider?.full_name}
                            </div>
                            <div className="flex items-center gap-1 font-medium gradient-text">
                              <DollarSign className="h-3 w-3" />
                              ${booking.total_amount}
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="text-sm p-3 bg-muted rounded-lg mt-2">
                              <strong>Notes:</strong> {booking.notes}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          {isProvider && booking.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                className="gradient-success flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => updateBookingStatus(booking.id, "rejected", "Provider declined")}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </>
                          )}

                          {isProvider && booking.status === "confirmed" && (
                            <Button 
                              size="sm" 
                              onClick={() => updateBookingStatus(booking.id, "completed")}
                              className="gradient-primary flex-1"
                            >
                              Mark Complete
                            </Button>
                          )}

                          {booking.status === "completed" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsReviewModalOpen(true);
                              }}
                              className="flex-1"
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Leave Review
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star 
                      className={`h-6 w-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review">Review</Label>
              <Textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsReviewModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={submitReview}
                className="flex-1 gradient-primary"
              >
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}