const errorCodes: {[key: string]: {header?: string, content?: string}} = {
    'WEBGL_NOT_AVAILABLE': {
        content: '<p>Applikationen kræver <a href="https://caniuse.com/#feat=webgl">WebGL support</a>.</p><p>Tjek venligst du benytter en understøttet browser/enhed og <a href="https://get.webgl.org/">WebGL er aktiveret</a>.</p>'
    }
}

export const errorCodesProxy = new Proxy(errorCodes, {
    get: (item, property, itemProxy) => {
        return item[property as string]?item[property as string]:{header:'Uknown error'};
    }
})