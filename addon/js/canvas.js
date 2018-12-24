var ready = false;
var timer = 0;
var FPS = 60;
var WIDTH;
var HEIGHT;

window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback) { window.setTimeout(callback, 1000 / FPS); };
})();

window.$ = function(arg) { return document.querySelector(arg); };

/* CANVAS ---------*/
var canvas = $("#canvas");
var ctx = canvas.getContext("2d");
var bgGradient;

/* FIREFLIES ---------*/
var fireflies = [];

var maxLifetime = 20; // in seconds
var minLifetime = 10;

var maxSize = 3;
var minSize = 1;

var maxSpeed = 60;
var minSpeed = 30;

var maxVarianceX = 50;
var firefliesNb = 200;
var firefliesColors = ["255, 255, 255", "170, 255, 230"];

/* CLOUDS, STARDUST, METEOR ---------*/
var path = "addon/img/";
var clouds = [];
var cloudsURL = ["cloud1.png", "cloud2.png", "cloud3.png", "cloud4.png"];

var stardust;
var stardustURL = "stardust.png";

var meteor;

//===============================
// MAIN INITIALIZATION
document.addEventListener("DOMContentLoaded", function() {
//===============================
	if(navigator.appName == 'Microsoft Internet Explorer') {
		addClass($("html"), "isIE");

    var agent = navigator.userAgent;

    if(agent.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/) != null) {
      var version = parseFloat( RegExp.$1 );
      addClass($("html"), "ie"+version);
    }
  };

	setSizes();
	window.addEventListener('resize', setSizes);

	// Meteor shower event
	var snow = $("#snow");
	snow.addEventListener('click', function() {
		if(!hasClass($("body"), "meteorShower")) {
			addClass($("body"), "meteorShower");

			setTimeout(function() { Meteor.getInstance(true, true); }, 200);
		}
	});

	snow.addEventListener('webkitAnimationEnd', function() { removeClass($("body"), "meteorShower"); });
	snow.addEventListener('oAnimationEnd', function() { removeClass($("body"), "meteorShower"); });
	snow.addEventListener('MSAnimationEnd', function() { removeClass($("body"), "meteorShower"); });
	snow.addEventListener('animationend', function() { removeClass($("body"), "meteorShower"); });

	// Background gradient
	bgGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
	bgGradient.addColorStop(0, "#f66b57");
	bgGradient.addColorStop(.25, "#9c414b");
	bgGradient.addColorStop(.6, "#033047");

	// Load pictures
	var loadedPix = 0;
	var checkLoadedPix = function() {
		if(++loadedPix == cloudsURL.length + 1) init();
	}

	// Clouds
	for(var i = 0; i < cloudsURL.length; i++) {
		clouds[i] = new Image();
		var cloud = clouds[i];

		cloud.index = i;
		cloud.src = path+cloudsURL[i];
		cloud.onload = checkLoadedPix;
		cloud.setPosition = function() {
			this.xpos = Math.round((WIDTH / cloudsURL.length) * this.index - this.width / 4);
	  		this.ypos = Math.round((HEIGHT - this.height) / 2 - this.height / 4);
		}
  }

  // Stardust
  stardust = new Image();
  stardust.src = path+stardustURL;
  stardust.onload = checkLoadedPix;
});

function init() {
	// Clouds
	for(var i = 0; i < clouds.length; i++)
		clouds[i].setPosition();

	// Fireflies
	for(var i = 0; i < firefliesNb; i++)
		fireflies[i] = new Firefly();

	// Meteors
	Meteor.getInstance(true);

	// Draw the canvas
	draw();

	setTimeout(function() { addClass($("body"), "ready") }, 500);
	ready = true;
}

function setSizes() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	canvas.setAttribute('width', WIDTH);
	canvas.setAttribute('height', HEIGHT);

	if(!ready) return;

	// Reposition the clouds
	for(var i = 0; i < clouds.length; i++)
		clouds[i].setPosition();
}


//===============================
// FIREFLY CLASS
function Firefly() {
//===============================
	this.x;
	this.varianceX;
	this.y;

	this.size;
	this.speed;
	this.opacity;
	this.color;
	
	this.lifetime;
	this.starttime;

	this.init = function() {
		this.size = parseFloat(getRandomArbitrary(minSize, maxSize).toFixed(2));
		this.speed = parseFloat(getRandomArbitrary(minSpeed, maxSpeed).toFixed(2));
		this.opacity = parseFloat(getRandomArbitrary(.25, 1).toFixed(2));
		this.color = firefliesColors[Math.round(Math.random())];

		this.x = parseFloat((Math.random() * WIDTH).toFixed(2));
		this.varianceX = parseFloat(getRandomArbitrary(0, maxVarianceX).toFixed(2));
		this.y = -1 * getRandomArbitrary(this.size, this.size * 100).toFixed(2);

		this.lifetime = getRandomInt(minLifetime, maxLifetime);
		this.starttime = timer / 60;
	}

	this.draw = function() {
		this.x += Math.cos(timer / FPS) * this.varianceX / FPS;
		this.y += this.speed / FPS;

		this.currentTime = (timer / FPS) - this.starttime;
		var timePercentage = this.currentTime * 100 / this.lifetime;
		this.opacity = 1 - timePercentage / 100;

		if(this.currentTime >= this.lifetime) this.init();

		ctx.beginPath();
	  	ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
	  	ctx.closePath();

	  	ctx.save();
	  	ctx.globalCompositeOperation = "overlay";
	  	ctx.fillStyle = 'rgba('+this.color+','+this.opacity+')';
	  	ctx.fill();
	  	ctx.restore();
	}

	this.init();
}


//===============================
// METEOR CLASS
function Meteor(isGiant) {
//===============================
	this.x;
	this.y;
	this.dx;
	this.dy;

	this.size;
	this.speed;
	this.opacity;

	this.lifetime;
	this.starttime;

	this.isGiant = isGiant;

	this.init = function() {
		if(this.isGiant) {
			this.size = 100;
			this.speed = 60 * 60;
			this.opacity = .04;

			this.x = getRandomInt(0, WIDTH / 2);
			this.dx = 2;

			this.lifetime = .8;
		}
		else {
			this.size = getRandomInt(50, 100);
			this.speed = parseFloat(getRandomArbitrary(minSpeed * 60, maxSpeed * 60).toFixed(2));
			this.opacity = (getRandomArbitrary(2, 4) / 100).toFixed(3);

			this.x = getRandomInt(0, WIDTH - 2);
			this.dx = 0;

			this.lifetime = parseFloat(getRandomArbitrary(.6, 1.15).toFixed(2));
		}

		this.y = -1 * this.size;
		this.dy = 2;

		this.starttime = timer / 60;
	}

	this.draw = function() {
		if(this.dx > 0) this.x += this.speed / FPS;
		this.y += this.speed / FPS;

		this.currentTime = (timer / FPS) - this.starttime;
		var timePercentage = this.currentTime * 100 / this.lifetime;

		if(this.currentTime >= this.lifetime || (!this.isGiant && hasClass($("body"), "meteorShower"))) {
			this.init();
			Meteor.getInstance();
		}

		ctx.save();
		ctx.beginPath();
		ctx.globalCompositeOperation = "overlay";
		ctx.globalAlpha = this.opacity;

    for(var i = 0; i < this.size; i++) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - (1 / this.size) * i) + ')';
      ctx.rect(this.x - this.dx * i, this.y - this.dy * i - 2, 2, 2);
      ctx.fill();
    }

		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	this.init();
}

Meteor.getInstance = function(now) {
	var isGiant = hasClass($("body"), "meteorShower");

	var delay = now ? 0 :
				(isGiant && meteor) ? meteor.lifetime :
				parseFloat(getRandomArbitrary(2, 6).toFixed(2));

	meteor = null;
	setTimeout(function() { meteor = new Meteor(isGiant); }, delay * 1000);
}


//===============================
// CANVAS DRAWING
function draw() {
//===============================
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	timer = requestAnimationFrame(draw);

	// Background gradient
	ctx.save();
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = bgGradient;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.restore();

  // Stardust
  ctx.save();
  ctx.globalCompositeOperation = "lighten";
  ctx.globalAlpha = .4 - Math.abs(Math.sin(timer / FPS)) * .3;
	ctx.drawImage(stardust, Math.round(WIDTH / 2 - stardust.width), 0);
	ctx.drawImage(stardust, Math.round(WIDTH / 2), 0);
	ctx.restore();

	// Clouds
	ctx.save();
  ctx.globalCompositeOperation = "soft-light";

  for(var i = 0; i < clouds.length; i++) {
    clouds[i].ypos += Math.cos(timer / FPS + i) / (i + 8);

    ctx.globalAlpha = .2;
    ctx.drawImage(clouds[i], clouds[i].xpos, clouds[i].ypos);
  }

  ctx.restore();

	// Fireflies
	for(var i = 0; i < firefliesNb; i++)
		fireflies[i].draw();

	// Meteors
	if(meteor) meteor.draw();
}


//===============================
// TOOLBOX
//===============================
function hasClass(element, className) {
	return element.classList.contains(className);
}

function addClass(element, className) {
	if(element.classList.length > 0)
		element.className += " "+className;
	else
		element.className = className;
}

function removeClass(element, className) {
	if(!hasClass(element, className)) return;

	element.className = element.className.replace(className, "");
	element.className.trim();
}

/* http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range */
/*Returns a random number between min (inclusive) and max (exclusive) */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/* Returns a random integer between min (inclusive) and max (inclusive)
   Using Math.round() will give you a non-uniform distribution! */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}