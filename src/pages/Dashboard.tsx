
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, MessageSquare, Wallet, Calendar, Star, Bell, Settings, CheckCircle, XCircle, TrendingUp, Search, User } from 'lucide-react';
import { OrderManagement } from '@/components/OrderManagement';

interface BorrowRequest {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  created_at: string;
  payment_status: string;
  items: {
    title: string;
    price_per_day: number;
  };
  profiles: {
    full_name: string;
  };
}

interface UserItem {
  id: string;
  title: string;
  price_per_day: number;
  availability: boolean;
  created_at: string;
}

interface UserService {
  id: string;
  title: string;
  price: number;
  price_type: string;
  is_active: boolean;
  created_at: string;
  rating: number;
  total_reviews: number;
}

interface ServiceRequest {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  requested_date: string | null;
  requested_time: string | null;
  services: {
    title: string;
    price: number;
  } | null;
  profiles: {
    full_name: string;
  } | null;
}

interface ServiceBooking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  service: {
    title: string;
  };
  customer?: {
    full_name: string;
  };
  provider?: {
    full_name: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [lendRequests, setLendRequests] = useState<BorrowRequest[]>([]);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [customerBookings, setCustomerBookings] = useState<ServiceBooking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    
    // Fetch borrow requests (where user is borrower)
    const { data: borrowData, error: borrowError } = await supabase
      .from('borrow_requests')
      .select(`
        *,
        items (title, price_per_day),
        profiles!borrow_requests_lender_id_fkey (full_name)
      `)
      .eq('borrower_id', user.id)
      .order('created_at', { ascending: false });
    
    if (borrowError) {
      console.error('Error fetching borrow requests:', borrowError);
    }

    // Fetch lend requests (where user is lender)
    const { data: lendData, error: lendError } = await supabase
      .from('borrow_requests')
      .select(`
        *,
        items (title, price_per_day),
        profiles!borrow_requests_borrower_id_fkey (full_name)
      `)
      .eq('lender_id', user.id)
      .order('created_at', { ascending: false });
    
    if (lendError) {
      console.error('Error fetching lend requests:', lendError);
    }

    // Fetch user's items
    const { data: itemsData, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    
    if (itemsError) {
      console.error('Error fetching items:', itemsError);
    }

    // Fetch user's services
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false });
    
    if (servicesError) {
      console.error('Error fetching services:', servicesError);
    }

    // Fetch service requests (where user is provider)
    const { data: serviceRequestsData } = await supabase
      .from('service_requests')
      .select(`
        *,
        services (title, price),
        profiles!service_requests_customer_id_fkey (full_name)
      `)
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch service bookings where user is provider
    const { data: providerBookingsData } = await supabase
      .from('service_bookings')
      .select(`
        *,
        service:services(title),
        customer:profiles!service_bookings_customer_id_fkey(full_name)
      `)
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch service bookings where user is customer
    const { data: customerBookingsData } = await supabase
      .from('service_bookings')
      .select(`
        *,
        service:services(title),
        provider:profiles!service_bookings_provider_id_fkey(full_name)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    setBorrowRequests(borrowData || []);
    setLendRequests(lendData || []);
    setUserItems(itemsData || []);
    setUserServices(servicesData || []);
    setServiceRequests((serviceRequestsData as unknown as ServiceRequest[]) || []);
    setServiceBookings((providerBookingsData as unknown as ServiceBooking[]) || []);
    setCustomerBookings((customerBookingsData as unknown as ServiceBooking[]) || []);
    setNotifications(notificationsData || []);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'negotiating': return 'bg-blue-100 text-blue-800';
      case 'payment_pending': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestClick = (requestId: string) => {
    navigate(`/request/${requestId}`);
  };

  const handleServiceRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          status: action === 'accept' ? 'approved' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh data
      fetchDashboardData();
      
      toast({
        title: `Request ${action}ed successfully`,
        description: `The service request has been ${action}ed.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} the request.`,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Please sign in to access your dashboard</h2>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your borrowing and lending activities</p>
          </div>
          <Button 
            onClick={() => navigate('/add-item')}
            className="gradient-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-7 h-auto">
            <TabsTrigger value="overview" className="text-xs md:text-sm px-2 py-3">Overview</TabsTrigger>
            <TabsTrigger value="borrowing" className="text-xs md:text-sm px-2 py-3">Borrowing</TabsTrigger>
            <TabsTrigger value="lending" className="text-xs md:text-sm px-2 py-3">Lending</TabsTrigger>
            <TabsTrigger value="items" className="text-xs md:text-sm px-2 py-3">My Items</TabsTrigger>
            <TabsTrigger value="services" className="text-xs md:text-sm px-2 py-3">Services</TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs md:text-sm px-2 py-3">Bookings</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs md:text-sm px-2 py-3">Orders</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm px-2 py-3">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-effect shadow-elegant hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground font-medium">Active Requests</p>
                      <p className="text-3xl font-bold gradient-text">{borrowRequests.filter(r => r.status === 'active').length}</p>
                    </div>
                    <div className="gradient-primary p-3 rounded-lg">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-effect shadow-elegant hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground font-medium">Items Listed</p>
                      <p className="text-3xl font-bold gradient-text">{userItems.length}</p>
                    </div>
                    <div className="gradient-success p-3 rounded-lg">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-effect shadow-elegant hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground font-medium">Services</p>
                      <p className="text-3xl font-bold gradient-text">{userServices.length}</p>
                    </div>
                    <div className="gradient-accent p-3 rounded-lg">
                      <Bell className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-effect shadow-elegant hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground font-medium">Bookings</p>
                      <p className="text-3xl font-bold gradient-text">{serviceBookings.length + customerBookings.length}</p>
                    </div>
                    <div className="gradient-secondary p-3 rounded-lg">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-effect shadow-card">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {borrowRequests.slice(0, 3).map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-center justify-between py-3 border-b last:border-b-0 hover:bg-accent/50 px-2 rounded cursor-pointer"
                      onClick={() => handleRequestClick(request.id)}
                    >
                      <div>
                        <p className="font-medium">{request.items.title}</p>
                        <p className="text-sm text-muted-foreground">{request.profiles.full_name}</p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                  {borrowRequests.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-2">No recent activity</p>
                      <Button onClick={() => navigate('/marketplace')} variant="outline" size="sm">
                        Browse Items
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-effect shadow-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => navigate('/add-item')} className="w-full justify-start gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    List New Item
                  </Button>
                  <Button onClick={() => navigate('/add-service')} variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                  <Button onClick={() => navigate('/marketplace')} variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Marketplace
                  </Button>
                  <Button onClick={() => navigate('/services')} variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Browse Services
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="borrowing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Borrow Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : borrowRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No borrow requests yet. <a href="/marketplace" className="text-trust-600 hover:underline">Browse items</a> to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {borrowRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRequestClick(request.id)}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{request.items.title}</h3>
                          <p className="text-sm text-gray-600">
                            Lender: {request.profiles.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <p className="text-sm font-semibold mt-1">
                            ${request.total_amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Lending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : lendRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lending requests yet. <a href="/add-item" className="text-trust-600 hover:underline">Add an item</a> to start lending!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lendRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRequestClick(request.id)}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{request.items.title}</h3>
                          <p className="text-sm text-gray-600">
                            Borrower: {request.profiles.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <p className="text-sm font-semibold mt-1">
                            ${request.total_amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  My Listed Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : userItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No items listed yet. <a href="/add-item" className="text-trust-600 hover:underline">Add your first item</a>!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userItems.map((item) => (
                      <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                            <Badge variant={item.availability ? "default" : "secondary"}>
                              {item.availability ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                          <p className="text-trust-600 font-semibold">
                            ${item.price_per_day}/day
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Listed {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            {/* Service Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Services</p>
                      <p className="text-2xl font-bold">{userServices.length}</p>
                    </div>
                    <Settings className="h-8 w-8 text-primary opacity-60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Requests</p>
                      <p className="text-2xl font-bold">{serviceRequests.filter(r => r.status === 'pending').length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                      <p className="text-2xl font-bold">
                        {userServices.length > 0 
                          ? (userServices.reduce((acc, s) => acc + Number(s.rating), 0) / userServices.length).toFixed(1)
                          : '0.0'
                        }
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500 opacity-60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{serviceRequests.filter(r => r.status === 'completed').length}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Requests Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Service Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : serviceRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No service requests yet. <a href="/add-service" className="text-primary hover:underline">Add a service</a> to start receiving requests!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{request.services?.title || 'Service'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Customer: {request.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {request.requested_date ? new Date(request.requested_date).toLocaleDateString() : 'Date TBD'} 
                            {request.requested_time && ` at ${request.requested_time}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right mr-4">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <p className="text-sm font-semibold mt-1">
                              ${request.total_amount}
                            </p>
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleServiceRequestAction(request.id, 'accept')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleServiceRequestAction(request.id, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Deny
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Services List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  My Listed Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : userServices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No services listed yet. <a href="/add-service" className="text-primary hover:underline">Add your first service</a>!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userServices.map((service) => (
                      <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold line-clamp-1">{service.title}</h3>
                            <Badge variant={service.is_active ? "default" : "secondary"}>
                              {service.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{Number(service.rating).toFixed(1)} ({service.total_reviews})</span>
                          </div>
                          <p className="text-primary font-semibold">
                            ${Number(service.price).toFixed(2)}/{service.price_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Listed {new Date(service.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {/* Provider Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Service Bookings (As Provider)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : serviceBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No service bookings yet. <a href="/add-service" className="text-trust-600 hover:underline">Add a service</a> to start receiving bookings!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{booking.service.title}</h3>
                          <p className="text-sm text-gray-600">
                            Customer: {booking.customer?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time} - {booking.end_time}
                          </p>
                          {booking.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              Notes: {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={`ml-2 ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {booking.payment_status}
                          </Badge>
                          <p className="text-sm font-semibold mt-1">
                            ${booking.total_amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  My Service Bookings (As Customer)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : customerBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No bookings yet. <a href="/services" className="text-trust-600 hover:underline">Browse services</a> to make your first booking!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{booking.service.title}</h3>
                          <p className="text-sm text-gray-600">
                            Provider: {booking.provider?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time} - {booking.end_time}
                          </p>
                          {booking.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              Notes: {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={`ml-2 ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {booking.payment_status}
                          </Badge>
                          <p className="text-sm font-semibold mt-1">
                            ${booking.total_amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{notification.title}</h4>
                            {notification.message && (
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Wallet Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-trust-600 mb-2">$0.00</div>
                  <p className="text-gray-600">Available balance</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Add Funds
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Your Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-trust-600 mb-2">5.0</div>
                  <p className="text-gray-600">Based on 0 reviews</p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  No transactions yet
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrderManagement isProvider={true} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics charts and trends will be displayed here.</p>
                  <Button onClick={() => navigate('/analytics')} className="mt-4" variant="outline">
                    View Detailed Analytics
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Month</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Earnings</span>
                      <span className="font-semibold text-lg">$0.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
