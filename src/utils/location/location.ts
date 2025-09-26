import { Geometry, Point } from "wkx";

export function getLatLngFromGeoPoint(geopoint: any) {
  const point = Geometry.parse(Buffer.from(geopoint, "hex")) as Point;
  JSON.stringify(point, null, 4);

  return {
    lat: point.x,
    lng: point.y,
  };
}

export function getGeoPointFromLatLng(lat: number, lng: number) {
  const geo = new Point(lng, lat).toWkb().toString("hex");
  JSON.stringify(geo, null, 4);
  return geo;
}


