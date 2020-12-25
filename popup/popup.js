function request (to, type, content) {
    return new Promise((resolve, reject) => {
        if (to == 'content') {
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                chrome.tabs.sendMessage(tabs[0].id, {to: to, from: 'popup', type: type, cotent: content}, response => {resolve(response)})
            })
        }
    })
}

window.onload = async function () {

    let display = document.getElementById('display')
    display.innerHTML = '<h2>Loading...</h2>'
    
    let response = await request('content', 'setup', 'popup loaded')
    if (response == 'no audio') {
        display.innerHTML = '<h2>Got Message</h2>'
    }
}