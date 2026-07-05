
interface Config {
    coords: [number, number],
    zoom: number,
    isSatellite: boolean,
    labelsVisible: boolean
}

export const DEFAULT_CONFIG: Config = {
    coords: [38.74, -9.15],
    zoom: 13,
    isSatellite: false,
    labelsVisible: true
}

let config: Config = (()=>{
    try{
        const data = localStorage.getItem('config')
        return data ? JSON.parse(data) : DEFAULT_CONFIG
    }catch(e){
        console.warn(e)
        console.log('Failed to get config. Resetting to default...')
        return DEFAULT_CONFIG
    }
})()

export function getConfig<K extends keyof Config>(key: K){
    return config[key]
}

export function setConfig<K extends keyof Config>(key: K, value: Config[K]){
    config[key] = value
    localStorage.setItem('config', JSON.stringify(config))
}