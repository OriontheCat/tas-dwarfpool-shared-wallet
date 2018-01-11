const request = require('snekfetch');
var MongoClient = require('mongodb').MongoClient;
var url = 'MONGODB_URI';
var walletData;
function recordWorkerData() {
  request.get('https://dwarfpool.com/eth/api?wallet=0x636508F54DB544e6BD1d17Ba5A4B8Bd73B5d6aEE')
    .then(r => {
      walletData = r.body;
      console.log(walletData)
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        if(walletData.)
        Object.keys(walletData.workers).forEach(function(key) {
          var worker = walletData.workers[key];
          if (key != '2130706433' && worker.alive) {
            var oldWalletShareAmount;
            db.collection("workers").find(key).toArray(function(err, result) {
              if (err) throw err;
              oldWalletShareAmount = result[0]
              MongoClient.connect(url, function(err, db) {
                db.collection("customers").updateOne({
                  name: key
                }, {
                  name: key,
                  walletShares: oldWalletShareAmount+worker.hashrate
                }, function(err, res) {
                  if (err) throw err;
                  db.close();
                });
              });
              db.close();
            });
          }
        });
      });
    })
}
setInterval(recordWorkerData, 2*60*1000)
