@echo off
pushd data
	run IncreaseBuild.bat
popd
start src/current/TestInterface.html
