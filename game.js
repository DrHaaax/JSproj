var analyser, canvas, ctx, random = Math.random, circles = [];

used = false;

window.onload = function() {
    canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 800;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    
    setupWebAudio();
    
    for (var i = 0; i < 20; i++) {
        circles[i] = new Circle();
        circles[i].draw();
    }
    draw();
};

function setupWebAudio() {
    var audio = document.createElement('audio');
    audio.src = 'assets/Devil_Trigger.mp3';
    audio.controls = 'true';
    document.body.appendChild(audio);
    audio.style.width = canvas.width + 'px';
    
    var audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
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
    
    for (var i = 0; i < circles.length; i++) {
        circles[i].radius = freqByteData[i] / 10;
        circles[i].y = circles[i].y > canvas.height ? 0 : circles[i].y + 1;
        circles[i].draw();
    }
    
    for (var i = 0; i < freqByteData.length; i += 20){
        ctx.fillStyle = 'rgb(' + getRandomColor() + ',' + getRandomColor() + ',' + getRandomColor() + ')';
        /*ctx.fillRect(i + canvas.width / freqByteData.length / 20, canvas.height - freqByteData[i] * 1.5, canvas.width / freqByteData.length * 25, canvas.height);
        ctx.strokeRect(i + canvas.width / freqByteData.length / 20, canvas.height - freqByteData[i] * 1.5, canvas.width / freqByteData.length * 25, canvas.height);*/
		ctx.fillRect(i, 0, canvas.width / freqByteData.length * 25, canvas.height);
        ctx.strokeRect(i, 0, canvas.width / freqByteData.length * 25, canvas.height);
    }
	checkFreqHeight(avg(freqByteData));	
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
	if (freq > 80 && used == false) {
		used = true;
		var sound = new Audio('assets/sound.mp3');
		sound.play();
	}
	else if (freq < 80 && used == true) {
		used = false;
	}
	console.log(used);
}

function avg(allFreq) {
	var total = 0;
	for(var i = 0; i < allFreq.length; i++) {
    total += allFreq[i];
	}
	var avg = total / allFreq.length;
	return avg;
}
