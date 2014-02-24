// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;
var contentClass = document.getElementsByClassName("gameField");
contentClass[0].appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";


// BackBush image
var backBushReady = false;
var backBushImage = new Image();
backBushImage.onload = function () {
	backBushReady = true;
};
backBushImage.src = "images/backbush.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";


//Cloud image
var cloudReady = false;
var cloudImage = new Image();
cloudImage.onload = function () {
	cloudReady = true;
};
cloudImage.src = "images/clouds.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

var leftArrowImage = new Image();
leftArrowImage.src = "images/leftArrow.png";
var rightArrowImage = new Image();
rightArrowImage.src = "images/rightArrow.png";


// Game objects
var hero = {
	speed: 64 // movement in pixels per second
};
var bg = {
	x : 0 ,
	y : 0,
	begin : 0 - 10,
	end : -13000 + 10 + canvas.width
}

var bBush = {
	x: 0,
	y: 430

}

var clouds = {
	x : 0 ,
	y : 300
}

var monster = {};
var env = {};
var monstersCaught = 0;
// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
var reset = function () {

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (-1 * bg.end)) + bg.x ;
	monster.y = 258 + (Math.random() * (canvas.height - 298));
};

var hitMonster = function (modifier) {
	if (monster.xSpeed == 0){
		//send him flying
		++monstersCaught;
		monster.xSpeed = hero.xSpeed;
		monster.ySpeed = hero.ySpeed;
		hero.xSpeed = hero.xSpeed / 2;
		hero.ySpeed = hero.ySpeed / 2;
	}
	if (Math.abs(monster.xSpeed) < 50 && monster.y > canvas.height - 70 && Math.abs(monster.ySpeed) < 50 ){
		//if the monster has slowed down enough reset the motherfucker
		monster.xSpeed = 0;
		monsterIsHit = false;
		reset();
	}else{
		//if he's hit the ground flip his y speed and decelerate his x speed
		if(  monster.y > canvas.height - 50){
			monster.ySpeed = monster.ySpeed * -.9;
			monster.xSpeed = monster.xSpeed * .5;
		}
		
		//move his x based on the x speed
		monster.xSpeed *= Math.pow(env.friction, modifier);
		monster.x += monster.xSpeed * modifier;
		//make monster fall
		monster.ySpeed += env.gravity * modifier;
		monster.y -= monster.ySpeed * modifier;
		//gravity
		
		
	}
}

var setStart = function () {

	hero.x = canvas.width / 2;
    hero.y = canvas.height / 2;
	hero.ySpeed = 0;
	hero.xSpeed = 0;
	hero.xAcceleration = 500;
	hero.movesLeft = false;
	hero.movesRight = false;
	hero.isJumping = false;
	env.gravity = -900;
	env.friction = .7;

	monster.xSpeed = 0;
	monster.ySpeed = 0;
	
	monsterIsHit = false;
}

// Update game objects
var update = function (modifier) {
	
	handleInput(modifier);
	
	if(monsterIsHit)
		hitMonster(modifier);
	
	if(hero.ySpeed > 0 || hero.ySpeed < 0){
		hero.isJumping = false;
	}
	//Handle Jump Event
	if (hero.isJumping){
		hero.ySpeed = 500;
		hero.isJumping = false;
	}
	
	//move hero left or right
	
	if(hero.movesRight && hero.movesLeft){
		//do nothing
	}else{
		if(hero.movesRight || hero.movesLeft){
			if (hero.movesRight){
				if(hero.xSpeed < 0){
					hero.xSpeed += 8 * hero.xAcceleration * modifier;
				} else
				hero.xSpeed += hero.xAcceleration * modifier;
			}
			if (hero.movesLeft){
				if(hero.xSpeed > 0){
					hero.xSpeed -= 8 * hero.xAcceleration * modifier;
				} else
				hero.xSpeed -= hero.xAcceleration * modifier;
			} 
		}else {
			if(hero.xSpeed > 0){
				hero.xSpeed -= hero.xAcceleration * modifier;
			}else if (hero.xSpeed < 0){
				hero.xSpeed += hero.xAcceleration * modifier;
			}
		}
	}
	hero.xSpeed *= Math.pow(env.friction, modifier);
	hero.x += hero.xSpeed * modifier;
	if(hero.xSpeed < -500){
		hero.xSpeed = -500;
	} else if(hero.xSpeed > 500){
		hero.xSpeed = 500;
	}
	//make hero fall
	hero.ySpeed += env.gravity * modifier;
	hero.y -= hero.ySpeed * modifier;

	//keep the hero from clipping off the screen
	if(hero.y > 416){
		hero.y = 416;
		hero.ySpeed = 0;
	}
	if(hero.y < 0) {
		hero.y = 0;
		hero.ySpeed = 0;
	}
	if(bg.x > bg.end){
		if(hero.x > 350) {
			hero.x = 350;
			bg.x -=  hero.xSpeed * modifier;
			monster.x -=  hero.xSpeed * modifier;
			//hero.xSpeed = 0;
		}
	}
	if(bg.x < bg.begin){
		if(hero.x < 250) {
			hero.x = 250;
			bg.x -=  hero.xSpeed * modifier;
			monster.x -=  hero.xSpeed * modifier;
			//hero.xSpeed = 0;
		}
	}
	
	
	// If hero collides with monster.
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		monsterIsHit = true;
	}
};

var handleInput = function(modifier){

	if (38 in keysDown) { // Player holding up
		//hero.y -= hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		//hero.y += hero.xSpeed * modifier;
	}
	if (37 in keysDown && hero.x > 0) { // Player holding left
		hero.movesLeft = true;
	}else{
		hero.movesLeft = false;
	}
	
	if (39 in keysDown && hero.x < 482) { // Player holding right
		//hero.x += hero.speed * modifier;
		hero.movesRight = true;
	}else{
		hero.movesRight = false;
	}
	
	if(32 in keysDown){
		hero.isJumping = true;
	}

} 

// Draw everything
var render = function () {
	//Code to repeat the bg
	//At most there will be 3 onscreen
	tempBGX = bg.x % 512;
	if (bgReady) {
		ctx.drawImage(bgImage, tempBGX, bg.y);
		ctx.drawImage(bgImage, tempBGX+512, bg.y);
		ctx.drawImage(bgImage, tempBGX+(512*2), bg.y);
	}
	
	bBush.x = bg.x % 512;
	if(backBushReady){
		ctx.drawImage(backBushImage, bBush.x/2, bBush.y);
		ctx.drawImage(backBushImage, bBush.x/2+256, bBush.y);
		ctx.drawImage(backBushImage, bBush.x/2+512, bBush.y);
		ctx.drawImage(backBushImage, bBush.x/2+768, bBush.y);
		
	
	}
	
	clouds.x = bg.x % (720*30);
	
	if(cloudReady){
			ctx.drawImage(cloudImage, clouds.x/30, clouds.y);
			ctx.drawImage(cloudImage, clouds.x/30+720, clouds.y);
		}

	if (heroReady) {
	    //AREA NEEDS REVIEW AND FINISHING
		//Need art resources for animating the little hero.
		//Sprite sheet with running, jumping, idle
		//Arrays corresponding to the states where each new frame is an element in the array.
		//This is currently wishful coding, hero.isIdle doesn't exist yet.
		/* 
		
		if(hero.isIdle){
		
		}
		
		*/
		
		//this is working right at the moment.
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
		if(monster.x < -32)
		//ctx.drawImage(leftArrowImage, 30, canvas.height - 160 );
		ctx.drawImage(leftArrowImage, 30, monster.y );
		if(monster.x > canvas.width)
		//ctx.drawImage(rightArrowImage, canvas.width - 70, canvas.height - 160 );
		ctx.drawImage(rightArrowImage, canvas.width - 70, monster.y );
	}
	

	// Score & Debug Text
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
	//ctx.fillText("bg.x: " + bg.x, 32, 52);
	//ctx.fillText("clouds.x: " + clouds.x, 32, 72);
	//ctx.fillText("hero.xSpeed: " + hero.xSpeed, 32, 92);
	//ctx.fillText("monster.x: " + monster.x, 32, 112);
	//ctx.fillText("monster.y: " + monster.y, 32, 132);
	//ctx.fillText("hero.x: " + hero.x, 32, 152);
	//ctx.fillText("hero.x: " + (bg.end - bg.x), 32, 172);
	
	
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
setStart();
reset();
var then = Date.now();
setInterval(main, 1); // Execute as fast as possible
