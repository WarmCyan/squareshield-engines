//*************************************************************
//  File: TextChar.js
//  Date created: 6/22/2015
//  Date edited: 6/23/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Class for a single character INSIDE OF A TEXT. These objects hold positioning and rendering information and take care of updating any animations
//*************************************************************


//TODO: store symbol, not characterMatrix
function TextChar()
{
	this.positionMatrix = [];
	this.characterMatrix = [];
	this.color = "#000000";
	this.blockSize = []; //[0] = width [1] = height
	
	this.keyFrames = [];


	this.render = function(dt, context)
	{
		context.fillStyle = this.color;

		for (var y = 0; y < 7; y++)
		{
			for (var x = 0; x < 5; x++)
			{
				if (this.characterMatrix[y][x] == 1)
				{
					context.fillRect(this.positionMatrix[y][x][0], this.positionMatrix[y][x][1], this.blockSize[0], this.blockSize[1]);
				}
			}
		}
	}
}
