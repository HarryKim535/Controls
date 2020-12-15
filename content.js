window.onload = () => {
    let audio = document.querySelector('video')
    if (audio === null) {
        audio = document.querySelector('audio')
        if (audio === null) return
    }
    let audio_context = new AudioContext()
    var source = audio_context.createMediaElementSource(audio)
    let compressor = audio_context.createDynamicsCompressor()
    
    compressor.ratio.setValueAtTime(1, audio_context.currentTime)
    source.connect(compressor)
    compressor.connect(audio_context.destination)
    console.log('set')
}
