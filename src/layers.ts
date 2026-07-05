import L from 'leaflet'
import { getConfig, setConfig } from './config'

const $settings = document.querySelector<HTMLDivElement>('.settings')!
const $isSatellite = $settings.querySelector<HTMLInputElement>('.is-satellite')!
const $labelsVisible = $settings.querySelector<HTMLInputElement>('.labels-visible')!

// Select

const SELECT_PADDING = 2

for(const $select of $settings.querySelectorAll<HTMLDivElement>('.select')){

    updateSelectSlider($select)

    $select.querySelector<HTMLInputElement>('input[type="checkbox"]')!
        .addEventListener('change', ()=>updateSelectSlider($select))

}

function updateSelectSlider($select: HTMLDivElement){

    const $input = $select.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    const $slider = $select.querySelector<HTMLDivElement>('.slider')!
    
    if($input.checked){
        const $onOption = $select.querySelector<HTMLDivElement>('.option.on')!
        const { width, left } = $onOption.getBoundingClientRect()
        $slider.style.left = (left - $slider.getBoundingClientRect().left + SELECT_PADDING) + 'px'
        $slider.style.width = width + 'px'
    }else{
        const $offOption = $select.querySelector<HTMLDivElement>('.option.off')!
        $slider.style.left = SELECT_PADDING + 'px'
        $slider.style.width = $offOption.getBoundingClientRect().width + 'px'
    }

}

// Layers

const STANDARD_LAYER = L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}${L.Browser.retina ? '@2x.png' : '.png'}`, { subdomains: 'abcd' })
const LABEL_LAYER = L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}${L.Browser.retina ? '@2x.png' : '.png'}`, { subdomains: 'abcd' })
const SATELLITE_LAYER = L.tileLayer(`http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`)

export function initLayers(map: L.Map){

    function updateLayers(){

        if($isSatellite.checked){
            map.removeLayer(STANDARD_LAYER)
            map.addLayer(SATELLITE_LAYER)
        }else{
            map.removeLayer(SATELLITE_LAYER)
            map.addLayer(STANDARD_LAYER)
        }

        if($labelsVisible.checked){
            map.addLayer(LABEL_LAYER)
            LABEL_LAYER.bringToFront()
        }else map.removeLayer(LABEL_LAYER)
        
    }

    $isSatellite.addEventListener('change', ()=>{
        setConfig('isSatellite', $isSatellite.checked)
        updateLayers()
    })
    $labelsVisible.addEventListener('change', ()=>{
        setConfig('labelsVisible', $labelsVisible.checked)
        updateLayers()
    })

    $isSatellite.checked = getConfig('isSatellite')
    $labelsVisible.checked = getConfig('labelsVisible')

    updateLayers()

}
