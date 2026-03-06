import { Coordinates, LocationResult } from './types';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const mapElement = (element: OverpassElement): LocationResult | null => {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return null;
  }

  const tags = element.tags ?? {};
  const type = tags.building || tags.landuse || tags.amenity || 'unknown';

  return {
    id: String(element.id),
    lat,
    lon,
    type,
    name: tags.name,
    tags
  };
};

async function queryOverpass(query: string): Promise<LocationResult[]> {
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status}`);
  }

  const data = (await response.json()) as { elements: OverpassElement[] };
  return data.elements.map(mapElement).filter((item): item is LocationResult => item !== null);
}

export async function searchMapArea(bounds: [number, number, number, number]) {
  const [south, west, north, east] = bounds;

  // Overpass query for map explorer: building categories often linked to abandoned-type exploration targets.
  const query = `
[out:json][timeout:25];
(
  nwr["building"~"industrial|warehouse|factory|hospital|school|yes"](${south},${west},${north},${east});
  nwr["amenity"~"hospital|school"](${south},${west},${north},${east});
  nwr["landuse"="industrial"](${south},${west},${north},${east});
);
out center tags;
`;

  return queryOverpass(query);
}

export async function scanRadius(center: Coordinates, radiusKm: number) {
  const radiusMeters = Math.round(radiusKm * 1000);

  // Overpass query for radius scanner focused on industrial zones, explicit abandoned tags and large structures.
  const query = `
[out:json][timeout:25];
(
  nwr(around:${radiusMeters},${center.lat},${center.lon})["landuse"="industrial"];
  nwr(around:${radiusMeters},${center.lat},${center.lon})["abandoned"="yes"];
  nwr(around:${radiusMeters},${center.lat},${center.lon})["building"~"industrial|warehouse|factory|hospital|school"];
  way(around:${radiusMeters},${center.lat},${center.lon})["building"]["building:levels"~"^[4-9]|[1-9][0-9]+$"];
);
out center tags;
`;

  return queryOverpass(query);
}

export async function inspectCoordinates({ lat, lon }: Coordinates) {
  // Overpass query for exact coordinate inspection: returns nearby OSM elements and tags in 100m.
  const query = `
[out:json][timeout:20];
(
  nwr(around:100,${lat},${lon});
);
out center tags 25;
`;

  return queryOverpass(query);
}

export async function geocodeInput(input: string): Promise<Coordinates | null> {
  const pair = input.split(',').map((value) => Number(value.trim()));
  if (pair.length === 2 && pair.every((value) => Number.isFinite(value))) {
    return { lat: pair[0], lon: pair[1] };
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(input)}`,
    {
      headers: {
        Accept: 'application/json'
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error('Nominatim geocoding failed');
  }

  const data = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (!data.length) {
    return null;
  }

  return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
}
