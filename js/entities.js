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
console.log('YAY');
enemy = entitiesEnemy.create(data.x, data.y, 'playerSprite');
game.physics.arcade.enable(enemy, Phaser.Physics.ARCADE);
enemy.body.collideWorldBounds = true;
break;
}

enemy.enemyType = parseInt(data.properties['enemy']);
}

function enemyIA(enemy) {
if (!enemy.alive) return;
switch(enemy.enemyType) {

case Enemy.BASIC:
break;

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
}
if (event.repeat >= 0) {
event.kill();
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

