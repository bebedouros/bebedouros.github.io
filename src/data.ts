import L from 'leaflet'
import { openModal } from './modal'

interface APIResponse {
    // there are more properties returned
    // but we're only documenting the useful ones
    features: {
        attributes: {
            MORADA: string,
            DESIGNACAO: string,
            MOBILIDADE_REDUZIDA: 'SIM' | 'NÃO' | null
        },
        geometry: {
            x: number
            y: number
        }
    }[]
}

const $detailsModal = document.querySelector<HTMLDivElement>('.details.modal')!
const $title = $detailsModal.querySelector<HTMLSpanElement>('.title')!
const $address = $detailsModal.querySelector<HTMLDivElement>('.address div')!
const $reducedMobility = $detailsModal.querySelector<HTMLDivElement>('.reduced-mobility')!
const $noReducedMobility = $detailsModal.querySelector<HTMLDivElement>('.no-reduced-mobility')!
const $coordinates = $detailsModal.querySelector<HTMLDivElement>('.coordinates')!

const $googleMaps = $detailsModal.querySelector<HTMLAnchorElement>('a.google-maps')!
const $appleMaps = $detailsModal.querySelector<HTMLAnchorElement>('a.apple-maps')!
const $bingMaps = $detailsModal.querySelector<HTMLAnchorElement>('a.bing-maps')!
const $openStreetMap = $detailsModal.querySelector<HTMLAnchorElement>('a.openstreetmap')!

const $errorModal = document.querySelector<HTMLDivElement>('.error.modal')!

const icon = L.icon({
    iconUrl: 'icon.svg',
    iconSize: [ 32, 32 ],
    className: 'feature'
})

export async function initData(map: L.Map){

    try{
        
        const res = await fetch(`https://services.arcgis.com/1dSrzEWVQn5kHHyK/arcgis/rest/services/Ambiente_DMEVAE/FeatureServer/1/query?${q({
            where: 'TIPOLOGIA = \'BEBEDOURO\'',
            outFields: 'MORADA,DESIGNACAO,MOBILIDADE_REDUZIDA',
            outSR: '4326',
            f: 'json'
        })}`)
    
        const data: APIResponse = await res.json()
    
        for(const feature of data.features){
    
            L.marker([ feature.geometry.y, feature.geometry.x ], { icon })
                .addTo(map)
                .on('click', ()=>{

                    const coords: [number, number] = [
                        feature.geometry.y,
                        feature.geometry.x
                    ]

                    const lastPos = map.getCenter()
                    const lastZoom = map.getZoom()
                    
                    map.flyTo(coords, map.getMaxZoom(), { duration: 1 })

                    const title = feature.attributes.DESIGNACAO
                    $title.textContent = title
                    $address.textContent = feature.attributes.MORADA

                    toggle($reducedMobility, feature.attributes.MOBILIDADE_REDUZIDA === 'SIM')
                    toggle($noReducedMobility, feature.attributes.MOBILIDADE_REDUZIDA === 'NÃO')

                    $coordinates.textContent = toDMS(coords)

                    $googleMaps.href = `https://www.google.com/maps?q=${coords}`
                    $appleMaps.href = `https://maps.apple.com/place?q=${coords}&ll=${coords}`
                    $bingMaps.href = `https://www.bing.com/maps/search?q=${coords}`
                    $openStreetMap.href = `https://www.openstreetmap.org/?mlat=${coords[0]}&mlon=${coords[1]}`

                    openModal($detailsModal, ()=>map.flyTo(lastPos, lastZoom, { duration: 1 }))
                })
    
        }
    
    }catch(e){
        console.error(e)
        openModal($errorModal)
    }

}

function q(params: Record<string, string>) {
    return new URLSearchParams(params).toString()
}

function toggle($div: HTMLDivElement, state: boolean){
    if(state) $div.style.removeProperty('display')
    else $div.style.display = 'none'
}

function toDMS(coords: [number, number]){

    let res = ''

    for(let [i, val] of coords.entries()){
        if(i > 1) throw new Error('Invalid coordinates.')

        const abs = Math.abs(val)
        const degrees = Math.floor(abs)
        const minsNotTruncated = (abs - degrees) * 60
        const mins = Math.floor(minsNotTruncated)
        const secs = ((minsNotTruncated - mins) * 60).toFixed(1)

        res += `${degrees}°${mins}'${secs}"${i == 0
            ? (val >= 0 ? 'N' : 'S') 
            : (val >= 0 ? 'E' : 'W')
        } `

    }
    
    return res.trim()
}