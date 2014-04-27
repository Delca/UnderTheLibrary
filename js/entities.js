// Shared input/output
var gameVar = [];

function generateEntities(mapName) {
var cachedMap = game.cache.getTilemapData(mapName);
var layers = cachedMap.data.layers;

for (var i = 0; i < layers.length; ++i) {
var layer = layers[i];

if (layer.type == 'objectgroup') {
var objects = layer.objects;

for (var j = 0; j < objects.length; ++j) {
	createEntity(objects[j]);
}
}
}
}

function createEntity(data) {
switch(chooseEntity(data)) {
case Entity.PLAYER_SPAWN:
playerSpawn.x = data.x ;
playerSpawn.y = data.y ;
break;

case Entity.CHECKPOINT:
break;

case Entity.ENEMY:
createEnemy(data);
break;

case Entity.DIALOG:
break;

case Entity.BLOCKTOGGLE:
createBlockToggle(data);
break;

case Entity.EVENT:
createEvent(data);
break;

case Entity.BUTTON:
createButton(data);
break;

case Entity.EPILOGUE:
createEpilogue(data);
break;

}
}

function chooseEntity(data) {
if (data.properties['playerSpawn'] !== undefined) {
return Entity.PLAYER_SPAWN;
}
if (data.properties['enemy'] !== undefined) {
return Entity.ENEMY;
}
if (data.properties['blockToggle'] !== undefined) {
return Entity.BLOCKTOGGLE;
}
if (data.properties['event'] !== undefined) {
return Entity.EVENT;
}
if (data.properties['button'] !== undefined) {
return Entity.BUTTON;
}
if (data.properties['epilogue'] !== undefined) {
return Entity.EPILOGUE;
}

}

function neutralIA(entity) {
if (!entity.alive) return;

switch(entity.entityType) {
case Entity.BLOCKTOGGLE:
blockToggleIA(entity);
break;
case Entity.BUTTON:
buttonIA(entity);
break;
}



}

// Enemies

function createEnemy(data) {
var enemy;
switch (parseInt(data.properties['enemy'])) {

case Enemy.BASIC:
enemy = entitiesEnemy.create(data.x, data.y, 'playerSprite');
game.physics.arcade.enable(enemy, Phaser.Physics.ARCADE);
enemy.body.collideWorldBounds = true;
break;

case Enemy.RAT:
enemy = entitiesEnemy.create(data.x, data.y, 'rat');
game.physics.arcade.enable(enemy, Phaser.Physics.ARCADE);
enemy.body.collideWorldBounds = true;

enemy.animations.add('walk', [0, 1, 2, 3, 4], 28, true);
enemy.animations.add('idle', [0, 5, 6, 5, 6, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 10, true);

break;

case Enemy.SPIDER:
var ceilingY = Math.floor(data.y/map.tileHeight)*map.tileHeight;
enemy = entitiesEnemy.create(data.x, ceilingY, 'spider');
ceilingY += enemy.height/2;
enemy.y = ceilingY;
game.physics.arcade.enable(enemy, Phaser.Physics.ARCADE);
enemy.body.allowGravity = false;
enemy.body.collideWorldBounds = true;
enemy.originalY = ceilingY;

enemy.animations.add('attack', [0, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 0], 12, true);
enemy.animations.add('idle', [0, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0], 5, true);

break;

}
enemy.anchor.setTo(.5, .5);
enemy.enemyType = parseInt(data.properties['enemy']);
}

function enemyIA(enemy) {
if (!enemy.alive) return;
switch(enemy.enemyType) {

case Enemy.BASIC:
break;

case Enemy.RAT:
ratIA(enemy);
break;

case Enemy.SPIDER:
spiderIA(enemy);
break;

}
}

function ratIA(rat) {
	// Behaviour
	rat.body.velocity.x = 0;

	if (Math.abs(player.y - rat.y) < 24 && Math.abs(player.y - rat.y) < 5*map.tileWidth){
		rat.body.velocity.x += 220 * Math.sign(player.x - rat.x);
	}

	// Animations
	if (rat.body.velocity.x == 0){
		rat.animations.play('idle');
		if (Phaser.Point.distance(player.body.position, rat.body.position) < 7*map.tileWidth) {
			playSound('ratIdle');
		}
	}
	else {
		if (rat.body.velocity.x > 0) {
			rat.scale.x = -1;
		}
		if (rat.body.velocity.x < 0) {
			rat.scale.x = 1;
		}
		rat.animations.play('walk');
		
		if (Phaser.Point.distance(player.body.position, rat.body.position) < 7*map.tileWidth) {
		playSound('ratAttack');
		}
		
	}

	
}

function spiderIA(spider) {
if (Math.abs(player.x - spider.x) < spider.width) {
	if (spider.y < player.y) {
		spider.body.velocity.y = 220;
		spider.animations.play('attack');
	}
	else {
	spider.body.velocity.y = 0;
	}
}
else {
	if (spider.y > spider.originalY) {
			spider.body.velocity.y = -30;
			spider.animations.play('attack', 7);
		}
		else {
			spider.body.velocity.y = 0;
			spider.animations.play('idle');
		}
}


}

// Neutral

function createBlockToggle(data) {
var coord = getTileXY(data);
var block = entitiesNeutral.create(coord.x * map.tileWidth, coord.y * map.tileHeight, 'blockToggle');
playerSolid.push(block);
game.physics.arcade.enable(block, Phaser.Physics.ARCADE);
block.body.allowGravity = false;
block.body.collideWorldBounds = true;
block.body.immovable = true;
block.inputGameVar = data.properties['input'];
block.entityType = Entity.BLOCKTOGGLE;
}

function blockToggleIA(block) {

if (block.visible && gameVar[block.inputGameVar] == 1) {

block.visible = false;
playSound('blockToggle');

}

if (!block.visible && gameVar[block.inputGameVar] == 0){
block.visible = true;
playSound('blockToggle');
}


}

function createButton(data) {
var coord = getTileXY(data);
var button = entitiesNeutral.create(coord.x * map.tileWidth, coord.y * map.tileHeight, 'button');
game.physics.arcade.enable(button, Phaser.Physics.ARCADE);
button.body.allowGravity = false;
button.body.collideWorldBounds = true;
button.body.immovable = true;
button.inputGameVar = data.properties['input'];
button.entityType = Entity.BUTTON;
}

function buttonIA(button) {

if (gameVar[button.inputGameVar] == 0) {
button.animations.frame = 0;
}

if (gameVar[button.inputGameVar] == 1){
button.animations.frame = 1;
}


}

function createEpilogue(data) {
var epilogue = entitiesNeutral.create(data.x, data.y, 'epilogue' + data.properties['epilogue']);
game.physics.arcade.enable(epilogue, Phaser.Physics.ARCADE);
epilogue.body.allowGravity = false;
epilogue.body.collideWorldBounds = false;
epilogue.body.immovable = true;
epilogue.entityType = Entity.EPILOGUE;
}

// Events

function createEvent(data) {
var area = entitiesArea.create(data.x, data.y, null);
area.width = data.width;
area.height = data.height;

game.physics.arcade.enable(area, Phaser.Physics.ARCADE);
area.body.allowGravity = false;
area.body.immovable = true;

area.callback = window[data.properties['callback']];
area.parameters = data.properties['parameters'].split(';');
area.repeat = parseInt(data.properties['repeat']) || 0;
}

function playDialog(event) {
startDialog(event.parameters[0]);
}

function processEvent(entity, event) {
if (event.repeat == -8) {
event.callback(event);
return;
}
if (event.repeat >= 0) {
event.callback(event);
--event.repeat;
}
if (event.repeat >= 0) {
event.kill();
}

return false;
}

// Event callbacks

function setGameVar(event) {
var parameters = event.parameters;
gameVar[parameters[0]] = parameters[1];
}

function checkpoint(event){
checkPointSpawn = getTileXY(event);
checkPointSpawn.x *= map.tileWidth;
checkPointSpawn.y *= map.tileHeight;
}

function nextLevel(event) {
checkPointSpawn.x = -1;
checkPointSpawn.y = -1;
mapName = nextLevelArray[mapName];
fade(function(){game.state.restart();});
}

function endGame(event) {
fade(function(){game.state.start('credits');});
}

function antigravity(event) {
player.inDialog = true;

if (player.x < event.x + event.width/2) {
	player.x += 3;
	player.animations.play('walk');
}
else {

if (launchTime === undefined) {
launchTime = Date.now() + 3*1000;
}

if (launchTime < Date.now()) {
player.body.allowGravity = false;
player.body.velocity.y = -200;
player.animations.play('jump');
}

}

}

// Constants

var launchTime;

var nextLevelArray = [];
nextLevelArray['cellar'] = 'cave';
nextLevelArray['cave'] = 'well';
nextLevelArray['well'] = 'cellar';

function Entity() {};

Entity.PLAYER_SPAWN = 0;
Entity.CHECKPOINT = 1;
Entity.ENEMY = 2;
Entity.DIALOG = 3;
Entity.BLOCKTOGGLE = 4;
Entity.EVENT = 5;
Entity.BUTTON = 6;
Entity.EPILOGUE = 7;

function Enemy() {};

Enemy.BASIC = 0;
Enemy.RAT = 1;
Enemy.SPIDER = 2;
Enemy.FROG = 3;
Enemy.COCKROACH = 4;

