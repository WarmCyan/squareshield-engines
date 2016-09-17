//*************************************************************
//  File: Physics.js
//  Date created: 6/4/2015
//  Date edited: 6/16/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: File for javascript class that relates to all 
//    physical properties of an object. EVERY OBJECT THAT GETS
//    EVALUATED BY THE PHSYICS ENGINE MUST CONTAIN AN INSTANCE
//    OF THIS CLASS
//*************************************************************

/*********************************{
@cl: Physics
@d: Representation/collection of all physical properties that an object can have. NOTE: EVERY OBJECT THAT GETS EVALUATED BY THE PHYSICS ENGINE MUST CONTAIN AN INSTANCE OF THIS CLASS
}*********************************/

/*********************************{
@c: Physics
}*********************************/
function Physics()
{
	this.layers = [];
	this.px = 0; //{@p:px @d: X-coordinate of the upper left hand corner of a bounding box (this could potentially represent the x-coordinate of the center of a circle as well) }
	this.py = 0; //{@p:py @d: Y-coordinate of the upper left hand corner of a bounding box (or center of a circle)}
	
	this.height = 0 //{@p:height @d: Height of bounding box. (0 if referring to circle) This can be thought of as a vector going down from py.}
	this.width = 0; //{@p:width @d: Width of bounding box. (0 if referring to circle) This can be thought of as a horizontal vector going to the right from px}
	//this.r = 0; //radius for potential circles
	
	this.vx = 0; //{@p:vx @d: Velocity in pixels per millisecond in the x direction.}
	this.vy = 0; //{@p:vy @d: Veolicty in pixels per millisecond in the y direction.}
	
	this.ax = 0; //{@p:ax @d: Acceleration in pixels per millisecond^2 in the x direction.}
	this.ay = 0; //{@p:ay @d: Acceleration in pixels per millisecond^2 in the y direction.}
	var mass = 1;
	var inv_mass = 1;

	this.movable = true;
	
	this.setMass = function(newMass) 
	{ 
		inv_mass = 0;
		mass = newMass; 
		if (mass == 0) { inv_mass = 0; log("infinite mass given"); } //"infinite" mass"
		else { inv_mass = 1 / mass; }
	}
	this.getMass = function() { return mass; }
	this.getInvMass = function() { return inv_mass; }
	
	this.restitution = .5; //"bounciness." between 0-1, closer to 1, bouncier it is
	
	this.friction = .04;


	this.updatePosition = function(dt)
	{
		if (!this.movable) { return; }
		
		//update velocity based on acceleration
		this.vx = this.vx + this.ax*dt;
		this.vy = this.vy + this.ay*dt;

		//update position based on velocity
		this.px = this.px + this.vx*dt;
		this.py = this.py + this.vy*dt;
		//TODO: IMPLEMENT RESISTANCE FACTOR (like friction, so all objects slow down eventually)
	}

}
