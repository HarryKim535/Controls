chrome.runtime.onMessage.addListener(listener)

window.onload = async function () {

    let display = document.getElementById('display')
    display.innerHTML = '<h2>Loading...</h2>'
    
    chrome.tabs.sendMessage(await getTabID(), {to: 'content', from: 'popup', content: 'popup loaded'}, (response) => {
        if (response == 'no audio') {
            display.innerHTML = '<h2>Got Message</h2>'
        }
    })
}

function listener (message) {
    if (message.to == 'popup') {

    }
}

function getTabID () {
    return new Promise((resolve) => {chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {resolve(tabs[0].id)})})
}