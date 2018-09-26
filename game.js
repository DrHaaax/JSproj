var analyser, canvas, ctx, random = Math.random, circles = [];

used = false;

reverse = false;

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
	
	grdCol = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3];
    
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
		circles[i].x = circles[i].y > canvas.height ? random() * canvas.width : circles[i].x; //maybe rework it, kinda mess
        circles[i].draw();
    }
	
	var x = 0;
	
    for (var i = 0; i < freqByteData.length; i++){
		ctx.fillStyle = shuffleGrd();
		ctx.fillRect(x, 0, canvas.width / freqByteData.length * 2.5, freqByteData[i]);
        ctx.strokeRect(x, 0, canvas.width / freqByteData.length * 2.5, freqByteData[i]);
		
		x += (canvas.width / freqByteData.length * 2.5) + 1;
    }
	
	checkFreqHeight();	
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

//for beatDetector
function checkFreqHeight(freq) {
	if (audio.isOnBeat()) {
		var sound = new Audio('assets/sound.mp3');
		sound.play();
		ctx.fillStyle = "red";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
}

function shuffleGrd(){
	if (grdCol[0] <= 0.01){
		reverse = false;
		}
	if (grdCol[6] >= 0.99){
		reverse = true;
		}
	if (reverse == false){
		for (var i = 0; i < grdCol.length; i++){
		grdCol[i] += 0.00005;
		}
	}
	else{
		for (var i = 0; i < grdCol.length; i++){
		grdCol[i] -= 0.00005;
		}
	}
	var grd = ctx.createLinearGradient(0,0,canvas.width,0);
	grd.addColorStop(grdCol[0],"red");
	grd.addColorStop(grdCol[1],"orange");
	grd.addColorStop(grdCol[2],"yellow");
	grd.addColorStop(grdCol[3],"green");
	grd.addColorStop(grdCol[4],"blue");
	grd.addColorStop(grdCol[5],"indigo");
	grd.addColorStop(grdCol[6],"violet");
	return grd;
}