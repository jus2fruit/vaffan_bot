const discord = require('discord.js');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const storeadatper = new FileSync('store.json');
const db = low(adapter)
db.defaults({ point: [], Inventory: []}).write()
const storedb = low(storeadatper)
const express = require('express');
const app = express();

var bot = new discord.Client();
var prefix = ("/");
var randnum = 0;

bot.on('ready', () => {
    bot.user.setPresence({ game: { name: '[/help] vaffan bot', type: 0}})
    console.log ("bot ready !")
});

bot.login('process.env.TOKEN');

bot.on ('message' , message => {
    if (message.content === "ping"){
        message.reply(":ping_pong:  pong !");
        console.log('ping pong !');

    }
    if (message.content === "bonne nuit"){
        message.reply("bonne nuit à toi")
        console.log('bonne nuit')
    }
    if (message.content === "test"){
        message.reply("tu test quoi la ?")
        console.log('test')
    }
    if (message.content === "bonjour"){
        message.reply("bonjour!")
        console.log('bonjour')
    }

    var msgauthor = message.author.id;

    if (message.author.bot)return;

    if (!db.get("Inventory").find({user: msgauthor}).value()){
         db.get("Inventory").push({user: msgauthor, items: "vide"}).write();
     }

    if (!db.get("point").find({user: msgauthor}).value()){
        db.get("point").push({user: msgauthor, point: 1}).write();
     }else{
         var userpointdb = db.get("point").filter({user: msgauthor}).find("point").value();
         console.log("userpointdb");
         var userpoint = Object.values(userpointdb)
         console.log(userpoint);
         console.log(`nombre de point : ${userpoint[1]}`)

         db.get("point").find({user: msgauthor}).assign({user: msgauthor, point: userpoint[1] += 1}).write();

     }

     if (!message.content.startsWith(prefix)) return;
     var args = message.content.substring(prefix.length).split(" ");

     switch (args[0].toLowerCase()){
         
        case "store":
        var store_embed = new discord.RichEmbed()
            .setColor('#E20000')
            .setTitle("vaffan store")
            .setDescription("voici le store mais il est pas fini alors gaspille pas tou t point ")
            .addField("couleur:", "rouge [100point][ID: item0001] description: pseudo rouge")
            .addField("couleur:", "bleu [150point][ID: item0002] description: pseudo bleu")
            .addField("couleur:", "aux choix [500point][ID: item0003] description: couleur pseudo aux choix")

        message.channel.send({embed: store_embed});
        console.log("store");

        break;

        case "buyitem":

        var itembuying = message.content.substr(9);
        if (!itembuying){
            itembuying = "Indeterminé !";
        }else{
            console.log(`StoreLogs: demande d'achat d'item ${itembuying}`)
            if (storedb.get("store_items").find({itemID: itembuying}).value()){
                console.log("Item trouvée")
                var info = storedb.get("store_items").filter({itemID: itembuying}).find("name", "desc").value();
                var iteminfo = Object.values(info);
                console.log(iteminfo);
                var buy_embed = new discord.RichEmbed()
                    .setTitle("vaffan store - facture d'achat")
                    .setDescription("attention ceci est une facture d'achat ! merci de votre achat")
                    .addField("Infos", `*ID:* ***${iteminfo[0]}***\n*Nom:* ***${iteminfo[1]}***\n*Description:* ***${iteminfo[2]}***\n*prix:* ***${iteminfo[3]}***`)
                
                message.author.send({embed: buy_embed});

                var useritem = db.get("Inventory").filter({user: msgauthor}).find("items").value();
                var itemsdb = Object.values(useritem);
                var userpointdb = db.get("point").filter({user: msgauthor}).find("point").value();
                var userpoint = Object.values(userpointdb);

                if (userpoint[1] >= iteminfo[3]){
                    message.reply(`***information:*** votre achat (${iteminfo[1]}) a été accépté. retrait de ${iteminfo[3]} point`)
                    if (!db.get("Inventory").filter({user: msgauthor}).find({user: "Vide"}).value()){
                    console.log("inventaire pas vide");
                    db.get("point").filter({user: msgauthor}).find("point").assign({user: msgauthor, point: userpoint[1] -= iteminfo[3]}).write();
                    db.get("Inventory").filter({user: msgauthor}).find("items").assign({user: msgauthor, items: itemsdb[1] + " , " + iteminfo[1]}).write();
                    }else{
                    console.log("inventaire vide !");
                    db.get("point").filter({user: msgauthor}).find("point").assign({user: msgauthor, point: userpoint[1] -= iteminfo[3]}).write();
                    db.get("Inventory").filter({user: msgauthor}).find("items").assign({user: msgauthor, items: iteminfo[1]}).write();
                    }
                }else{
                    message.reply("erreur de transactions! nombre de point insufisant !");

                }
            }
        }

        break;

        case "stats":

        var userpointdb = db.get("point").filter({user: msgauthor}).find("point").value();
        var userpoint = Object.values(userpointdb);
        var Inventorydb = db.get("Inventory").filter({user: msgauthor}).find("items").value();
        var Inventory = Object.values(Inventorydb);
        var usercreatedate = message.author.createdAt.toString().split(' ')

         var stats_embed = new discord.RichEmbed()
         .setTitle(`stats utilisateur : ${message.author.username}`)
         .addField("point",`${userpoint[1]} point`, true)
         .addField("user ID", msgauthor, true)
         .addField("inventaire", Inventory[1])
         .addField("date de création de l'utilisateur", usercreatedate[1] + ' ' + usercreatedate[2]+','+usercreatedate[3])
         .setThumbnail(message.author.avatarURL)

         message.author.send({embed: stats_embed})

        break;

     }


    if (message.content === prefix + "help"){
        var help_embed = new discord.RichEmbed()
           .setColor('#0132BC')
           .addField("commande du bot !", "   /help : affiche les commande du bot ! \n/point : vous dit votre nombre de point\n/helpmp : vous donne le help en mp\n/store : pour voir notre boutique\n/buyitem (item001)\n/stats : pour voir vos stats et votre inventaire")
           .addField("interaction",  "ping : vous dit vos ping \nbonne nuit : vous dit bonne nuit \nbonjour : vous dit bonjour ")
           .addField("questions pour le bot:", "comment va tu vaffan bot?")
           .addField("commande moderateur:", "^^warn : @lepseudo laraison \n^^warns @lepseudo : vous dit les warn de la perssone \n^^mute le temps @lepseudo \n!clear le nombre de message \ntout sa est à faire dans le channel #sanction " )
           .addField("enderbot commande:", ">i : ouvre l'inventaire ou crée votre conte\n>mine : mine pour 1 de mana\n>mineall : mine pour toute la mana\> ")
           message.channel.sendEmbed(help_embed);
        console.log("commande help demander !");
    }

    if (message.content === prefix + "helpmp"){
        message.reply("help envoyés")
        var helpmp_embed = new discord.RichEmbed()
           .setColor('#0132BC')
           .addField("commande du bot !", "   /help : affiche les commande du bot ! \n/point : vous dit votre nombre de point\n/helpmp : vous donne le help en mp\n/store : pour voir notre boutique\n/buyitem (item001)\n/stats : pour voir vos stats et votre inventaire")
           .addField("interaction",  "ping : vous dit vos ping \nbonne nuit : vous dit bonne nuit \nbonjour : vous dit bonjour ")
           .addField("questions pour le bot:", "comment va tu vaffan bot?")
           .addField("commande moderateur:", "^^warn : @lepseudo laraison \n^^warns @lepseudo : vous dit les warn de la perssone \n^^mute le temps @lepseudo \n!clear le nombre de message \ntout sa est à faire dans le channel #sanction " )
           .addField("enderbot commande:", ">i : ouvre l'inventaire ou crée votre conte\n>mine : mine pour 1 de mana\n>mineall : mine pour toute la mana\> ")
           message.author.sendEmbed(helpmp_embed);
        console.log("commande helpmp demander !");
    }


    if (message.content === "comment va tu vaffan bot?"){
        message.reply("oui je vais bien")
    }





    if (message.content === prefix + "point"){
       var point = db.get("point").filter({user: msgauthor}).find('point').value()
       var pointfinal = Object.values(point);
       var point_embed = new discord.RichEmbed()
         .setColor('#01FF3E')
         .setTitle(`point de ${message.author}`)
         .setDescription("voici tes point")
         .addField("point:", `${pointfinal[1]} point` )
    message.channel.send({embed: point_embed});
    }

});
