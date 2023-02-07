
'use strict';

const {xedargWrap} = require('xedarg');

function func1(a)
{
    // ...
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

for( let a of func1.permuteValidArgs() )
    console.log(a);
// { boolArg: true, intArg: 2, strArg: 'as' }
// { boolArg: true, intArg: 2, strArg: 'df' }
// { boolArg: false, intArg: 3, strArg: 'as' }
// { boolArg: false, intArg: 3, strArg: 'df' }
