//*************************************************************
//  File: TestInterface.js
//  Date created: 5/30/2015
//  Date edited: 6/17/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Script that controls and runs the physics engine as
//    as an example. THIS FILE IS FOR TESTING AND DEMONSTRATION 
//    PURPOSES ONLY, IT IS NOT A PART OF THE PHYSICS ENGINE
//*************************************************************

window.onload = startup;

var world;
var objectConsole;
var logConsole;

var objects = []; //ASSUMED TO CONTAIN ONLY TestObject INSTANCES

var DEBUG = true; //shows basics: fps, frame, runtime
var DEBUG_ADVANCED = true; //shows all variables for all objects (GREATLY REDUCES PERFORMANCE WHEN MANY OBJECTS)

var LOG_ENABLED = true;

var DAMAGE_ENABLED = false;

var GAME_PLAYING = true;

//-------TIMING/FRAMES------
var lastFrameTime; //represents the time in milliseconds that the last frame was drawn
var frameNum = 0; //counts up each frame
var fps = 0;
var lastDT = 0; //the last frame time difference recorded
var recordFPS = false; //use this so you don't have to calc FPS every single frame, just every other or something.
var recordFPSCounter = 0; //counts up until hits delay, then sets recordFPS to true
var recordFPSCounterDelay = 25; //represents frames to let pass before recording fps

//NOTE: runtime updates at SAME INTERVAL as fps
var runtime = 0; //ms (keeps adding timedifference for each frame)
var runtimeDisplay = 0; //seconds


//LOGGING STUFF
var logsPerFrame = 0; //update this every frame to zero, if it gets to high, temporarily disable log (note this actually goes based on resetLogcount, not literally every frame)
var logDisabled = 0; //represents number of frames to disable log (count down to zero every frame)
var resetLogCount = 0; //count this down, when reaches zero, reset logsPerFrame to zero
var LOG_THROTTLE_FRAMES = 5; //throttle log if too many messages within 5 frames
var LOGS_MAX = 6; //the limit to how many message it will accept before throttling

var physEngine;


//-------MOUSE STUFF-------
var mouseDown = false;
var mouseLastX = -1;
var mouseLastY = -1;
var mouseCurrentX = -1;
var mouseCurrentY = -1;
var mouseLogX = -1; //just shown in the log
var mouseLogY = -1; //just shown in the log
var indexOfClickedObject = -1; //if clicking on something the index within the objects array will be stored here
var objectOffsetX = -1; //how far from left edge of selected object was clicked
var objectOffsetY = -1; //how far from left edge of selected object was clicked

//assign all important parts of web page
function startup()
{
	//get html elements
	world = document.getElementById("World");
	objectConsole = document.getElementById("ObjectConsole");
	logConsole = document.getElementById("LogConsole");

	world.addEventListener("mousedown", handleClick, false);
	world.addEventListener("mouseup", handleMouseUp, false);
	world.addEventListener("mousemove", handleMouseMove, false);

	log("Hello world!");
	
	physEngine = new PhysicsEngine();	
	physEngine.entities = objects;


	//WALLS
	var wallLeft = new TestObject("LeftWall", -200, 1, 200, world.height - 2, "#000000");
	var wallRight = new TestObject("RightWall", world.width, 1, world.width + 200, world.height - 2, "#000000");
	var wallTop = new TestObject("TopWall", -200, -200, world.width + 400, 200, "#000000");
	var wallBottom = new TestObject("BottomWall", -200, world.height, world.width + 400, 200, "#000000");

	wallLeft.physics.setMass(0);
	wallLeft.physics.movable = false;
	wallLeft.physics.layers = [1];
	
	wallRight.physics.setMass(0);
	wallRight.physics.movable = false;
	wallRight.physics.layers = [2];
	
	wallTop.physics.setMass(0);
	wallTop.physics.movable = false;
	wallTop.physics.layers = [3];
	
	wallBottom.physics.setMass(0);
	wallBottom.physics.movable = false;
	wallBottom.physics.layers = [4];
	
	objects.push(wallLeft);
	objects.push(wallRight);
	objects.push(wallTop);
	objects.push(wallBottom);

	//TESTING OBJECTS
	var myTestObject = new TestObject("myTestObject", 10, 10, 40, 40, "#002299");
	var myOtherObject = new TestObject("myOtherObject", 80, 80, 40, 40, "#992200");
	var gravityObject = new TestObject("gravityObject", 130, 20, 40, 40, "#009922");
	var collidingObject = new TestObject("collidingObject", world.width - 51, 200, 50, 50, "#EEEE00");
	objects.push(myTestObject);
	objects.push(myOtherObject);
	objects.push(gravityObject);
	objects.push(collidingObject);

	myTestObject.physics.ay = .00045; //TESTING ONLY
	myTestObject.physics.layers = [1, 2, 3, 4];
	myTestObject.clickable = true;
	
	myOtherObject.physics.ay = .0002; //TESTING ONLY
	myOtherObject.physics.layers = [1, 2, 3, 4];
	myOtherObject.clickable = true;
	
	gravityObject.physics.ay = .0004; //TESTING ONLY
	gravityObject.physics.vx = .1;
	gravityObject.physics.vy = -.1;
	gravityObject.physics.restitution = .9;
	gravityObject.physics.layers = [1, 2, 3, 4];
	gravityObject.clickable = true;

	collidingObject.physics.vx = -.45;
	//collidingObject.physics.ay = .004;
	collidingObject.physics.layers = [1, 2, 3, 4];
	collidingObject.physics.setMass(100);
	collidingObject.clickable = true;

	log("Damage is OFF");
	
	lastFrameTime = (new Date()).getTime();
	animate();
}

//send a message to the logconsole
function log(message) 
{ 
	if (!LOG_ENABLED) { return; }
	if (logDisabled > 0) { return; }
	logsPerFrame++;
	logConsole.value += message + "\n"; 

	if (logsPerFrame > LOGS_MAX) 
	{ 
		logDisabled = 200; 
		logConsole.value += "\nLOG TEMPORARILY DISABLED DUE TO MESSAGE THROTTLING...\n\n"; 
	}
	logConsole.scrollTop = logConsole.scrollHeight; 
}
//shows all information about current objects in the objectConsole
function updateObjectLog()
{
	var consoleText = "FRAME " + frameNum + " FPS: " + fps + " RUNTIME: " + runtimeDisplay + " seconds";
	consoleText += "\nDT: " + lastDT + " ms";
	if(physEngine.ticClamped) { consoleText += " (clamped at 25ms) \nWARNING: SIMULATION NOT RUNNING AT FULL SPEED"; }
	consoleText += "\n\nMouse X: " + mouseLogX + " Mouse Y: " + mouseLogY;
	if (mouseDown) { consoleText += " CLICKING - x: " + mouseCurrentX + " y: " + mouseCurrentY; }
	if (indexOfClickedObject != -1) { consoleText += "\nSelected object: " + objects[indexOfClickedObject].name + " (offset - x: " + parseInt(objectOffsetX) + " y: " + parseInt(objectOffsetY) + ")"; }

	if (DEBUG_ADVANCED)
	{
		for (var i = 0; i < objects.length; i++)
		{
			if (objects[i].name.indexOf("Wall") > -1) { continue; }
			consoleText += "\n\nObject: " + objects[i].name;
			consoleText += "\nx: " + objects[i].physics.px;
			consoleText += "\ny: " + objects[i].physics.py;
			consoleText += "\nvx: " + objects[i].physics.vx;
			consoleText += "\nvy: " + objects[i].physics.vy;
			consoleText += "\nax: " + objects[i].physics.ax;
			consoleText += "\nay: " + objects[i].physics.ay;
			consoleText += "\nHealth: " + objects[i].health;
		}
	}

	objectConsole.value = consoleText;
}

function toggleLog()
{
	if (LOG_ENABLED) { LOG_ENABLED = false; logConsole.disabled = true;  }
	else { LOG_ENABLED = true; logConsole.disabled = false; }
}
function toggleAdvancedDebugging()
{
	if (DEBUG_ADVANCED) { DEBUG_ADVANCED = false; }
	else { DEBUG_ADVANCED = true; }
}
function togglePlaying()
{
	if (GAME_PLAYING) 
	{ 
		GAME_PLAYING = false; 
		var context = world.getContext("2d");
		context.fillStyle='black';
		context.font = 'bold 14px Arial';
		context.fillText("PAUSED", 10, 20);
	}
	else { lastFrameTime = (new Date()).getTime(); GAME_PLAYING = true; }
}
function toggleDamagable()
{
	if (DAMAGE_ENABLED) { DAMAGE_ENABLED = false; log("Damage is now OFF"); }
	else { DAMAGE_ENABLED = true; log("Damage is now ON"); }
}
function spiceUp()
{
	log("Spicing it up! Whee!");
	for (var i = 0; i < objects.length; i++)
	{
		if (!objects[i].physics.movable) { continue; }
		var randVX = (Math.random() * 2) - 1;
		var randVY = (Math.random() * 2) - 1;

		this.objects[i].physics.vx = randVX;
		this.objects[i].physics.vy = randVY;
	}
}
function addNewGravBox()
{
	log("Adding a new gravity-susceptible box to the world...");
	var randPX = (Math.random() * world.width)
	var randPY = (Math.random() * world.height)
	var boxNum = objects.length - 8;
	var newBox = new TestObject("NewObject" + boxNum, randPX, randPY, 50, 50, "#550077"); //40x40
	newBox.physics.ay = .0003
	newBox.physics.layers = [1,2,3,4];
	newBox.clickable = true;
	objects.push(newBox);
	log("There are now " + (objects.length - 4) + " objects in the world.");
}
function addNewBox()
{
	log("Adding a new box to the world...");
	var randPX = (Math.random() * world.width)
	var randPY = (Math.random() * world.height)
	var boxNum = objects.length - 8;
	var newBox = new TestObject("NewObject" + boxNum, randPX, randPY, 50, 50, "#555555"); //40x40
	newBox.physics.layers = [1,2,3,4];
	newBox.clickable = true;
	objects.push(newBox);
	log("There are now " + (objects.length - 4) + " objects in the world.");
}
function fun()
{
	log("It appears that you'd like something fun: starting trololololo.mp3");
	document.getElementById("music").play();
}

function handleClick(event)
{
	mouseDown = true;
	var position = mousePosition(event);
	mouseCurrentX = position.x;
	mouseCurrentY = position.y;
	mouseLastX = position.x;
	mouseLastY = position.y;
	log("Clicked the world at x: " + position.x + " y: " + position.y);

	//check if clicked on a block
	clickedObjectCheck();
}

//if the clicked mouse is over an object, assign it as selected block
function clickedObjectCheck()
{
	for (var i = 0; i < objects.length; i++)
	{
		var obj = objects[i];
		if (!obj.clickable) { continue; } //ignore object if clickable is set to false
		
		if (obj.physics.px < mouseCurrentX && (obj.physics.width + obj.physics.px) > mouseCurrentX &&
			obj.physics.py < mouseCurrentY && (obj.physics.height + obj.physics.py) > mouseCurrentY)
		{
			log("CLICKED ON OBJECT: " + obj.name);			
			obj.physics.movable = false;
			indexOfClickedObject = i;	
			objectOffsetX = mouseCurrentX - obj.physics.px;
			objectOffsetY = mouseCurrentY - obj.physics.py;
		}
	}
}

function handleMouseUp(event)
{
	mouseDown = false;
	if (indexOfClickedObject != -1)
	{
		//release selected object
		objects[indexOfClickedObject].physics.movable = true;
	}
	indexOfClickedObject = -1;
}
function handleMouseMove(event)
{
	var timeDifference = (new Date()).getTime() - lastFrameTime;
	var position = mousePosition(event);
	if (mouseDown) { updateMouseVelocities(position.x, position.y, timeDifference); }
	if (mouseDown && indexOfClickedObject == -1) { clickedObjectCheck(); }
	mouseLogX = position.x;
	mouseLogY = position.y;
}

function updateMouseVelocities(posX, posY, dt)
{
	mouseLastX = mouseCurrentX;
	mouseLastY = mouseCurrentY;

	mouseCurrentX = posX;
	mouseCurrentY = posY;

	//if there is a selected object, update it's position to mouse's position
	if (indexOfClickedObject != -1)
	{
		var obj = objects[indexOfClickedObject];
		obj.physics.px = mouseCurrentX - objectOffsetX;
		obj.physics.py = mouseCurrentY - objectOffsetY;

		//change velocity based on mouse movement
		dx = mouseCurrentX - mouseLastX;
		dy = mouseCurrentY - mouseLastY;

		velX = dx / dt;
		velY = dy / dt;

		//average out the velocities (smooths them a bit)
		//NOTE: Multiplying velocities by 2 in order to give them an extra boost (otherwise it's really difficult to release correctly and make them fly really well)
		obj.physics.vx = (obj.physics.vx + velX*2) / 2;
		obj.physics.vy = (obj.physics.vy + velY*2) / 2;
	}	
}


function mousePosition(event)
{
	var xPos = 0;
	var yPos = 0;

	var rect = world.getBoundingClientRect();
	xPos = parseInt(event.clientX - rect.left);
	yPos = parseInt(event.clientY - rect.top);
	return { x: xPos, y: yPos };
}



//PHYSICS ENGINE EVENTS
function physEvent_collision(objA, objB, keOn1, keOn2)
{
	//(multiply KE by 1000 to effect health) (then .001 will translate to 1 of health damage from energy transfer)
	if (objA.name.indexOf("Wall") > -1 || objB.name.indexOf("Wall") > -1) { return; }
	var damage1 = keOn1 * 1000;
	var damage2 = keOn2 * 1000;
	
	//attempting to do averages for damage transfer instead
	var damage = (damage1 + damage2) / 2;

	if (!(keOn1 < .001)) { log("Kinetic energy transfered to " + objA.name + ": " + keOn1 + " (taking " + damage + " damage)"); }
	if (!(keOn2 < .001)) { log("Kinetic energy transfered to " + objB.name + ": " + keOn2 + " (taking " + damage + " damage)"); }

	if (DAMAGE_ENABLED)
	{
		//TODO: average damages and apply to both? (right now, damages don't seem to be applied logically)
		/*if (damage1 > 1) { objA.health -= damage1; }
		if (damage2 > 2) { objB.health -= damage2; }*/
		if (damage > 1) 
		{ 
			if (objA.damagable) { objA.health -= damage; }
			if (objB.damagable) { objB.health -= damage; }
		}

		if (objA.health < 0 && objA.damagable) 
		{ 
			log("Object " + objA.name + " died. Removing from world...");  
			objA.clickable = false;
			objA.movable = false;
			objA.damagable = false;
			objA.color = "#000000";
		}
		if (objB.health < 0 && objB.damagable) 
		{ 
			log("Object " + objB.name + " died. Removing from world..."); 
			objB.clickable = false;
			objB.movable = false;
			objB.damagable = false;
			objB.color = "#000000";
		}
	}
}

//recursive animation function that continually updates canvas
function animate()
{
	if (GAME_PLAYING)
	{
		var timeDifference = (new Date()).getTime() - lastFrameTime;
		lastFrameTime = (new Date()).getTime(); //update lastFrameTime to right now, since frame is being drawn

		lastDT = timeDifference;

		runtime += timeDifference;
		runtimeDisplay = parseInt(runtime / 1000);

		//fps recording
		recordFPSCounter++;
		if (recordFPS) 
		{ 
			fps = parseInt(1000/timeDifference); 
			recordFPS = false; 
		}
		if (recordFPSCounter > recordFPSCounterDelay) { recordFPS = true; recordFPSCounter = 0; }

		//take care of log disabling stuff
		if (logDisabled > 0) 
		{ 
			logDisabled--; 
			if (logDisabled <= 0) { log("Logging re-enabled\n"); }
		}
		resetLogCount--;
		if (resetLogCount < 1) { resetLogCount = LOG_THROTTLE_FRAMES; logsPerFrame = 0; }

		//PHYSICSY STUFF
		
		physEngine.updatePhysics(timeDifference);
		
		//update canvas!
		var worldContext = world.getContext('2d');
		worldContext.clearRect(0, 0, world.width, world.height);
		for (var i = 0; i < objects.length; i++)
		{
			objects[i].renderObject(worldContext);
		}

		//update mouse position if necessary
		if (mouseDown) { updateMouseVelocities(mouseCurrentX, mouseCurrentY, timeDifference); }

		frameNum++;
		if (DEBUG) { updateObjectLog(); }
	}

	window.requestAnimationFrame(animate);
}
