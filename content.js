chrome.runtime.onMessage.addListener(listener)

function getCompressor (values, audioContext) {
    let compressor = audioContext.createDynamicsCompressor()
    compressor.threshold.linearRampToValueAtTime(values.threshold, audioContext.currentTime + .5)
    compressor.knee.linearRampToValueAtTime(values.knee, audioContext.currentTime + .5)
    compressor.ratio.linearRampToValueAtTime(values.ratio, audioContext.currentTime + .5)
    compressor.release.linearRampToValueAtTime(values.release, audioContext.currentTime + .5)
    return compressor
}

function getValues () {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({to: 'background', from: 'content', content: location.href}, (response) => {resolve(response)})
    })
}

function loadValues () {
    
}

async function listener (message, sender, respond) {
    if (message.to == 'content') {
        if (message.from == 'popup') {
            if (message.content == 'popup loaded') {
                let audio = getAudio()
                if (!audio) {
                    respond('no audio')
                }
                else respond(await getValues())
            }
        }
    }
}


function getAudio () {
    let audio = document.querySelector('video')
    if (!audio) audio = document.querySelector('audio')
    return audio
}

function toggleCompressor (source, compressor, destination) {
    //if on
    source.connect(compressor)
    compressor.connect(destination)
}

window.onload = async function () {
    let audio = getAudio()
    if (!audio) {
        return
    }
    let values = await getValues()
    console.log(values)
    let audioContext = new AudioContext()
    let source = audioContext.createMediaElementSource(audio)
    let compressor = getCompressor(values, audioContext)
    toggleCompressor(source, compressor, audioContext.destination)
    console.log('set')
}
