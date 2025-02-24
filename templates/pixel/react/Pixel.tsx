import { canUseDOM } from 'vtex.render-runtime'

export async function handleEvents(e: PixelMessage | MessageEvent) {
    console.log("Handling events from <% appName %> pixel!", e.data.eventName, e.data);
}

if (canUseDOM) {
    window.addEventListener('message', handleEvents)
}
