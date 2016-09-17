//*************************************************************
//  File: Text.js
//  Date created: 6/21/2015
//  Date edited: 6/25/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Class that contains a group of symbols, and all
//    the necessary functions for rendering and animating the symbols
//*************************************************************


//REQUIRES GLOBAL 'alphabet' ARRAY that contains the letter matrices
function Text(canvasContainer, blockSizeArray, letterSpacing, useRelPos)
{
	//TODO: alphabet may be stored in here? and then matrix height calculated from that?
	this.CHAR_MATRIX_HEIGHT = 14; //this needs to be constant for all characters in a single text //previously 7

	this.container = canvasContainer; //"the world"
	//var symbols = [];
	var textString = "";
	this.chars = []; //list of TextChars

	this.blockMargin = 0;
	this.blockSize = blockSizeArray; //[0] = width [1] = height
	this.letterSpacing = letterSpacing;
	this.lineSpacing = 0;
	this.textMargin = [0,0]; //[0] = x [1] = y
	
	//[0] = numerator, [1] = denominator
	this.useRelPos = useRelPos;
	this.relPosStartX = [0,1];
	this.relPosStartY = [0,1];
	this.relPosEndX = [0,1];
	this.relPosEndY = [0,1];

	this.alignX = "left"; //left, right
	this.alignY = "top"; //top, bottom
	
	//the relative amounts ARE TRANSLATED INTO the absolute. But you have the option to manually put in the amounts yourself
	this.absPosStartX = null;
	this.absPosStartY = null;
	this.absPosEndX = null;
	this.absPosEndY = null;

	this.setRelativePositions = function(startX, endX, startY, endY)
	{
		this.relPosStartX = startX;
		this.relPosEndX = endX;
		this.relPosStartY = startY;
		this.relPosEndY = endY;
	}

	this.centerX = false;
	this.centerY = false;
	
	this.setTextString = function(text)
	{
		textString = String(text);
		this.chars = [];
		this.calculateTextChars();
	}
	this.getTextString = function() { return textString; }


	this.findTextHeight = function(numOfLines)
	{
		var height = numOfLines * (this.blockSize[1]*this.CHAR_MATRIX_HEIGHT + this.blockMargin*(this.CHAR_MATRIX_HEIGHT - 1)) + (numOfLines-1)*this.lineSpacing;
		height += this.textMargin[1] * 2;
		return height;
	}
	this.findLineWidth = function(text)
	{
		var width = 0;
		for (var i = 0; i < text.length; i++)
		{
			var numBlocks = alphabet[text[i]].width;
			width += (this.blockSize[0] * numBlocks + this.blockMargin * (numBlocks - 1));
		}
		width += (this.textMargin[0] * 2) + (this.letterSpacing * (text.length - 1));
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
		

		//PSEUDO CODE FOR MULTILINE
		
		//for each line
			//check for newline
				//if newline
					//move everything after it down a line
					//record line number that you moved it down to in a variable
				//while width > allowed
					//if next line number matches 'newlinenumber' variable, move next line down another line
					//move character down to next line

		var newLineLN = -1;
		for (var i = 0; i < lines.length; i++)
		{
			if (lines[i].indexOf("\n") > -1)
			{
				var index = lines[i].indexOf("\n");
				if (lines[i+1] == undefined) { lines[i+1] = ""; }
				lines[i+1] = lines[i].substring((index + 1), lines[i].length) + lines[i+1];
				lines[i] = lines[i].substring(0, index);
				newLineLN = i+1;
			}
			while (this.findLineWidth(lines[i]) > allowedWidth)
			{
				if (i+1 == newLineLN)
				{
					if (lines[i+2] == undefined) { lines[i+2] = ""; }
					lines[i+2] = lines[i+1];
					lines[i+1] = "";
					newLineLN = i+2;
				}

				//get the last character of the current line and add it to the beginning of the next
				var lastChar = lines[i].substring(lines[i].length - 1, lines[i].length);
				lines[i] = lines[i].substring(0, lines[i].length - 1);
				if (lines[i+1] == undefined) { lines[i+1] = ""; }
				lines[i+1] = lastChar + lines[i+1];
			}
			lineWidths[i] = this.findLineWidth(lines[i]);
		}

		
		//make multi-lines until it fits x-wise
		/*for (var i = 0; i < lines.length; i++)
		{
			while (this.findLineWidth(lines[i]) > allowedWidth)
			{
				//get the last character of the current line and add it to the beginning of the next
				var lastChar = lines[i].substring(lines[i].length - 1, lines[i].length);
				lines[i] = lines[i].substring(0, lines[i].length - 1);
				if (lines[i+1] == undefined) { lines[i+1] = ""; }
				lines[i+1] = lastChar + lines[i+1];
			}
			lineWidths[i] = this.findLineWidth(lines[i]);
		}*/
		
		if (this.findTextHeight(lines.length) > allowedHeight) { /*log("ERROR - NOT ENOUGH SPACE FOR TEXT");*/ }
			
		//evaluating positional variables
		var evalX = 0;
		var evalY = 0;

		//find starting positions for Y
		//TODO: add centering
		if (this.centerX) { evalX = this.absPosStartX  + (allowedWidth - lineWidths[0]) / 2; } 
		else if (this.alignX == "left") { evalX = this.absPosStartX + this.textMargin[0]; }
		else if (this.alignX == "right") { evalX = this.absPosEndX - lineWidths[0]; }
		else { log("NOTHING FOUND FOR evalX"); } //DEBUGGING ONLY
		
		if (this.centerY) { evalY = this.absPosStartY  + (allowedHeight - this.findTextHeight(lines.length)) / 2; }
		else if (this.alignY == "top") { evalY = this.absPosStartY + this.textMargin[1]; }
		else if (this.alignY == "bottom") { evalY = this.absPosEndY - this.findTextHeight(lines.length); }

		for (var line = 0; line < lines.length; line++)
		{
			//advance evalY forward for previous line
			if (line > 0)
			{
				var lineForwardAmount = this.blockSize[1]*this.CHAR_MATRIX_HEIGHT + this.blockMargin*(this.CHAR_MATRIX_HEIGHT - 1);
				evalY += lineForwardAmount + this.lineSpacing;
				
				if (this.centerX) { evalX = this.absPosStartX + this.textMargin[0] + (allowedWidth - lineWidths[line]) / 2; }
				else if (this.alignX == "left") { evalX = this.absPosStartX + this.textMargin[0]; }
				else if (this.alignX == "right") { evalX = this.absPosEndX - lineWidths[line]; }
				else { log("NOTHING FOUND FOR evalX"); } //DEBUGGING ONLY
			}
			for (var l = 0; l < lines[line].length; l++)
			{

				//start instance of textChar
				var textCharacter = new TextChar(this);

				var letter = alphabet[lines[line][l]];
				var mat = letter.matrix;
				textCharacter.assocSymbol = letter;
				textCharacter.blockSize = this.blockSize;

				var maxX = letter.width;
				for (var y = 0; y < this.CHAR_MATRIX_HEIGHT; y++)
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
				this.chars.push(textCharacter);
				
				//update evalx
				var numBlocks = alphabet[lines[line][l]].width;
				var letterForwardAmount = this.blockSize[0] * numBlocks + this.blockMargin*(numBlocks-1);
				evalX += letterForwardAmount + this.letterSpacing;
			}
		}
	}

	//dt is for any animations
	this.renderFont = function(dt)
	{
		var context = this.container.getContext('2d');
		for (var c = 0; c < this.chars.length; c++) { this.chars[c].render(dt, context); }
	}
}
