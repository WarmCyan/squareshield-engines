//*************************************************************
//  File: PhysicsEngine.js
//  Date created: 6/4/2015
//  Date edited: 6/4/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Javascript class for the engine itself, which takes
//    care of handling the collisions and movements of all objects
//    that have physcial properties
//*************************************************************

function PhysicsEngine()
{
	this.entities = [];

	this.updatePhysics = function(dt)
	{
		//check for collisions
		for (var i = 0; i < this.entities.length; i++)
		{
			for (var j = i + 1; j < this.entities.length; j++)
			{
				//if (i == j) { continue; }
				var obj1 = this.entities[i].physics;
				var obj2 = this.entities[j].physics;

				var collision = this.detectCollision(obj1, obj2);
				if (collision) 
				{
					GAME_PLAYING = false; 
					log(this.entities[j].name + " has collided with " + this.entities[i].name);
				}

			}
		}

		//update positions
		for (var i = 0; i < this.entities.length; i++)
		{
			this.entities[i].physics.updatePosition(dt);
		}
	}

	//PASS IN TWO PHYSICS INSTANCES
	this.detectCollision = function(obj1, obj2)
	{
		if ((obj1.px + obj1.width) < obj2.px || obj1.px > (obj2.px + obj2.width)) { return false; }
		if ((obj1.py + obj1.height) < obj2.py || obj1.py > (obj2.py + obj2.height)) { return false; }

		return true;
	}
}
