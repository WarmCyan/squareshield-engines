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
	
	populateAlphabet();

	var firstText = new Text();
	firstText.container = world;
	firstText.blockSize = [10,10];
	firstText.letterSpacing = 10;
	firstText.useRelPos = true;
	firstText.relPosEndX = [1,2];
	firstText.relPosEndY = [1,1];
	firstText.textMargin = [20, 100];
	firstText.setTextString("ABCDEFGX ABCDEFGX");
	texts.push(firstText);
	
	
	lastFrameTime = (new Date()).getTime();
	animate();
}

function populateAlphabet()
{
	log("Populating Alphabet...");
	var space = [
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
	
	var A = [
		[0,1,1,0,0],
		[1,0,0,1,0],
		[1,0,0,1,0],
		[1,1,1,1,0],
		[1,0,0,1,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
	
	var B = [
		[1,1,1,0,0],
		[1,0,0,1,0],
		[1,1,1,0,0],
		[1,0,0,1,0],
		[1,1,1,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
	
	var C = [
		[0,1,1,1,0],
		[1,0,0,0,0],
		[1,0,0,0,0],
		[1,0,0,0,0],
		[0,1,1,1,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
	
	var D = [
		[1,1,1,0,0],
		[1,0,0,1,0],
		[1,0,0,1,0],
		[1,0,0,1,0],
		[1,1,1,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
	
	var E = [
		[1,1,1,1,0],
		[1,0,0,0,0],
		[1,1,1,0,0],
		[1,0,0,0,0],
		[1,1,1,1,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
	
	var F = [
		[1,1,1,1,0],
		[1,0,0,0,0],
		[1,1,1,0,0],
		[1,0,0,0,0],
		[1,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];

	var G = [
		[0,1,1,1,0],
		[1,0,0,0,0],
		[1,0,1,1,0],
		[1,0,0,1,0],
		[0,1,1,1,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
	
	var X = [
		[1,0,0,0,1],
		[0,1,0,1,0],
		[0,0,1,0,0],
		[0,1,0,1,0],
		[1,0,0,0,1],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];

	alphabet[" "] = new Symbol(" ", space);
	alphabet["A"] = new Symbol("A", A);
	alphabet["B"] = new Symbol("B", B);
	alphabet["C"] = new Symbol("C", C);
	alphabet["D"] = new Symbol("D", D);
	alphabet["E"] = new Symbol("E", E);
	alphabet["F"] = new Symbol("F", F);
	alphabet["G"] = new Symbol("G", G);
	alphabet["X"] = new Symbol("X", X);

	log("Done!");
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
		if (DEBUG) { updateObjectLog(); }
	}

	window.requestAnimationFrame(animate);
}
