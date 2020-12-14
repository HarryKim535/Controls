chrome.runtime.onStartup.addListener(init)

chrome.runtime.onInstalled.addListener(load_bookmarks)
chrome.bookmarks.onChanged.addListener(load_bookmarks)
chrome.bookmarks.onChildrenReordered.addListener(load_bookmarks)
chrome.bookmarks.onCreated.addListener(load_bookmarks)
chrome.bookmarks.onImportEnded.addListener(load_bookmarks)
chrome.bookmarks.onMoved.addListener(load_bookmarks)
chrome.bookmarks.onRemoved.addListener(load_bookmarks)

chrome.runtime.onMessage.addListener(listener)
chrome.commands.onCommand.addListener(listener)

function init () {
    var bookmarks_bar_structure = []
    for (let i = 0; i < 10; i++) {
        bookmarks_bar_structure.push({url : undefined, config : undefined})
    }
    chrome.storage.set({
        bookmarks_bar : bookmarks_bar_structure
    })
    load_bookmarks()
}

function load_bookmarks () {
    chrome.storage.local.get(['bookmarks_bar'], (storage) => {
        chrome.bookmarks.getChildren('1', (bookmarks) => {
            for (let i in bookmarks) {
                storage.bookmarks_bar[i].url = class_to_string(new URL(bookmarks[i].url))
            }
            chrome.storage.local.set({bookmarks_bar : storage.bookmarks_bar})
            console.log(storage.bookmarks_bar)
        })
    })
}

function class_to_string (url_class) {
    return {
        href : url_class.href,
        host : url_class.hostname,
        path : url_class.pathname,
        search : url_class.search,
        hash : url_class.hash
    }
}

function listener (message) {

}

function open_url (url) {

}