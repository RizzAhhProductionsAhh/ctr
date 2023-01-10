set strvar=yoo

echo %strvar%>x&FOR %%? IN (x) DO SET /A strlength=%%~z? - 2&del x

echo %strlength%

set s=%strvar:~1,%strlength%%

echo %s%