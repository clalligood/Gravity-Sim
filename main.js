
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// the "main" code begins here
var friction = 1;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/radpills.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();

    // var largeBody;
    // for (var i = 0; i < 1; i++) {
    //     largeBody = new LargeBody(gameEngine);
    //     gameEngine.addEntity(largeBody);
    // }

    //Populate the world with land
    var particle;
    // particle = new Particle(gameEngine);
    // particle.x = 400;
    // particle.y = 400;
    // particle.velocity = {x: 0, y: 0};
    // particle.radius = 25;
    // gameEngine.addEntity(particle);
    for (var i = 0; i < 50; i++) {
        particle = new Particle(gameEngine);
        gameEngine.addEntity(particle);
    }

    gameEngine.init(ctx);
    gameEngine.start();
});
