//*************************************************************
//  File: TestInterface.js
//  Date created: 6/23/2015
//  Date edited: 6/23/2015
//  Author: Nathan Martindale
//  Copyright © 2015 Digital Warrior Labs
//  Description: script that handles the thing
//*************************************************************

window.onload = startup;

var drawing;
var result;
var secondResult;
var height;
var width;
var letter;

function startup()
{
	//get html elements
	drawing = document.getElementById("drawing");
	result = document.getElementById("result");
	secondResult = document.getElementById("secondResult");
	height = document.getElementById("height");
	width = document.getElementById("width");
	letter = document.getElementById("letter");


	//populate table
	populateTable();
	

	
}
//className

function populateTable()
{
	drawing.innerHTML = "";
	
	for (var y = 0; y < parseInt(height.value); y++)
	{
		//tr
		var newTr = document.createElement('tr');
		for (var x = 0; x < parseInt(width.value); x++)
		{
			var newTd = document.createElement('td');
			newTd.setAttribute('style',"height: 20px; width: 20px;");
			newTd.className = "white";
			newTd.addEventListener("click", clickCell, false);
			newTr.appendChild(newTd);
		}
		drawing.appendChild(newTr);
	}
}

function clickCell()
{
	if (this.className == "white") { this.className = "black"; }
	else { this.className = "white"; }
}


function save()
{
	var trList = document.getElementsByTagName("tr");

	result.value += "var " + letter.value + " = [";
	

	for (var i = 0; i < trList.length; i++)
	{
		result.value += "\n\t[";
		var tdList = trList[i].children; //cells?
		for (var j = 0; j < tdList.length; j++)
		{
			if (tdList[j].className == "black") { result.value += "1"; }
			else { result.value += "0"; }

			if (j != tdList.length - 1) { result.value += ","; }
		}
		result.value += "]";
		if (i != trList.length - 1) { result.value += ","; }
	}

	result.value += "\n];\n"

	secondResult.value += "\nalphabet[\"" + letter.value + "\"] = new Symbol(\"" + letter.value + "\", " + letter.value + ");";
	
}

