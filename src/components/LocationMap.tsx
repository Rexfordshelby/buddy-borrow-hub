import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface LocationMapProps {
  locations?: Array<{
    id: string;
    title: string;
    location: string;
    latitude?: number;
    longitude?: number;
    price?: number;
  }>;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export function LocationMap({ 
  locations = [], 
  center = [-74.5, 40], 
  zoom = 9, 
  height = "400px" 
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'your-mapbox-token-here'; // This should come from environment
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for locations
    locations.forEach((location) => {
      if (location.latitude && location.longitude) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${location.title}</h3>
            <p class="text-sm text-gray-600">${location.location}</p>
            ${location.price ? `<p class="text-sm font-medium">$${location.price}/day</p>` : ''}
          </div>
        `);

        new mapboxgl.Marker()
          .setLngLat([location.longitude, location.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [locations, center, zoom]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full rounded-lg shadow-lg"
      style={{ height }}
    />
  );
}