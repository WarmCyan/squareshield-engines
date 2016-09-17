//*************************************************************
//  File: CollisionManifold.js
//  Date created: 6/5/2015
//  Date edited: 6/5/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: Class that stores and computes information about
//    a collision between two objects
//*************************************************************

//takes only PHYSICS instances
function CollisionManifold(obj1, obj2)
{
	this.A = obj1;
	this.B = obj2;
	this.penetration = 0;
	this.normal = []; //the unit normal vector, points from obj1 towards obj2 (array, [0] = x,  [1] = y)

	this.generateBoxBoxManifold = function()
	{
		//Find the distances from the respective midpoint to left/right sides
		var aMidX = this.A.width / 2;
		var bMidX = this.B.width / 2;
		
		//Find the distances from the respective midpoint to top/bottom sides
		var aMidY = this.A.height / 2;
		var bMidY = this.B.height / 2;
		
		//get the vector from A's midpoint to B's midpoint
		var abVec = [];
		abVec[0] = (this.A.px + aMidX) - (this.B.px + bMidX);
		abVec[1] = (this.A.py + aMidY) - (this.B.py + bMidY);

		//calculate x-axis overlap: take the IDEAL DISTANCE between midpoints (if the perimeter of one was on the perimeter of the other) and subtract the ACTUAL DISTANCE between midpoints (found from the vector immediately above)
		var xIdealDistance = aMidX + bMidX; //ideal distance, if perimeter of one was exactly on perimeter of other, is just sum of distances from midpoints to sides.
		var xActualDistance = Math.abs(abVec[0]); //abs because we're dealing with a physical distance and want a positive result
		var xOverlap = xIdealDistance - xActualDistance;

		//calculate y-axis overlap: same as above
		var yIdealDistance = aMidY + bMidY;
		var yActualDistance = Math.abs(abVec[1]);
		var yOverlap = yIdealDistance - yActualDistance;

		if (xOverlap < yOverlap) //since going for smallest, go with xoverlap
		{
			if (abVec[0] < 0) //negative difference, b is on the RIGHT, point to the RIGHT
			{
				this.normal[0] = 1; //positive x direction
				this.normal[1] = 0; 
			}
			else //positive difference, b is on the LEFT, point to the LEFT
			{
				this.normal[0] = -1 //negative x direction
				this.normal[1] = 0;
			}
			this.penetration = xOverlap;
			//log("x penetration used: " + xOverlap);
		}
		else //yOverlap is smaller, so use it
		{
			if (abVec[1] < 0) //negative difference, b is ABOVE, so go UP
			{
				this.normal[0] = 0;
				this.normal[1] = 1; //positive y direction
			}
			else //positive difference, b is BELOW, so go DOWN
			{
				this.normal[0] = 0;
				this.normal[1] = -1; //negative y direction
			}
			this.penetration = yOverlap;
			//log("y penetration used: " + yOverlap);
		}
	}
}
