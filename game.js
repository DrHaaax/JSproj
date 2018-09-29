var analyser, canvas, ctx, random = Math.random, circles = [], ebullets = [], pbullets = [];

used = false;

reverse = false;

idealscore = 0;

score = 0;

h = window.innerHeight;
w = h / 2;

window.onload = function() {
	
	var file = document.getElementById("thefile");
	var audio = document.getElementById("audio");
	
	canvas = document.createElement('canvas');
	canvas.width = w;
    canvas.height = h;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
	
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	file.onchange = function() {
	
	var files = this.files;
	
	document.getElementById("thefile").style.visibility = 'hidden';
	
	grdCol = [[0, 0.05, 1], ["green", "yellow", "red"]];
	
	bulletW = canvas.width / 50;
	bulletH = canvas.height / 27;
	
	ecanonpos = [
	(canvas.width / 5) - bulletW / 2, 
	(canvas.width / 5 * 2) - bulletW / 2, 
	(canvas.width / 5 * 3) - bulletW / 2, 
	(canvas.width / 5 * 4) - bulletW / 2
	];
    
    setupWebAudio(files);
	
	document.addEventListener("keydown", keyDownHandler);
	
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
		sens: 3, 
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
        circles[i].radius = freqByteData[i] / 5;
        circles[i].y = circles[i].y > canvas.height - 1 ? 0 : circles[i].y + 1;
		circles[i].x = circles[i].y > canvas.height ? random() * canvas.width : circles[i].x;
        circles[i].draw();
    }
	
	ctx.fillStyle = "aqua";
	ctx.globalAlpha = 0.2;
	ctx.fillRect(0, canvas.height / 20, canvas.width, canvas.height / 40);
	ctx.globalAlpha = 1;
	
	var y = 0;
	
	for (var i = 0; i < freqByteData.length; i++){
		ctx.fillStyle = shuffleGrd();
		
		ctx.fillRect(0, y, freqByteData[i] / 4, canvas.height / freqByteData.length * 2.5);
        ctx.strokeRect(0, y, freqByteData[i] / 4, canvas.height / freqByteData.length * 2.5);
		
		ctx.fillRect(canvas.width - freqByteData[i] / 4, y, canvas.width, canvas.height / freqByteData.length * 2.5);
        ctx.strokeRect(canvas.width - freqByteData[i] / 4, y, canvas.width, canvas.height / freqByteData.length * 2.5);
		
		y += (canvas.height / freqByteData.length * 2.5) + 1;
    }
	
	checkFreqHeight();	
	
	for (var i = 0; i < ebullets.length; i++){		
		if (ebullets[i].y >= canvas.height && ebullets[i].destroyed == false){
			ebullets[i].destroyed = true;
			score = score - 5 > 0 ? score - 5 : 0;
			//hit player canon
			screenBlink("red");
		}
		
		if (ebullets[i].destroyed == false){	
			for (var j = 0; j < pbullets.length; j++){  //check collision between bullets
			if (pbullets[j].x == ebullets[i].x && pbullets[j].y <= ebullets[i].y && pbullets[j].destroyed == false){
				ebullets[i].destroyed = true;
				pbullets[j].destroyed = true;
				score += 10;
			}
		}		
			ebullets[i].y += canvas.height / 80;
			ctx.fillStyle = "red";
			ctx.fillRect(ebullets[i].x, ebullets[i].y, bulletW, bulletH);
		}
	}
	
	for (var i = 0; i < pbullets.length; i++){
		if (pbullets[i].y <= 0 && pbullets[i].destroyed == false){
			pbullets[i].destroyed = true;
			score = score - 5 > 0 ? score - 5 : 0;
			//hit wall
			screenBlink("aqua");
		}
		
		if (pbullets[i].destroyed == false){
			pbullets[i].y -= canvas.height / 40;
			ctx.fillStyle = "green";
			ctx.fillRect(pbullets[i].x, pbullets[i].y, bulletW, bulletH);
		}
	}
	
	canons();
	
	if (audio.isFinished() && ebullets[ebullets.length - 1].destroyed == true) {
		ctx.font = "30px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText(score + " / " + idealscore, canvas.width / 2, canvas.height / 2);
		if (score < idealscore * 0.5){
		ctx.fillText("Eh, maybe try again?", canvas.width / 2, canvas.height / 2 + 50);
		}
		if (score > idealscore * 0.5 && score!=idealscore){
		ctx.fillText("Good!", canvas.width / 2, canvas.height / 2 + 50);
		}
		if (score == idealscore){
		ctx.fillText("P E R F E C T", canvas.width / 2, canvas.height / 2 + 50);
		}
	} else {
		ctx.font = "30px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "left";
		ctx.fillText("score: " + score, 5, 25);
		ctx.font = "20px Arial";
		ctx.fillText("shoot the red lasers on [1] [2] [3] [4] buttons", 5, canvas.height - 5);
	} 	
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
    ctx.globalAlpha = 0.2;
    ctx.arc(that.x, that.y, that.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
}

//for beatDetector
function checkFreqHeight(freq) {
	if (audio.isOnBeat()) {
		idealscore += 10;
		var sound = new Audio('assets/sound.mp3');
		sound.play();
		ebullets.push(new ebullet());
	}
}

function shuffleGrd(){
	if (grdCol[0][1] <= 0.01){
		reverse = false;
		for (var i = 0; i < grdCol.length; i++){
			grdCol[1][i] = 'rgb(' + getRandomColor() + ',' + getRandomColor() + ',' + getRandomColor() + ')';
		}
	}
	if (grdCol[0][1] >= 0.99){
		reverse = true;
		for (var i = 0; i < grdCol.length; i++){
			grdCol[1][i] = 'rgb(' + getRandomColor() + ',' + getRandomColor() + ',' + getRandomColor() + ')';
		}
	}
	grdCol[0][1] = reverse == false ? grdCol[0][1] + 0.00002 : grdCol[0][1] - 0.00002;
	var grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
	grd.addColorStop(grdCol[0][0],grdCol[1][0]);
	grd.addColorStop(grdCol[0][1],grdCol[1][1]);
	grd.addColorStop(grdCol[0][2],grdCol[1][2]);
	return grd;
}

function ebullet() {
	this.x = ecanonpos[Math.floor(Math.random() * ecanonpos.length)];
	this.y = 0;
    this.destroyed = false;
}

function pbullet(x) {
	this.x = x;
	this.y = canvas.height;
    this.destroyed = false;
}

function canons(){
	ctx.fillStyle = "gray";
	for (var i = 0; i < ecanonpos.length; i++){
		ctx.fillRect(ecanonpos[i], 0, bulletW, bulletH * 1.2);
		ctx.fillRect(ecanonpos[i], canvas.height - bulletH * 1.2, bulletW, canvas.height - bulletH * 1.2);
	}
}

function screenBlink(col){
	ctx.fillStyle = col;
	ctx.globalAlpha = 0.3;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.globalAlpha = 1;
}

function keyDownHandler(e) {
    if(e.keyCode == 49) {
		pbullets.push(new pbullet(ecanonpos[0]));
    }
	if(e.keyCode == 50) {
		pbullets.push(new pbullet(ecanonpos[1]));
    }
	if(e.keyCode == 51) {
		pbullets.push(new pbullet(ecanonpos[2]));
    }
	if(e.keyCode == 52) {
		pbullets.push(new pbullet(ecanonpos[3]));
    }
}