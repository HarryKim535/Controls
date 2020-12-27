let currentValues

function draw (canvas, values) {
    console.log(values)
    let context = canvas.getContext('2d')
    let origin = {x: canvas.width*(6/7), y: canvas.height*(1/7)}
    let ratio = canvas.height/canvas.width
    let slope = -ratio/values.ratio
    let span = canvas.width/140
    let kneeRange = {from: values.threshold - (values.knee/2), to: values.threshold + (values.knee/2)}
    let rKneeEnd = {x: kneeRange.to*span, y: slope*kneeRange.to*span}
    let rIntersect = {x: values.threshold*span, y: slope*values.threshold*span}
    let rKneeStart = {x: kneeRange.from*span, y: rIntersect.y + (ratio*(rIntersect.x-kneeRange.from*span))}
    
    context.clearRect(0, 0, canvas.width, canvas.height)

    let gap = canvas.height/14
    context.beginPath()
    for (let i = 0; i < 15; i++) {
        context.moveTo(gap*i, 0)
        context.lineTo(gap*i, canvas.height)
    }
    context.setLineDash([10, 10])
    context.strokeStyle = 'rgb(230, 230, 230)'
    context.stroke()

    context.lineWidth = 3
    context.translate(origin.x, origin.y)
    context.beginPath()
    context.moveTo(canvas.width/7, slope*canvas.width/7)
    context.lineTo(rKneeEnd.x, rKneeEnd.y)
    context.quadraticCurveTo(rIntersect.x, rIntersect.y, rKneeStart.x, rKneeStart.y)
    context.lineTo(-origin.x, ratio*(origin.x + rKneeStart.x + rKneeStart.y))
    context.setLineDash([])
    context.strokeStyle = 'black'
    context.stroke()
    
    context.translate(-origin.x, -origin.y)
    context.lineWidth = 2
    context.font = 'italic 10px sans-serif'
    context.textAlign = 'center'
    context.beginPath()
    for (let i = -3/5; i < 4; i++) {
        context.moveTo(gap*(5*i), canvas.height)
        context.lineTo(gap*(5*i), canvas.height - 10)
        context.fillText(50*i - 120, gap*(5*i), canvas.height - 15)
        for (let j = 1; j <= 4; j++) {
            context.moveTo(gap*(5*i + j), canvas.height)
            context.lineTo(gap*(5*i + j), canvas.height - 5)
        }
    }
    context.stroke()

    context.fillText('dB', gap*13, canvas.height - 15)
}

function update (type, value) {
    currentValues[type] = value
    draw(document.querySelector('canvas'), currentValues)
}

function connect (target) {
    target.nextElementSibling.innerHTML = target.value
    target.nextElementSibling.style.left = 100*(target.value-target.min)/(target.max-target.min) + '%'
}

window.onload = function () {
    let  title = document.querySelector('.title')
    title.innerHTML = 'Loading'
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {to: 'content', from: 'popup', type: 'audio?', cotent: 'popup loaded'}, response => {
            if (response === undefined) {
                title.innerHTML = 'Connection Denied'
            }
            else if (response === null) {
                title.innerHTML = 'No Audio'
            }
            else {
                chrome.runtime.sendMessage({to: 'background', from: 'popup', type: 'values', content: response}, values => {
                    title.innerHTML = JSON.stringify(values)
                    document.querySelector('.audio-on').style = 'display: flex'
                    let canvas = document.querySelector('#plot')
                    draw(canvas, values)
                    let oncanvas = ['threshold', 'knee', 'ratio', 'reduction']
                    for (let item of oncanvas) {
                        let slider = document.querySelector('#'+item)
                        slider.onfocus = ({target}) => {
                            connect(target)
                        }
                        slider.oninput = ({target}) => {
                            connect(target)
                            update(target.id, Number(target.value))
                        }
                    }
                    let slider = document.querySelector('#release')
                    slider.onfocus = slider.oninput = ({target}) => {
                        connect(target)
                        //apply(target.id, Number(target.value))
                    }
                })
            }
        })
    })
}