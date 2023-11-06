import mapboxgl from 'mapbox-gl';

export const buildingLayerTemplate: mapboxgl.AnyLayer = {
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
        'fill-extrusion-color': '#aaa',
        // use an 'interpolate' expression to add a smooth transition effect to the
        // buildings as the user zooms in
        'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
        ],
        'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.4
    }
};


export const dynamicFillLayerTemplate = (layerId: string, layerName:string):mapboxgl.AnyLayer => {
    const layer:mapboxgl.AnyLayer = {
        'id': layerId,
        'type': 'fill',
        'source': layerId,
        'source-layer': layerName,
        'paint': {
            'fill-color': 'rgba(0,0,0,0)'
        }
    };
    return layer;
};


export const dynamicLineLayerTemplate = (layerId: string, layerName: string): mapboxgl.AnyLayer => {
    return {
        'id': layerId,
        'type': 'line',
        'source': layerId,
        'source-layer': layerName,
        'paint': {
            'line-color': 'rgba(0,0,0,0)',
            'line-width': 1,
        },
    };
};