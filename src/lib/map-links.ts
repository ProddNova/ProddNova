import { Coordinates } from './types';

export const googleMapsPinUrl = ({ lat, lon }: Coordinates) =>
  `https://www.google.com/maps?q=${lat},${lon}`;

export const googleMapsSatelliteUrl = ({ lat, lon }: Coordinates) =>
  `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lon}&zoom=18&basemap=satellite`;

export const googleStreetViewUrl = ({ lat, lon }: Coordinates) =>
  `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`;
