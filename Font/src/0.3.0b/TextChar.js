//*************************************************************
//  File: TextChar.js
//  Date created: 6/22/2015
//  Date edited: 6/23/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Class for a single character INSIDE OF A TEXT. These objects hold positioning and rendering information and take care of updating any animations
//*************************************************************


//TODO: store symbol, not characterMatrix
function TextChar(text)
{
	this.textContainer = text; //need this to get the CHAR_MATRIX_HEIGHT
	this.positionMatrix = [];
	//this.characterMatrix = [];
	this.assocSymbol;
	this.color = "#000000";
	this.blockSize = []; //[0] = width [1] = height
	
	this.keyFrames = [];


	this.render = function(dt, context)
	{
		context.fillStyle = this.color;

		for (var y = 0; y < this.textContainer.CHAR_MATRIX_HEIGHT; y++)
		{
			for (var x = 0; x < this.assocSymbol.width; x++)
			{
				if (this.assocSymbol.matrix[y][x] == 1)
				{
					context.fillRect(this.positionMatrix[y][x][0], this.positionMatrix[y][x][1], this.blockSize[0], this.blockSize[1]);
				}
			}
		}
	}
}
