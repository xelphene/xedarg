
'use strict';

const {xedargWrap} = require('xedarg');

function func1(a)
{
    console.log(
        `func1: ` +
        `boolArg=${JSON.stringify(a.boolArg)}` +
        ` intArg=${JSON.stringify(a.intArg)}` +
        ` strArg=${JSON.stringify(a.strArg)}`
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

func1({intArg:3});
// func1: boolArg=true intArg=3 strArg="as"

console.log( func1.getDefaults() );
// { boolArg: true, intArg: 2, strArg: 'as' }

