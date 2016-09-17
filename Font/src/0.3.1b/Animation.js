//*************************************************************
//  File: Animation.js
//  Date created: 6/27/2015
//  Date edited: 6/27/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Class that takes care of keeping track of animation
//    time, key frames, etc.
//*************************************************************

//animation types:
//	color (hexidecimal, but do NOT include # sign)
//	number
//	matrix (array of arrays, two dimensional array)

function Animation(type, userType)
{
	this.userType = userType; //PURELY USER DEFINED, can be used as your own method of defining different types (for your handling classes, if you need an extra piece of information as to WHAT this is animating)
	this.type = type; //meant more for internal use, but still needs to be passed by user
	//this.timeLength = timeLength; //honestly probably don't need this either
	//this.startTime = startTime; //very well may not need this
	this.currentTime = 0; //adds every dt to it, so as long as accurate dt's are being passed in, THIS SHOULD REPRESENT AMOUNT OF TIME PASSED IN ANIMATION

	this.done = false; //BOOLEAN AMOUNT, do not change, code changes this when animation is finished. User can check it for when it's true in order to remove the animation from any lists or any other pertinent places
	
	var keyframes = [];
	this.keyFrames = keyframes;
	var keyframeIntervals = []; //assoc array that contains time in ms since beginning of animation before it applies (each one should therefore be consecutively larger than the former)

	this.addKeyFrame = function(keyFrameData, time)
	{
		keyframes.push(keyFrameData);
		keyframeIntervals.push(time);
		this.keyFrames = keyframes;
	}

	//THIS is the function that will also return "current frame"
	this.updateAnimation = function(dt)
	{
		if (this.done) { return null; }
		
		this.currentTime += dt;
		var frameOne = null; //INDEX 
		var frameTwo = null; //INDEX
		
		//check for end of animation reached
		if (this.currentTime > keyframeIntervals[keyframeIntervals.length - 1])
		{
			return keyframes[keyframes.length - 1];
			this.done = true;
		}
		
		//for loop to find which frames time is currently between
		for (var i = 0; i < keyframeIntervals.length; i++)
		{
			if (this.currentTime > keyframeIntervals[i] && this.currentTime < keyframeIntervals[i+1])
			{
				frameOne = i;
				frameTwo = i+1;
				break;
			}
			else if (this.currentTime == keyframeIntervals[i]) { return keyframes[i]; log("EXACT FRAME");}
			else 
			{
				continue;
			}
		}

		//find ratio of times
		var ratio = (keyframeIntervals[frameTwo] - keyframeIntervals[frameOne]) / (this.currentTime - keyframeIntervals[frameOne]);
		//console.log(ratio);

		//based on type, apply ratio differently
		if (this.type == "number")
		{
			return ((keyframes[frameTwo] - keyframes[frameOne]) / ratio) + keyframes[frameOne];
		}
		else if (this.type == "matrix")
		{
			var matrix = [];
			//populate basic arrays
			for (var i = 0; i < keyframes[frameOne].length; i++)
			{
				matrix[i] = [];

				for (var j = 0; j < keyframes[frameOne][i].length; j++)
				{
					matrix[i][j] = ((keyframes[frameTwo][i][j] - keyframes[frameOne][i][j]) / ratio) + keyframes[frameOne][i][j];
				}
			}
			return matrix;
		}
		else if (this.type == "color")
		{
			var colorValues1 = getHexValues(keyframes[frameOne]);
			var colorValues2 = getHexValues(keyframes[frameTwo]);
			//console.log("values1 " + colorValues1);
			//console.log("values2 " + colorValues2 + "\n----------------");

			var r = 0;
			var g = 0;
			var b = 0;
			
			//perform math on each individual color value
			r = parseInt(((colorValues2[0] - colorValues1[0]) / ratio) + colorValues1[0]);
			g = parseInt(((colorValues2[1] - colorValues1[1]) / ratio) + colorValues1[1]);
			b = parseInt(((colorValues2[2] - colorValues1[2]) / ratio) + colorValues1[2]);
			//console.log("COLVAL2[2] : " + colorValues2[2] + " COLVAL1[2] : " + colorValues1[2]);
			//console.log("ratio: " + ratio + " r - " + r + " g - " + g + " b - " + b + "\n===============================");
			
			return getColorHex(r, g, b);
		}
		
		
	}


	var dictionary = [];
	dictionary[0] = "0";
	dictionary[1] = "1";
	dictionary[2] = "2";
	dictionary[3] = "3";
	dictionary[4] = "4";
	dictionary[5] = "5";
	dictionary[6] = "6";
	dictionary[7] = "7";
	dictionary[8] = "8";
	dictionary[9] = "9";
	dictionary[10] = "A";
	dictionary[11] = "B";
	dictionary[12] = "C";
	dictionary[13] = "D";
	dictionary[14] = "E";
	dictionary[15] = "F";

	//CALL THIS FUNCTION
	function getColorHex(r, g, b) { return getHexPairFromValue(r) + getHexPairFromValue(g) + getHexPairFromValue(b);	}

	function getHexPairFromValue(value)
	{
		var sixteenth = parseInt(value / 16);
		var remainder = value - (sixteenth*16);

		var hex1 = dictionary[sixteenth];
		var hex2 = dictionary[remainder];
		return hex1 + hex2;
	}
	
	//CALL THIS FUNCTION
	function getHexValues(hex)
	{
		hex = hex.toUpperCase();
		var hr = hex.substring(0, 2);
		var hg = hex.substring(2, 4);
		var hb = hex.substring(4, 6);
		//console.log(hr + " " + hg + " " + hb);

		var r = convertHexValue(hr);
		var g = convertHexValue(hg);
		var b = convertHexValue(hb);
		//console.log("r " + r + " g " + g + " b " + b);

		return [r, g, b];
	}

	//digit/letter pair (0-255)
	function convertHexValue(hex)
	{
		var hex1 = hex.substring(0,1);
		var hex2 = hex.substring(1,2);

		//console.log("hex1 " + hex1);
		//console.log("hex2 " + hex2);
		var hex1Value = convertSingleHex(hex1);
		var hex2Value = convertSingleHex(hex2);


		hex1Value *= 16;
		var total = parseInt(parseInt(hex1Value) + parseInt(hex2Value));

		return total;
	}
	

	//single digit/letter
	function convertSingleHex(hex)
	{
		for (var i = 0; i < dictionary.length; i++)
		{
			if (dictionary[i] == hex) { return i; }
		}
		return -1;
	}
}
