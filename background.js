chrome.runtime.onStartup.addListener(init)
chrome.runtime.onInstalled.addListener(load_bookmarks)

chrome.bookmarks.onChanged.addListener(load_bookmarks)
chrome.bookmarks.onChildrenReordered.addListener(load_bookmarks)
chrome.bookmarks.onCreated.addListener(load_bookmarks)
chrome.bookmarks.onImportEnded.addListener(load_bookmarks)
chrome.bookmarks.onMoved.addListener(load_bookmarks)
chrome.bookmarks.onRemoved.addListener(load_bookmarks)

chrome.commands.onCommand.addListener(open_bookmarks)
chrome.runtime.onMessage.addListener(listener)

function init () {
   config()
}

async function load_bookmarks () {
    let alt = new Array(10)
    let bookmarks_promise = get_promise('bookmarks')
    for (let i in await bookmarks_promise) {
        alt[i] = analyze_url((await bookmarks_promise)[i].url)
    }
    chrome.storage.local.set({alt : alt})
}

function config () {
    
}

async function open_bookmarks (command) {
    let alt_promise = get_promise('alt')
    console.await
    let re = /(\w+)_(\d)/
    let [_, key, index] = command.match(re)
    if (key == 'alt') {
        chrome.tabs.create({url: (await alt_promise)[index].href})
    }
    
}

function listener (message) {
    
}

function get_promise (key) {
    return new Promise((resolve, reject) => {
        if (key == 'bookmarks') {
            chrome.bookmarks.getChildren('1', (bookmarks) => {resolve(bookmarks)})
        }
        if (key = 'alt') {
            chrome.storage.local.get(['alt'], (storage) => {resolve(storage.alt)})
        }
        else reject()
    })
}

function analyze_url (url_string) {
    let url_object = new URL(url_string)
    return {
        href : url_object.href,
        host : url_object.hostname,
        path : url_object.pathname,
        search : url_object.search,
        hash : url_object.hash
    }
}