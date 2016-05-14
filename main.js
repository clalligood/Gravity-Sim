
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
   // var human = new Human(gameEngine);
   // circle.setIt();
   // gameEngine.addEntity(circle);
    var human;
    for (var i = 0; i < 12; i++) {
        human = new Human(gameEngine);
        gameEngine.addEntity(human);
    }

    // Populate the world with resources
    var resource;
    for (var i = 0; i < 12; i++) {
        resource = new Resource(gameEngine);
        gameEngine.addEntity(resource);
    }

    //Populate the world with land
    var land;
    for (var i = 0; i < 5; i++) {
        land = new Land(gameEngine);
        gameEngine.addEntity(land);
    }

    gameEngine.init(ctx);
    gameEngine.start();
});
