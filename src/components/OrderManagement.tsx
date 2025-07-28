import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Package, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  CreditCard,
  Truck,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  confirmation_code: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  total_amount: number;
  notes?: string;
  customer_rating?: number;
  provider_rating?: number;
  customer_review?: string;
  provider_review?: string;
  created_at: string;
  service: {
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
  };
  customer: {
    full_name: string;
    email: string;
    phone: string;
  };
  provider: {
    full_name: string;
    email: string;
    phone: string;
  };
}

interface OrderManagementProps {
  isProvider?: boolean;
}

export function OrderManagement({ isProvider = false }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const query = supabase
        .from('service_bookings')
        .select(`
          *,
          service:services(title, description, price, category, location),
          customer:profiles!service_bookings_customer_id_fkey(full_name, email, phone),
          provider:profiles!service_bookings_provider_id_fkey(full_name, email, phone)
        `);

      if (isProvider) {
        query.eq('provider_id', user.id);
      } else {
        query.eq('customer_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data as Order[]);
      setFilteredOrders(data as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, reason?: string) => {
    try {
      const updates: any = { 
        status: newStatus,
        provider_response_at: new Date().toISOString()
      };

      if (reason) {
        updates.cancellation_reason = reason;
      }

      const { error } = await supabase
        .from('service_bookings')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      // Create notification
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // For now, skip notification creation as we don't have customer/provider IDs in the current structure
        // This would need to be updated when the database structure includes IDs
        console.log('Order status updated to:', newStatus);
      }

      toast({
        title: 'Order Updated',
        description: `Order has been ${newStatus} successfully`
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive'
      });
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.provider.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchOrders();
  }, [user, isProvider]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500 text-white';
      case 'pending': return 'bg-amber-500 text-white';
      case 'cancelled': case 'rejected': return 'bg-red-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-600 bg-emerald-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'refunded': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Truck className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const ordersByStatus = {
    all: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
    completed: filteredOrders.filter(o => o.status === 'completed').length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled' || o.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">
            {isProvider ? 'Order Management' : 'My Orders'}
          </h2>
          <p className="text-muted-foreground">
            {isProvider ? 'Manage your service bookings' : 'Track your service orders'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(ordersByStatus).map(([status, count]) => (
          <Card key={status} className="glass-effect hover-lift cursor-pointer" onClick={() => setStatusFilter(status)}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold gradient-text">{count}</div>
              <div className="text-sm text-muted-foreground capitalize">{status}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, services, or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : isProvider
                  ? 'You haven\'t received any orders yet.'
                  : 'You haven\'t placed any orders yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="glass-effect hover-lift transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold gradient-text">
                          {order.service.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>Order #{order.order_number}</span>
                          <span>•</span>
                          <span>Code: {order.confirmation_code}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                        <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                          <CreditCard className="h-3 w-3 mr-1" />
                          {order.payment_status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{format(new Date(order.booking_date), 'PPP')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{order.start_time} - {order.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span>{isProvider ? order.customer.full_name : order.provider.full_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold gradient-text">
                          ${order.total_amount}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ordered {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailsModalOpen(true);
                      }}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {isProvider && order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="gradient-success flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, 'rejected', 'Provider declined')}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {isProvider && order.status === 'confirmed' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="gradient-primary w-full"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedOrder.service.title}</h3>
                  <p className="text-muted-foreground">{selectedOrder.service.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold gradient-text">
                    ${selectedOrder.total_amount}
                  </div>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Order Number:</span>
                      <span className="font-mono">#{selectedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmation Code:</span>
                      <span className="font-mono">{selectedOrder.confirmation_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span>{format(new Date(selectedOrder.created_at), 'PPP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Date:</span>
                      <span>{format(new Date(selectedOrder.booking_date), 'PPP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Time:</span>
                      <span>{selectedOrder.start_time} - {selectedOrder.end_time}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      {isProvider ? 'Customer' : 'Provider'} Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(() => {
                      const contact = isProvider ? selectedOrder.customer : selectedOrder.provider;
                      return (
                        <>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{contact.full_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {selectedOrder.service.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{selectedOrder.service.location}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Customer Notes:</strong> {selectedOrder.notes}
                  </AlertDescription>
                </Alert>
              )}

              {/* Reviews */}
              {(selectedOrder.customer_review || selectedOrder.provider_review) && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Reviews</h4>
                  {selectedOrder.customer_review && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Customer Review</CardTitle>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < (selectedOrder.customer_rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedOrder.customer_review}</p>
                      </CardContent>
                    </Card>
                  )}
                  {selectedOrder.provider_review && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Provider Review</CardTitle>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < (selectedOrder.provider_rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedOrder.provider_review}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}