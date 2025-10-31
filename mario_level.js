/********************************************************************************
 * 3. LEVEL BUILDER (Bestand: mario_level.js)
 * Bevat de Level class en de specifieke levelbouwfuncties (zoals oneone).
 * Vereist: Mario, Mario.Entity, Mario.Floor, Mario.Goomba, etc.
 ********************************************************************************/
var Level = Mario.Level = function(options) {
    this.playerPos = options.playerPos;
    this.scrolling = options.scrolling;
    this.background = options.background;
    this.exit = options.exit;

    // Sprites are now mocked objects
    this.floorSprite = options.floorSprite;
    this.wallSprite = options.wallSprite;
    this.brickSprite = options.brickSprite;
    this.ublockSprite = options.ublockSprite;
    this.goombaSprite = options.goombaSprite;

    this.statics = [];
    this.scenery = [];
    this.blocks = [];
    this.enemies = [];
    this.items = [];
    this.pipes = [];

    for (var i = 0; i < 15; i++) {
        this.statics[i] = [];
        this.scenery[i] = [];
        this.blocks[i] = [];
    }
};

Level.prototype.putFloor = function(start, end) {
    for (var i = start; i < end; i++) {
        this.statics[13][i] = new Mario.Floor([16*i,208], this.floorSprite);
        this.statics[14][i] = new Mario.Floor([16*i,224], this.floorSprite);
    }
};

Level.prototype.putGoomba = function(x, y) {
    this.enemies.push(new Mario.Goomba([16*x, 16*y], this.goombaSprite() ));
};

Level.prototype.putWall = function(x, y, height) {
    for (var i = y-height; i < y; i++) {
        this.statics[i][x] = new Mario.Floor([16*x, 16*i], this.wallSprite);
    }
};

Level.prototype.putQBlock = function(x, y, item) {
    this.blocks[y][x] = new Mario.Block( {
        pos: [x*16, y*16],
        item: item,
        sprite: this.qblockSprite,
        usedSprite: this.ublockSprite
    });
};

Level.prototype.putBrick = function(x,y,item) {
    this.blocks[y][x] = new Mario.Block({
        pos: [x*16, y*16],
        item: item,
        sprite: this.brickSprite,
        usedSprite: this.ublockSprite,
        breakable: !item
    });
};

Level.prototype.putFlagpole = function(x) {
    this.statics[12][x] = new Mario.Floor([16*x, 192], this.wallSprite);
    for (i=3; i < 12; i++) {
        this.scenery[i][x] = new Mario.Prop([16*x, 16*i], resources.get('pole'))
    }
    this.scenery[2][x] = new Mario.Prop([16*x, 32], resources.get('top'));
    this.items.push(new Mario.Flag(16*x));
}

// Mock the level creator (Level 1-1)
Mario.oneone = function() {
    window.level = new Mario.Level({
        playerPos: [80, 160],
        scrolling: true,
        background: '#63b3ed',
        exit: 3200,
        // Mocked sprites needed for put functions
        floorSprite: resources.get('floor'),
        wallSprite: resources.get('wall'),
        qblockSprite: resources.get('qblock'),
        brickSprite: resources.get('brick'),
        ublockSprite: resources.get('ublock'),
        goombaSprite: function() { return resources.get('goomba'); }
    });

    // Set initial player position based on level config
    player.pos = level.playerPos;

    // --- BUILD LEVEL (Simplified 1-1 Structure) ---
    level.putFloor(0, 150); // Main floor

    // First jump
    level.putQBlock(15, 10, 'coin');
    level.putQBlock(16, 10, 'shroom');
    level.putBrick(17, 10);

    // Goomba and a hole
    level.putGoomba(22, 12);
    level.putGoomba(23, 12);
    level.putFloor(28, 150);

    // Wall and second jump structure
    level.putWall(35, 13, 4);
    level.putQBlock(40, 10, 'coin');

    // Flagpole
    level.putFlagpole(50);
};

