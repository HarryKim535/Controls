let audioContext
let compressor
let gain
let source

function setup () {
	audioContext = new AudioContext()
	compressor = audioContext.createDynamicsCompressor()
	gain = audioContext.createGain()
	source = audioContext.createMediaElementSource(getAudio())
	source.connect(compressor)
	compressor.connect(gain)
	gain.connect(audioContext.destination)
}

function getAudio () {
	let audio = document.querySelector('video')
	if (!audio) audio = document.querySelector('audio')
	return audio
}

function setCompressor (values) {
	for (let item in values) {
		console.log(item, values[item])
		if (item == 'gain') gain.gain.exponentialRampToValueAtTime(2**values[item], audioContext.currentTime + 0.2)
		else compressor[item].linearRampToValueAtTime(values[item], audioContext.currentTime + 0.2)
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
						if (!audioContext) setup()
						send('popup', 'url', getUrl())
					}
				}
			}
			else if (message.type == 'apply') {
				delete message.content.range
				setCompressor(message.content)
			}
		}
		else if (message.from == 'background') {
			if (message.type == 'values') {
				delete message.content.range
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
		setup()
		send('background', 'values', getUrl())
	}
}
