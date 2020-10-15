const Discord = require("discord.js");
const config = require('./config.json');
const setTitle = require('node-bash-title');

process.on('unhandledRejection', error => {
  console.error(
    "There was an error! Did you update the config.json file?",
    error
  );
  process.exit();
});

setTitle('Level Automater');
var maxMessages = 10000;
var timeToWait = null, minTime = 61000, maxTime = 62000;
//var timeToWait = null, minTime = 5000, maxTime = 6000;
var content = null;
var prune = true;
setArgValues();

for (const token of config.botToken) {
  let count = 1; // Number of messages sent (modified by sendSpamMessage)
  const client = new Discord.Client();
  client.config = config;

  console.log("Loading please wait...");
  client.on('ready', () => {
    console.log(`Logged in to ${client.user.username}`);
  })

  try {
    client.on("message", async message => {
      // Ignore message if the content doesn't apply to us
      if (message.author.id !== client.user.id || message.content.indexOf(client.config.prefix) !== 0) return;
  
      const prefix = config.prefix;
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
      


      if (command === "start") {
        function sendSpamMessage() {  
          if (content) {
            message.channel.send(content);
          } else {
            //message.channel.send(".")
          }
          
          if (count < maxMessages) {
            // If you don't care about whether the messages are deleted or not, like if you created a dedicated server
            // channel just for bot spamming, you can remove the below statement and the entire prune command.
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            if (prune) message.channel.send("..");
            console.log("[" + time + "] Sent Message ==> [" + count + "]");
            count++;

            if (!timeToWait)
              timeToWait = Math.floor(Math.random() * (maxTime - minTime)) + minTime;
  
            setTimeout(sendSpamMessage, timeToWait);
          } else {
            message.channel.send("------------------");
            message.channel.send("Finished Grinding!");
            message.channel.send("------------------");
          }
        }
  
        message.delete().catch(console.error);
        sendSpamMessage();
      }
      
      if (command === ".") {
        message.channel.fetchMessages()
        .then(messages => {
          let message_array = messages.array();
          message_array.length = 1;
          message_array.map(msg => msg.delete().catch(O_o => {}));
        }).catch(console.error);
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        console.log("[" + time + "] Successfully deleted message!");
      }
    });
  } catch (error) {
    console.error("CAUGHT ERROR =>", error);
  }
  client.login(token);
}

function setArgValues() {
  // Get command line arguments
  var argLength = process.argv.length;
  for (let j = 2; j < argLength; j++) {
    // j is 2 initially to ignore `node bot.js`
    let argsLeft = j + 1 < argLength;
    let arg = process.argv[j];
    let nextArg = process.argv[j + 1];

    // All the flags require a second argument, so this only checks for flags if another arg exists
    if (argsLeft) {
      // TODO update docs and ensure proper typechecking and spit relevant error instead of running command
      if (arg == "--message") {
        content = nextArg;
      } else if (arg == "--maxMessages") {
        maxMessages = nextArg;
      } else if (arg == "--setTime") {
        timeToWait = nextArg;
      } else if (arg == "--maxTime") {
        maxTime = nextArg;
      } else if (arg == "--minTime") {
        minTime = nextArg;
      }
    } else {
      if (minTime && maxTime && minTime > maxTime) {
        console.error("minTime can't be greater than maxTime!");
        process.exit();
      }
    }

    // Doesn't require a second arg
    if (arg == "--prune") {
      prune = true;
    }
  }
}