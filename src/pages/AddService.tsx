
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, DollarSign, Star, Plus, X, Upload, Image } from 'lucide-react';

const serviceCategories = [
  { id: 'home', name: 'Home Services' },
  { id: 'automotive', name: 'Automotive' },
  { id: 'food', name: 'Food & Catering' },
  { id: 'beauty', name: 'Beauty & Wellness' },
  { id: 'event', name: 'Events & Photography' },
  { id: 'repair', name: 'Repair & Maintenance' },
];

const pricingTypes = [
  { id: 'per_hour', name: 'Per Hour' },
  { id: 'per_day', name: 'Per Day' },
  { id: 'per_service', name: 'Per Service' },
  { id: 'per_visit', name: 'Per Visit' },
];

const AddService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: '',
      pricingType: '',
      location: '',
      availability: '',
    }
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

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
        description: "Your service image has been uploaded successfully.",
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

  const onSubmit = async (data: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to list a service.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('services')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          price: parseFloat(data.price),
          price_type: data.pricingType,
          location: data.location,
          availability: data.availability,
          provider_id: user.id,
          tags: tags,
          images: uploadedImages,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Service listed successfully!",
        description: "Your service is now available on the marketplace.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error listing service:', error);
      toast({
        title: "Error",
        description: "Failed to list service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to list a service on our platform.</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Service</h1>
            <p className="text-gray-600">Share your skills and start earning by offering professional services</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: "Service title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Professional House Cleaning" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    rules={{ required: "Service description is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your service in detail..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      rules={{ required: "Please select a category" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      rules={{ required: "Location is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., New York, NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      rules={{ 
                        required: "Price is required",
                        pattern: {
                          value: /^\d+(\.\d{1,2})?$/,
                          message: "Please enter a valid price"
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input placeholder="50.00" type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricingType"
                      rules={{ required: "Please select pricing type" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricing Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pricing type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pricingTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="availability"
                    rules={{ required: "Please specify your availability" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Available Mon-Fri 9AM-5PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                   <div>
                     <FormLabel>Service Images</FormLabel>
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
                                 alt={`Service image ${index + 1}`}
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

                   <div>
                     <FormLabel>Service Tags (up to 5)</FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? "Listing..." : "List Service"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddService;
