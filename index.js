const request = require('snekfetch');
var MongoClient = require('mongodb').MongoClient;
const Discord = require("discord.js");
const client = new Discord.Client();
client.login('DISCORD_TOKEN');
var url = 'MONGODB_URI';
var walletData;

function recordWorkerData() {
  request.get('https://dwarfpool.com/eth/api?wallet=0x636508F54DB544e6BD1d17Ba5A4B8Bd73B5d6aEE')
    .then(r => {
      walletData = r.body;
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        if (typeof walletData.last_payment_date != 'null' && (new Date().getTime() - Date.parse(walletData.last_payment_date).getTime()) < 2.1 * 60 * 1000) {
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
            db.collection("workers").find(key).toArray(function(err, result) {
              if (err) throw err;
              oldWalletShareAmount = result[0]
              MongoClient.connect(url, function(err, db) {
                db.collection("customers").updateOne({
                  name: key
                }, {
                  name: key,
                  walletShares: oldWalletShareAmount + worker.hashrate
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
setInterval(recordWorkerData, 2 * 60 * 1000)
