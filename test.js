var unicoderter = require('./src/unicode-converter');

var unicoder = new unicoderter({
        map: '#Ambili Font map for Payyans\n#http://download.savannah.gnu.org/releases/smc/payyans\n#Copyright 2009 Zyxware (www.zyxware.com)\n#Copyright 2008 SMC (www.smc.org.in)\n#Licensed under GPLv3\n#Contact discuss@lists.smc.org.in for bug reports\nw=ം\nx=ഃ\nA=അ\nB=ആ'
    });

unicoder.pipe(process.stdout);
unicoder.write('wxAB');
unicoder.end();
