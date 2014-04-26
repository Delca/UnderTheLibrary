var game = new Phaser.Game(640, 480, Phaser.AUTO, null, null, null, null, false);

var main_state = {preload: preload, create: create, update: update};

function preload() {
game.load.spritesheet('playerSprite', 'assets/runner.png', 24, 42);
game.load.spritesheet('blockToggle', 'assets/blockToggle.png', 32, 32);
game.load.spritesheet('dialogbox', 'assets/dialogBox.png', 574, 107);

game.load.tilemap('start', 'map/start.json', null, Phaser.Tilemap.TILED_JSON);
game.load.image('tiles', 'assets/tiles.png');

game.load.bitmapFont('font', 'font/font_0.png', 'font/font.fnt', null, null, -4);
};

var player;
var map;
var layer;
var cursors;
var playerSpawn = new Phaser.Point(128, 92);

// Container Groups
var entitiesNeutral;
var entitiesEnemy;
var entitiesArea;

// Functional arrays (contains sprites grouped by functionnality)
var playerSolid = [];

// Texts for the dialog box
var speakerText; // to print the name of the speaker
var dialogText; // to print the dialog text itself
var dialogBoxSprite;

function create() {
game.physics.startSystem(Phaser.Physics.ARCADE);
game.physics.arcade.gravity.y = 850;

map = game.add.tilemap('start');
map.addTilesetImage('tiles', 'tiles');
map.setCollision([41,42,43,49,50,51,57,58,59,5,56,63,64]);
layer = map.createLayer('layer1');
layer.resizeWorld();
layer.debug= true;
map.setTileIndexCallback(ladderIndex, setLadderState, this, layer);
map.setTileIndexCallback(spikesIndex, killPlayer, this, layer);

entitiesNeutral = game.add.group();
entitiesEnemy = game.add.group();
entitiesArea = game.add.group();
generateEntities('start');

spawnPlayer(playerSpawn);
player.anchor.setTo(.5, .5);
player.animations.add();
game.camera.follow(player);
game.physics.arcade.enable(player, Phaser.Physics.ARCADE);
player.body.collideWorldBounds = true;
player.body.maxVelocity.x = 230;
player.body.maxVelocity.y = 460;

cursors = game.input.keyboard.createCursorKeys();

dialogBoxSprite = game.add.sprite(30, 360 + 150, 'dialogBox');
speakerText = game.add.bitmapText(60, 360, 'font', '');
dialogText = game.add.bitmapText(54, 390, 'font', '');

dialogBoxSprite.fixedToCamera = true;

};

function update() {
game.physics.arcade.collide(entitiesEnemy, layer);
playerAI(player);
game.debug.body(player);
entitiesNeutral.forEach(neutralIA);
entitiesEnemy.forEachAlive(enemyIA);
entitiesArea.forEachAlive(function(e) {game.debug.spriteBounds(e);});
};

function playerAI(player) {
	player.ladderState = false;
	game.physics.arcade.collide(player, layer);

	if (player.inDialog) return;
	
	forEach(playerSolid, function(entity){game.physics.arcade.collide(player, entity);})
	
	// Stop horizontal movement if on ground
	if (player.body.blocked.down) {
		player.body.velocity.x = 0;
	}

	// Up is pressed (jump, ladder)
	if (cursors.up.isDown) {

		// Jump from the ground
		if (player.body.blocked.down || player.body.touching.down) {console.log('jump');
			player.body.velocity.y = -330;
		}

		// Climb a ladder
		if (player.ladderState){
			player.body.velocity.y = -160;
		}
	}

	// Horizontal movement
	if (cursors.left.isDown) {
		player.scale.x = -1;

		// Ground movement
		if (player.body.blocked.down) {
			player.body.velocity.x = -230;
		}
		else { //Air movement
			player.body.velocity.x += -12;
		}

	}
	if (cursors.right.isDown) {
		player.scale.x = 1;

		// Ground movement
		if (player.body.blocked.down) {
			player.body.velocity.x = 230;
		}
		else { //Air movement
			player.body.velocity.x += 12;
		}

	}

	// Down pressed
	if (cursors.down.isDown) {
		if (player.ladderState){
			player.body.velocity.y = 160;
		}
	}

	// Climbing a ladder mechanics
	player.body.allowGravity = !player.ladderState;
	if (player.ladderState) {
		if (cursors.left.isUp && cursors.right.isUp){
			player.body.velocity.x = 0;
		}
		if (cursors.up.isUp && cursors.down.isUp){
			player.body.velocity.y = 0;
		}

	}


	// Collisions with other entities
	game.physics.arcade.collide(player, entitiesEnemy, null, killPlayer);

	// Collision with event areas
	game.physics.arcade.collide(player, entitiesArea, null, processEvent);
	
};

// UTIL FUNCTIONS

function setLadderState() {
var x = player.body.x;
var tile = getTile(getTileXY(new Phaser.Point(player.x, player.y + player.height/2)));

if (tile.index != ladderIndex) {
player.ladderState = false;
return;
}

// var distanceFromTileCenter = x + player.body.width/2 - (Math.floor(x/map.tileWidth)*map.tileWidth + map.tileWidth/2);
// console.log(distanceFromTileCenter);
// player.ladderState = Math.abs(distanceFromTileCenter) < 24;
player.ladderState = true;
player.ladderState &= !player.body.blocked.down;
}

function getTileXY(point) {
return new Phaser.Point(Math.floor(point.x/map.tileWidth), Math.floor(point.y/map.tileHeight));
}

function getTile(point) {
// point is in tile coordinate
return map.getTile(point.x, point.y, layer);
}

function spawnPlayer(point) {
if (player === undefined) {
player = game.add.sprite(128, 92, 'playerSprite');
}
player.reset(point.x, point.y);
}

function killPlayer() {
spawnPlayer(playerSpawn);
return false;
}

function forEach(array, callback) {
for (var i = 0; i < array.length; ++i) {
callback(array[i]);
}
}


var ladderIndex = 53;
var spikesIndex = 45;

game.state.add('main', main_state);
game.state.start('main');

