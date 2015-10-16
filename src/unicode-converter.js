var util = require('util');
var Transform = require('stream').Transform;
util.inherits(UnicodeConvertStream, Transform);

if (typeof String.prototype.startsWith != 'function') {
  // add startsWith() http://stackoverflow.com/a/646643/589184
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

function UnicodeConvertStream(options) {
    if(!(this instanceof UnicodeConvertStream)) {
        return new UnicodeConvertStream(options);
    }
    this.map = {}
    var rules = options.map.split('\n');
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.startsWith("#")) {
            continue;
        }
        var lhs = rule.split('=')[0];
        var rhs = rule.split('=')[1];
        this.map[lhs]=rhs;
    }
    this.map['\n']='\n';
    this.map[' ']=' ';
    this.charBuffer = '';
    this.baseBuffer = '';
    this.maxWidthLHS = 3;
    this.postBase = options.postBase;
    Transform.call(this);
}

UnicodeConvertStream.prototype._transform = function (chunk, encoding, callback) {
    this.charBuffer = this.charBuffer + chunk;
    processingLoop:
    while (this.charBuffer != '') {
        this.charBegin = this.charBuffer;

        // check and push checks if the first @charSize characters of the charBuffer has a map entry. If yes, it slices that part from the charBuffer and pushes the corresponding RHS to output
        var checkandpush = function(charSize) {
            if (this.map[this.charBuffer.slice(0, charSize)] != undefined) {
                this._pushBuffer(this.map[this.charBuffer.slice(0, charSize)]);
                this.charBuffer = this.charBuffer.slice(charSize);
                return true;
            } else {
                return false;
            }
        }

        // This loop calls checkandpush for ..., 3, 2, 1 chars from charBuffer so that the largest match can be mapped first.
        // For example, in Ambili, C=ഇ, Cu=ഈ. We would want to see if C is followed by u before converting it to ഇ.
        for (var currLHSwidth = this.maxWidthLHS; currLHSwidth >= 1; currLHSwidth--) {
            if (this.charBuffer.length >= currLHSwidth) {
                if (checkandpush.call(this, currLHSwidth)) {
                    continue processingLoop;
                }
            }
        }
        // If we've gone through the loop without slicing the charBuffer even once, that means the character is undecodable. So let's just output the same.
        if (this.charBegin == this.charBuffer) {
            this._pushBuffer(this.charBuffer.slice(0,1));
            this.charBuffer = this.charBuffer.slice(1);
        }
    }
    callback();
}

UnicodeConvertStream.prototype._pushBuffer = function(char) {
    if (this.postBase.indexOf(char) >= 0) {
        this.baseBuffer = this.baseBuffer + char;
    } else {
        this.push(char);
        if (this.baseBuffer != '') {
            this.push(this.baseBuffer);
            this.baseBuffer = '';
        }
    }
}

module.exports = UnicodeConvertStream;
