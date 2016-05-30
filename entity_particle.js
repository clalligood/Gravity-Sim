/**
 * Created by asic on 5/12/2016.
 */
function rollDice(count, sides) {
    var total = 0;
    for(var i = 0; i < count; i++) {
        total += Math.random() * sides;
    }
    return total;
}

function Particle(game) {
    this.home;
    this.status;
    this.radius = Math.random() * 10 + Math.random() * 10 + 2;
    this.angle = {x: rollDice(4, 6) + 3, y: rollDice(4, 6) + 3};
    this.spin = rollDice(2, 6) - 6;
    this.density = (Math.random() * 100) + 1;
    this.x = 0;
    this.y = 0;

    this.visualRadius = this.radius * this.density;

    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    this.oldVelocity = {x: 0, y: 0};
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Particle.prototype = new Entity();
Particle.prototype.constructor = Particle;

Particle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Particle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Particle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Particle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Particle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Particle.prototype.setSize = function(size) {
    this.radius = size;
};

Particle.prototype.setDensity = function(density) {
    this.density = density;
};

Particle.prototype.energy = function() {
    return parseFloat((this.radius * this.density) * Math.sqrt((Math.abs(this.velocity.x) + (Math.abs(this.velocity.y)))));
};

Particle.prototype.explode = function (x, y) {
    this.generateChildren(x, y);
    this.removeFromWorld = true;
};

Particle.prototype.generateChildren = function (x, y) {
    var count = parseInt(Math.random() * 4) + 1;
    console.log(count);
    var particle;
    for (var i = 0; i < count; i++) {
        if (this.game.entities.length > 1000) {
            throw new Error("We looping");
        }
        particle = new Particle(this.game);
        particle.setSize(this.radius / count);
        particle.setDensity(this.density);
        particle.x = parseInt(parseInt(this.x) + i);
        particle.y = parseInt(parseInt(this.y) + i);
        console.log("Made a particle: ");
        particle.velocity.x = x * (1 + Math.random() * .2);
        particle.velocity.y = y * (1 + Math.random() * .2);
        this.game.addEntity(particle);
    }
};

Particle.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

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


            if (ent instanceof Particle) {
                if ((this.energy() / ent.energy()) > 1.5) {
                    if (ent.radius <= 2) {
                        this.radius += (ent.radius / 2);
                        ent.removeFromWorld = true;
                    } else {
                        ent.explode(this.velocity.x, this.velocity.y);
                    }
                    this.velocity.x *= (1 - (ent.energy() / this.energy()));
                    this.velocity.y *= (1 - (ent.energy() / this.energy()));
                } else if ((this.energy() / ent.energy()) > 1.5) {
                    if (this.radius <= 2) {
                        ent.radius += (this.radius / 2);
                        this.removeFromWorld = true;
                    } else {
                        this.explode(ent.velocity.x, ent.velocity.y);
                    }
                    ent.velocity.x *= (1 - (this.energy() / ent.energy()));
                    ent.velocity.y *= (1 - (this.energy() / ent.energy()));
                } else {
                    ent.x -= difX * delta / 2;
                    ent.y -= difY * delta / 2;
                    this.velocity.x
                        = ent.velocity.x * friction;
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

        //Look for...
        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Particle.prototype.draw = function (ctx) {
    ctx.beginPath();
    var alpha = (this.density / 101) + .1;
    ctx.fillStyle = "rgba(255, 0, 255, " + alpha + ")";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};