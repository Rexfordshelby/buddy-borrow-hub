
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, MessageSquare, Wallet, Calendar, Star, Bell } from 'lucide-react';

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
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [lendRequests, setLendRequests] = useState<BorrowRequest[]>([]);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
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
    const { data: borrowData } = await supabase
      .from('borrow_requests')
      .select(`
        *,
        items (title, price_per_day),
        profiles!borrow_requests_lender_id_fkey (full_name)
      `)
      .eq('borrower_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch lend requests (where user is lender)
    const { data: lendData } = await supabase
      .from('borrow_requests')
      .select(`
        *,
        items (title, price_per_day),
        profiles!borrow_requests_borrower_id_fkey (full_name)
      `)
      .eq('lender_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch user's items
    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .eq('owner_id', user.id)
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

        <Tabs defaultValue="borrowing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="borrowing">My Borrowing</TabsTrigger>
            <TabsTrigger value="lending">My Lending</TabsTrigger>
            <TabsTrigger value="items">My Items</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
