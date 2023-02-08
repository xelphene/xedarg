
'use strict';

function entriesToObject(e) 
{
    var n = {};
    for( let a of e )
        n[a[0]] = a[1];
    return n;
}
exports.entriesToObject = entriesToObject;

// p == [ [ 'sa',   [ true, false ] ],
//        [ 'full', [ true, false ] ],
//        [ 'x',    [ 'a', 'b', 'c' ] ] ]
function * permuteList(p)
{
    var myKey  = p[0][0];
    var myVals = p[0][1];
    
    for( let v of myVals ) {
        if( p.length>1 )
            for( let u of permuteList(p.slice(1)) )
                yield [ [myKey,v] ].concat(u)
        else
            yield [ [myKey,v] ];
    }
}
exports.permuteList = permuteList;

// p == {
//        sa:   [true,false],
//        full: [true,false],
//        x:    ['a','b','c'],
//      }
function * permuteObject(p)
{
    for( let i of permuteList(Object.entries(p)) )
    {
        let o = entriesToObject(i);
        yield o;
    }
}
exports.permuteObject = permuteObject;

function main () {
    var sov = {
        sa: [true,false],
        full: [true,false],
        x: ['a','b','c'],
    };
    
    for( let i of permuteObject(sov) )
        console.log(i);
}

if( require.main===module )
    main();
