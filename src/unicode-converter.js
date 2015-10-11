var util = require('util');
var Transform = require('stream').Transform;
util.inherits(UnicodeConvertStream, Transform);

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
    var unicodeChunk = this.map[chunk.toString()];
    this.push(unicodeChunk);
    callback();
}

module.exports = UnicodeConvertStream;
