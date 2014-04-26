function textUpdate(phaserText) {
++dialogBox.currInd;

var line = dialogBox.currDialog[dialogBox.currLine];

if (dialogBox.currInd <= line.text.length) {
phaserText.setText(line.text.substr(0, dialogBox.currInd));
}
else {

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
}

}

function startDialog(dialogName) {
dialogBox.currLine = -1;
dialogBox.currDialog = Dialog[dialogName];
nextLine(dialogText);
player.inDialog = true;
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

new Line('VOICE', 'Oh, it seems to work\nnow'),
new Line(null, 'Well, we will see how it\nwill go then . . .'),
];



