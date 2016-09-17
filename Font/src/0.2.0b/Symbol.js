//*************************************************************
//  File: Symbol.js
//  Date created: 6/21/2015
//  Date edited: 6/21/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Class that holds information for a single character
//*************************************************************


function Symbol(assocChar, matrix)
{
	this.assocChar = assocChar;
	this.matrix = matrix;
	this.utilizesLastCol = false;
	//this.maxX = 4;

	//check to see if uses last column or not
	for (var i = 0; i < 7; i++)
	{
		if (matrix[i][4] == 1) { this.utilizesLastCol = true; break; }
	}
}
