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
    Transform.call(this, options);
}

UnicodeConvertStream.prototype._transform = function (chunk, encoding, callback) {
    chunk = chunk.toString();
    for (var i = 0; i < chunk.length; i++) {
        var unicodeChunk = this.map[chunk[i]];
        this.push(unicodeChunk);
    }
    callback();
}

module.exports = UnicodeConvertStream;
