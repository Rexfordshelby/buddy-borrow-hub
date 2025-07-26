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
import { Clock, CalendarDays, DollarSign, User, MapPin } from "lucide-react";
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
  profiles?: {
    full_name: string;
    avatar_url?: string;
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
  service: {
    title: string;
  };
  customer: {
    full_name: string;
  };
}

interface BookingCalendarProps {
  service?: Service;
  isProvider?: boolean;
}

export function BookingCalendar({ service, isProvider = false }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Booking form state
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [notes, setNotes] = useState("");

  const fetchBookings = async () => {
    if (!user) return;

    const query = supabase
      .from("service_bookings")
      .select(`
        *,
        service:services(title),
        customer:profiles!service_bookings_customer_id_fkey(full_name)
      `);

    if (isProvider) {
      query.eq("provider_id", user.id);
    } else {
      query.eq("customer_id", user.id);
    }

    if (service) {
      query.eq("service_id", service.id);
    }

    const { data } = await query;
    if (data) {
      setBookings(data as Booking[]);
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
      const endTimeFormatted = endTime;

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

      // Create booking first
      const { data: bookingData, error: bookingError } = await supabase
        .from("service_bookings")
        .insert({
          service_id: service.id,
          customer_id: user.id,
          provider_id: service.provider_id,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTimeFormatted,
          total_amount: totalAmount,
          notes,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .maybeSingle();

      if (bookingError) {
        console.error("Booking creation error:", bookingError);
        throw new Error("Failed to create booking");
      }

      console.log("Booking created successfully:", bookingData);

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

      console.log("Payment response:", { paymentData, paymentError });

      if (paymentError) {
        console.error("Payment creation error:", paymentError);
        // Clean up booking if payment creation fails
        await supabase.from("service_bookings").delete().eq("id", bookingData.id);
        throw new Error(paymentError.message || "Failed to create payment session");
      }

      if (!paymentData?.url) {
        console.error("No payment URL received:", paymentData);
        await supabase.from("service_bookings").delete().eq("id", bookingData.id);
        throw new Error("Failed to get payment URL");
      }

      // Create notification for provider
      await supabase
        .from("notifications")
        .insert({
          user_id: service.provider_id,
          title: "New Booking Request",
          message: `You have a new booking request for ${service.title}`,
          type: "booking"
        });

      toast({
        title: "Redirecting to Payment",
        description: "Your booking is being processed..."
      });

      // Redirect to Stripe payment
      window.open(paymentData.url, '_blank');

      setIsBookingModalOpen(false);
      setStartTime("");
      setDuration("1");
      setNotes("");
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

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from("service_bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Booking Updated",
      description: `Booking ${status} successfully`
    });

    fetchBookings();
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookings.filter(booking => booking.booking_date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {isProvider ? "Manage Bookings" : "Book Service"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
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
                    <Button className="w-full mt-4" disabled={!selectedDate}>
                      Book This Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Book {service.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input 
                          id="date"
                          value={selectedDate ? format(selectedDate, "PPP") : ""}
                          disabled
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
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any special requirements..."
                        />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span>Total Cost:</span>
                          <span className="font-bold">
                            ${service.price_type === "per_hour" 
                              ? (service.price * parseInt(duration)).toFixed(2)
                              : service.price.toFixed(2)
                            }
                          </span>
                        </div>
                      </div>
                      <Button 
                        onClick={createBooking} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? "Creating..." : "Confirm Booking"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Bookings for selected date */}
            <div>
              <h3 className="font-semibold mb-4">
                {selectedDate ? `Bookings for ${format(selectedDate, "PPP")}` : "Select a date"}
              </h3>
              
              {selectedDateBookings.length === 0 ? (
                <p className="text-muted-foreground">No bookings for this date</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {booking.start_time} - {booking.end_time}
                            </span>
                          </div>
                          <Badge 
                            variant="secondary"
                            className={`${getStatusColor(booking.status)} text-white`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <p className="font-medium">{booking.service.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {isProvider ? booking.customer.full_name : service?.profiles?.full_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${booking.total_amount}
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
                            {booking.notes}
                          </p>
                        )}

                        {isProvider && booking.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            >
                              Decline
                            </Button>
                          </div>
                        )}

                        {isProvider && booking.status === "confirmed" && (
                          <Button 
                            size="sm" 
                            className="mt-3"
                            onClick={() => updateBookingStatus(booking.id, "completed")}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}