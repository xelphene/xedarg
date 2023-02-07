
'use strict';

const {xedargWrap} = require('xedarg');

function func1(a)
{
    return (
        `B=${JSON.stringify(a.boolArg)} ` +
        `I=${JSON.stringify(a.intArg)} ` +
        `S=${JSON.stringify(a.strArg)}`
    );
}
func1 = xedargWrap(func1);
func1.args = `
boolArg          T F
#commentedArg    c d
# comment
intArg           2 3   # comment
strArg           as df
`;
func1.rejects = `
boolArg=T intArg=3
boolArg=F intArg=2
`;

for( let rv of func1.iterMapValid() )
    console.log(rv);
// B=true I=2 S="as"
// B=true I=2 S="df"
// B=false I=3 S="as"
// B=false I=3 S="df"
