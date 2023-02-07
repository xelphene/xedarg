
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
func1.rejects = `
boolArg=T intArg=3
boolArg=F intArg=2
`;

func1({boolArg:true, intArg:2, strArg:'as'});
// OK: func1: boolArg=true intArg=2 strArg="a"

func1({boolArg:true, intArg:3, strArg:'as'});
// Exception: Invalid combination of values for boolArg, intArg per reject rule "boolArg=T intArg=3".

