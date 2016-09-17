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
	//physics engine constants
	var CORRECTION_PERCENT = .2;
	var CORRECTION_SLOP = .05;


	this.entities = [];
	
	this.collisionSets = []; //collection of CollisionManifolds

	this.updatePhysics = function(dt)
	{
		//check for collisions
		var collisionIndex = 0;
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
					//GAME_PLAYING = false; 
					//log(this.entities[j].name + " has collided with " + this.entities[i].name);
					this.collisionSets.push(new CollisionManifold(obj1, obj2));
				}

			}
		}

		//resolve any collisions
		for (var i = 0; i < this.collisionSets.length; i++)
		{
			this.resolveCollision(this.collisionSets[i]);
		}

		//clear out collisionSets
		this.collisionSets = [];

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

		//check to make sure in same layers
		for (var i = 0; i < obj1.layers.length; i++)
		{
			if (obj2.layers.indexOf(obj1.layers[i]) > -1) { return true; }
		}

		//return true;
		//reaches this point if it didn't find any matching layers
		return false;
	}


	this.resolveCollision = function(manifold)
	{
		manifold.generateBoxBoxManifold();
		
		//get the velocity vector of the objects in relation to eachother
		var relativeVelocity = [];
		relativeVelocity[0] = manifold.A.vx - manifold.B.vx;
		relativeVelocity[1] = manifold.A.vy - manifold.B.vy;
		
		//how fast the objects are moving towards eachother in relation to their normal
		//(this should end up giving you velocity ONLY IN ONE DIRECTION (along x, or along y)
		//NOTE: normalvelocity can be thought of to represent the CHANGE IN VELOCITY. Delta V
		var normalVelocity = dotProduct(relativeVelocity, manifold.normal);

		//TODO: add this in later if feel like it's needed
		//if objects already moving away from eachother, ignore
		if (normalVelocity < 0) { return; }

		//get minimum restitution and use it
		var e = 1;
		if (manifold.A.restitution < manifold.B.restitution) { e = manifold.A.restitution; }
		else { e = manifold.B.restitution; }

		//calculate impulse scalar (impulse = Mass * Delta V)
		var j = (-(1 + e) * normalVelocity) / (manifold.A.getInvMass() + manifold.B.getInvMass());
		//var j = (-(1 + e) * normalVelocity) / (manifold.A.getInvMass() + manifold.B.getInvMass());

		//apply that impulse based on normal unit vector
		var impulse = [];
		impulse[0] = j * manifold.normal[0];
		impulse[1] = j * manifold.normal[1];

		//log("impulse x: " + impulse[0]);
		//log("impulse y: " + impulse[1]);

		//GAME_PLAYING = false;
		
		//change velocities based on normal
		//log("a_inv_mass: " + manifold.A.getInvMass());
		//log("b_inv_mass: " + manifold.B.getInvMass());
		manifold.A.vx += manifold.A.getInvMass() * impulse[0];
		manifold.A.vy += manifold.A.getInvMass() * impulse[1];
		manifold.B.vx -= manifold.B.getInvMass() * impulse[0];
		manifold.B.vy -= manifold.B.getInvMass() * impulse[1];

		//positional correction
		if (manifold.penetration > CORRECTION_SLOP) 
		{
			var correction = [];
			correction[0] = CORRECTION_PERCENT * manifold.normal[0] * (manifold.penetration - CORRECTION_SLOP); 
			correction[1] = CORRECTION_PERCENT * manifold.normal[1]  * (manifold.penetration - CORRECTION_SLOP);

			if (manifold.A.movable) 
			{
				manifold.A.px -= manifold.A.getInvMass() * correction[0];
				manifold.A.py -= manifold.A.getInvMass() * correction[1];
			}
			if (manifold.B.movable) 
			{
				manifold.B.px += manifold.B.getInvMass() * correction[0];
				manifold.B.py += manifold.B.getInvMass() * correction[1];
			}
		}

		
	}


	//only handles 2x1 matricies
	function dotProduct(matrix1, matrix2)
	{
		var result = (matrix1[0] * matrix2[0]) + (matrix1[1] * matrix2[1]);
		return result;
	}
}
