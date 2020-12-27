chrome.runtime.onStartup.addListener(init)
chrome.runtime.onInstalled.addListener(loadBookmarks)

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
}
function config () {
    chrome.storage.local.set({audio : {
        defaultValues : {
            "threshold": -24,
            "knee": 30,
            "ratio": 12,
            "release": 0.25,
            "reduction": 0
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
                    if (url.range == 0) {
                        audio[url.host].values = values
                        chrome.storage.local.set({audio: audio}, () => 0)
                        continue
                    }
                    else {
                        if (!audio[url.host][url.path]) audio[url.host][url.path] = {}
                        if (url.range == 1) {
                            audio[url.host][url.path].values = values
                            chrome.storage.local.set({audio: audio}, () => 0)
                            continue
                        }
                        else {
                            console.log(audio)
                            if (!audio[url.host][url.path][url.search]) audio[url.host][url.path][url.search] = {}
                            audio[url.host][url.path][url.search].values = values
                            chrome.storage.local.set({audio: audio}, () => 0)
                            continue
                        }
                    }
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
    let values
    let range = -1
    let host = audio[url.host]
    if (!host) {
        values = audio.defaultValues
        values.range = range
    }
    else {
        range += 1
        let path = host[url.path]
        if (!path) {
            values = host.values
            values.range = range
        }
        else {
            range += 1
            let search = path[url.search]
            if (!search) {
                values = path.values
                values.range = range
            }
            else {
                range += 1
                values = search.values
                values.range = range
            }
        }
    }
    return values
}

init()