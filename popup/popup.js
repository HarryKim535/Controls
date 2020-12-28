let currentUrl
let currentValues
let originalValues = {}
let sliders = {all: ['threshold', 'knee', 'ratio', 'gain', 'release', 'range'], oncanvas: ['threshold', 'knee', 'ratio', 'gain'], onside: ['release'], ontitle: ['url']}

function draw (canvas, values) {
	let context = canvas.getContext('2d')
	let span = canvas.width/140
	let ratio = canvas.height/canvas.width
	let slope = -ratio/values.ratio
	let origin = {x: canvas.width*(6/7), y: canvas.height*(1/7) - 15*values.gain*span}
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

function apply(values) {
	send('content', 'apply', values)
}

function save() {
	send('background', 'save', {url: currentUrl, values: currentValues})
}

function connect (target) {
	target.nextElementSibling.innerHTML = target.value
	target.nextElementSibling.style.left = 100*(target.value-target.min)/(target.max-target.min) + '%'
}

function setUrl (range) {
	let url = currentUrl.host
	let title = document.querySelector('.title')
	if (range > 0) {
		url += currentUrl.path
	}
	if (range > 1) {
		url += currentUrl.search
	}
	title.innerHTML = url
}

function listener (message) {
	console.log(message)
	if (message.to == 'popup') {
		if (message.from == 'content') {
			if (message.type == 'url') {
				if (message.content === null) {
					document.querySelector('.title').innerHTML = 'No Audio'
				}
				else {
					currentUrl = message.content
					let title = document.querySelector('.title')
					let slider = document.querySelector('#range-container')
					title.innerHTML = currentUrl.host
					slider.style.display = 'block'
					send('background', 'values', currentUrl)
				}
			}
			else if (message.type == 'notification') {
				if (message.content = 'window loaded') {
					send('content', 'notification', 'popup loaded')
				}
			}
		}
		else if (message.from == 'background') {
			if (message.type == 'values') {
				currentValues = message.content
				Object.assign(originalValues, currentUrl)
				setUrl(currentValues.range)
				for (let item of sliders.all) document.querySelector('#' + item).value = currentValues[item]
				for (let element of document.querySelectorAll('.onaudio')) element.style.display = 'inline'
				
				let canvas = document.querySelector('#plot')
				draw(canvas, currentValues)
			}
		}
	}
}

function send (to, type, content) {
	if (to == 'content') {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, {to: to, from: 'popup', type: type, content: content})
		})
	}
	else {
		chrome.runtime.sendMessage({to: to, from: 'popup', type: type, content: content})
	}
}


window.onload = () => {
	chrome.runtime.onMessage.addListener(listener)
	for (let item of sliders.oncanvas) {
		let slider = document.querySelector('#' + item)
		slider.onfocus = ({target}) => {
			connect(target)
		}
		slider.oninput = ({target}) => {
			connect(target)
			currentValues[target.id] = target.valueAsNumber
			apply({[target.id]: target.valueAsNumber})
			save()
			update(target.id, target.valueAsNumber)
		}
		slider.onchange = () => {
			for (let element of document.querySelectorAll('.onchange')) element.style.display = 'block'
		}
	}
	for (let item of sliders.onside) {
		let slider = document.querySelector('#' + item)
		slider.oninput = slider.onfocus = ({target}) => {
			console.log(target.valueAsNumber)
			connect(target)
			currentValues[target.id] = target.valueAsNumber
			apply({[target.id]: target.valueAsNumber})
			save()
		}
		slider.onchange = () => {
			for (let element of document.querySelectorAll('.onchange')) element.style.display = 'block'
		}
	}
	document.querySelector('#range').oninput = ({target}) => {
		setUrl(target.valueAsNumber)
	}
	document.querySelector('#discard').onclick = () => {
		console.log(originalValues)
		apply(originalValues)
		for (item of sliders.all) {
			if (originalValues[item] != currentValues[item]) {
				update(item, originalValues[item])
				document.querySelector('#' + item).value = originalValues[item]
			}
		}
		save()
	}
	document.querySelector('#reload').onclick = () => {
		send('background', 'reload', 'reload')
	}
	let  title = document.querySelector('.title')
	title.innerHTML = 'Loading'
	send('content', 'notification', 'popup loaded')
}