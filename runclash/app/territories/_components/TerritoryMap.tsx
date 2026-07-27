"use client";

import { useEffect, useRef, useState } from "react";

interface Territory {
    _id: string;
    name: string;
    center: { coordinates: [number, number] };
    radius: number;
    owner?: { _id: string; firstName: string; lastName: string; username: string; profileImage?: string };
    captureProgress: number;
    totalCaptures: number;
    color: string;
    icon: string;
    xpReward: number;
    coinReward: number;
}

interface TerritoryMapProps {
    territories: Territory[];
    userPosition: { lat: number; lng: number } | null;
    currentUserId?: string;
}

function getTerritoryColor(
    territory: Territory,
    currentUserId?: string
): { fillColor: string; strokeColor: string; fillOpacity: number } {
    if (!currentUserId) {
        return { fillColor: "#fbbf24", strokeColor: "#f59e0b", fillOpacity: 0.15 };
    }
    if (territory.owner && territory.owner._id === currentUserId) {
        return { fillColor: "#3b82f6", strokeColor: "#2563eb", fillOpacity: 0.2 };
    }
    if (territory.owner) {
        return { fillColor: "#ef4444", strokeColor: "#dc2626", fillOpacity: 0.2 };
    }
    return { fillColor: "#fbbf24", strokeColor: "#f59e0b", fillOpacity: 0.15 };
}

export default function TerritoryMap({
    territories,
    userPosition,
    currentUserId,
}: TerritoryMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const circlesRef = useRef<any[]>([]);
    const userMarkerRef = useRef<any>(null);
    const [leaflet, setLeaflet] = useState<any>(null);

    useEffect(() => {
        import("leaflet").then((L) => setLeaflet(L));
    }, []);

    useEffect(() => {
        if (!leaflet || !mapRef.current || mapInstanceRef.current) return;

        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const map = leaflet.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
        }).setView([40.7128, -74.006], 12);

        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [leaflet]);

    useEffect(() => {
        if (!leaflet || !mapInstanceRef.current) return;

        circlesRef.current.forEach((c: any) => mapInstanceRef.current.removeLayer(c));
        circlesRef.current = [];

        territories.forEach((t) => {
            const [lng, lat] = t.center.coordinates;
            const colors = getTerritoryColor(t, currentUserId);

            const circle = leaflet.circle([lat, lng], {
                radius: t.radius,
                color: colors.strokeColor,
                fillColor: colors.fillColor,
                fillOpacity: colors.fillOpacity,
                weight: 2,
                dashArray: t.owner ? "0" : "5, 5",
            }).addTo(mapInstanceRef.current);

            const ownerLabel = t.owner
                ? t.owner._id === currentUserId
                    ? "Your Territory"
                    : `👤 ${t.owner.firstName} ${t.owner.lastName}`
                : "Neutral";

            circle.bindPopup(`
                <div style="min-width: 150px">
                    <h3 style="font-weight: bold; margin: 0 0 4px">${t.icon} ${t.name}</h3>
                    <p style="margin: 2px 0; font-size: 12px; color: #666">Owner: ${ownerLabel}</p>
                    <p style="margin: 2px 0; font-size: 12px; color: #666">
                        Captures: ${t.totalCaptures} • Progress: ${t.captureProgress}% • 🏆 ${t.xpReward}xp / ${t.coinReward}🪙
                    </p>
                </div>
            `);

            circle.on("click", () => {
                console.log("Territory clicked:", t.name);
            });
            circlesRef.current.push(circle);
        });
    }, [leaflet, territories, currentUserId]);

    useEffect(() => {
        if (!leaflet || !mapInstanceRef.current) return;

        if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
        }

        if (userPosition) {
            const customIcon = leaflet.divIcon({
                className: "user-marker",
                html: `<div style="
                    width: 16px; height: 16px;
                    background: #3b82f6;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 10px rgba(59,130,246,0.6);
                "></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });

            userMarkerRef.current = leaflet.marker([userPosition.lat, userPosition.lng], {
                icon: customIcon,
            }).addTo(mapInstanceRef.current);
        }
    }, [leaflet, userPosition]);

    return (
        <div ref={mapRef} className="h-full w-full rounded-lg" style={{ minHeight: "350px" }} />
    );
}

