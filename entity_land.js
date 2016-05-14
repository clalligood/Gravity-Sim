/**
 * Created by asic on 5/12/2016.
 */
function Land(game) {
    this.radius = Math.random() * 20 + 5;
    this.visualRadius = 200;
    this.colors = ["Yellow"];
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Land.prototype = new Entity();
Land.prototype.constructor = Land;

Land.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Land.prototype.update = function () {
    Entity.prototype.update.call(this);

    for (var i = 0; i < this.game.entities.length; i++) {

    }
};

Land.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};