var SOUND;

function loadSound(name){
	//var soundName = 'reelSpinLoop.aac';
	SOUND = new Howl({src: ['sounds/' + name]});

}
function soundPlay() {
	SOUND.play();
	var name = SOUND._src.replace('sounds/', '');
	$('#soundName').html(name);
}

function soundStop() {
	SOUND.stop();
}

function fadeOut (){
	SOUND.fade(1, 0, 500)
}

function setValue(){
	var slider = document.getElementById('playback-slider');
	var speed = document.getElementById('playback-slider');
	speed.innerHTML = slider.value;
	SOUND.pause();
	SOUND._rate = slider.value;

	SOUND.play();
	// SOUND.loop(true);
}

function loadedSound(soundName){
	$('#soundName').html(soundName);
}

function newSoundHandle(){
	var name = $('#soundToLoad')[0].files[0].name;

	if(SOUND && SOUND.playing()){
		soundStop();
	}

	loadSound(name);
	loadedSound(name);
}

function toggleLoop(){
	SOUND._loop = !SOUND._loop;	//TODO
	$("#loop-btn").toggleClass('active');
}

function addEndHandler (){
	var name = $('#soundToLoadOnEnd')[0].files[0].name;
	SOUND.on('end', function(){
		$('input').val('');
		SOUND = new Howl({src: ['sounds/' + name]});
		soundPlay();
	});
}

function addSound(){
	$("#soundToLoad").click();
}