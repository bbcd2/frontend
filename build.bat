@echo off
rem create output folder
mkdir ..\output
mkdir ..\output\frontend
rem copy the build directory and the package.json file to the temp folder
xcopy /E /I build ..\output\frontend
copy package.json ..\output\frontend