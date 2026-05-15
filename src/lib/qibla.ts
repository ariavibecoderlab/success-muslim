import { Coordinates, Qibla } from 'adhan';

export function getQiblaDirection(lat: number, lng: number): number {
  const coordinates = new Coordinates(lat, lng);
  return Qibla(coordinates);
}
