class MsgEvent extends Event {
	constructor (type, msg, from = undefined, to = undefined) {
		super(type)
		this.msg = msg
		this.to = to
	}
}
class AudioEvent extends Event {
	constructor (type, name, status) {
		super(type)
		this.name = name
		this.status = status
	}
}

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
	dispatch (type, msg) {
		this.e.dispatchEvent(new MsgEvent(type, msg))
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
class AudioControler {
	context = new AudioContext()
	e = document.createElement('div')
	
	constructor (name, level) {
		this.name = name
		this.level = level
		this.e.addEventListener('AudioControl', this.mainh.bind(this))
		//this.c.e.addEventListener('send', function (e) {
		//	console.log(e)
		//	if(e.msg == 'source') {
		//		this.getSource()
		//	}
		//}.bind(this))
	}

	mainh (e) {
		if (e.name == 'source') {
			if (e.status == 'ready') this.test()
		}
	}
	getSource () {
		if (this.level === 1) {
			let elem = document.getElementsByTagName('video')||document.getElementsByTagName('audio')
			console.log(elem)
			if (elem[0].buffered.length > 0) {
				this.source = this.context.createMediaElementSource(elem[0])
				this.e.dispatchEvent(new AudioEvent('AudioControl', 'source', 'ready'))
			}
			else {
				this.source = undefined
			}
		}
		else if (this.level === 0) {
			chrome.tabCapture.capture({audio : true}, function (stream) {
				console.log(stream)
				this.source = this.context.createMediaStreamSource(stream)
				this.e.dispatchEvent(new AudioEvent('AudioControl', 'source', 'ready'))
			}.bind(this))
		}
	}
	//initiate this.compressor
	getComp () {
	}
	//initiate this.gain
	getGain () {
	}
	//set this.comp to values
	applyCompValues (values) {
	}
	//set this.gain to value
	applyGainValue (value) {
	}
	//connect source to destination
	connect (
	)
	test () {
		this.source.connect(this.context.destination)
	}
}
class StorageControler {
	e = document.createElement('div')

	constructor () {

	}
	//return obj
	createNewData (url) {

	}
	getUrl (id) {

	}
	getCompValues (id) {
	}
	getGainValue (id) {
	}
	setCompValues (id, values) {
	}
	setGainValue (id, value) {
	}
	//return whole url structure
	getTree () {
	}
	newLeaf (url) {

	}
	save () {

	}
	removeLeaf (url) {

	}
	//dump to idPool
	removeId (id) {

	}

}
class ContentWatcher {
	e = document.createElement('div')
	//addEventListener to proper events
	start () {
	}
	//detach those
	stop () {
	}
}
class UrlCreator {
	static get jsonify () {
		return {
			host : "default"
		}
	}
	constructor (str) {
		this.url = new URL(str)
	}
	get jsonify () {
		return {
			host : this.url.hostname,
			path : this.url.pathname,
			search : this.url.search
		}
	}
}