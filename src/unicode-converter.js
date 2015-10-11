var util = require('util');
var Transform = require('stream').Transform;
util.inherits(UnicodeConvertStream, Transform);

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
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
    this.charBuffer = '';
    Transform.call(this, options);
}

UnicodeConvertStream.prototype._transform = function (chunk, encoding, callback) {
    chunk = chunk.toString();
    this.charBuffer = this.charBuffer + chunk;
    while (this.charBuffer != '') {
        if (this.charBuffer.length > 2) {
            // if there's a mapping for a 3 char slice
            if (this.map[this.charBuffer.slice(0,3)] != undefined) {
                this.push(this.map[this.charBuffer.slice(0,3)]);
                this.charBuffer = this.charBuffer.slice(3);
                continue;
            }
        }
        if (this.charBuffer.length > 1) {
            if (this.map[this.charBuffer.slice(0,2)] != undefined) {
                this.push(this.map[this.charBuffer.slice(0,2)]);
                this.charBuffer = this.charBuffer.slice(2);
                continue;
            }
        }
        if (this.charBuffer.length > 0) {
            if (this.map[this.charBuffer.slice(0,1)] != undefined) {
                this.push(this.map[this.charBuffer.slice(0,1)]);
                this.charBuffer = this.charBuffer.slice(1);
                continue;
            } else {
                break;
            }
        }
    }
    callback();
}

module.exports = UnicodeConvertStream;
