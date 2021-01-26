function test () {
	var c = new Connector('test')
	c.standby()
	var d = new Connector('test')
	d.standby()
}

chrome.management.getSelf(({id}) => {
	chrome.storage.local.set({ExtensionId: id})
})

chrome.runtime.onInstalled.addListener(init)

chrome.bookmarks.onChanged.addListener(loadBookmarks)
chrome.bookmarks.onChildrenReordered.addListener(loadBookmarks)
chrome.bookmarks.onCreated.addListener(loadBookmarks)
chrome.bookmarks.onImportEnded.addListener(loadBookmarks)
chrome.bookmarks.onMoved.addListener(loadBookmarks)
chrome.bookmarks.onRemoved.addListener(loadBookmarks)

chrome.commands.onCommand.addListener(openBookmarks)
chrome.runtime.onMessage.addListener(listener)

function init () {
	config()
	loadBookmarks()
	test()
}
function config () {
	chrome.storage.local.set({audio : {
		themes: {
			Default : {
				"threshold": -24,
				"knee": 30,
				"ratio": 12,
				"release": 0.25,
				"gain": 0,
				"range": 0
			}
		}
	}})
}

async function loadBookmarks () {
	chrome.bookmarks.getChildren('1', bookmarks => {
		let alt = new Array(10)
		for (let i in bookmarks) {
			alt[i] = bookmarks[i].url
		}
		chrome.storage.local.set({alt : alt})
	})
}

function openBookmarks (command) {
	chrome.storage.local.get(['alt'], ({alt}) => {
		let re = /(\w+)_(\d)/
		let [_, key, index] = command.match(re)
		if (key == 'alt') {
			chrome.tabs.create({url: alt[index]})
		}
	})
}

function listener (message) {
	console.log(message)
	if (message.to == 'background') {
		if (message.from == 'content') {
			if (message.type == 'values') {
				chrome.storage.local.get(['audio'], ({audio}) => {
					send('content', 'values', getValues(audio, message.content))
				})
			}
		}
		else if (message.from == 'popup') {
			if (message.type == 'values') {
				chrome.storage.local.get(['audio'], ({audio}) => {
					send('popup', 'values', getValues(audio, message.content))
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
					send('popup', 'themes', Object.keys(audio.themes))
				})
			}
			else if (message.type == 'theme values') {
				chrome.storage.local.get(['audio'], ({audio}) => {
					console.log(audio.themes[message.content])
					send('popup', 'theme values', audio.themes[message.content])
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

function send (to, type, content) {
	if (to == 'content') {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, {to: to, from: 'background', type: type, content: content})
		})
	}
	else {
		chrome.runtime.sendMessage({to: to, from: 'background', type: type, content: content})
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