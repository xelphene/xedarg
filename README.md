
# Overview

xedarg is a Javascript utilty for functions that take discrete named arguments.

It can automatically validate, upcast and enumerate possible valid arguments
to a function that it wraps.

# Useage

## Basic

Basic validation:

```
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
boolArg          T F   # converted to boolean
#commentedArg    c d
# comment
intArg           2 3   # converted to numeric
strArg           as df
`;

func1({boolArg:true, intArg:2, strArg:'as'});
// func1: boolArg=true intArg=2 strArg="a"

func1({boolArg:true, intArg:2, strArg:'qwer'});
// Error: Invalid value for argument "strArg". Valid values are "as", "df".
```

## Rejecting certain combinations

Certain combinations of arguments can be declared invalid:

```
...
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

func1({boolArg:true, intArg:2});
// OK: func1: boolArg=true intArg=2 strArg="a"

func1({boolArg:true, intArg:3});
// Exception: Invalid combination of values for boolArg, intArg per reject rule "boolArg=T intA
```

## Defaults

The first option in the argument specification is assumed to be a default
value.

```
...
func1({intArg:3});
// func1: boolArg=true intArg=3 strArg="as"

console.log( func1.getDefaults() );
// { boolArg: true, intArg: 2, strArg: 'as' }
```

## Enumeration / Map

xedarg can enumerate all possible combinations of valid arguments:

```
...
for( let a of func1.permuteValidArgs() )
    console.log(a);
// { boolArg: true, intArg: 2, strArg: 'as' }
// { boolArg: true, intArg: 2, strArg: 'df' }
// { boolArg: false, intArg: 3, strArg: 'as' }
// { boolArg: false, intArg: 3, strArg: 'df' }
```

And invoke the wrapped function for all possible valid arguments (i.e. map
all valid argument values onto the function):

```
'use strict';

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
```

## Access via Symbol property only

xedarg can add it's properties and methods exclusively as a Symbol on the
wrapped function instead, if desired:

```
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
// works as before
```

# Argument Specification Type Conversion

In the argument specification (the "args" property), the following strings
will be converted to the following values:

T: boolean: true
F: boolean: false
N: null
/^[0-9]+$/: number

# Copyright and License

Copyright (C) 2023 Steve Benson

See the LICENSE file for license info.
