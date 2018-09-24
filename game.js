var analyser, canvas, ctx, random = Math.random, circles = [];

used = false;

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
	
	grd = ctx.createLinearGradient(0,0,0,200);
	grd.addColorStop(0,"green");
	grd.addColorStop(0.5,"yellow");
	grd.addColorStop(1,"red");
    
    setupWebAudio(files);
    
    for (var i = 0; i < 20; i++) {
        circles[i] = new Circle();
        circles[i].draw();
    }
    draw();
	}
};

//for beatDetector
function setupWebAudio(files) {
	audio = new stasilo.BeatDetector({
		sens: 5, 
		visualizerFFTSize: 256, 
		analyserFFTSize: 256, 
		passFreq: 600,
		url: URL.createObjectURL(files[0])});
}

function draw() {
	requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);	
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	var freqByteData = audio.getAudioFreqData(); //beatDetector
    
    for (var i = 0; i < circles.length; i++) {
        circles[i].radius = freqByteData[i] / 10;
        circles[i].y = circles[i].y > canvas.height ? 0 : circles[i].y + 1;
        circles[i].draw();
    }
	
    for (var i = 0; i < freqByteData.length; i += 1){
        //ctx.fillStyle = 'rgb(' + getRandomColor() + ',' + getRandomColor() + ',' + getRandomColor() + ')';
		ctx.fillStyle = grd;
		ctx.fillRect(i * 10, 0, canvas.width / freqByteData.length * 2.5, freqByteData[i]);
        ctx.strokeRect(i * 10, 0, canvas.width / freqByteData.length * 2.5, freqByteData[i]);
    }
	checkFreqHeight(freqAvg(freqByteData));	
}

/*function getRandomColor(){
    return random() * 255 >> 0;
}*/

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

/*function checkFreqHeight(freq) {
	if (freq > 120 && used == false) {
		used = true;
		var sound = new Audio('assets/sound.mp3');
		sound.play();
		ctx.fillStyle = "red";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	else if (freq < 120 && used == true) {
		used = false;
	}
}*/

//for beatDetector
function checkFreqHeight(freq) {
	if (audio.isOnBeat()) {
		var sound = new Audio('assets/sound.mp3');
		sound.play();
		ctx.fillStyle = "red";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
}

function freqAvg(allFreq) {
	var total = 0;
	for(var i = 0; i < allFreq.length; i++) {
    total += allFreq[i];
	}
	var avg = total / allFreq.length;
	console.log(avg);
	return avg;
}
