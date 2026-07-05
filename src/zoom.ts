import L from 'leaflet'

const $zoomInBtn = document.querySelector<HTMLButtonElement>('.zoom-in-btn')!
const $zoomOutBtn = document.querySelector<HTMLButtonElement>('.zoom-out-btn')!

export function initZoom(map: L.Map){

    function updateButtons(){
        const zoom = map.getZoom()
        $zoomInBtn.disabled = zoom === map.getMaxZoom()
        $zoomOutBtn.disabled = zoom === map.getMinZoom()
    }

    $zoomInBtn.addEventListener('click', ()=>map.zoomIn())
    $zoomOutBtn.addEventListener('click', ()=>map.zoomOut())

    map.on('zoomend', ()=>updateButtons())
    updateButtons()

}