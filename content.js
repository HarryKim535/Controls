let audioContext = new AudioContext()
let compressor = audioContext.createDynamicsCompressor()
let source

function getAudio () {
    let audio = document.querySelector('video')
    if (!audio) audio = document.querySelector('audio')
    return audio
}

function setCompressor (values) {
    for (let i in values) {
        compressor[i].linearRampToValueAtTime(values[i], audioContext.currentTime + 0.2)
    }
}

function getUrl () {
    return {
        href : location.href,
        host : location.hostname,
        path : location.pathname,
        search : location.search
    }
}


function listener (message) {
    if (message.to == 'content') {
        if (message.from == 'popup') {
            if (message.type == 'notification') {
                if (message.content == 'popup loaded') {
                    if (getAudio() === null) {
                        send('popup', 'url', null)
                    }
                    else {
                        send('popup', 'url', getUrl())
                    }
                }
            }
            else if (message.type == 'apply') {
                setCompressor(message.content)
            }
        }
        else if (message.from == 'background') {
            if (message.type == 'values') {
                setCompressor(message.content)
            }
        }
    }
}

function send (to, type, content) {
    chrome.runtime.sendMessage({to: to, from: 'content', type: type, content: content})
}

window.onload = function () {
    chrome.runtime.onMessage.addListener(listener)
    send('popup', 'notification', 'window loaded')
    if (!getAudio()) {
        return
    }
    else {
        source = audioContext.createMediaElementSource(getAudio())
        source.connect(compressor)
        compressor.connect(audioContext.destination)
        send('background', 'values', getUrl())
    }
}
