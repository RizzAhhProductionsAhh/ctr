set x=%cd%
cd %~dp0\

if "%2" == "" (
	node ./ctr.js %*
	goto :OOP

)

set t=%1
set o=%2

if "%t:~0,1%" == "/" (
	set t=%t:~1%
)
if "%t:~0,2%" == "./" (
	set t=%t:~2%
)
if "%o:~0,1%" == "/" (
	set o=%o:~1%
)
if "%o:~0,2%" == "./" (
	set o=%o:~2%
)


node ctr.js "%x%\%t%" "%x%\%o%"


:OOP
cd %x%

