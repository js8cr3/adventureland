const nonCombat = require_code('nonCombat');
const manouver = require_code('manouver');
const combat = require_code('combat');
const adventurelandUtils = require_code('adventurelandUtils');
const utils = require_code('utils');
const settings = require_code('settings');

const monsterData = settings.monsterData;
const getMonsterBoundary = adventurelandUtils.getMonsterBoundary;
const initializeNodes = utils.initializeNodes;
const withinBoundary2D = utils.withinBoundary2D;
const symbolA = settings.symbolA;
const gridUnit = settings.gridUnit;

const monsterBoundary = getMonsterBoundary(...monsterData);
monsterBoundary[0] -= gridUnit * 2;
monsterBoundary[2] += gridUnit * 4;

const nodes = initializeNodes(monsterBoundary, gridUnit, symbolA);

const mageName = 'Desk';

if(character.ctype === 'merchant') {

			manouver(nodes, monsterBoundary, 'aggroKiteStrategy') 
	
} else if(character.ctype === 'mage') {
	
	mageMain();
	
	function on_cm(name, data) {
		log(name)
		const partyNameList = ['Stool', 'Shelf'];
		let isPartyMember = false;
		for(const memberName of partyNameList) {
			if(name !== memberName) continue;
			isPartyMember = true;
			break;
		}
		if(!isPartyMember) return;
		if(data !== 'magiport') return;
		character.magiportCheck[name] = 'magiport';
	} 	
	
} else if(character.ctype === 'priest') {
	priestMain();
	function on_magiport(name) {
		log('received magiport invite')
		if(name !== 'Desk') return;
		accept_magiport(name);
		character.combatState = 'ready';
	};
} else if(character.ctype === 'warrior') {
	warriorMain();
	function on_magiport(name) {
		log('received magiport invite')
		if(name !== 'Desk') return;
		accept_magiport(name);
		character.combatState = 'ready';
	};
}

async function priestMain() {
	if( withinBoundary2D(character, monsterBoundary) ){
		character.combatState = 'active';
	} else if (character.rip) {
		character.combatState = 'rip';
	} else {
		character.combatState = 'inactive';
	}
	while(true) {
		log(character.combatState)
		await priestLoop();
	}
}

async function mageMain() {
	nonCombat.handleMagiportRequest(['Stool', 'Shelf']);
	if( 
		get_player('Stool') &&
		withinBoundary2D(character, monsterBoundary) 
	) {
		character.combatState = 'active';
	} else if (character.rip) {
		character.combatState = 'rip';
	} else {
		character.combatState = 'inactive';
	}
	while(true) {
		log('combat: '+character.combatState)
		await mageLoop();
	}
}

async function warriorMain() {
	if( 
		get_player('Stool') &&
		withinBoundary2D(character, monsterBoundary) 
	) {
		character.combatState = 'active';
	} else if (character.rip) {
		character.combatState = 'rip';
	} else {
		character.combatState = 'inactive';
	}
	while(true) {
		log(character.combatState)
		await warriorLoop();
	}

}

async function mageLoop() {

	const currentState = character.combatState;
	const currentIntervals = [];

	switch(currentState) {
		case 'active':
			currentIntervals.push( setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) {
					if(character.rip) character.combatState = 'rip'
					return;
				}
				const priest = get_player('Stool');
				if(!priest || (priest && priest.rip)) nonCombat.retreatToSafety();
			}, 333 ) );
			currentIntervals.push( setInterval( () => { 
				if(character.combatState !== currentState) return;
				combat.mage() 
			}, 100 ) );
			currentIntervals.push( setInterval( () => { 
				if(character.combatState !== currentState) return;
				manouver(nodes, monsterBoundary, 'followLeaderStrategy') 
			}, 333 ) );
			break;
		case 'ready':
			currentIntervals.push( setInterval( () => {
				combat.misc();
			}, 500 ) );
			currentIntervals.push( setInterval( () => {
				if(get_player('Stool')) character.combatState = 'active';
			}, 1000) );
			break;
		case 'inactive':
			currentIntervals.push( setInterval( () => {
				combat.misc();
			}, 500 ) );
			await nonCombat.teleportToSpot()
			character.combatState = 'ready';
			break;
		case 'rip':
			nonCombat.mageHandleDeath();
			log('rip');
	}

	while(character.combatState === currentState) {
		await new Promise(r=>setTimeout(r, 1000));
	}

	for(const interval of currentIntervals) {
		clearInterval(interval);
	}

}

async function priestLoop() {

	const currentState = character.combatState;
	const currentIntervals = [];

	switch(currentState) {
		case 'ready':
			character.combatState = 'active';
			break;
		case 'active':
			currentIntervals.push( setInterval( () => {
				if(character.rip) character.combatState = 'rip'
			}, 333 ) );
			currentIntervals.push( setInterval( () => { 
				combat.priest(monsterBoundary) 
			}, 100 ) );
			currentIntervals.push( setInterval( () => { 
				manouver(nodes, monsterBoundary, 'aggroKiteStrategy') 
			}, 333 ) );
			break;
		case 'inactive':
			currentIntervals.push( setInterval( () => {
				combat.misc();
			}, 500 ) );
			while(character.combatState === 'inactive') {
				nonCombat.requestMagiport(mageName);
				await new Promise(r=>setTimeout(r, 10000));
			}
			break;
		case 'rip':
			nonCombat.nonMageHandleDeath();
			log('rip');
	}

	while(character.combatState === currentState) {
		await new Promise(r=>setTimeout(r, 1000));
	}

	for(const interval of currentIntervals) {
		clearInterval(interval);
	}

}

async function warriorLoop() {

	const currentState = character.combatState;
	const currentIntervals = [];

	switch(currentState) {
		case 'ready':
			currentIntervals.push( setInterval( () => {
				combat.misc();
			}, 500 ) );
			currentIntervals.push( setInterval( () => {
				if(get_player('Stool')) character.combatState = 'active';
			}, 1000) );
			break;
		case 'active':
			currentIntervals.push( setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) {
					if(character.rip) character.combatState = 'rip'
					return;
				}
				const priest = get_player('Stool');
				if(!priest || (priest && priest.rip)) nonCombat.retreatToSafety();
			}, 333 ) );
			currentIntervals.push( setInterval( () => { 
				combat.warrior();
			}, 100 ) );
			currentIntervals.push( setInterval( () => { 
				combat.warriorMove();
			}, 250 ) );
			break;
		case 'inactive':
			currentIntervals.push( setInterval( () => {
				combat.misc();
			}, 500 ) );
			while(character.combatState === 'inactive') {
				nonCombat.requestMagiport(mageName);
				await new Promise(r=>setTimeout(r, 10000));
			}
			break;
		case 'rip':
			nonCombat.nonMageHandleDeath();
			log('rip');
	}

	while(character.combatState === currentState) {
		await new Promise(r=>setTimeout(r, 1000));
	}

	for(const interval of currentIntervals) {
		clearInterval(interval);
	}

}
