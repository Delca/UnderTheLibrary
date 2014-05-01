var game = new Phaser.Game(640, 480, Phaser.AUTO, "gameScreen", null, null, null, false);

var main_state = {preload: null, create: create, update: update};
var title_state = {preload: preload, create:createTitle, update:updateTitle};
var credits_state = {preload: null, create:createCredits, update:updateCredits};

var GAME_END = 0;

function preload() {
game.load.bitmapFont('font', 'font/font_0.png', 'font/font.fnt', null, null, -4);

game.load.spritesheet('playerSprite', 'assets/player.png', 24, 42);
game.load.spritesheet('blockToggle', 'assets/blockToggle.png', 32, 32);
game.load.spritesheet('dialogBox', 'assets/dialogbox.png', 574, 107);
game.load.spritesheet('rat', 'assets/rat.png', 42, 20);
game.load.spritesheet('spider', 'assets/spider.png', 34, 34);
game.load.spritesheet('button', 'assets/button.png', 32, 32);

game.load.tilemap('cellar', 'map/' + 'cellar' + '.json', null, Phaser.Tilemap.TILED_JSON);
game.load.tilemap('cave', 'map/' + 'cave' + '.json', null, Phaser.Tilemap.TILED_JSON);
game.load.tilemap('well', 'map/' + 'well' + '.json', null, Phaser.Tilemap.TILED_JSON);


game.load.image('tiles', 'assets/tiles.png');

game.load.audio('sfx', ['audio/mix.mp3']);

game.load.image('title', 'assets/titlescreen.png');
game.load.image('epilogue1', 'assets/epilogue1.png');
game.load.image('epilogue2', 'assets/epilogue2.png');
game.load.image('epilogue3', 'assets/epilogue3.png');
game.load.image('epilogue4', 'assets/epilogue4.png');
};

function createTitle() {
fade(null, false);
if (sfx === undefined) {
var now = Date.now();
sfx = game.add.audio('sfx');
sfx.lastPlayed = [];
sfx.addMarker('blockToggle', 0, 0.5);
sfx.addMarker('bookLadder', 1, 0.12);
sfx.addMarker('groundImpact', 2, 0.07);
sfx.addMarker('ratAttack', 3, 0.16 + 0.3);
sfx.addMarker('ratIdle', 4, 0.14 + 0.78);
sfx.addMarker('step', 5, 0.07 + 0.09);
sfx.addMarker('typewriter', 6, 0.05 + 0.10);
sfx.lastPlayed['blockToggle'] = 0;
sfx.lastPlayed['bookLadder'] = 0;
sfx.lastPlayed['groundImpact'] = 0;
sfx.lastPlayed['ratAttack'] = 0;
sfx.lastPlayed['ratIdle'] = 0;
sfx.lastPlayed['step'] = 0;
sfx.lastPlayed['typewriter'] = 0;
}

if (bgm === undefined) {
bgm = game.add.audio('sfx');
bgm.addMarker('mainTheme', 7, 25.7, 1, false);
bgm.addMarker('tension', 33, 60.1, 1, true);
}
bgm.stop();
bgm.play('mainTheme', null, 1, true);
enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
titleBackground = game.add.sprite(0, 0, 'title');



dialogBoxSprite = game.add.sprite(30, 360 + 150, 'dialogBox');
speakerText = game.add.bitmapText(60, 360, 'font', '');
dialogText = game.add.bitmapText(54, 390, 'font', '');

dialogBoxSprite.fixedToCamera = true;
speakerText.fixedToCamera = true;
dialogText.fixedToCamera = true;
//startDialog('credits');



game.input.keyboard.onUpCallback = function(e){
if (e.keyCode == Phaser.Keyboard.ENTER ||
	e.keyCode == Phaser.Keyboard.UP ||
	e.keyCode == Phaser.Keyboard.DOWN ||
	e.keyCode == Phaser.Keyboard.LEFT ||
	e.keyCode == Phaser.Keyboard.RIGHT){
fade(function(){bgm.stop();bgm.play('tension');game.state.start('main');});
game.input.keyboard.onUpCallback = null;
}
};

}

function updateTitle() {}

function createCredits() {
	fade(null, false);
	bgm.stop();
	dialogBoxSprite = game.add.sprite(30, 360 + 150, 'dialogBox');
	speakerText = game.add.bitmapText(60, 360, 'font', '');
	dialogText = game.add.bitmapText(54, 390, 'font', '');

	dialogBoxSprite.fixedToCamera = true;
	speakerText.fixedToCamera = true;
	dialogText.fixedToCamera = true;
	startDialog('credits');
	GAME_END = 0;
	mapName = 'cellar';
}

function updateCredits() {
	if (GAME_END > 0 && enterKey.isDown){
		fade(function(){game.state.start('title');});
	}
}

game.state.add('title', title_state);
game.state.add('credits', credits_state);
game.state.add('main', main_state);
game.state.start('title');

var mapName = 'cellar';
var player;
var map;
var layer;
var cursors;
var playerSpawn = new Phaser.Point(128, 92);
var checkPointSpawn = new Phaser.Point(-1, -1);;
var sfx;
var bgm;
var soundActivated = true;
var titleBackground;
var enterKey;
var zGroup;

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

// Constants
var ladderIndex = 2;
var spikesIndex = 3;

function create() {
gameVar = [];
map = game.add.tilemap(mapName);
map.addTilesetImage('tiles', 'tiles');
map.setCollision([1]);
layer = [];
layer[0] = map.createLayer('collision');
layer[0].resizeWorld();
layer[0].visible = false;
layer[0].debug= true;
layer[1] = map.createLayer('background');
layer[1].resizeWorld();
layer[1].alpha = 1;
layer[1].debug= true;
layer[2] = map.createLayer('middleground');
layer[2].resizeWorld();
layer[2].debug= true;
layer[2].alpha = 1;
layer[3] = map.createLayer('foreground');
layer[3].resizeWorld();
layer[3].debug= true;
layer[3].alpha = 1;
map.setTileIndexCallback(ladderIndex, setLadderState, this, layer[0]);
map.setTileIndexCallback(spikesIndex, killPlayer, this, layer[0]);

entitiesNeutral = game.add.group();
entitiesEnemy = game.add.group();
entitiesArea = game.add.group();
zGroup = game.add.group();

cursors = game.input.keyboard.createCursorKeys();

dialogBoxSprite = game.add.sprite(30, 360 + 150, 'dialogBox');
speakerText = game.add.bitmapText(60, 360, 'font', '');
dialogText = game.add.bitmapText(54, 390, 'font', '');

dialogBoxSprite.fixedToCamera = true;
speakerText.fixedToCamera = true;
dialogText.fixedToCamera = true;

if (checkPointSpawn.x > -1) {
	game.camera.focusOn(checkPointSpawn.x, checkPointSpawn.y);
}
else {
	game.camera.focusOn(playerSpawn.x, playerSpawn.y);
}


fade(function(){

game.physics.startSystem(Phaser.Physics.ARCADE);
game.physics.arcade.gravity.y = 850;
generateEntities(mapName);
spawnPlayer(playerSpawn);


}, false);
};

function update() {
if (player !== undefined && player.alive && game.physics.arcade != null) {
player.allowGravity = true;
game.physics.arcade.collide(entitiesEnemy, layer);
playerAI(player);
// game.debug.body(player);
entitiesNeutral.forEach(neutralIA);
entitiesEnemy.forEachAlive(enemyIA);
// entitiesArea.forEachAlive(function(e) {game.debug.spriteBounds(e);});
}
};

function playerAI(player) {
	player.ladderState = false;
	game.physics.arcade.collide(player, layer);
	
	// Collision with event areas
	game.physics.arcade.collide(player, entitiesArea, null, processEvent);
	
	if (player.inDialog || !player.alive) return;
	
	forEach(playerSolid, function(entity){game.physics.arcade.collide(player, entity);})
	
	// Stop horizontal movement if on ground
	if (player.body.blocked.down) {
		player.body.velocity.x = 0;
	}

	// Up is pressed (jump, ladder)
	if (cursors.up.isDown) {

		// Jump from the ground
		if ((player.body.blocked.down || player.body.touching.down) && mapName!='well') {
			player.body.velocity.y = -350;
			playSound('groundImpact');
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
			playSound('step');
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
			playSound('step');
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

		if (player.body.velocity.x != 0 ||player.body.velocity.y != 0) {
			playSound('bookLadder');
		}
		
	}


	// Collisions with other entities
	game.physics.arcade.collide(player, entitiesEnemy, null, killPlayer);

	// Animations
	
	if (player.ladderState) {
		if (player.body.velocity.x != 0 || player.body.velocity.y != 0){
			player.animations.play('climb');
		}
	}
	else {
		if (player.body.velocity.y > 0){
			player.animations.play('jump');
		}
		else if (player.body.velocity.y < 0) {
			player.animations.play('fall');
		}
		else {
			if (player.body.velocity.x != 0) {
				player.animations.play('walk');
			}
			else {
				player.animations.play('idle');
			}
		}
	}
	
};

// UTIL FUNCTIONS

function setLadderState() {
var x = player.body.x;
var tile = getTile(getTileXY(new Phaser.Point(player.x, player.y + player.height/2)));

if (tile == null || tile.index != ladderIndex) {
player.ladderState = false;
return;
}

// var distanceFromTileCenter = x + player.body.width/2 - (Math.floor(x/map.tileWidth)*map.tileWidth + map.tileWidth/2);
// player.ladderState = Math.abs(distanceFromTileCenter) < 24;
player.ladderState = true;
player.ladderState &= !player.body.blocked.down;
}

function getTileXY(point) {
return new Phaser.Point(Math.floor(point.x/map.tileWidth), Math.floor(point.y/map.tileHeight));
}

function getTile(point) {
// point is in tile coordinate
return map.getTile(point.x, point.y, layer[0]);
}

function spawnPlayer(point) {
if (player !== undefined) {
player.destroy();
}

if (checkPointSpawn.x >= 0) {
point = checkPointSpawn;
}

player = game.add.sprite(point.x, point.y, 'playerSprite');
zGroup.add(player);
game.camera.follow(player);
game.physics.arcade.enable(player, Phaser.Physics.ARCADE);
player.body.collideWorldBounds = true;
player.body.maxVelocity.x = 230;
player.body.maxVelocity.y = 460;
player.anchor.setTo(.5, .5);
player.animations.add('idle', [0], 10, true);
player.animations.add('walk', [1, 2, 1, 0], 10);
player.animations.add('jump', [3, 4], 10);
player.animations.add('fall', [4, 3], 13);
player.animations.add('climb', [5, 6], 6);
player.inDialog = false;

player.allowGravity = false;
}

function killPlayer() {
player.body.velocity.x = 0;
player.body.velocity.y = 0;
player.destroy();
fade(function(){game.physics.destroy();game.state.restart();});
return false;
}

function forEach(array, callback) {
for (var i = 0; i < array.length; ++i) {
callback(array[i]);
}
}

function playSound(name, volume) {
var now = Date.now();
if (now - sfx.lastPlayed[name] > 2*sfx.markers[name].duration*1000 || name == 'typewriter') {
sfx.lastPlayed[name] = now;
sfx.play(name, null, 0.05*(name=='typewriter'?0.5:1)*(soundActivated?1:0) );
};

}

function fade(callback, out) {
	if (out === undefined) {
		out = true;
	}

	var mask = game.add.graphics(0, 0);
	mask.fixedToCamera = true;
	mask.beginFill("black", 1);
	mask.drawRect(0, 0, game.width, game.height);
	mask.endFill();
	mask.alpha = (out?0:1);

	var tween = game.add.tween(mask).to({alpha:(out?1:0)}, 500, Phaser.Easing.Linear.None, true)
						.onComplete.add(function() {
							if (callback != null) {
								callback();
							}
						}, this);

}
