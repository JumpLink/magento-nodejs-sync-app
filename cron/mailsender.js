var execSync = require('execSync');
var config = require(__dirname+'/../config/config.js');
var general_conf = config.open(__dirname + "/../config/general.json");
var email   = require("emailjs");
var email_server  = email.server.connect(general_conf.email);
var execSync = require('execSync');

function send_mail(send_text) {
  if(typeof(send_text) !== "undefined" && send_text.length > 4) {
    console.log("Mail wird gesendet..");
    email_server.send({
       text:    send_text, 
       from:    "Admin <christopher@bugwelder.com>", 
       to:      "Christopher Heinecke <christopher@bugwelder.com>",
       subject: "Bugwelder Sync Unsyncable Itemnumbers"
    }, function(err, message) { console.log(err || message); });
  }
}

var send_text = "Folgende SKUs sollen zwar syncronisiert werden, dies funktioniert aber nicht, was soll'n das?!\nWillst du mich verwirren?! Bitte korrigieren!\n\n";
send_text += execSync.stdout('node ./magento_syncablecheck_all_products.js');
send_text += "\n\nLG, dein Server";

console.log(send_text);