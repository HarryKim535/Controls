function getCompressor (values, audioContext) {
    let compressor = audioContext.createDynamicsCompressor()
    compressor.threshold.linearRampToValueAtTime(values.threshold, audioContext.currentTime + .5)
    compressor.knee.linearRampToValueAtTime(values.knee, audioContext.currentTime + .5)
    compressor.ratio.linearRampToValueAtTime(values.ratio, audioContext.currentTime + .5)
    compressor.release.linearRampToValueAtTime(values.release, audioContext.currentTime + .5)
    return compressor
}

function loadValues () {
    
}

function listener (message) {
    if (message.to == 'content') {
        if (message.from == 'popup') {
            if (message.type == 'audio?') {
                if (getAudio() === null) {
                    chrome.runtime.sendMessage({to: 'popup', from: 'content', type: 'url', content: null})
                }
                else {
                    chrome.runtime.sendMessage({to: 'popup', from: 'content', type: 'url', content: location.href})
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

window.onload = function () {
    let audio = getAudio()
    if (!audio) {
        return
    }
    else {
        chrome.runtime.sendMessage({to: 'background', from: 'content', type: 'values', content: location.href}, values => {
            let audioContext = new AudioContext()
            let source = audioContext.createMediaElementSource(audio)
            let compressor = getCompressor(values, audioContext)
            toggleCompressor(source, compressor, audioContext.destination)
        })
    }
}
