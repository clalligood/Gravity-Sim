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

function Particle(game, data) {
    this.status;
    this.radius = Math.random() * 10 + 1;
    this.density = (Math.random() * 100) + 1;
    this.targetRadius;
    this.x = 0;
    this.y = 0;
    this.r = parseInt(rollDice(1, 200) + 54);
    this.g = parseInt(rollDice(1, 200) + 54);
    this.b = parseInt(rollDice(1, 200) + 54);
    //this.visualRadius = this.radius * 2255;

    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 26 - 13, y: Math.random() * 26 - 13};

    if (data) {
        this.status = data.status;
        this.radius = data.radius;
        this.density = data.density;
        this.targetRadius = data.targetRadius;
        this.x = data.x;
        this.y = data.y;
        this.velocity = data.velocity;
        this.r = data.r;
        this.g = data.g;
        this.b = data.b;
    }

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
    return this.radius * Math.sqrt((Math.abs(this.velocity.x) + (Math.abs(this.velocity.y))));
    //return parseFloat((this.radius * this.density) * Math.sqrt((Math.abs(this.velocity.x) + (Math.abs(this.velocity.y)))));
};

Particle.prototype.explode = function (x, y) {
    this.generateChildren(x, y);
    this.removeFromWorld = true;
};

Particle.prototype.generateChildren = function (x, y) {
    var count = parseInt(Math.random() * 4) + 1;
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
        particle.velocity.x = x * (1 + Math.random() * .2);
        particle.velocity.y = y * (1 + Math.random() * .2);
        this.game.addEntity(particle);
    }
};

var maxSpeed = 500;

Particle.prototype.update = function () {
    Entity.prototype.update.call(this);

    if (this.radius < 0.5) {
        this.removeFromWorld = true;
    }
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

    var changeX = 0;
    var changeY = 0;
    var changeN = 1;

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        var dist = distance(this, ent);;
        // if (dist !== 0) {
        //     var difX = (ent.x - this.x) / dist;
        //     var difY = (ent.y - this.y) / dist;
        //     changeX *= difX / (dist * dist) * ((this.radius - ent.radius) * (this.radius - ent.radius) * 1000000);
        //     changeY *= difY / (dist * dist) * ((this.radius - ent.radius) * (this.radius - ent.radius) * 1000000);
        // }

        //Collide with
        if (ent !== this && this.collide(ent)) {
            var temp = {x: this.velocity.x, y: this.velocity.y};

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x) / dist;
            var difY = (this.y - ent.y) / dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;


            if (ent instanceof Particle) {
                if ((this.energy() / ent.energy()) > 1.1) {
                    if (ent.radius / this.radius <= 0.2) {
                        this.targetRadius =  Math.sqrt(ent.radius * ent.radius + this.radius * this.radius);
                        ent.removeFromWorld = true;
                    } else {
                        ent.explode(this.velocity.x, this.velocity.y);
                        ent.x -= difX * delta / 2;
                        ent.y -= difY * delta / 2;


                        // this.velocity.x = ent.velocity.x * friction;
                        // this.velocity.y = ent.velocity.y * friction;
                        // ent.velocity.x = temp.x * friction;
                        // ent.velocity.y = temp.y * friction;
                        this.velSwap(ent, this);

                        this.x += this.velocity.x * this.game.clockTick;
                        this.y += this.velocity.y * this.game.clockTick;
                        ent.x += ent.velocity.x * this.game.clockTick;
                        ent.y += ent.velocity.y * this.game.clockTick;
                    }
                    //this.velocity.x *= (1 - (ent.energy() / this.energy()));
                    //this.velocity.y *= (1 - (ent.energy() / this.energy()));
                } else if ((ent.energy() / this.energy()) > 1.1 ) {
                    if (this.radius / ent.radius <= 0.2) {
                        ent.targetRadius = Math.sqrt(ent.radius * ent.radius + this.radius * this.radius);
                        this.removeFromWorld = true;
                    } else {
                        this.explode(ent.velocity.x, ent.velocity.y);
                        this.x -= difX * delta / 2;
                        this.y -= difY * delta / 2;


                        // this.velocity.x = ent.velocity.x * friction;
                        // this.velocity.y = ent.velocity.y * friction;
                        // ent.velocity.x = temp.x * friction;
                        // ent.velocity.y = temp.y * friction;
                        this.velSwap(this, ent);

                        this.x += this.velocity.x * this.game.clockTick;
                        this.y += this.velocity.y * this.game.clockTick;
                        ent.x += ent.velocity.x * this.game.clockTick;
                        ent.y += ent.velocity.y * this.game.clockTick;
                    }
                    //ent.velocity.x *= (1 - (this.energy() / ent.energy()));
                    //ent.velocity.y *= (1 - (this.energy() / ent.energy()));
                } else {
                    this.velSwap(ent, this);
                }
            }
        } else {
            //Gravity
            if (ent != this) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                changeX -= ((difX / (dist)) * 500) * (ent.mass() / this.mass());
                changeY -= ((difY / (dist)) * 500) * (ent.mass() / this.mass());
                changeN++;
            }
        }
    }

    if (this.radius < this.targetRadius) {
        this.radius += (this.targetRadius -this.radius) * .3;
    }

    this.velocity.x -= (changeX / changeN);
    this.velocity.y -= (changeY / changeN);

    this.velocity.x -= ((1 - friction) * this.game.clockTick * this.velocity.x);
    this.velocity.y -= ((1 - friction) * this.game.clockTick * this.velocity.y);
};

Particle.prototype.mass = function() {
    return this.radius * this.radius;
    //return this.radius * this.density;
}


Particle.prototype.draw = function (ctx) {
    ctx.save();
    ctx.beginPath();
    var alpha = 1;
    ctx.fillStyle = "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + alpha.toString() + ")";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
};

Particle.prototype.velSwap = function(A, B) {
    // var tempX = (B.velocity.x * (B.mass() - A.mass()) + ( A.velocity.x)) / (B.mass() + A.mass());
    // var tempY = (B.velocity.y * (B.mass() - A.mass()) + ( A.velocity.y)) / (B.mass() + A.mass());
    // A.velocity.x = (A.velocity.x * (A.mass() - B.mass()) + ( B.velocity.x)) / (B.mass() + A.mass());
    // A.velocity.y = (A.velocity.y * (A.mass() - B.mass()) + (B.velocity.y)) / (B.mass() + A.mass());
    // B.velocity.x = tempX;
    // B.velocity.y = tempY;
    if ((A.velocity.x == 0) || (B.velocity.x == 0)) {
        return;
    }
    var tempX = (B.velocity.x * (B.mass() - A.mass()) + (2 * A.mass() * A.velocity.x)) / (A.mass() + B.mass());
    var tempY = (B.velocity.y * (B.mass() - A.mass()) + (2 * A.mass() * A.velocity.y)) / (A.mass() + B.mass());
    A.velocity.x = (A.velocity.x * (A.mass() - B.mass()) + (2 * B.mass() * B.velocity.x)) / (A.mass() + B.mass());
    A.velocity.y = (A.velocity.y * (A.mass() - B.mass()) + (2 * B.mass() * B.velocity.y)) / (A.mass() + B.mass());
    B.velocity.x = tempX;
    B.velocity.y = tempY;
};