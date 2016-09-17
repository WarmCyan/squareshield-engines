//*************************************************************
//  File: TextChar.js
//  Date created: 6/22/2015
//  Date edited: 6/27/2015
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
	this.opacity = 1;
	this.blockSize = []; //[0] = width [1] = height
	
	//this.keyFrames = [];
	//this.currentFrame = null; //if this is null, NO ANIMATIONS TAKING PLACE
	this.animations = [];
	this.relativeAnimationMatrixX = []; //only for positional animation
	this.relativeAnimationMatrixY = []; //only for positional animation
	this.useRelativeMatrix = false; //set to true when doing positional animation


	this.render = function(dt, context)
	{
		//update current variables based on animations
		if (this.animations.length > 0)
		{
			for (var i = 0; i < this.animations.length; i++)
			{
				var result = this.animations[i].updateAnimation(dt);
				if (this.animations[i].userType == "blockWidth")
				{
					this.blockSize[0] = result;
				}
				else if (this.animations[i].userType == "positionRelX")
				{
					this.useRelativeMatrix = true;
					this.relativeAnimationMatrixX = result;
				}
				else if (this.animations[i].userType == "positionRelY")
				{
					this.useRelativeMatrix = true;
					this.relativeAnimationMatrixY = result;
				}
				else if (this.animations[i].userType == "opacity")
				{
					this.opacity = result;
				}
				else if (this.animations[i].userType == "blockColor")
				{
					this.color = "#" + result;
					//console.log(result);
				}
			}
		}

		//render based on current variables
		context.fillStyle = this.color;
		context.globalAlpha = this.opacity;
		
		for (var y = 0; y < this.textContainer.CHAR_MATRIX_HEIGHT; y++)
		{
			for (var x = 0; x < this.assocSymbol.width; x++)
			{
				if (this.assocSymbol.matrix[y][x] == 1)
				{
					var posDX = 0;
					var posDY = 0;
					
					if (this.useRelativeMatrix) 
					{ 
						if (this.relativeAnimationMatrixX[y] != undefined) 
						{ 
							if (this.relativeAnimationMatrixX[y][x] != undefined) { posDX = this.relativeAnimationMatrixX[y][x]; }
						}
						if (this.relativeAnimationMatrixY[y] != undefined) 
						{ 
							if (this.relativeAnimationMatrixY[y][x] != undefined) { posDY = this.relativeAnimationMatrixY[y][x]; }
						}
					}

					//console.log("posx: " + posDX + " posy: " + posDY);
		
					context.fillRect(this.positionMatrix[y][x][0] + posDX, this.positionMatrix[y][x][1] + posDY, this.blockSize[0], this.blockSize[1]);
				}
			}
		}
	}
}
