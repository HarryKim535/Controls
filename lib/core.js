class Connector {
	isActive = false
	e = document.createElement('div')
	constructor (name, toRuntime = true) {
		this.name = name
		if (typeof toRuntime == 'boolean') this.toRuntime = toRuntime
		else throw new TypeError('runtime parameter has to be boolean')
		
	}

	standby () {
		chrome.runtime.onConnect.addListener(this.accept.bind(this))
		chrome.runtime.onMessage.addListener(this.getSend.bind(this))
	}
	connect () {
		if (this.toRuntime === true) this.port = chrome.runtime.connect({name: this.name})
		else if (this.toRuntime === false) {
			chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
				this.port = chrome.tabs.connect(tabs[0].id, {name: this.name})
			}.bind(this))
		}
		this.bind()
		this.isActive = true
	}
	post (msg) {
		this.port.postMessage(msg)
	}
	disconnect () {
		this.isActive = false
		this.port.disconnect()
		console.log(`${this.name} disconnected`)
	}
	send (msg) {
		if (this.toRuntime === true) chrome.runtime.sendMessage(msg)
		else if (this.toRuntime === false) {
			chrome.tabs.query({active: true, currentWindow: true}, tabs => {
				chrome.tabs.sendMessage(tabs[0].id, msg)
			})
		}
	}
	dispatch (name, msg) {
		this.e.dispatchEvent(new Event(name, {msg: msg}))
	}
	getPost (msg) {
		this.dispatch('post', msg)
	}
	getSend (msg) {
		this.dispatch('send', msg)
	}
	accept (port) {
		if (port.name == this.name) {
			this.isActive = true
			this.port = port
			this.bind()
			this.post(`${this.name} accepted`)
			console.log(`${this.name} connection`)
		} 
		else {
			port.postMessage(`${this.name} rejects ${port.name}`)
			port.disconnect()
			console.log(`${this.name} rejects ${port.name}`)
		}
	}
	bind () {
		this.port.onMessage.addListener(this.getPost.bind(this))
		this.port.onDisconnect.addListener(this.clear.bind(this))
	}
	clear () {
		this.isActive = false
		console.log(`${this.name} diconnection`)
	}
}

//level enum : 0 background , 1 content , 2 popup
class AudioControl {
	context = new AudioContext()
	c = new Connector('test')
	
	constructor (name, level) {
		this.name = name
		this.level = level
		this.c.e.addEventListener('send', function (e) {
			console.log(e)
			if(e.msg == 'source') {
				this.getSource()
				this.connect()
			}
		}.bind(this))
		this.c.standby()
	}

	getSource () {
		if (this.level === 1) {
			let elem = document.getElementsByTagName('video')||document.getElementsByTagName('audio')
			if (elem == undefined) this.source = undefined
			else this.source = this.context.createMediaElementSource(elem[0])
		}
		else if (this.level === 0) {
			chrome.tabCapture.capture({audio : true}, function (stream) {
				this.source = this.context.createMediaStreamSource(stream)
			}.bind(this))
		}
	}
	connect () {
		this.source.connect(this.context.destination)
	}
}