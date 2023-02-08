
'use strict';

const xedarg = Symbol('discargval');
exports.xedarg = xedarg;
const {entriesToObject, permuteList} = require('./permute');

class InvalidArgsComboError extends Error
{
    constructor(argKeys, ruleStr) 
    {
        let m = `Invalid combination of values for ${argKeys.join(', ')} per reject rule ${JSON.stringify(ruleStr)}.`;
        super(m);
    }
}

class InvalidArgValueError extends Error
{
    constructor(argKey, domainValues)
    {
        let dv = domainValues.map( v => JSON.stringify(v) ).join(', ');
        super(`Invalid value for argument ${JSON.stringify(argKey)}. Valid values are ${dv}.`);
    }
}

function upcastValue (v) {
    if( /^[0-9]+$/.test(v) )
        return parseInt(v);
    switch (v) {
        case 'T':
            return true;
        case 'F':
            return false;
        case 'N':
            return null;
        default:
            return v;
    }
}

const upcastValues = vs => vs.map( v => upcastValue(v) );

function * iterConfLines(s)
{
    var lineno=0;
    for( let line of s.split('\n') )
    {
        lineno++;
        if( line.startsWith('#') )
            continue;
        // strip trailing comments
        line = line.split('#')[0];
        // strip leading/trailing whitespace
        line = line.replace(/^\s+/,'').replace(/\s+$/,'');
        if( line=='' ) continue;
        
        yield [line, lineno];
    }
}

function parseRejectRules(s)
{
    var rejectRules = [];

    for( let [line, lineno] of iterConfLines(s) )
    {
        let clauses = {};
        for( let clause of line.split(/\s+/) )
        {
            let cparts = clause.split('=');
            if( cparts.length != 2 )
                throw new Error(`Invalid reject rule ${JSON.stringify(line)} on line ${lineno}`);
            
            clauses[cparts[0]] = upcastValue( cparts[1] );
        }
        rejectRules.push({
            def: line,
            clauses,
        });
    }
    
    return rejectRules;
}

function parseArgs(s)
{
    var args = {};
    
    for( let [line, lineno] of iterConfLines(s) )
    {
        var parts = line.split(/\s+/);
        if( parts.length < 2 )
            throw new Error(`at least 2 parts required in each opt spec on line ${lineno}`);
        
        let optName = parts[0];
        
        if( args.hasOwnProperty(optName) )
            throw new Error(`duplicate option name on line ${lineno}`);
        
        let optValues = parts.slice(1);
        optValues = upcastValues(optValues);

        args[optName] = { domain: optValues };
    }
    
    return args;
}

function validate( input, argSpec )
{
    // TODO: broken for custom class
    //input = Object.assign({}, input);
    // maybe copy by doing:
    //  var input2 = argSpec.getDefaults();
    //  for( let k of Object.keys(input) )
    //    input2[k] = input[k];
    // for now just modify in place
    
    // fill in defaults
    for( let k of Object.keys(argSpec.args) )
        if( input[k]===undefined )
            input[k] = argSpec.args[k].domain[0];
            
    // ensure arg values are in-domain
    for( let k of Object.keys(input) )
    {
        if( argSpec.args.hasOwnProperty(k) )
        {
            if( ! argSpec.args[k].domain.includes(input[k]) )
                //throw new Error(`Invalid value for arg "${k}"`);
                throw new InvalidArgValueError(k, argSpec.args[k].domain);
        }
        else {
            if( ! argSpec.allowExtra )
                throw new Error(`no such arg "${k}"`);
        }
    }
    
    for( let rejectRule of argSpec.rejects )
    {
        let clauseKeys = Object.keys(rejectRule.clauses);

        let reject = clauseKeys
            .map( k => input[k] == rejectRule.clauses[k] )
            .reduce( (a,b) => a && b );
        
        if( reject )
            throw new InvalidArgsComboError(clauseKeys, rejectRule.def);
    }

    return input;
}

class ArgSpec {
    constructor () {
        this._args = {};
        this._rejects = [];
        this.allowExtra = false;
        this._defaults = undefined;
        this._makeNewArgObj = () => new Object();
    }
    
    setArgs(s) { this._args = parseArgs(s); }
    get args () { return this._args }
    set args (s) { this.setArgs(s) }
    
    setRejects(s) { this._rejects = parseRejectRules(s); }
    set rejects (s) { this.setRejects(s) }
    get rejects () { return this._rejects }

    set customArgClass (c) { this._makeNewArgObj = () => new c(); }
    
    set makeNewArgObj (f)  { this._makeNewArgObj = f }
    get makeNewArgObj ()   { return this._makeNewArgObj }

    getDefaults () 
    {
        var d = this._makeNewArgObj();
        for( let k of Object.keys(this._args) )
            d[k] = this._args[k].domain[0];
        return d;
    }
    
    * permuteAllArgs () {
        var ae = Object.entries(this._args).map(
            e => [e[0], e[1].domain]
        );
        for( let i of permuteList(ae) )
            yield entriesToObject(i);
    }
    
    * permuteValidArgs () {
        for( let a of this.permuteAllArgs() ) 
        {
            try {
                validate(a, this);
                yield a;
            } catch(e) {
            }
        }
    }
    
    countValidArgs () {
        var c=0;
        for( let a of this.permuteValidArgs () )
            c++;
        return c;
    }
}

function wrap(origFunc, opts)
{
    if( opts===undefined )
        opts = {
            addPropsOnWrapper: true
        };
    
    var argSpec = new ArgSpec();

    var wrapperFunc = function(a) {
        if( a===undefined )
            throw new Error(`No argument provided`);
        a = validate(a, argSpec);
        return origFunc(a);
    }

    function addAPI(api)
    {
        api.getDefaults = () => argSpec.getDefaults();
    
        Object.defineProperty(api, 'args', {
            set: s  => argSpec.args = s,
            get: () => argSpec.args,
            enumerable: true,
        });
    
        Object.defineProperty(api, 'rejects', {
            set: s  => argSpec.rejects = s,
            get: () => argSpec.rejects,
            enumerable: true,
        });
    
        api.iterMapValid = function * () {
            for( let a of argSpec.permuteValidArgs() ) {
                yield wrapperFunc(a);
            }
        }
    
        api.permuteValidArgs = function * () {
            for( let a of argSpec.permuteValidArgs() )
                yield a;
        }
    
        api.countValidArgs = function () {
            return argSpec.countValidArgs();
        }
    }
    
    if( opts.addPropsOnWrapper )
        addAPI(wrapperFunc);

    wrapperFunc[xedarg] = {};
    addAPI(wrapperFunc[xedarg]);
    
    return wrapperFunc;
}
exports.xedargWrap = wrap;
