function getCompressor (values, audioContext) {
    let compressor = audioContext.createDynamicsCompressor()
    compressor.threshold.linearRampToValueAtTime(values.threshold, audioContext.currentTime + .5)
    compressor.knee.linearRampToValueAtTime(values.knee, audioContext.currentTime + .5)
    compressor.ratio.linearRampToValueAtTime(values.ratio, audioContext.currentTime + .5)
    compressor.release.linearRampToValueAtTime(values.release, audioContext.currentTime + .5)
    return compressor
}

function request (to, type, content) {
    return new Promise((resolve) => {
        if (to == 'background') {
            chrome.runtime.sendMessage({to: to, from: 'content', type: type, content: content}, response => {console.log(response);resolve(response)})
        }
    })
}

function loadValues () {
    
}

async function listener (message, sender, respond) {
    if (message.to == 'content') {
        if (message.from == 'popup') {
            if (message.type == 'audio?') {
                if (getAudio() == null) {
                    respond(null)
                }
                else {
                    respond(location.href)
                }
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

chrome.runtime.onMessage.addListener(listener)

window.onload = async function () {
    let audio = getAudio()
    if (!audio) {
        return
    }
    let values = await request('background', 'values', document.URL)
    console.log(values)
    let audioContext = new AudioContext()
    let source = audioContext.createMediaElementSource(audio)
    let compressor = getCompressor(values, audioContext)
    toggleCompressor(source, compressor, audioContext.destination)
    console.log('set')
}
