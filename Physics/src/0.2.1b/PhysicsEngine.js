//*************************************************************
//  File: PhysicsEngine.js
//  Date created: 6/4/2015
//  Date edited: 6/16/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Javascript class for the engine itself, which takes
//    care of handling the collisions and movements of all objects
//    that have physcial properties
//*************************************************************

function PhysicsEngine()
{
	//physics engine constants
	var CORRECTION_PERCENT = .3; //.2
	var CORRECTION_SLOP = .001; //.001
	var MAX_PENETRATION = 10;
	var VELOCITY_CLAMP = .00001;
	var MAXIMUM_TIME_TIC = 25; //basically means that if the dt is passed in as something greater than 25ms (less than 40 fps), SLOW SIMULATION DOWN, to reduce amount of glitches between objects (and flying out of bounds)

	this.ticClamped = false;

	this.entities = [];
	
	this.collisionSets = []; //collection of CollisionManifolds

	this.updatePhysics = function(dt)
	{
		//frame tic time clamping
		if (dt > MAXIMUM_TIME_TIC) { dt = 25; this.ticClamped = true; }
		else { this.ticClamped = false; }
		
		//check for collisions
		var collisionIndex = 0;
		for (var i = 0; i < this.entities.length; i++)
		{
			for (var j = i + 1; j < this.entities.length; j++)
			{
				var obj1 = this.entities[i].physics;
				var obj2 = this.entities[j].physics;

				var collision = this.detectCollision(obj1, obj2);
				if (collision) 
				{ 
					//CHECK if engine container has the event function and if so call it.
					/*if (typeof physEvent_Collision == "function")
					{
						var kineticEnergyOn1 = (obj2.physics.mass * obj2.physics.
					}*/
					
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
			//CLAMP VELOCITIES
			var velX = Math.abs(this.entities[i].physics.vx);
			var velY = Math.abs(this.entities[i].physics.vy);
			if (velX < VELOCITY_CLAMP && velX > 0) { this.entities[i].physics.vx = 0;  }
			if (velY < VELOCITY_CLAMP && velY > 0) { this.entities[i].physics.vy = 0; }

			//update
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

		//if objects already moving away from eachother, ignore
		if (normalVelocity < 0) { return; }

		//NOTE: tutorial said to use minimum restitution, I think it makes more sense to average them
		//get minimum restitution and use it
		/*var e = 1;
		if (manifold.A.restitution < manifold.B.restitution) { e = manifold.A.restitution; }
		else { e = manifold.B.restitution; }*/

		//get average restitution
		var e = (manifold.A.restitution + manifold.B.restitution) / 2;

		//calculate impulse scalar (impulse = Mass * Delta V)
		var j = (-(1 + e) * normalVelocity) / (manifold.A.getInvMass() + manifold.B.getInvMass());

		//apply that impulse based on normal unit vector
		var impulse = [];
		impulse[0] = j * manifold.normal[0];
		impulse[1] = j * manifold.normal[1];
		//impulse[0] = j * manifold.normal[0] * (manifold.penetration / 5);
		//impulse[1] = j * manifold.normal[1] * (manifold.penetration / 5);
		//if (manifold.penetration > 5) { log("penetration: " + manifold.penetration); }
		/*if (manifold.penetration > (manifold.A.width / 4) || manifold.penetration > (manifold.B.width / 4)) 
		{ 
			log("GREAT PENETRATION"); 
			impulse[0] *= 2;
			impulse[1] *= 2;
		}*/

		//change velocities based on normal
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
			
			if (manifold.penetration > MAX_PENETRATION)
			{
				//log("MAX PENETRATION REACHED, dampening velocities");
				correction[0] = manifold.normal[0] * (manifold.penetration - MAX_PENETRATION + 1);
				correction[1] = manifold.normal[1] * (manifold.penetration - MAX_PENETRATION + 1); 
				//dampen velocities?
				/*manifold.A.vx /= 5;
				manifold.A.vy /= 5;
				manifold.B.vx /= 5;
				manifold.B.vy /= 5;*/
				/*manifold.A.vx /= 1.1;
				manifold.A.vy /= 1.1;
				manifold.B.vx *= 1.1;
				manifold.B.vy *= 1.1;*/
			}

			if (manifold.A.movable) 
			{
				manifold.A.px -= /*manifold.A.getInvMass() */ correction[0];
				manifold.A.py -=/* manifold.A.getInvMass() */ correction[1];
			}
			if (manifold.B.movable) 
			{
				manifold.B.px += /*manifold.B.getInvMass() */ correction[0];
				manifold.B.py += /*manifold.B.getInvMass() */ correction[1];
			}
		}

		//FRICTION STUFFS
		
		//recalculate relative velocity
		relativeVelocity = [];
		relativeVelocity[0] = manifold.A.vx - manifold.B.vx;
		relativeVelocity[1] = manifold.A.vy - manifold.B.vy;

		//get the tangent vector
		var tangent = [];
		tangent[0] = relativeVelocity[0] - dotProduct(relativeVelocity, manifold.normal) * manifold.normal[0];
		tangent[1] = relativeVelocity[1] - dotProduct(relativeVelocity, manifold.normal) * manifold.normal[1];
		
		//normalize the tangent vector
		//tangent[0] *= manifold.normal[1];
		//tangent[1] *= manifold.normal[0];
		//log("tan0 " + tangent[0]); //LEAVE IN ONLY FOR LAG TESTING
		//log("tan1 " + tangent[1]);
		
		//get magnitude to apply along friction vector
		var jt = -dotProduct(relativeVelocity, manifold.normal);
		jt = jt / (manifold.A.getInvMass() + manifold.B.getInvMass());
		//log("mag: " + jt);
		//log("altmag: " + j);
		
		var frictionImpulse = [];
		dynFric = (manifold.A.friction + manifold.B.friction) / 2;
		//frictionImpulse[0] = j * dynFric * tangent[0];
		//frictionImpulse[1] = j * dynFric * tangent[1];
		frictionImpulse[0] = (-jt * dynFric * 10) * tangent[0] + (-dynFric) * tangent[0];
		frictionImpulse[1] = (-jt * dynFric * 10) * tangent[1] + (-dynFric) * tangent[1];
		
		//apply friction impulse
		manifold.A.vx += manifold.A.getInvMass() * frictionImpulse[0];
		manifold.A.vy += manifold.A.getInvMass() * frictionImpulse[1];
		manifold.B.vx -= manifold.B.getInvMass() * frictionImpulse[0];
		manifold.B.vy -= manifold.B.getInvMass() * frictionImpulse[1];
	}


	//only handles 2x1 matricies
	function dotProduct(matrix1, matrix2)
	{
		var result = (matrix1[0] * matrix2[0]) + (matrix1[1] * matrix2[1]);
		return result;
	}
}
