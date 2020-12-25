function request (to, type, content) {
    return new Promise((resolve, reject) => {
        if (to == 'content') {
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                chrome.tabs.sendMessage(tabs[0].id, {to: to, from: 'popup', type: type, cotent: content}, response => {resolve(response)})
            })
        }
        else if (to == 'background') {
            chrome.runtime.sendMessage({to: to, from: 'popup', type: type, content: content}, response => {resolve(response)})
        }
        else reject()
    })
}

window.onload = async function () {
    let display = document.getElementById('display')
    let title = document.createElement('h2')
    display.append(title)

    title.innerText = 'Loading'
    
    try{
        let response = await request('content', 'audio?', 'popup loaded')
        if (response == null) {
            title.innerText = 'No Audio'
        }
        else {
            let values = await request('background', 'values', response)
            console.log(values)
        }
    }
    catch (error) {
        title.innerText = 'error: ' + error 
    }
}