var analyser, canvas, ctx, random = Math.random, circles = [];

used = false;

	//initialization of beatDetector
	/*var song = new stasilo.BeatDetector({
		sens: 4, 
		visualizerFFTSize: 256, 
		analyserFFTSize: 256, 
		passFreq: 600,
		url: 'assets/Devil_Trigger.mp3'});*/

window.onload = function() {
	
	var file = document.getElementById("thefile");
	var audio = document.getElementById("audio");
	
	file.onchange = function() {
	
	var files = this.files;
    
	canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 800;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    
    setupWebAudio(files);
    
    for (var i = 0; i < 20; i++) {
        circles[i] = new Circle();
        circles[i].draw();
    }
    draw();
	}
};

function setupWebAudio(files) {
    var audio = document.createElement('audio');
    //audio.src = 'assets/Devil_Trigger.mp3';
	audio.src = URL.createObjectURL(files[0]);
    audio.controls = 'true';
    document.body.appendChild(audio);
    audio.style.width = canvas.width + 'px';
    
    var audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
	
	analyser.fftSize = 256;
	
    var source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    audio.play();
}

function draw() {
	requestAnimationFrame(draw);
    var freqByteData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqByteData);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (var i = 0; i < circles.length; i++) {
        circles[i].radius = freqByteData[i] / 10;
        circles[i].y = circles[i].y > canvas.height ? 0 : circles[i].y + 1;
        circles[i].draw();
    }
    
    for (var i = 0; i < freqByteData.length; i += 1){
        ctx.fillStyle = 'rgb(' + getRandomColor() + ',' + getRandomColor() + ',' + getRandomColor() + ')';
		
		//from bottom to top
        /*ctx.fillRect(i + canvas.width / freqByteData.length / 20, canvas.height - freqByteData[i] * 1.5, canvas.width / freqByteData.length * 25, canvas.height);
        ctx.strokeRect(i + canvas.width / freqByteData.length / 20, canvas.height - freqByteData[i] * 1.5, canvas.width / freqByteData.length * 25, canvas.height);*/
		
		//from top to bottom
		ctx.fillRect(i * 20, 0, canvas.width / freqByteData.length * 2.5, freqByteData[i]);
        //ctx.strokeRect(i + 2, 0, canvas.width / freqByteData.length * 25, freqByteData[i]);
    }
	checkFreqHeight(freqAvg(freqByteData));	
}

function getRandomColor(){
    return random() * 255 >> 0;
}

function Circle() {
    this.x = random() * canvas.width;
    this.y = random() * canvas.height;
    this.radius = random() * 100 + 50;
    this.color = 'rgb(' + getRandomColor() + ',' + getRandomColor() + ',' + getRandomColor() + ')';    
}

Circle.prototype.draw = function() {
    var that = this;
    ctx.save();
    ctx.beginPath();
    ctx.globalAlpha = random() / 3 + 0.2;
    ctx.arc(that.x, that.y, that.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
}

function checkFreqHeight(freq) {
	if (freq > 75 && used == false) {
		used = true;
		var sound = new Audio('assets/sound.mp3');
		sound.play();
		ctx.fillStyle = "red";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	else if (freq < 75 && used == true) {
		used = false;
	}
}

//for beatDetector
/*function checkFreqHeight(freq) {
	if (song.isOnBeat()) {
		var sound = new Audio('assets/sound.mp3');
		sound.play();
		ctx.fillStyle = "red";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
}*/

function freqAvg(allFreq) {
	var total = 0;
	for(var i = 0; i < allFreq.length; i++) {
    total += allFreq[i];
	}
	var avg = total / allFreq.length;
	console.log(avg);
	return avg;
}
