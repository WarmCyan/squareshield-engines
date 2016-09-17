//*************************************************************
//  File: Text.js
//  Date created: 6/21/2015
//  Date edited: 6/23/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Class that contains a group of symbols, and all
//    the necessary functions for rendering and animating the symbols
//*************************************************************


//REQUIRES GLOBAL 'alphabet' ARRAY that contains the letter matrices
function Text()
{
	this.container; //"the world"
	//var symbols = [];
	var textString = "";
	var chars = []; //list of TextChars
	this.characters = chars;

	this.blockMargin = 0;
	this.blockSize = [0,0]; //[0] = width [1] = height
	this.letterSpacing = 0;
	this.lineSpacing = 0;
	this.textMargin = [0,0]; //[0] = x [1] = y
	
	//[0] = numerator, [1] = denominator
	this.useRelPos = false;
	this.relPosStartX = [0,1];
	this.relPosStartY = [0,1];
	this.relPosEndX = [0,1];
	this.relPosEndY = [0,1];
	
	//the relative amounts ARE TRANSLATED INTO the absolute. But you have the option to manually put in the amounts yourself
	this.absPosStartX = null;
	this.absPosStartY = null;
	this.absPosEndX = null;
	this.absPosEndY = null;

	this.centerX = false;
	this.centerY = false;
	
	this.setTextString = function(text)
	{
		textString = text;
		this.calculateTextChars();
	}
	this.getTextString = function() { return textString; }


	this.findTextHeight = function(numOfLines)
	{
		var height = numOfLines * (this.blockSize[1]*7 + this.blockMargin*6) + (numOfLines-1)*this.lineSpacing;
		height += this.textMargin[1] * 2;
		return height;
	}
	this.findLineWidth = function(text)
	{
		var width = 0;
		for (var i = 0; i < text.length; i++)
		{
			var numBlocks = 4;
			if (alphabet[text[i]].utilizesLastCol) { numBlocks = 5; }
			width += (this.blockSize[0] * numBlocks + this.blockMargin * (numBlocks - 1));
		}
		console.log("width BEFORE margins: " + width); 
		width += (this.textMargin[0] * 2) + (this.letterSpacing * (text.length - 1));
		console.log("width AFTER margins: " + width);
		return width;
	}
	
	this.calculateTextChars = function()
	{
		//calculate absPos values
		if (this.useRelPos)
		{
			var totalWidth = this.container.width;	
			var totalHeight = this.container.height;

			this.absPosStartX = (totalWidth / this.relPosStartX[1]) * this.relPosStartX[0];
			this.absPosStartY = (totalHeight / this.relPosStartY[1]) * this.relPosStartY[0];
			this.absPosEndX = (totalWidth / this.relPosEndX[1]) * this.relPosEndX[0];
			this.absPosEndY = (totalHeight / this.relPosEndY[1]) * this.relPosEndY[0];
		}
		
		//multiline stuff
		var lines = [];
		var lineWidths = [];

		lines[0] = textString;

		//find allowed dimensions
		var allowedWidth = this.absPosEndX - this.absPosStartX;
		var allowedHeight = this.absPosEndY - this.absPosStartY;
		
		var foundFit = false;
		
		//find actual dimensions
		var actualWidth = 0;
		var actualHeight = 0;

		//make multi-lines until it fits x-wise
		for (var i = 0; i < lines.length; i++)
		{
			while (this.findLineWidth(lines[i]) > allowedWidth)
			{
				log("width: " + this.findLineWidth(lines[i]));
				log("allowed: " + allowedWidth);
				console.log(lines[i]);
				
				//get the last character of the current line and add it to the beginning of the next
				var lastChar = lines[i].substring(lines[i].length - 1, lines[i].length);
				console.log(lastChar);
				lines[i] = lines[i].substring(0, lines[i].length - 1);
				if (lines[i+1] == undefined) { lines[i+1] = ""; }
				lines[i+1] = lastChar + lines[i+1];
				console.log(lines);
			}
			lineWidths[i] = this.findLineWidth(lines[i]);
		}
		
		if (this.findTextHeight(lines.length) > allowedHeight) { log("ERROR - NOT ENOUGH SPACE FOR TEXT"); }
			

		//evaluating positional variables
		var evalX = 0;
		var evalY = 0;

		//find starting positions for Y
		//TODO: add centering
		evalX = this.absPosStartX + this.textMargin[0];
		evalY = this.absPosStartY + this.textMargin[1];
		
		for (var line = 0; line < lines.length; line++)
		{
			//advance evalY forward for previous line
			//TODO: no, this should just go at the end of every character calculation. (more fficient anyway)
			if (line > 0)
			{
				var lineForwardAmount = this.blockSize[1]*7 + this.blockMargin*6;
				evalY += lineForwardAmount + this.lineSpacing;
				evalX = this.absPosStartX + this.textMargin[0];
			}
			for (var l = 0; l < lines[line].length; l++)
			{
				//advance evalX forward based on previous letter
				if (l > 0)
				{
					var numBlocks = 4;

					//last lastColUtil
					if (alphabet[lines[line][l-1]].utilizesLastCol) { numBlocks = 5; }
					var letterForwardAmount = this.blockSize[0] * numBlocks + this.blockMargin*(numBlocks-1);
					evalX += letterForwardAmount + this.letterSpacing;
				}
				

				//start instance of textChar
				var textCharacter = new TextChar();

				var letter = alphabet[lines[line][l]];
				var mat = letter.matrix;
				textCharacter.characterMatrix = mat;
				textCharacter.blockSize = this.blockSize;

				var maxX = 4;
				if (letter.utilizesLastCol) { maxX = 5; }
				for (var y = 0; y < 7; y++)
				{
					textCharacter.positionMatrix[y] = [];
					for (var x = 0; x < maxX; x++)
					{
						textCharacter.positionMatrix[y][x] = [];
						posX = evalX + (this.blockSize[0]*x) + (this.blockMargin*x);
						posY = evalY + (this.blockSize[1]*y) + (this.blockMargin*y);
						textCharacter.positionMatrix[y][x][0] = parseInt(posX);
						textCharacter.positionMatrix[y][x][1] = parseInt(posY);
					}
				}
				chars.push(textCharacter);
			}
		}
	}

	//dt is for any animations
	this.renderFont = function(dt)
	{
		var context = this.container.getContext('2d');
		for (var c = 0; c < chars.length; c++) { chars[c].render(dt, context); }
	}
}
