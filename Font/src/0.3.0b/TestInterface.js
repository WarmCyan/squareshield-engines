//*************************************************************
//  File: TestInterface.js
//  Date created: 6/21/2015
//  Date edited: 6/22/2015
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
var DEBUG_ADVANCED = true; //shows all variables for all objects (GREATLY REDUCES PERFORMANCE WHEN MANY OBJECTS)

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


var latestObjectID = 0;

var fontEngine;

var alphabet = [];

//assign all important parts of web page
function startup()
{
	//get html elements
	world = document.getElementById("World");
	objectConsole = document.getElementById("ObjectConsole");
	logConsole = document.getElementById("LogConsole");

	log("Hello world!");
	
	//fontEngine = new PhysicsEngine();	
	
	log("Populating Alphabet...");
	populateAlphabet();
	log("Done!");

	var sqrShieldMsg = new Text(world);
	sqrShieldMsg.blockSize = [4,3];
	sqrShieldMsg.blockMargin = -.1;
	sqrShieldMsg.letterSpacing = 5;
	sqrShieldMsg.useRelPos = true;
	/*sqrShieldMsg.relPosStartX = [1,3];
	sqrShieldMsg.relPosEndX = [2,3];
	sqrShieldMsg.relPosEndY = [1,1];*/
	sqrShieldMsg.setRelativePositions([0,1],[1,1],[0,1],[1,1]);
	sqrShieldMsg.setRelativePositions([0,1],[1,1],[0,1],[1,1]);
	//sqrShieldMsg.textMargin = [100,200];
	sqrShieldMsg.centerX = true;
	sqrShieldMsg.centerY = true;
	sqrShieldMsg.setTextString("SquareShield\nFont Engine");
	//sqrShieldMsg.setTextString("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz. 0123456789\",:");
	texts.push(sqrShieldMsg);
	for (var i = 0; i < 6; i++) { sqrShieldMsg.chars[i].color = "#880000"; }
	
	var frameM = new Text(world);
	frameM.blockSize = [3,2];
	//frameM.blockMargin = -1;
	frameM.letterSpacing = 3;
	frameM.useRelPos = true;
	frameM.relPosEndX = [1,1];
	frameM.relPosEndY = [1,1];
	frameM.textMargin = [10,0];
	frameM.setRelativePositions([0,1],[1,1],[9,10],[1,1]);
	frameM.setTextString("1234567890");
	texts.push(frameM);
	
	var timeM = new Text(world, [3,2], 4, true);
	timeM.setRelativePositions([0,1],[1,1],[0,1],[1,1]);
	timeM.textMargin = [5,5];
	//timeM.blockMargin = -1;
	timeM.setTextString("0:00");
	texts.push(timeM);

	var msgM = new Text(world, [1,1], 2, true);
	msgM.setRelativePositions([0,1],[1,1],[2,9],[1,1]);
	msgM.blockMargin = 0;
	msgM.lineSpacing = 5;
	msgM.textMargin = [0,0];
	msgM.setTextString("\"Hello world! How's it going?\", said the man@gmail.com - (yeah) this/that and more!. \nCopyright © 2016 Digital Warrior Labs");
	texts.push(msgM);
	
	lastFrameTime = (new Date()).getTime();
	animate();
}

function testLetter(context)
{
	var startX = 50;
	var startY = 50;
	var blockMargin = 0;
	var blockSize = [10, 10]; //[0] = width [1] = height
	var letterSpacing = 10;
	context.fillStyle = "#003377";
	var letters = ["X", "A", "B", "C"];
	
	for (var l = 0; l < letters.length; l++)
	{
		//advance startX forward by last letter	
		if (l > 0)
		{
			var numBlocks = 4;
			//last lastColUtil
			if (alphabet[letters[l-1]].utilizesLastCol) { numBlocks = 5; }
			
			var letterForward = blockSize[0]*numBlocks + blockMargin*(numBlocks-1);
			startX += letterForward + letterSpacing;
		}
		
		
		var letter = alphabet[letters[l]];
		var mat = letter.matrix;
		
		var maxX = 4;
		if (letter.utilizesLastCol) { maxX = 5; }
		for (var y = 0; y < 7; y++)
		{
			for (var x = 0; x < maxX; x++)
			{
				if (mat[y][x] == 1)
				{
					posX = startX + (blockSize[0]*x) + (blockMargin*x);
					posY = startY + (blockSize[1]*y) + (blockMargin*y);
					context.fillRect(posX, posY, blockSize[0], blockSize[1]);
				}
			}
		}
	}
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
	if (DEBUG_ADVANCED)
	{
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
		/*for (var i = 0; i < physEngine.getEntities().length; i++)
		{
			physEngine.getEntities()[i].renderObject(worldContext);
		}*/
		//testLetter(worldContext);
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
