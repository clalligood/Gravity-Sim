/**
 * Created by asic on 5/12/2016.
 */
function Resource(game) {
    this.radius = Math.random() * 10 + 10;
    this.visualRadius = 200;
    this.colors = ["Brown", "Green", "Red", "Gold"];
    this.types = ["Minerals", "Wood", "Food", "Luxury"];
    this.type = Math.random() * 100;
    this.weight = .1;
    if (this.type < 30) {
        this.type = 0;
    } else if (this.type < 60) {
        this.type = 1;
    } else if (this.type < 90) {
        this.type = 2;
    } else{
        this.type = 3;
    }
    this.color = this.type;
    this.weight = .1;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Resource.prototype = new Entity();
Resource.prototype.constructor = Resource;

Resource.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Resource.prototype.update = function () {
    Entity.prototype.update.call(this);

    for (var i = 0; i < this.game.entities.length; i++) {

    }
};

Resource.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};