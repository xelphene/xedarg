
'use strict';

const {xedarg, xedargWrap} = require('xedarg');

function func1(a)
{
    return (
        `B=${JSON.stringify(a.boolArg)} ` +
        `I=${JSON.stringify(a.intArg)} ` +
        `S=${JSON.stringify(a.strArg)}`
    );
}
func1 = xedargWrap(func1, {addPropsOnWrapper:false});
func1[xedarg].args = `
boolArg          T F
#commentedArg    c d
# comment
intArg           2 3   # comment
strArg           as df
`;
func1[xedarg].rejects = `
boolArg=T intArg=3
boolArg=F intArg=2
`;

for( let rv of func1[xedarg].iterMapValid() )
    console.log(rv);

console.log(func1.args); // undefined
console.log(func1.iterMapValid); // undefined

func1({boolArg:true, intArg:2, strArg:'as'});

