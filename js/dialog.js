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
if (player !== undefined){
	player.inDialog = false;
	}
game.add.tween(dialogBoxSprite.cameraOffset).to({y: 360 + 150}, 500, Phaser.Easing.Linear.None, true);
GAME_END = 1;
}

}

function startDialog(dialogName) {
	if (player !== undefined){
	player.inDialog = true;
	player.body.velocity.x = 0;
	}
	
	zGroup.add(dialogBoxSprite);
	zGroup.sort();
	
	var tween = game.add.tween(dialogBoxSprite.cameraOffset).to({y: 360}, 500, Phaser.Easing.Linear.None, true).onComplete.add(function(){

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

Dialog.test1 = [
new Line('PLAYER', '*CRK* *BZZ* *KRR*'),
new Line(null, '. . .'),
new Line(null, 'SYSTEM INITATED'),

new Line(null, ''),
new Line(null, ''),
];

Dialog.test2 = [
new Line('PLAYER', '01234567890123456789012345678901\n\
					01234567890123456789012345678901\n\
					01234567890123456789012345678901'),
];


// CELLAR

Dialog.intro = [
new Line('MECHANISM', '*CRK* *BZZ* *KRR*'),
new Line('', '. . .'),
new Line('SOUND', '*PIIING*'),
new Line('SPEAKERS', 'SYSTEM ACTIVATED.\nESCAPE MODULE ACTIVE IN 3.'),
new Line(null, '2.'),
new Line(null, '1.'),
new Line(null, '0. ESCAPE MODULE ACTIVATED.\nCURRENT GOAL:\nFIND A WAY BACK TO THE SURFACE'),
];

Dialog.spikes = [
new Line('SPEAKERS', 'MAGNETIC MINERALS CAN DESTROY\nTHE NAVIGATION MODULE.\nAVOIDING STRATEGY ACTIVATED.'),
new Line('MOTION MODULE', 'COMPUTING ALTERNATIVE WAY...'),
new Line(null, '*VRRRRRM*'),
new Line(null, '*VRRRRRM*'),
new Line(null, '*VVVR-*'),
new Line(null, '*PIIING*'),
new Line(null, 'COMPUTATION TERMINATED.'),
new Line('SPEAKERS', 'NEW PATH COMPUTED:\n\nUSE BOOKS AS LADDERS')
];

Dialog.rat = [
new Line('RAT', '*SSSHH*'),
new Line('SPEAKERS', 'ALERT: HARMFUL RODENT DETECTED.\nAVOIDING STARTEGY ACTIVATED.'),
];

Dialog.spider = [
new Line('SPEAKERS', 'UNKNOWN ENTITY DETECTED.\nSEARCHING FOR DATA...'),
new Line('', '.....................................................................................'),
new Line('SPEAKERS', '.....*PIIING*'),
new Line(null, 'ENTITY RECOGNIZED AS SPIDER.\nUSES ITS WEB TO IMMOBILIZE ITS\nPREY. JUDGED AS HARMFUL.'),
new Line(null, 'AVOIDING STARTEGY ACTIVATED.')
];

Dialog.cellarEnd = [
new Line('SPEAKERS', 'FRESH SURFACE AIR DETECTED.\nDIRECTION CONFIRMED.'), 
];


// CAVE

Dialog.physics = [
new Line('SPEAKERS', 'PHYSICS BOOK DETECTED.\nANALYSING...'),
new Line(null, '................................'),
new Line(null, '... *CRSH* *KPM*'),
new Line('SPEAKER', 'COGNITION MODULE DAMAGED.\nANALYSIS ABORTED.')
];

Dialog.sports = [
new Line('SPEAKERS', 'SPORTS BOOK DETECTED.\nANALYSING...'),
new Line(null, '................................'),
new Line('SOUND', '....*PIIING*'),
new Line('SPEAKERS', 'ANALYSIS COMPLETED.\nUSEFUL INFORMATION: 0%\nBOOK IGNORED.'),
];

Dialog.politics = [
new Line('SPEAKERS', 'POLITICS BOOK DETECTED.\nANALYSING...'),
new Line(null, '................................'),
new Line('SOUND', '....*PIIING*'),
new Line('SPEAKERS', 'ANALYSIS COMPLETED.\nUSEFUL INFORMATION: 47%'),
new Line(null, 'SWITCHING INTO\nANARCHY MODE...'),
new Line(null, '............'),
new Line('', '*MNT* *MSTR*'),
new Line('SPEAKER', 'HELICOIDAL MODULE DAMAGED.\nANARCHY MODE ABORTED.'),
];

Dialog.anime = [
new Line('SPEAKERS', 'ANIME DISCS DETECTED.\nANALYSING...'),
new Line(null, '................................'),
new Line('SOUND', '....*PIIING*'),
new Line('SPEAKERS', 'ANALYSIS COMPLETED.\nUSEFUL INFORMATION: 98%'),
new Line(null, 'TRYING TO PIERCE\nTHE HEAVEN WTIH A DRILL...'),
new Line(null, '...............'),
new Line('', '*TTGL* *KMN*'),
new Line('SPEAKER', 'DRILL MODULE MISSING.\nDRILLING ABORTED.'),
];

Dialog.antigravity = [
new Line('SPEAKERS', 'ANTIGRAVITY BOOK DETECTED.\nANALYSING...'),
new Line('', '................................'),
new Line('SOUND', '....*PIIING*'),
new Line('SPEAKERS', 'ANALYSIS COMPLETED.\nUSEFUL INFORMATION: 100%'),
new Line(null, 'BOOTING UP THE\nANTIGRAVITY MODULE...'),
new Line('', '..................'),
new Line(null, '............'),
new Line('SOUND', '*KA-PIIING*'),
new Line('SPEAKER', 'ANTIGRAVITY MODULE BOOTED.\nSTAND IN AN OPEN SPACE\nFOR AWESOME.'),
];

Dialog.credits = [
new Line('', '       UNDER THE LIBRARY\nA LUDUM DARE 29 GAME\nTHEME: BENEATH THE SURFACE'),
new Line(null, 'ALL SPRITE, TILESET, CODE, AUDIO\nCREATED IN 48H\nBY DELCA ( @DELCAW )'),
new Line(null, '\n      THANKS FOR PLAYING!')
];

Dialog.epilogue = [
new Line(null, '-THE END-'),
new Line(null, 'AND THUS END YOUR ADVENTURE.\nHAVING NAVIGATED THIS LABYRINTH,\nYOU FINALLY FOUND THE EXIT.'),
new Line(null, 'NO ONE CAN TELL WHAT WILL\nHAPPEN TO YOU NEXT.\nOH, AND BY THE WAY,'),
new Line(null, 'DID YOU FIND THE\nFOUR HIDDEN BOOKS ?\n\:-)'),

];
