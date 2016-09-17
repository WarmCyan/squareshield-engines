//*************************************************************
//  File: TestInterface.js
//  Date created: 6/21/2015
//  Date edited: 6/30/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Script that controls and runs the font engine as
//    as an example. THIS FILE IS FOR TESTING AND DEMONSTRATION 
//    PURPOSES ONLY, IT IS NOT A PART OF THE FONT ENGINE
//*************************************************************

window.onload = startup;

var world;
var objectConsole;
var logConsole;

var texts = []; //ASSUMED TO CONTAIN ONLY TestObject INSTANCES

var DEBUG = true; //shows basics: fps, frame, runtime

var LOG_ENABLED = true;

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

var alphabet = [];

//assign all important parts of web page
function startup()
{
	//get html elements
	world = document.getElementById("World");
	objectConsole = document.getElementById("ObjectConsole");
	logConsole = document.getElementById("LogConsole");

	log("Hello world!");
	
	
	log("Populating Alphabet...");
	populateAlphabet();
	log("Done!");

	var sqrShieldMsg = new Text(world);
	sqrShieldMsg.blockSize = [4,3];
	sqrShieldMsg.blockMargin = -.1;
	sqrShieldMsg.letterSpacing = 5;
	sqrShieldMsg.useRelPos = true;
	sqrShieldMsg.setRelativePositions([0,1],[1,1],[0,1],[1,1]);
	sqrShieldMsg.setRelativePositions([0,1],[1,1],[0,1],[1,1]);
	sqrShieldMsg.alignX = "center";
	sqrShieldMsg.alignY = "center";
	sqrShieldMsg.setTextString("SquareShield\nFont Engine");
	texts.push(sqrShieldMsg);
	for (var i = 0; i < 6; i++) 
	{ 
		colorani = new Animation("color", "blockColor");
		colorani.userType = "blockColor";
		colorani.addKeyFrame("000000", 0);
		colorani.addKeyFrame("000000", 1000);
		colorani.addKeyFrame("000000", 1300);
		colorani.addKeyFrame("1166FF", 1500);
		colorani.addKeyFrame("11FF44", 1700);
		colorani.addKeyFrame("880000", 2200);
		sqrShieldMsg.chars[i].animations.push(colorani);
	}

	for (var i = 0; i < sqrShieldMsg.chars.length; i++)
	{
		var ani = new Animation("number", "blockWidth");
		ani.addKeyFrame(50, 0);
		ani.addKeyFrame(4, 1200);

		//come up with matrix for this character
		var width = sqrShieldMsg.chars[i].positionMatrix[0].length;
		var height = sqrShieldMsg.chars[i].positionMatrix.length;
		
		var matrix1 = [];
		for (var h = 0; h < height; h++)
		{
			matrix1[h] = [];
			for (var w = 0; w < width; w++)
			{
				matrix1[h][w] = 100;
			}
		}
		var matrix2 = [];
		for (var h = 0; h < height; h++)
		{
			matrix2[h] = [];
			for (var w = 0; w < width; w++)
			{
				matrix2[h][w] = 0;
			}
		}

		var posAni = new Animation("matrix", "positionRelX");
		posAni.addKeyFrame(matrix1, 0);
		posAni.addKeyFrame(matrix2, 1000);
	
		var opacityAni = new Animation("number", "opacity");
		opacityAni.addKeyFrame(0, 0);
		opacityAni.addKeyFrame(1, 1200);
		
		sqrShieldMsg.chars[i].animations.push(posAni);
		sqrShieldMsg.chars[i].animations.push(ani);
		sqrShieldMsg.chars[i].animations.push(opacityAni);
	}
	
	var frameM = new Text(world);
	frameM.blockSize = [3,2];
	frameM.letterSpacing = 3;
	frameM.useRelPos = true;
	frameM.relPosEndX = [1,1];
	frameM.relPosEndY = [1,1];
	frameM.textMargin = [0,0];
	frameM.setRelativePositions([0,1],[1,1],[9,10],[1,1]);
	frameM.setTextString("1234567890");
	frameM.alignX = "right";
	frameM.alignY = "bottom";
	texts.push(frameM);
	
	var timeM = new Text(world, [3,2], 4, true);
	timeM.setRelativePositions([0,1],[1,1],[0,1],[1,1]);
	timeM.textMargin = [0,0];
	timeM.alignX = "right";
	timeM.setTextString("0:00");
	texts.push(timeM);

	var msgM = new Text(world, [1,1], 1, true);
	msgM.setRelativePositions([0,1],[1,1],[1,9],[1,1]);
	msgM.blockMargin = 0;
	msgM.lineSpacing = 5;
	msgM.textMargin = [0,0];
	msgM.setTextString("\"Hello world! How's it going?\", said the man@gmail.com - (yeah) this/that and more!. \nCopyright © 2016 Digital Warrior Labs");
	texts.push(msgM);

	var usersMsg = new Text(world, [2,2], 2, true)
	usersMsg.setRelativePositions([0,1],[1,1],[2,3],[1,1]);
	usersMsg.lineSpacing = 5;
	usersMsg.textMargin = [5,5];
	usersMsg.setTextString("Type here!");
	for (var i = 0; i < usersMsg.chars.length; i++) { usersMsg.chars[i].color = "#0033AA"; }
	texts.push(usersMsg);

	/*var logo = new Text(world, [15,15], 5, true);
	logo.setRelativePositions([0,1],[1,1],[0,1],[1,1]);
	logo.alignX = "left";
	logo.alignY = "bottom";
	logo.textMargin = [10,-10];
	logo.setTextString("Abc");
	texts.push(logo);*/
	
	lastFrameTime = (new Date()).getTime();
	animate();
}

function changeText()
{
	texts[4].setTextString(document.getElementById("textContents").value);
	for (var i = 0; i < texts[4].chars.length; i++) { texts[4].chars[i].color = "#0033AA"; }
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

	objectConsole.value = consoleText;
}

function toggleLog()
{
	if (LOG_ENABLED) { LOG_ENABLED = false; logConsole.disabled = true;  }
	else { LOG_ENABLED = true; logConsole.disabled = false; }
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

		var mins = parseInt(runtimeDisplay / 60);
		var secs = runtimeDisplay - mins*60;
		if (secs < 10) { secs = "0" + secs; }
		texts[2].setTextString(mins + ":" + secs);
		for (var i = 0; i < texts[2].chars.length; i++) { texts[2].chars[i].color = "#006600"; }
		

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

		//update canvas!
		var worldContext = world.getContext('2d');
		worldContext.clearRect(0, 0, world.width, world.height);
		for (var i = 0; i < texts.length; i++)
		{
			texts[i].renderFont(timeDifference);
		}
		

		frameNum++;
		texts[1].setTextString("frame " + frameNum);
		for (var i = 0; i < texts[1].chars.length; i++) { texts[1].chars[i].color = "#FF0000"; }
		if (DEBUG) { updateObjectLog(); }
	}

	window.requestAnimationFrame(animate);
}
