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
            "threshold" : compressor.threshold.defaultValue,
            "knee" : compressor.knee.defaultValue,
            "ratio" : compressor.ratio.defaultValue,
            "release" : compressor.release.defaultValue
        }
    }})
}

async function loadBookmarks () {
    let alt = new Array(10)
    let bookmarks = await getPromise('bookmarks')
    for (let i in bookmarks) {
        alt[i] = analyzeUrl(bookmarks[i].url)
    }
    chrome.storage.local.set({alt : alt})
}

async function openBookmarks (command) {
    let alt_promise = getPromise('alt')
    let re = /(\w+)_(\d)/
    let [_, key, index] = command.match(re)
    if (key == 'alt') {
        createTab((await alt_promise)[index].href)
    }
}

function createTab (url) {
    chrome.tabs.create({url: url})
}

async function listener (message, sender, respond) {
    if (message.to == 'background') {
        if (message.from == 'content')
            if (message.content == 'values')
        respond(await getValues(message.content))
    } 
}

async function getValues (url) {
    let values
    let config = await getPromise('config')
    console.log(config)
    let host = config[url.host]
    if (!host) values = config.defaultValues
    else {
        let path = host[url.path]
        if (!path) values = host.values
        else {
            let search = path[url.search]
            if (!search) values = path.values
            else {
                values = search.valuses
            }
        }
    }
    return values
}

function getPromise (key) {
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