'use client'
import React, { useRef, useEffect, useState } from 'react'
import mapboxgl, { GeoJSONSource } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import MapboxDraw from '@mapbox/mapbox-gl-draw'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from 'geojson'
import {
  putFeatureToCollection,
  getFeatureCollection,
  getFeatures,
  putFeature,
} from '@/server/mapbox'
import { MAPBOX_DRAW_THEME } from '@/lib/mapbox-draw-theme'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

export const Map = () => {
  const colors = ['#ff0000', '#ff9500', '#84ff00', '#00b3ff', '#ff1ce8']
  const [selectedColor, setSelectedColor] = useState<string>(colors[0])

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [lng, setLng] = useState(-70.9)
  const [lat, setLat] = useState(42.35)
  const [zoom, setZoom] = useState(9)
  const currentFeature = useRef<Feature<Geometry, GeoJsonProperties>>()
  const featureCollection = useRef<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  })
  const drawRef = useRef<MapboxDraw>()
  const mapRef = useRef<mapboxgl.Map>()
  const handleSelectColor = (color: string) => {
    const map = mapRef.current
    if (!map) return

    map.setPaintProperty('main', 'fill-color', color)
  }
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current ?? 'root',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    })
    const draw = new MapboxDraw({
      controls: {
        polygon: true,
        trash: true,
        point: false,
        line_string: false,
        combine_features: false,
        uncombine_features: false,
      },
      styles: MAPBOX_DRAW_THEME,
      userProperties: true,
    })

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    })
    map.addControl(draw, 'top-right')
    map.addControl(geocoder, 'bottom-right')
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('move', () => {
      setLng(parseFloat(map.getCenter().lng.toFixed(4)))
      setLat(parseFloat(map.getCenter().lat.toFixed(4)))
      setZoom(parseFloat(map.getZoom().toFixed(2)))
    })

    map.on('load', async () => {
      const features = await getFeatureCollection(
        'uwIyeyedBtwzPmWULbIs',
        'aKtyIjmvrYbTcoqTjUb0'
      )
        .then((data) => {
          const processedData = data.map((item, index) => {
            item.geometry.coordinates = JSON.parse(item.geometry.coordinates)
            return item as Feature<Geometry, GeoJsonProperties>
          })
          return processedData
        })
        .catch((e) => [])

      featureCollection.current.features = features
      map.addSource('main', {
        type: 'geojson',
        data: featureCollection.current,
      })
      map.addLayer({
        id: 'main',
        type: 'fill',
        source: 'main',
        paint: {
          'fill-color': selectedColor,
        },
      })
      draw.add(featureCollection.current)
      drawRef.current = draw
      mapRef.current = map
    })

    map.on('draw.create', addArea)
    map.on('draw.selectionchange', async (e: any) => {
      if (e.features.length > 0) {
        currentFeature.current = e.features[0]
        // do nothing or save the
      } else {
        // const res = await putFeature(JSON.stringify(currentFeature.current))
        console.log('currentFeature', currentFeature)
        const res = await putFeatureToCollection(
          JSON.stringify(currentFeature.current),
          'uwIyeyedBtwzPmWULbIs',
          'aKtyIjmvrYbTcoqTjUb0'
        )
        console.log(res)
      }
    })
    map.on('draw.modechange', (e) => {
      console.log('draw', e)
      map.setPaintProperty('main', 'fill-opacity', 0.5)
    })
    map.on('draw.update', updateArea)
    async function addArea(e: any) {
      featureCollection.current.features.push(e.features[0])
      const mapSource = map.getSource('main') as GeoJSONSource
      mapSource.setData(featureCollection.current)

      currentFeature.current = e.features[0] // triggers when points are connected
    }

    async function updateArea(e: any) {
      console.log('update', e.features[0]) // triggers when points are connected
      // const data = draw.getAll()
      const area = e.features[0]
      // const areaId = String(area.id)
      // const layer = map.getLayer(areaId)
      currentFeature.current = area
      // if (layer) {
      //   map.removeLayer(areaId)
      //   map.removeSource(areaId)
      // }
    }

    return () => map.remove()
  }, [])

  return (
    <>
      <div className="border flex gap-3 p-3 bg-muted border-muted-foreground ">
        <Button
          variant="outline"
          onClick={() => {
            const draw = drawRef.current
            if (!draw) {
              return
            }

            draw.changeMode('draw_polygon')
          }}
        >
          New Shape
        </Button>

        <div className="flex gap-3 items-center">
          {colors.map((color) => (
            <div
              key={color}
              className={cn('hover:cursor-pointer size-8')}
              style={{ backgroundColor: color }}
              onClick={() => {
                handleSelectColor(color)
              }}
            ></div>
          ))}
        </div>
      </div>
      <div className="size-full relative">
        <noscript>You need to enable JavaScript to run this app. </noscript>
        <div className=" bg-black/50 text-white p-1.5 px-3 absolute rounded top-0 left-0 m-3 z-10">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <div
          id="root"
          ref={mapContainerRef}
          className="mapboxgl-map size-full absolute top-0 right-0 left-0 bottom-0"
        ></div>
      </div>
    </>
  )
}
