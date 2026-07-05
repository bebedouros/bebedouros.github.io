
const $modals = document.querySelectorAll<HTMLDivElement>('.modal')

const lastScrollMap = new Map<HTMLDivElement, number>()

for(const $modal of $modals){

    // reset scroll
    $modal.scroll(0, 0)
    lastScrollMap.set($modal, 0)

    $modal.addEventListener('scroll', onScroll)

    // close by clicking outside
    $modal.addEventListener('click', ()=>closeModal($modal))
    $modal.querySelector<HTMLDivElement>('.container')!.addEventListener('click', e=>e.stopPropagation())
    $modal.querySelector<HTMLDivElement>('.close-btn')!.addEventListener('click', ()=>closeModal($modal))

}

function onScroll(this: HTMLDivElement){

    const currScroll = this.scrollTop
    const lastScroll = lastScrollMap.get(this)!

    if(
        !this.classList.contains('off') && // is open
        currScroll < innerHeight * .5 && // close to top
        currScroll < lastScroll // scrolling up
    ) closeModal(this)

    lastScrollMap.set(this, currScroll)

}

type CloseEvent = () => any

const closeEvents = new Map<HTMLDivElement, CloseEvent>()

export function openModal($modal: HTMLDivElement, closeEvent?: CloseEvent){

    $modal.classList.remove('off')
    
    $modal.scroll({
        top: $modal.scrollHeight,
        behavior: 'smooth'
    })

    if(closeEvent)
        closeEvents.set($modal, closeEvent)

}

function closeModal($modal: HTMLDivElement, scroll = true){

    $modal.classList.add('off')

    if(scroll) $modal.scroll({
        top: 0,
        behavior: 'smooth'
    })

    const closeEvent = closeEvents.get($modal)
    if(closeEvent){
        closeEvents.delete($modal)
        closeEvent()
    }

}