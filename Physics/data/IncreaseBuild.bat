@echo off

set /p currentBuild=<"Build.dat"
set /a newBuild=%currentBuild% + 1

echo | set /p dummy="%newBuild%" > "Build.dat"
echo Updated build to %newBuild%
