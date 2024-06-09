"use client"
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export default function Home() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current ?? "root",
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
    const draw = new MapboxDraw({
        displayControlsDefault: false,
        // Select which mapbox-gl-draw control buttons to add to the map.
        controls: {
            polygon: true,
            trash: true
        },
        // Set mapbox-gl-draw to draw by default.
        // The user does not have to click the polygon control button first.
        defaultMode: 'draw_polygon'
    });

    // map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(draw)
     // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.on('move', () => {
      setLng(parseFloat(map.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.getCenter().lat.toFixed(4)));
      setZoom(parseFloat(map.getZoom().toFixed(2))); 
    });

     map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea)

    function updateArea(e: any) {
        const data = draw.getAll();
        const answer = document.getElementById('calculated-area');
        if (data.features.length > 0) {
            const area = turf.area(data);
            // Restrict the area to 2 decimal points.
            const rounded_area = Math.round(area * 100) / 100;
            answer!.innerHTML = `<p><strong>${rounded_area}</strong></p><p>square meters</p>`;
        } else {
            answer!.innerHTML = '';
            if (e.type !== 'draw.delete')
                alert('Click the map to draw a polygon.');
        }
    }
    
    return () => map.remove();
  }, [])


  return (
    <main className="min-h-screen border">
      <noscript>You need to enable JavaScript to run this app. </noscript>
      <div className="p-4 bg-white text-black absolute z-10 left-0 bottom-0">
    <p>Click the map to draw a polygon.</p>
    <div id="calculated-area"></div>
</div>
        <div className=" bg-black/50 text-white p-1.5 px-3 absolute rounded top-0 left-0 m-3 z-10">Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}</div>
      <div id="root" ref={mapContainerRef} className="absolute top-0 right-0 left-0 bottom-0"></div>
    </main>
  );
}
