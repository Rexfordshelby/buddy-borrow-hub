import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Upload, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PortfolioImage {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  display_order: number;
}

interface ServicePortfolioProps {
  serviceId: string;
  isOwner?: boolean;
}

export function ServicePortfolio({ serviceId, isOwner = false }: ServicePortfolioProps) {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPortfolioImages = async () => {
    const { data } = await supabase
      .from("service_portfolio")
      .select("*")
      .eq("service_id", serviceId)
      .order("display_order");

    if (data) {
      setImages(data);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${serviceId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('service-portfolio')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('service-portfolio')
        .getPublicUrl(fileName);

      await supabase
        .from("service_portfolio")
        .insert({
          service_id: serviceId,
          image_url: publicUrl,
          title: title || null,
          description: description || null,
          display_order: images.length
        });

      toast({
        title: "Image uploaded",
        description: "Portfolio image added successfully"
      });

      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      fetchPortfolioImages();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    const { error } = await supabase
      .from("service_portfolio")
      .delete()
      .eq("id", imageId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Image deleted",
      description: "Portfolio image removed successfully"
    });

    fetchPortfolioImages();
  };

  useEffect(() => {
    fetchPortfolioImages();
  }, [serviceId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Portfolio</h3>
        {isOwner && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Portfolio Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Image title..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Image description..."
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No portfolio images yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="relative">
                <img
                  src={image.image_url}
                  alt={image.title || "Portfolio image"}
                  className="w-full h-48 object-cover"
                />
                {isOwner && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {(image.title || image.description) && (
                <CardContent className="p-3">
                  {image.title && (
                    <h4 className="font-medium text-sm">{image.title}</h4>
                  )}
                  {image.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {image.description}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}