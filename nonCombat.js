module.exports = load_nonCombat();

async function load_nonCombat() {
	return {
		retreatToSafety, 
		mageHandleDeath, 
		nonMageHandleDeath, 
		teleportToSpot,
		requestMagiport,
		handleMagiportRequest
	}
}


// active 

async function retreatToSafety() {
	character.combatState = 'ready'
	const safeSpot = [-442,-2154];
	let result;
	while(result !== 'stopped') {
		const mData = await smart_move(...safeSpot)
		result = mData.reason;
	}
	while(character.targets) {
		await new Promise(r => setTimeout(r, 1000));
	}
}

// rip

async function mageHandleDeath() {
	await new Promise(r => setTimeout(r, 15000));
	await respawn();
	character.combatState = 'inactive'
}

async function nonMageHandleDeath() {
	await new Promise(r => setTimeout(r, 15000));
    await respawn();
	character.combatState = 'inactive';
}

// inactive

async function teleportToSpot() {

	const waitForMP = async () => {
		while(character.mp < 1600) {
			await new Promise(r => setTimeout(r, 1000));
		}
		return;
	}
	if(character.map === 'main') {
		await waitForMP();
		await use_skill('blink', [-83, -422]);
		await new Promise(r => setTimeout(r, 3000));
		await smart_move({map: 'winterland', x: -8, y: -337});
	}
	await waitForMP();
	await use_skill('blink', [-442,-2154]);
	await new Promise(r => setTimeout(r, 3000));
	character.combatState = 'ready';

}

function requestMagiport(name) {
	/*
	parent.socket.on('magiport', data => {
		log('received magiport invite')
		log(JSON.stringify(data));
		if(data.name !== name) return;
		accept_magiport(name);
		character.combatState = 'ready';
	});*/
	send_cm(name, 'magiport');
}

// startup

async function handleMagiportRequest(partyNameList) {

	character.magiportCheck = {};
	for(const name of partyNameList) {
		character.magiportCheck[name] = null
	}

	const useMagiport = async name => {
		const cleanup = setTimeout( () => { throw new Error('magiport timeout') }, 5000);
		await use_skill('magiport',name); 
		for(let i = 0; i < 5; i++) {
			if(get_player(name)) {
				clearTimeout(cleanup)
				return;
			}
			await new Promise(r=>setTimeout(r, 1000));
		}
	}
	while(true) {
		await new Promise(r => setTimeout(r, 1000));
		if(character.combatState !== 'ready' && character.combatState !== 'active') continue;
		// check whether anyone is requesting magiport
		const mList = character.magiportCheck;
		let magiportTarget;
		for(const name in mList) {
			if(!mList[name]) continue;
			magiportTarget = name;	
			break;
		}
		if(!magiportTarget) continue;
		// wait for target to be teleported
		let mSuccess = false;
		while( !mSuccess ) {
			while(character.mp < 1000) {
				await new Promise(r => setTimeout(r, 1000));
			}
			await useMagiport(magiportTarget).then( () => mSuccess = true ).catch(log);
			await new Promise(r=>setTimeout(r,1000))
		}
		character.magiportCheck[magiportTarget] = null;
	}
}
