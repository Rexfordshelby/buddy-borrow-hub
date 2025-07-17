
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';

const AddItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    price_per_day: '',
    deposit_amount: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const categories = [
    'electronics', 'tools', 'sports', 'books', 'furniture', 
    'kitchen', 'automotive', 'clothing', 'gaming', 'other'
  ];

  const conditions = ['new', 'like_new', 'good', 'fair'];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setImageUploadLoading(true);
    try {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('service-portfolio')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('service-portfolio')
        .getPublicUrl(fileName);

      setUploadedImages(prev => [...prev, publicUrl]);
      
      toast({
        title: "Image uploaded",
        description: "Your item image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImageUploadLoading(false);
    }
  };

  const removeImage = (imageToRemove: string) => {
    setUploadedImages(prev => prev.filter(image => image !== imageToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('items').insert({
        owner_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        condition: formData.condition as any,
        price_per_day: parseFloat(formData.price_per_day),
        deposit_amount: parseFloat(formData.deposit_amount) || 0,
        location: formData.location,
        images: uploadedImages
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your item has been listed successfully.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Please log in to add items</p>
            <Button onClick={() => navigate('/auth')}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Title *
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter item title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your item"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({...formData, condition: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Day ($) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({...formData, price_per_day: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Location
                   </label>
                   <Input
                     value={formData.location}
                     onChange={(e) => setFormData({...formData, location: e.target.value})}
                     placeholder="City, State"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Item Images
                   </label>
                   <div className="mt-2">
                     <div className="flex items-center gap-4 mb-4">
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleImageUpload}
                         className="hidden"
                         id="image-upload"
                         disabled={imageUploadLoading}
                       />
                       <label htmlFor="image-upload">
                         <Button
                           type="button"
                           variant="outline"
                           className="cursor-pointer"
                           disabled={imageUploadLoading}
                           asChild
                         >
                           <span>
                             {imageUploadLoading ? (
                               <>
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                 Uploading...
                               </>
                             ) : (
                               <>
                                 <Upload className="h-4 w-4 mr-2" />
                                 Upload Image
                               </>
                             )}
                           </span>
                         </Button>
                       </label>
                     </div>
                     
                     {uploadedImages.length > 0 && (
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         {uploadedImages.map((imageUrl, index) => (
                           <div key={index} className="relative group">
                             <img
                               src={imageUrl}
                               alt={`Item image ${index + 1}`}
                               className="w-full h-32 object-cover rounded-lg border"
                             />
                             <Button
                               type="button"
                               variant="destructive"
                               size="sm"
                               className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                               onClick={() => removeImage(imageUrl)}
                             >
                               <X className="h-3 w-3" />
                             </Button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
