import { Layer } from 'mapbox-gl';
import { useEffect } from 'react';
//import { getTracks } from '../../../Api/backendServices';
//import DroneImg from '../../../Assets/images/drone.png';
//import PlaneImg from '../../../Assets/images/plane.png';

/*

const generateSource = (data: any):any => { return { 'type': 'geojson', 'data': data } };
const generateDroneLayer = (id: string, source: string):Layer => {
    return {
        'id': id,
        'type': 'symbol',
        'source': source,
        'layout': {
            'icon-image': 'drone',
            'icon-size': 0.5,
            'text-field': ['format',
                ['get', 'time'],
                {
                    'font-scale': 0.7,
                },
                '\n',
                {},
                ['get', 'model'],
                {
                    'font-scale': 1
                },
                '\n',
                {},
                ['get', 'sn'],
                {
                    'font-scale': 0.8,
                },
                '\n',
                {},
                ['get', 'speed'],
                {
                    'font-scale': 0.8,
                },
                '\n',
                {},
                ['get', 'altitude'],
                {
                    'font-scale': 0.8,
                },
            ],
            'text-offset': [0, 4.2]
        }
    }
}

const generatePlaneLayer = (id: string, source: string):Layer => {
    return {
        'id': id,
        'type': 'symbol',
        'source': source,
        'layout': {
            'icon-image': 'plane',
            'icon-rotate': ['get', 'direction'],
            'icon-rotation-alignment': 'map',
            'icon-size': 0.5,
            //'icon-color': '#FCD227',
            //'text-color': '#FCD227',
            'text-field': ['format',
                ['get', 'time'],
                {
                    'font-scale': 0.7
                },
                '\n',
                {},
                ['get', 'callsign'],
                {
                    'font-scale': 1
                },
                '\n',
                {},
                ['get', 'speed'],
                {
                    'font-scale': 0.8,
                },
                '\n',
                {},
                ['get', 'altitude'],
                {
                    'font-scale': 0.8,
                },
            ],
            'text-offset': [0, 3.5]
        },
        "paint": {
            'text-color': '#fff',
            'text-halo-color': '#000',
            'text-halo-width': 1,

        }
    }
}


const TRACKING_UPDATE_TIME = 1000;

export const tracking = () => {
    let gMap: mapboxgl.Map;

    const handleFetch = async () => {
        const data = await getTracks()
        //Drone layer        
        if(gMap.getSource('drone')) {
            let source:any = gMap.getSource('drone')
            source.setData(data['drone']);
        }else{
            gMap.addSource('drone',generateSource(data['drone']));
            gMap.addLayer(generateDroneLayer('drone', 'drone'));
        }

        //Plane layer
        if(gMap.getSource('plane')) {
            let source:any = gMap.getSource('plane')
            source.setData(data['flight']);
        }else{
            gMap.addSource('plane',generateSource(data['flight']));
            gMap.addLayer(generatePlaneLayer('plane', 'plane'));
        }
    }

    const addIcons = () => {
        gMap?.loadImage(DroneImg, (error: any, image: HTMLImageElement) => {
            if (error) throw error
            gMap.addImage('drone', image)
        })
        gMap?.loadImage(PlaneImg, (error: any, image: HTMLImageElement) => {
            if (error) throw error
            gMap.addImage('plane', image)
        })
    }

    const init = async (map: mapboxgl.Map) => {
        gMap = map;
        addIcons();
        setInterval(() => {
            handleFetch();
        }, TRACKING_UPDATE_TIME)
    }

    useEffect(() => {

    }, [])

    return [init]
}
*/