import type { GpsLocation } from './moments';

export interface GeolocationResult {
  success: true;
  coords: GeolocationCoordinates;
}

export interface GeolocationError {
  success: false;
  error: string;
}

export type LocationResult = GeolocationResult | GeolocationError;

export async function requestLocation(): Promise<LocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return { success: false, error: 'Geolocation not supported' };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ success: true, coords: position.coords });
      },
      (error) => {
        let errorMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'Unknown location error';
        }
        resolve({ success: false, error: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`,
      {
        headers: {
          'User-Agent': 'DogTracer/1.0',
        },
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.address) {
      const { amenity, leisure, park, neighbourhood, suburb, city, town, village } = data.address;
      const place = amenity || leisure || park || neighbourhood || suburb || city || town || village;
      if (place) return place;
    }
    
    if (data.display_name) {
      const parts = data.display_name.split(',');
      return parts[0]?.trim() || null;
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function getLocationWithLabel(): Promise<GpsLocation | null> {
  const locationResult = await requestLocation();
  
  if (!locationResult.success) {
    return null;
  }
  
  const { latitude, longitude, accuracy } = locationResult.coords;
  
  const placeLabel = await reverseGeocode(latitude, longitude);
  
  return {
    latitude,
    longitude,
    accuracy,
    placeLabel,
  };
}
