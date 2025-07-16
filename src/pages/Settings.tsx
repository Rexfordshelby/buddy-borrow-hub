import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  Trash2,
  Download
} from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setSaving] = useState(false);
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    newRequests: true,
    requestUpdates: true,
    messages: true,
    payments: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showLocation: true,
    showPhone: false,
    allowMessages: true,
    showRating: true
  });

  // Theme setting
  const [theme, setTheme] = useState('light');

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Here you would save settings to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Here you would implement account deletion
        toast({
          title: "Account deletion requested",
          description: "Your account will be deleted within 24 hours.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account. Please contact support.",
          variant: "destructive",
        });
      }
    }
  };

  const downloadData = async () => {
    try {
      // Here you would implement data export
      toast({
        title: "Data export started",
        description: "Your data will be sent to your email within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to access settings</h1>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
            </div>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Account & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <Input value={user.email || ''} disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support to change your email address
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Two-Factor Authentication</label>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Badge variant="secondary">Not enabled</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Notification Methods</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Email notifications</span>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(value) => handleNotificationChange('email', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Push notifications</span>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(value) => handleNotificationChange('push', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">SMS notifications</span>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(value) => handleNotificationChange('sms', value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Notification Types</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New borrow requests</span>
                      <Switch
                        checked={notifications.newRequests}
                        onCheckedChange={(value) => handleNotificationChange('newRequests', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Request status updates</span>
                      <Switch
                        checked={notifications.requestUpdates}
                        onCheckedChange={(value) => handleNotificationChange('requestUpdates', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">New messages</span>
                      <Switch
                        checked={notifications.messages}
                        onCheckedChange={(value) => handleNotificationChange('messages', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment notifications</span>
                      <Switch
                        checked={notifications.payments}
                        onCheckedChange={(value) => handleNotificationChange('payments', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Marketing emails</span>
                      <Switch
                        checked={notifications.marketing}
                        onCheckedChange={(value) => handleNotificationChange('marketing', value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Privacy & Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Profile visibility</span>
                    <p className="text-xs text-muted-foreground">Allow others to find your profile</p>
                  </div>
                  <Switch
                    checked={privacy.profileVisible}
                    onCheckedChange={(value) => handlePrivacyChange('profileVisible', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Show location</span>
                    <p className="text-xs text-muted-foreground">Display your location on listings</p>
                  </div>
                  <Switch
                    checked={privacy.showLocation}
                    onCheckedChange={(value) => handlePrivacyChange('showLocation', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Show phone number</span>
                    <p className="text-xs text-muted-foreground">Display phone in your profile</p>
                  </div>
                  <Switch
                    checked={privacy.showPhone}
                    onCheckedChange={(value) => handlePrivacyChange('showPhone', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Allow messages</span>
                    <p className="text-xs text-muted-foreground">Let others send you messages</p>
                  </div>
                  <Switch
                    checked={privacy.allowMessages}
                    onCheckedChange={(value) => handlePrivacyChange('allowMessages', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Show rating</span>
                    <p className="text-xs text-muted-foreground">Display your rating publicly</p>
                  </div>
                  <Switch
                    checked={privacy.showRating}
                    onCheckedChange={(value) => handlePrivacyChange('showRating', value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="h-5 w-5 mr-2" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Theme</span>
                    <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4 mr-1" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4 mr-1" />
                      Dark
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Data & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Export your data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download a copy of all your data including profiles, listings, and messages.
                  </p>
                  <Button onClick={downloadData} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Request Data Export
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button onClick={handleDeleteAccount} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;