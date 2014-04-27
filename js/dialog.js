function textUpdate(phaserText) {
++dialogBox.currInd;
playSound('typewriter');

var line = dialogBox.currDialog[dialogBox.currLine];

if (dialogBox.currInd <= line.text.length) {
phaserText.setText(line.text.substr(0, dialogBox.currInd) + '_');
}
else {
phaserText.setText(line.text.substr(0, dialogBox.currInd-1));

game.input.keyboard.onUpCallback = function(e){
if (e.keyCode == Phaser.Keyboard.ENTER){
nextLine(phaserText);
game.input.keyboard.onUpCallback = null;
}
};


}



}

function nextLine(phaserText) {
dialogBox.currInd = 1;
++dialogBox.currLine;

if (dialogBox.currDialog[dialogBox.currLine] != undefined){

if (dialogBox.currDialog[dialogBox.currLine].speaker != null) {
speakerText.setText(dialogBox.currDialog[dialogBox.currLine].speaker);
}

game.time.events.repeat(45, dialogBox.currDialog[dialogBox.currLine].text.length, textUpdate, this, phaserText);
}
else {
phaserText.setText('');
speakerText.setText('');
player.inDialog = false;
game.add.tween(dialogBoxSprite.cameraOffset).to({y: 360 + 150}, 500, Phaser.Easing.Linear.None, true);
}

}

function startDialog(dialogName) {
	player.inDialog = true;
	var tween = game.add.tween(dialogBoxSprite.cameraOffset).to({y: 360}, 500, Phaser.Easing.Linear.None, true).onComplete.add(function(){

		player.body.velocity.x = 0;
		dialogBox.currLine = -1;
		dialogBox.currDialog = Dialog[dialogName];
		nextLine(dialogText);

	});
}

// Global variables
var dialogBox = [];
dialogBox.currInd = 0;
dialogBox.currLine = 0;
dialogBox.currDialog = null;

// Dialogs

function Line(speaker, text) {
this.speaker = speaker;
this.text = text;
}

function Dialog(){}

Dialog.intro = [
new Line('PLAYER', '*CRK* *BZZ* *KRR*'),
new Line(null, '. . .'),
new Line(null, 'SYSTEM INITATED'),

new Line(null, ''),
new Line(null, ''),
];

Dialog.test = [
new Line('PLAYER', '01234567890123456789012345678901\n\
					01234567890123456789012345678901\n\
					01234567890123456789012345678901'),
];



