class Connector {
	isActive = false

	constructor (name) {
		this.name = name
	}

	standby () {
		chrome.runtime.onConnect.addListener(this.#accept.bind(this))
	}
	connect () {
		this.port = chrome.runtime.connect({name: this.name})
		this.#bind()
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
	
	#get (msg) {
		console.log(msg)
	}
	#accept (port) {
		if (port.name == this.name) {
			this.isActive = true
			this.port = port
			this.#bind()
			this.post(`${this.name} accepted`)
			console.log(`${this.name} connected`)
		} 
		else {
			port.postMessage(`${this.name} rejects ${port.name}`)
			port.disconnect()
			console.log(`${this.name} rejects ${port.name}`)
		}
	}
	#bind () {
		this.port.onMessage.addListener(this.#get.bind(this))
		this.port.onDisconnect.addListener(this.#clear.bind(this))
	}
	#clear () {
		this.isActive = false
		console.log(`${this.name} diconnection`)
	}
}