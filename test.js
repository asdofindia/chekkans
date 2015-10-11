var unicoderter = require('./src/unicode-converter');
var fs = require('fs');

var map = fs.readFileSync('ambili.map', 'utf8');

var unicoder = new unicoderter({
        map: map,
        postBase: ["െ", "േ"]
    });

unicoder.pipe(process.stdout);
unicoder.write('wxAB');
unicoder.write('Fs¥ms°tbm F¥mhpsat¥m  ??*$%^&*');
unicoder.end();
