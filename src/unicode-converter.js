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
    this.postBase = options.postBase;
    Transform.call(this, options);
}

UnicodeConvertStream.prototype._transform = function (chunk, encoding, callback) {
    var push = function(that, char) {
        if (that.postBase.indexOf(char) >= 0) {
            that.baseBuffer = that.baseBuffer + char;
        } else {
            that.push(char);
            if (that.baseBuffer != '') {
                that.push(that.baseBuffer);
                that.baseBuffer = '';
            }
        }
    }
    chunk = chunk.toString();
    this.charBuffer = this.charBuffer + chunk;
    console.log(this.charBuffer);
    while (this.charBuffer != '') {
        this.charBegin = this.charBuffer;
        if (this.charBuffer.length > 2) {
            // if there's a mapping for a 3 char slice
            if (this.map[this.charBuffer.slice(0,3)] != undefined) {
                push(this, this.map[this.charBuffer.slice(0,3)]);
                this.charBuffer = this.charBuffer.slice(3);
                continue;
            }
        }
        if (this.charBuffer.length > 1) {
            if (this.map[this.charBuffer.slice(0,2)] != undefined) {
                push(this, this.map[this.charBuffer.slice(0,2)]);
                this.charBuffer = this.charBuffer.slice(2);
                continue;
            }
        }
        if (this.charBuffer.length > 0) {
            if (this.map[this.charBuffer.slice(0,1)] != undefined) {
                push(this, this.map[this.charBuffer.slice(0,1)]);
                this.charBuffer = this.charBuffer.slice(1);
                continue;
            } else {
                if (this.charBegin == this.charBuffer) {
                    console.log('could not decode' + this.charBuffer.slice(0,1));
                    push(this, this.charBuffer.slice(0,1));
                    this.charBuffer = this.charBuffer.slice(1);
                }
            }
        }
    }
    callback();
}

module.exports = UnicodeConvertStream;
