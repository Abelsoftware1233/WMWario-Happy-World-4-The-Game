/********************************************************************************
 * 4. CORE GAME LOOP (Bestand: main_game.js)
 * Bevat de game loop (main), update, render en initiële setup.
 * Vereist: input, Mario.Player, Mario.Level, resources, en alle entity-classes.
 ********************************************************************************/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

// De globale variabelen
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext('2d');

// Pas canvas-grootte aan voor de juiste schaling
canvas.width = 256 * 3;
canvas.height = 240 * 3;
ctx.scale(3,3);

var updateables = [];
var fireballs = [];
// De echte player-object, gedefinieerd na Mario.Player
var player = new Mario.Player([80, 160]);

var vX = 0, vY = 0, vWidth = 256, vHeight = 240;
var level;
var sounds; 
var music;  
var lastTime;
var gameTime = 0;


resources.load([
     // Geen externe assets nodig in deze mock
]);

resources.onReady(init);

function init() {
     // Mock audio-objecten om fouten te voorkomen
     music = {};
     sounds = {};

     Mario.oneone(); // Bouw het level
     lastTime = Date.now();
     main();
}

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;
    requestAnimFrame(main);
}

function update(dt) {
    gameTime += dt;

    handleInput(dt);
    updateEntities(dt, gameTime);

    checkCollisions();
}

function handleInput(dt) {
    if (player.piping || player.dying || player.noInput) return;

    if (input.isDown('RUN')){
        player.run();
    } else {
        player.noRun();
    }
    if (input.isDown('JUMP')) {
        player.jump();
    } else {
        player.noJump();
    }

    if (input.isDown('DOWN')) {
        player.crouch();
    } else {
        player.noCrouch();
    }

    if (input.isDown('LEFT')) {
        player.moveLeft();
    }
    else if (input.isDown('RIGHT')) {
        player.moveRight();
    } else {
        player.noWalk();
    }
}

function updateEntities(dt, gameTime) {
    player.update(dt);
    updateables.forEach (function(ent) {
        ent.update(dt, gameTime);
    });

    // Camera scrolling
    if (player.exiting) {
        if (player.pos[0] > vX + 96)
            vX = player.pos[0] - 96
    }else if (level.scrolling && player.pos[0] > vX + 80) {
        vX = player.pos[0] - 80;
    }

    if (player.powering.length !== 0 || player.dying) { return; }
    level.items.forEach (function(ent) {
        ent.update(dt);
    });

    // Filter dode vijanden
    level.enemies = level.enemies.filter(e => !e.isDead);
    level.enemies.forEach (function(ent) {
        ent.update(dt, vX);
    });

    fireballs.forEach(function(fireball) {
        fireball.update(dt);
    });
    level.pipes.forEach (function(pipe) {
        pipe.update(dt);
    });
}

function checkCollisions() {
    if (player.powering.length !== 0 || player.dying) { return; }
    player.checkCollisions();

    level.items.forEach(function(item) {
        item.checkCollisions();
    });
    level.enemies.forEach (function(ent) {
        ent.checkCollisions();
    });
    fireballs.forEach(function(fireball){
        fireball.checkCollisions();
    });
    level.pipes.forEach (function(pipe) {
        pipe.checkCollisions();
    });
}

function render() {
    updateables = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = level.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scenery
    for(var i = 0; i < 15; i++) {
        for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
            if (level.scenery[i][j]) {
                renderEntity(level.scenery[i][j]);
            }
        }
    }

    // Items and Enemies
    level.items.forEach (function (item) { renderEntity(item); });
    level.enemies.forEach (function(enemy) { renderEntity(enemy); });
    fireballs.forEach(function(fireball) { renderEntity(fireball); });

    // Static blocks and breakable blocks
    for(var i = 0; i < 15; i++) {
        for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
            if (level.statics[i][j]) {
                renderEntity(level.statics[i][j], '#4CAF50'); // Groene vloer
            }
            if (level.blocks[i][j]) {
                renderEntity(level.blocks[i][j]);
                updateables.push(level.blocks[i][j]);
            }
        }
    }

    // Speler en Game Over
    if (player.dying) {
        ctx.fillStyle = 'black';
        ctx.fillText("Game Over", vX + 100, vY + 120);
        return;
    }

    if (player.invincibility % 2 === 0) {
        renderEntity(player);
    }

    // Pipes (worden na Mario getekend)
    level.pipes.forEach (function(pipe) {
        renderEntity(pipe, '#4CAF50');
    });
}

function renderEntity(entity, defaultColor) {
    if (entity.render.length > 2) {
        entity.render(ctx, vX, vY);
    } else {
        Mario.Entity.prototype.render.call(entity, ctx, vX, vY, defaultColor);
    }
}

