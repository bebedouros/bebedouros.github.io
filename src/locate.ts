import L from 'leaflet'
import { openModal } from './modal'

const $locateBtn = document.querySelector<HTMLButtonElement>('.locate-btn')!
const $loadingLocationBtn = document.querySelector<HTMLButtonElement>('.loading-location-btn')!
const $noGeolocatorModal = document.querySelector<HTMLDivElement>('.no-geolocator.modal')!

let id: number | null = null

let location: [ number, number ] | null = null
let lastUpdate = 0

let dot: L.Marker
let accuracyCircle: L.Circle

const dotIcon = L.divIcon({
    className: 'current-location-dot',
    html: '<div class="compass" style="display: none"></div>',
    iconSize: [ 24, 24 ]
})

function locate(map: L.Map){

    if(location){
        map.flyTo(location, map.getMaxZoom())
        return
    }

    if(id !== null) return

    switchButton($loadingLocationBtn)

    id = navigator.geolocation.watchPosition(p=>locationHandler(map, p), errorHandler, {
        enableHighAccuracy: true,
        timeout: 5e3,
        maximumAge: 0
    })

    startCompass()

}

function locationHandler(map: L.Map, pos: GeolocationPosition){
    if(pos.timestamp === lastUpdate) return
    lastUpdate = pos.timestamp

    const { latitude, longitude, accuracy } = pos.coords
    const coords: [ number, number ] = [ latitude, longitude ]

    if(location === null){

        switchButton($locateBtn)
        
        dot = L.marker(coords, { icon: dotIcon }).addTo(map)

        accuracyCircle = L.circle(coords, {
            radius: accuracy,
            stroke: false,
            fillColor: '#08f',
            fillOpacity: .1
        }).addTo(map)

        map.flyTo(coords, map.getMaxZoom())

    }else{
        dot.setLatLng(coords)
        accuracyCircle.setLatLng(coords)
        accuracyCircle.setRadius(accuracy)
    }

    location = coords

}

function errorHandler(e: GeolocationPositionError){
    
    console.error(e)
    openModal($noGeolocatorModal)

    switchButton($locateBtn)

    if(id !== null){
        navigator.geolocation.clearWatch(id)
        id = null
    }

    removeEventListener('deviceorientation', handleOrientation, true)
    removeEventListener('deviceorientationabsolute', handleOrientation, true)

    if(location !== null){
        location = null
        dot.remove()
        accuracyCircle.remove()
    }

}

async function startCompass(){

    if((DeviceOrientationEvent as any).requestPermission){
        // ios

        try{
            const res: string = await (DeviceOrientationEvent as any).requestPermission()
            if(res === 'granted') addEventListener('deviceorientation', handleOrientation, true)
        }catch(e){
            console.error(e)
        }

    }else{

        addEventListener(
            'ondeviceorientationabsolute' in window
            ? 'deviceorientationabsolute' // more accurate
            : 'deviceorientation',
            handleOrientation,
            true
        )

    }

}

function handleOrientation(e: DeviceOrientationEvent){
    if(!location) return

    let rotation: number | null = null

    if('webkitCompassHeading' in e)
        rotation = e.webkitCompassHeading as number
    
    if(e.absolute && e.alpha !== null)
        rotation = 360 - e.alpha

    if(rotation === null) return

    const $compass = dot.getElement()?.querySelector<HTMLDivElement>('.compass')
    if($compass){
        $compass.style.removeProperty('display')
        $compass.style.rotate = rotation + 'deg'
    }

}

function switchButton($button: HTMLButtonElement){
    $locateBtn.style.display = 'none'
    $loadingLocationBtn.style.display = 'none'
    $button.style.removeProperty('display')
}


export function initLocate(map: L.Map){

    if(!navigator.geolocation){
        $locateBtn.classList.add('disabled')
        $locateBtn.addEventListener('click', ()=>openModal($noGeolocatorModal))
        return
    }
    
    $locateBtn.addEventListener('click', ()=>locate(map))

}
