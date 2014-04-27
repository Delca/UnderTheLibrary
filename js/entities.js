// Shared input/output
var gameVar = [];

function generateEntities(mapName) {
var cachedMap = game.cache.getTilemapData(mapName);
var layers = cachedMap.data.layers;

for (var i = 0; i < layers.length; ++i) {
var layer = layers[i];
console.log(layer.name);

if (layer.type == 'objectgroup') {
var objects = layer.objects;
console.log('Found an object layer with ' + objects.length + ' entities');

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

}

function neutralIA(entity) {
if (!entity.alive) return;

switch(entity.entityType) {
case Entity.BLOCKTOGGLE:
blockToggleIA(entity);
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

	if (Math.abs(player.y - rat.y) < 14){
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

}

if (!block.visible && gameVar[block.inputGameVar] == 0){
block.visible = true;
}


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

function processEvent(entity, event) {
if (event.repeat >= 0) {
event.callback.apply(this, event.parameters);
--event.repeat;
playSound('blockToggle');
}
if (event.repeat >= 0) {
event.kill();
playSound('blockToggle');
}

return false;
}

// Event callbacks

function setGameVar(index, value) {
console.log('setGlobalGameVar called with args ' + index + ' ' + value);
gameVar[index] = value;
}

// Constants

function Entity() {};

Entity.PLAYER_SPAWN = 0;
Entity.CHECKPOINT = 1;
Entity.ENEMY = 2;
Entity.DIALOG = 3;
Entity.BLOCKTOGGLE = 4;
Entity.EVENT = 5;

function Enemy() {};

Enemy.BASIC = 0;
Enemy.RAT = 1;
Enemy.SPIDER = 2;
Enemy.FROG = 3;
Enemy.COCKROACH = 4;

