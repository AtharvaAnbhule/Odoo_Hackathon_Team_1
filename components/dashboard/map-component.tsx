"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Booking } from "@/lib/types";

const DefaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapComponent({
  pickups,
  pendingReturns,
}: {
  pickups: Booking[];
  pendingReturns: Booking[];
}) {
  const defaultPosition = [51.505, -0.09] as [number, number];

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Markers for pickups */}
      {pickups.map((booking) => (
        <Marker
          key={`pickup-${booking.id}`}
          position={[
            defaultPosition[0] + Math.random() * 0.02 - 0.01,
            defaultPosition[1] + Math.random() * 0.02 - 0.01,
          ]}>
          <Popup>
            <div className="space-y-1">
              <h3 className="font-bold">Pickup: {booking.productName}</h3>
              <p>Customer: {booking.customerName}</p>
              <p>Time: {new Date(booking.startDate).toLocaleTimeString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Markers for returns */}
      {pendingReturns.map((booking) => (
        <Marker
          key={`return-${booking.id}`}
          position={[
            defaultPosition[0] + Math.random() * 0.02 - 0.01,
            defaultPosition[1] + Math.random() * 0.02 - 0.01,
          ]}>
          <Popup>
            <div className="space-y-1">
              <h3 className="font-bold">Return: {booking.productName}</h3>
              <p>Customer: {booking.customerName}</p>
              <p>Due: {new Date(booking.endDate).toLocaleDateString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
