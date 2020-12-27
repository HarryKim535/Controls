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
    let compressor = new AudioContext().createDynamicsCompressor()
    config(compressor)
}

function config (compressor) {
    chrome.storage.local.set({config : {
        defaultValues : {
            "threshold": compressor.threshold.defaultValue,
            "knee": compressor.knee.defaultValue,
            "ratio": compressor.ratio.defaultValue,
            "release": compressor.release.defaultValue,
            "reduction": compressor.reduction.defaultValue
        }
    }})
}

async function loadBookmarks () {
    chrome.bookmarks.getChildren('1', bookmarks => {
        let alt = new Array(10)
        for (let i in bookmarks) {
            alt[i] = analyzeUrl(bookmarks[i].url)
        }
        chrome.storage.local.set({alt : alt})
    })
}

function openBookmarks (command) {
    chrome.storage.local.get(['alt'], ({alt}) => {
        let re = /(\w+)_(\d)/
        let [_, key, index] = command.match(re)
        if (key == 'alt') {
            chrome.tabs.create({url: alt[index].href})
        }
    })
}

function listener (message) {
    if (message.to == 'background') {
        if (message.from == 'content') {
            if (message.type == 'values') {
                chrome.storage.get(['config'], ({config}) => {
                    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                        chrome.tabs.sendMessage(tabs[0].id, {to: 'content', from: 'background', type: 'values', cotent: getValues(config, analyzeUrl(message.content))})
                    })
                })
            }
        }
        else if (message.from == 'popup') {
            if (message.type == 'values') {
                chrome.storage.get(['config'], ({config}) => {
                    chrome.runtime.sendMessage({to: 'popup', from: 'background', type: 'values', content: getValues(config, analyzeUrl(message.content))})
                })
            }
        }
    }
    return true
}

function getValues (config, url) {
    let values
    let host = config[url.host]
    if (host == undefined) values = config.defaultValues
    else {
        let path = host[url.path]
        if (path == undefined) values = host.values
        else {
            let search = path[url.search]
            if (search == undefined) values = path.values
            else {
                values = search.values
            }
        }
    }
    return values
}

function getStorage (key) {
    return new Promise((resolve, reject) => {
        if (key == 'bookmarks') {
            chrome.bookmarks.getChildren('1', bookmarks => {resolve(bookmarks)})
        }
        else if (key == 'alt') {
            chrome.storage.local.get(['alt'], ({alt}) => {resolve(alt)})
        }
        else if (key == 'config') {
            chrome.storage.local.get(['config'], ({config}) => {resolve(config)})
        }
        else reject()
    })
}

function analyzeUrl (url_string) {
    try {
        var url_object = new URL(url_string)
    }
    catch {
        return null
    }
    return {
        href : url_object.href,
        host : url_object.hostname,
        path : url_object.pathname,
        search : url_object.search
    }
}

function test () {
    init()
}

test()