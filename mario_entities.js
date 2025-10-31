/********************************************************************************
 * 2. ENTITY STUBS (Bestand: mario_entities.js)
 * Bevat de Mario namespace, de Resources mock, en de klassedefinities.
 ********************************************************************************/
var Mario = {};

// Mock Resources (Bypasses image/sound loading)
var resources = {
    _readyCallbacks: [],
    load: function(paths) { console.log("Resources mocked. No actual image/sound loading."); },
    onReady: function(callback) {
        this._readyCallbacks.push(callback);
        // Call immediately as we have no async resources to load
        setTimeout(callback, 50);
    },
    get: function(path) { return { width: 16, height: 16, isMock: true }; }
};

// Mock Entity Base Class
Mario.Entity = function(pos, size, sprite, hitBox) {
    this.pos = pos || [0, 0];
    this.size = size || [16, 16];
    this.sprite = sprite;
    this.update = function() {};
    this.checkCollisions = function() {};
};
Mario.Entity.prototype.render = function(ctx, vX, vY, color) {
    ctx.fillStyle = color || 'gray';
    ctx.fillRect(this.pos[0] - vX, this.pos[1] - vY, this.size[0], this.size[1]);
};

// Mock Specific Entities
Mario.Floor = function(pos, sprite) { Mario.Entity.call(this, pos, [16, 16], sprite); };
Mario.Prop = function(pos, sprite) { Mario.Entity.call(this, pos, [16, 16], sprite); };
Mario.Block = function(options) {
    Mario.Entity.call(this, options.pos, [16, 16], options.sprite);
    this.update = function() {};
    this.isHit = false;
    this.render = function(ctx, vX, vY) {
        var color = this.isHit ? '#a04000' : '#d08800'; // Bruin of Oranje
        Mario.Entity.prototype.render.call(this, ctx, vX, vY, color);
    }
};
Mario.Coin = function(pos, sprite) { Mario.Entity.call(this, pos, [8, 8], sprite); };
Mario.Pipe = function(options) { Mario.Entity.call(this, options.pos, [32, options.length * 16]); };
Mario.Flag = function(x) {
    Mario.Entity.call(this, [x, 32], [16, 16]);
    this.render = function(ctx, vX, vY) {
        Mario.Entity.prototype.render.call(this, ctx, vX, vY, 'yellow'); // Vlaggenmast
    }
};

// Goomba Mock (Enemy that moves and can die)
Mario.Goomba = function(pos, sprite) {
    Mario.Entity.call(this, pos, [16, 16], sprite);
    this.vel = [-30, 0];
    this.isDead = false;
    this.update = function(dt) {
        if (!this.isDead) { this.pos[0] += this.vel[0] * dt; }
        if (this.pos[1] > 180) { this.pos[1] = 180; } // Vloerbotsing mock
    };
    this.render = function(ctx, vX, vY) {
        if (!this.isDead) {
            Mario.Entity.prototype.render.call(this, ctx, vX, vY, 'brown');
        } else {
            ctx.fillStyle = 'darkred';
            ctx.fillRect(this.pos[0] - vX, this.pos[1] - vY + 14, 16, 2); // Platgestampt
        }
    };
    this.checkCollisions = function() {}
};

// Player Mock (The Mario entity)
Mario.Player = function(pos) {
    Mario.Entity.call(this, pos, [16, 16]);
    this.vel = [0, 0];
    this.speed = 100;
    this.piping = false;
    this.dying = false;
    this.noInput = false;
    this.exiting = false;
    this.powering = [];
    this.invincibility = 0;
    this.onGround = true;

    this.update = function(dt) {
        // Zwaartekracht
        this.vel[1] += 1000 * dt;

        // Max snelheid in de lucht
        if (!this.onGround) {
            this.vel[0] = Math.max(-150, Math.min(150, this.vel[0]));
        }

        this.pos[0] += this.vel[0] * dt;
        this.pos[1] += this.vel[1] * dt;

        // Simpele vloerbotsing mock
        if (this.pos[1] > 180) {
            this.pos[1] = 180;
            this.vel[1] = 0;
            this.onGround = true;
        }
    };
    this.render = function(ctx, vX, vY) {
        // Rood vierkant voor Mario
        Mario.Entity.prototype.render.call(this, ctx, vX, vY, this.dying ? 'grey' : 'red');
    };

    // Input handlers
    this.run = function() { this.speed = 150; };
    this.noRun = function() { this.speed = 50; };
    this.jump = function() {
        if (this.onGround) {
            this.vel[1] = -300;
            this.onGround = false;
        }
    };
    this.noJump = function() {};
    this.crouch = function() {};
    this.noCrouch = function() {};
    this.moveLeft = function() { this.vel[0] = -this.speed; };
    this.moveRight = function() { this.vel[0] = this.speed; };
    this.noWalk = function() { if(this.onGround) { this.vel[0] = 0; } };

    this.checkCollisions = function() {
        // Basis Goomba botsing: als Mario erbovenop valt, wordt hij platgestampt, anders "sterft" Mario
        level.enemies.forEach((enemy) => {
            if (!enemy.isDead && this.pos[0] < enemy.pos[0] + 16 &&
                this.pos[0] + 16 > enemy.pos[0] &&
                this.pos[1] + 16 > enemy.pos[1] &&
                this.pos[1] < enemy.pos[1] + 16)
            {
                // Platstampen: check of Mario van bovenaf valt
                if (this.vel[1] > 0 && this.pos[1] + 16 < enemy.pos[1] + 8) {
                     enemy.isDead = true;
                     this.vel[1] = -150; // Kleine sprong
                } else {
                    // Raak, "sterf" mock
                    this.dying = true;
                    console.log("Mario hit enemy and is now 'dying'");
                }
            }
        });
    };
};

