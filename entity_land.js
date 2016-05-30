/**
 * Created by asic on 5/12/2016.
 */
function Land(game) {
    this.radius = parseInt(Math.random() * 20 + 5);
    this.visualRadius = 200;
    this.colors = ["Yellow"];
    this.citizens = [];
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
        var ent = this.game.entities[i];

        //Collide with
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;


            if (ent instanceof Human) {
                if (this.citizens.length <= (this.radius / 5)) {
                    ent.setHome(this);
                    this.citizens[this.citizens.length] = ent;
                } else {
                    console.log(this.citizens + " ," + this.radius);
                    this.citizens[this.citizens.length - 1].exile();
                }
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;
                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
        }
    }
};

Land.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 0, 255, .75)";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};