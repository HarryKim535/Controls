function test () {
	var a = new AudioControl('test', 0)
}

chrome.management.getSelf(({id}) => {
	chrome.storage.local.set({ExtensionId: id})
})

chrome.runtime.onInstalled.addListener(init)
//chrome.runtime.onMessage.addListener(listener)

function init () {
	config()
	loadBookmarks()
	test()
}
function config () {
	chrome.storage.local.set({data : {
		0 : {
			url : UrlCreator.jsonify,
			urlRange : 0,
			compValues : {
				"threshold": -24,
				"knee": 30,
				"ratio": 12,
				"release": 0.25,
			},
			gainValue : {
				"gain": 0
			},
		}
	}})
}

function listener (message) {
	console.log(message)
	if (message.to == 'background') {
		if (message.from == 'content') {
			if (message.type == 'values') {
				chrome.storage.local.get(['audio'], ({audio}) => {
					//send('content', 'values', getValues(audio, message.content))
				})
			}
		}
		else if (message.from == 'popup') {
			if (message.type == 'values') {
				chrome.storage.local.get(['audio'], ({audio}) => {
					//send('popup', 'values', getValues(audio, message.content))
				})
			}
			else if (message.type == 'save') {
				chrome.storage.local.get(['audio'], ({audio}) => {
					let url = message.content.url
					let values = message.content.values
					if (!audio[url.host]) audio[url.host] = {}
					if (values.range == 0) {
						audio[url.host]['values'] = values
						console.log(audio)
						chrome.storage.local.set({audio: audio})
						return
					}
					else {
						if (!audio[url.host][url.path]) audio[url.host][url.path] = {}
						if (values.range == 1) {
							audio[url.host][url.path]['values'] = values
							console.log(audio)
							chrome.storage.local.set({audio: audio})
							return
						}
						else {
							if (!audio[url.host][url.path][url.search]) audio[url.host][url.path][url.search] = {}
							audio[url.host][url.path][url.search]['values'] = values
							console.log(audio)
							chrome.storage.local.set({audio: audio})
							return
						}
					}
				})
			}
			else if (message.type == 'themes') {
				chrome.storage.local.get(['audio'], ({audio}) => {
					//send('popup', 'themes', Object.keys(audio.themes))
				})
			}
			else if (message.type == 'theme values') {
				chrome.storage.local.get(['audio'], ({audio}) => {
					console.log(audio.themes[message.content])
					//send('popup', 'theme values', audio.themes[message.content])
				})
			}
			else if (message.type == 'save theme') {
				chrome.storage.local.get(['audio'], ({audio}) => {
					audio.themes[message.content.name] = message.content.values
					console.log(audio)
					chrome.storage.local.set({audio: audio})
				})
			}
		}
	}
}
function getValues (audio, url) {
	let host = audio[url.host]
	if (host) {
		let path = host[url.path]
		if (path) {
			let search = path[url.search]
			if (search) {
				return search.values
			}
			else {
				return path.values
			}
		}
		else {
			return host.values
		}
	}
	else {
		return audio.themes.Default
	}
}