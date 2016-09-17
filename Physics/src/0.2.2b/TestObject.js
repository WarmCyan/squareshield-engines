//*************************************************************
//  File: TestObject.js
//  Date created: 5/30/2015
//  Date edited: 6/16/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: File for javascript class for a testing object
//    that demonstrates how to integrate objects with the physics
//    engine. THIS FILE IS FOR TESTING AND DEMONSTRATION PURPOSES
//    ONLY, IT IS NOT A PART OF THE PHYSICS ENGINE
//*************************************************************

/*********************************{
@cl: TestObject
@d: This is an example class that demonstrates how to integrate the physics engine with a 'game object'. This class should NOT be included in a final product involving the physics engine! It serves as an example only!
}*********************************/

/*********************************{
@c: TestObject
@i:
	@v:name @d: Small identifying string so that it can be identified in the object console
	@v:x @d: Upper-left hand corner of the square. (From left side of canvas)
	@v:y @d: Upper-left hand corner of the square. (From top of canvas)
	@v:width @d: Pixel width of the square.
	@v:height @d: Pixel height of the square.
	@v:color @d: Hex color code for how it should be rendered (pass in a string starting with #)
}*********************************/
function TestObject(name, x, y, width, height, color)
{
	this.name = name; //{@p:name @d: Small identifying string so that it can be identified in the object console}
	this.physics = new Physics(); //{@p:phys @d: @l:Physics object that contains all of the physical properties of this object}

	//assign all physical properties
	this.physics.px = x;
	this.physics.py = y;
	this.physics.width = width; 
	this.physics.height = height; 
	
	this.color = color; //{@p:color @d: String hexidecimal color code for the square (should start with '#')}

	this.clickable = false;
	this.damagable = true;

	this.health = 1000;


	/*********************************{
	@f: renderObject
	@d: This function should be called by whatever is in charge of animating the current game frame.
	@i: 
		@v:context @d: The canvas context that this object should be rendered on
	}*********************************/
	this.renderObject = function(context)
	{
		context.fillStyle = this.color;
		context.fillRect(this.physics.px, this.physics.py, this.physics.width, this.physics.height);
	}
}
