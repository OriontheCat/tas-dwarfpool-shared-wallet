const request = require('snekfetch');
var MongoClient = require('mongodb').MongoClient;
const Discord = require("discord.js");
const client = new Discord.Client();
client.login(process.env.DISCORD_TOKEN);
var url = process.env.MONGODB_URI;
var walletData;
var express = require('express');
var app     = express();
app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});
function recordWorkerData() {
  request.get('https://dwarfpool.com/eth/api?wallet=0x636508F54DB544e6BD1d17Ba5A4B8Bd73B5d6aEE')
    .then(r => {
      walletData = r.body;
      console.log("walletData: "+ JSON.stringify(walletData))
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        if (typeof walletData.last_payment_date != 'null' && (new Date().getTime() - new Date(walletData.last_payment_date).getTime()) < 2.1 * 60 * 1000) {
          client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
          });
          client.on('ready', msg => {
            var shares = "";
            db.collection("customers").find({}).toArray(function(err, result) {
              if (err) throw err;
              shares = result.toString;
              client.servers.guilds.get('400864008858763264').channels.get('400864008858763266').send(shares)
              db.close();
            });
          });
          db.foo.updateMany({}, {
            $set: {
              walletShares: Date.now() / 1000
            }
          })
        }
        Object.keys(walletData.workers).forEach(function(key) {
          var worker = walletData.workers[key];
          if (key != '2130706433' && worker.alive) {
            var oldWalletShareAmount;
            db.collection("workers").find({name: key}).toArray(function(err, result) {
              if (err) throw err;
              oldWalletShareAmount = result[0]
              MongoClient.connect(url, function(err, db) {
                console.log("walletShareTest: "+ JSON.stringify(oldWalletShareAmount) + worker.hashrate)
                db.collection("customers").updateOne({
                  name: key
                }, {
                  name: key,
                  walletShares: oldWalletShareAmount + worker.hashrate
                }, function(err, res) {
                  console.log(res)
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
recordWorkerData();
setInterval(recordWorkerData, 2 * 60 * 1000)
