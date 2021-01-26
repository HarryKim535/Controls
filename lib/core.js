class Connector {
	runtime = chrome.runtime
	isActive = false

	constructor (name) {
		this.name = name
	}
	standby() {
		this.runtime.onConnect.addListener(this.#check)
	}
	connect () {
		this.port = this.runtime.connect({name: this.name})
		this.port.onMessage.addListener(this.#get)
		this.port.onDisconnect.addListener(this.#clear)
		this.isActive = true
	}
	post (msg) {
		this.port.postMessage(msg)
	}
	disconnect () {
		this.isActive = false
		this.port.disconnect()
	}
	
	#get (msg) {
		console.log(msg)
	}
	#check (port) {
		port.name == this.name ? ( this.isActive = true, this.port = port, this.post(true) ) : port.disconnect()
	}
	#clear () {
		this.isActive = false
	}
}