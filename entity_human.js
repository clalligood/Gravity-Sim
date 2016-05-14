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

function Human(game) {
    this.home;
    this.status;
    this.strength = rollDice(2, 6) + 3;
    this.dexterity = rollDice(2, 6) + 3;
    this.constitution = rollDice(2, 6) + 3;
    this.intelligence = rollDice(2, 6) + 3;
    this.wisdom = rollDice(2, 6) + 3;
    this.charisma = rollDice(2, 6) + 3;

    this.objectCarried = false;
    this.maxWeight = this.strength * 10;
    this.carriedWeight = 0;

    this.statuses = ["wandering", "resource", "mating", "synthesizing"];
    this.radius = 10;
    this.visualRadius = 200;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Human.prototype = new Entity();
Human.prototype.constructor = Human;

Human.prototype.setIt = function () {
    this.it = true;
    this.color = 0;
    this.visualRadius = 500;
};

Human.prototype.setNotIt = function () {
    this.it = false;
    this.color = 3;
    this.visualRadius = 200;
};

Human.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Human.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Human.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Human.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Human.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Human.prototype.touchTopOf = function(r1, r2) {
    return (r1.y <= r2.y);
};

Human.prototype.touchBottomOf = function(r1, r2) {
    return (r1.y >= r2.y);
};

Human.prototype.touchLeftOf = function(r1, r2) {
    return (r1.x <= r2.x);
};

Human.prototype.touchRightOf = function(r1, r2) {
    return (r1.x >= r2.x);
};

Human.prototype.update = function () {
    Entity.prototype.update.call(this);
    //  console.log(this.velocity);

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


            if (ent instanceof Human) {
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
            } else if (ent instanceof Resource) {

                //Set this player to collecting
                this.status = this.statuses[0];

                if (this.maxWeight > this.carriedWeight) {
                    this.carriedWeight += ent.weight;
                    this.objectCarried = ent.object;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                }

                // if (this.touchTopOf(this, ent)) {
                //     this.velocity.y = -this.velocity.y;
                // }
                // else if (this.touchBottomOf(this, ent)) {
                //     this.velocity.y = Math.abs(this.velocity.y);
                // }
                // if (this.touchLeftOf(this, ent)) {
                //     this.velocity.x = -this.velocity.x;
                // }
                // else if (this.touchRightOf(this, ent)) {
                //     this.velocity.x = Math.abs(this.velocity.x);
                // }
                // this.x += this.velocity.x * this.game.clockTick;
                // this.y += this.velocity.y * this.game.clockTick;
            } else if (ent instanceof Land) {
                if(this.home == false) {
                    this.home = ent;
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

Human.prototype.draw = function (ctx) {
    ctx.beginPath();
    var alpha = (this.carriedWeight / this.maxWeight) + .1;
    ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};