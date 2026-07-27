"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface GPSPoint {
    lat: number;
    lng: number;
    timestamp: number;
}

interface MapComponentProps {
    route: GPSPoint[];
    isActive: boolean;
    smoothedRoute?: GPSPoint[];
}

export default function MapComponent({ route, isActive, smoothedRoute }: MapComponentProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const polylineRef = useRef<any>(null);
    const accuracyCircleRef = useRef<any>(null);
    const [leaflet, setLeaflet] = useState<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [locating, setLocating] = useState(false);
    const [gpsStatus, setGpsStatus] = useState<"idle" | "acquiring" | "active" | "error">("idle");

    const displayRoute = smoothedRoute && smoothedRoute.length > 1 ? smoothedRoute : route;

    useEffect(() => {
        import("leaflet").then((L) => {
            setLeaflet(L);
        });
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
        }).setView([51.505, -0.09], 13);

        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        map.addControl(leaflet.control.zoom({ position: "bottomright" }));

        mapInstanceRef.current = map;
        setMapLoaded(true);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [leaflet]);

    const handleLocateMe = useCallback(() => {
        if (!mapInstanceRef.current || !navigator.geolocation) return;
        setLocating(true);
        setGpsStatus("acquiring");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const map = mapInstanceRef.current;
                map.setView([latitude, longitude], 16, { animate: true });

                if (accuracyCircleRef.current) {
                    accuracyCircleRef.current.setLatLng([latitude, longitude]);
                    accuracyCircleRef.current.setRadius(accuracy);
                } else {
                    accuracyCircleRef.current = leaflet.circle([latitude, longitude], {
                        radius: accuracy,
                        color: "#3b82f6",
                        fillColor: "#3b82f6",
                        fillOpacity: 0.1,
                        weight: 1,
                    }).addTo(map);
                }

                setGpsStatus("active");
                setLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setGpsStatus("error");
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
    }, [leaflet]);

    useEffect(() => {
        if (!leaflet || !mapInstanceRef.current || displayRoute.length === 0) return;

        const map = mapInstanceRef.current;
        const lastPoint = displayRoute[displayRoute.length - 1];

        if (markerRef.current) {
            markerRef.current.setLatLng([lastPoint.lat, lastPoint.lng]);
        } else {
            const customIcon = leaflet.divIcon({
                className: "custom-marker",
                html: `<div style="
                    width: 20px; height: 20px;
                    background: #ef4444;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 12px rgba(239,68,68,0.6);
                    ${isActive ? "animation: pulse 1.5s infinite;" : ""}
                "></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
            });
            markerRef.current = leaflet.marker([lastPoint.lat, lastPoint.lng], { icon: customIcon }).addTo(map);
        }

        const latlngs = displayRoute.map((p) => [p.lat, p.lng]);
        if (polylineRef.current) {
            polylineRef.current.setLatLngs(latlngs);
        } else {
            polylineRef.current = leaflet.polyline(latlngs, {
                color: "#ef4444",
                weight: 4,
                opacity: 0.85,
                lineCap: "round",
                lineJoin: "round",
                dashArray: isActive ? "8, 8" : undefined,
            }).addTo(map);
        }

        if (isActive) {
            map.setView([lastPoint.lat, lastPoint.lng], map.getZoom(), { animate: true, duration: 0.5 });
        }

        if (displayRoute.length > 1 && !isActive) {
            const bounds = leaflet.latLngBounds(latlngs.map((ll) => ll as [number, number]));
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        }
    }, [leaflet, displayRoute, isActive]);

    useEffect(() => {
        if (!leaflet || !mapInstanceRef.current || displayRoute.length === 0) return;

        const lastPoint = displayRoute[displayRoute.length - 1];

        if (accuracyCircleRef.current) {
            accuracyCircleRef.current.setLatLng([lastPoint.lat, lastPoint.lng]);
        }
    }, [leaflet, displayRoute]);

    return (
        <div className="relative h-full w-full">
            <div ref={mapRef} className="h-full w-full rounded-lg" style={{ minHeight: "350px" }} />

            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                        <div className="text-5xl mb-3">🗺️</div>
                        <p className="text-gray-400 text-sm font-medium">Initializing map...</p>
                    </div>
                </div>
            )}

            {mapLoaded && (
                <>
                    <button
                        onClick={handleLocateMe}
                        disabled={locating}
                        className="absolute top-3 right-3 z-[1000] flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-md border border-gray-200 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <span className={locating ? "animate-spin" : ""}>📍</span>
                        {locating ? "Locating..." : "My Location"}
                    </button>

                    {gpsStatus === "acquiring" && (
                        <div className="absolute top-3 left-3 z-[1000] rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700">
                            Acquiring GPS signal...
                        </div>
                    )}

                    {gpsStatus === "error" && (
                        <div className="absolute top-3 left-3 z-[1000] rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-700">
                            GPS error. Check permissions.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
