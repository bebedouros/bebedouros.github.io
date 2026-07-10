import './style.scss'
import 'leaflet/dist/leaflet.css'
import '@tabler/icons-webfont/dist/tabler-icons.css'
import L from 'leaflet'
import { openModal } from './modal'
import { initLayers } from './layers'
import { initZoom } from './zoom'
import { initData } from './data'
import { DEFAULT_CONFIG, getConfig, setConfig } from './config'
import './locate'
import { initLocate } from './locate'

// TODO: pwa

const $map = document.querySelector<HTMLDivElement>('.map')!

const map = L.map($map, {
    zoomControl: false,
    attributionControl: false,
    maxZoom: 18,
    minZoom: 12,
} as L.MapOptions & {
    doubleTapDragZoom?: boolean | 'center'
    doubleTapDragZoomOptions?: { reverse?: boolean }
})
    .setView(getConfig('coords'), getConfig('zoom'))
    .setMaxBounds([
        [38.62, -9],
        [38.85, -9.3],
    ])

map.on('zoomend', ()=>setConfig('zoom', map.getZoom()))
map.on('moveend', ()=>{
    const center = map.getCenter()
    setConfig('coords', [ center.lat, center.lng ])
})

initLayers(map)
initZoom(map)
initData(map)
initLocate(map)

const $top = document.querySelector<HTMLDivElement>('.ui .top')!

// Logo

const $logo = $top.querySelector<HTMLDivElement>('.logo')!
$logo.addEventListener('click', ()=>map.flyTo(
    DEFAULT_CONFIG.coords,
    DEFAULT_CONFIG.zoom,
    { duration: 1 }
))

// About Button

const $aboutBtn = $top.querySelector<HTMLButtonElement>('.about-btn')!
const $aboutModal = document.querySelector<HTMLDivElement>('.about.modal')!

$aboutModal.scrollTo(0, 0)
$aboutBtn.addEventListener('click', ()=>openModal($aboutModal))

// Share Button

const $shareBtn = $top.querySelector<HTMLButtonElement>('.share-btn')!

if(navigator.share !== undefined){
    $shareBtn.addEventListener('click', ()=>navigator.share({ url: 'https://bebedouros.pt/' }))
    $shareBtn.style.removeProperty('display')
}

// Refresh Button
for(const $refreshBtn of document.querySelectorAll<HTMLButtonElement>('.refresh-btn'))
    $refreshBtn.addEventListener('click', ()=>location.reload())
