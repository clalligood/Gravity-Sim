
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// the "main" code begins here
var friction = 1;

var socket = io.connect("http://76.28.150.193:8888");

socket.on("load", function (data) {
    console.log(data);
});

var loadData;
socket.emit("load", { studentname: "Collin Alligood", statename: "theGameState12331123" });
socket.on("load", function (data) {
    loadData = data;
});

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/radpills.png");

window.onload = function () {
    ASSET_MANAGER.downloadAll(function () {
        var canvas = document.getElementById('gameWorld');
        var ctx = canvas.getContext('2d');


        var gameEngine = new GameEngine();
        //Populate the world with land
        var particle;
        for (var i = 0; i < 50; i++) {
            particle = new Particle(gameEngine, null);
            gameEngine.addEntity(particle);
        }

        gameEngine.init(ctx);
        gameEngine.start();

        document.getElementById('save').addEventListener("click", function(){
            var data = [];
            var game = gameEngine.entities[0].game;
            for(var i = 0; i < gameEngine.entities.length; i++) {
                var ent = gameEngine.entities[i];
                ent.game = null;
                data.push(ent);
            }
            console.log("Saved");
            socket.emit("save", { studentname: "Collin Alligood", statename: "theGameState12331123", data: data});
            socket.emit("load", { studentname: "Collin Alligood", statename: "theGameState12331123" });

            for(var i = 0; i < gameEngine.entities.length; i++) {
                var ent = gameEngine.entities[i];
                ent.game = game;
            }
        });

        document.getElementById('load').addEventListener("click", function() {
            socket.emit("load", { studentname: "Collin Alligood", statename: "theGameState12331123"});

            //Clear our world
            for(var i = 0; i < gameEngine.entities.length; i++) {
                gameEngine.entities[i].removeFromWorld = true;
            }
            gameEngine.update();

            console.log(loadData);
            for(var i = 0; i < loadData.data.length; i++) {
                var ent = loadData.data[i];
                ent.game = gameEngine;
                gameEngine.addEntity(new Particle(gameEngine, ent));
            }
            console.log("loaded");
        });
    });
}