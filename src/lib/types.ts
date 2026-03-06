export type LocationResult = {
  id: string;
  lat: number;
  lon: number;
  type: string;
  name?: string;
  tags: Record<string, string>;
};

export type Coordinates = {
  lat: number;
  lon: number;
};
