async function main() {

	const [
		nonCombat,
		manouver,
		combat,
		{ getMonsterBoundary },
		{ initializeNodes, withinBoundary2D },
		{ symbolA, gridUnit, monsterData }
	] = await Promise.all( [
		require_code('nonCombat'),
		require_code('manouver'),
		require_code('combat'),
		require_code('adventurelandUtils'),
		require_code('utils'),
		require_code('settings')
	] );

	const monsterBoundary = getMonsterBoundary(...monsterData);
	monsterBoundary[0] -= gridUnit * 2;
	monsterBoundary[2] += gridUnit * 4;

	const nodes = initializeNodes(monsterBoundary, gridUnit, symbolA);

	const mageName = 'Desk';
	const priestName = 'Stool'
	const partyList = ['Desk', 'Stool', 'Shelf'];

	function on_magiport(name) {
		if(name !== mageName) return;
		accept_magiport(name);
		character.combatState = 'ready';
	};


	if(character.ctype === 'merchant') {

		manouver(nodes, monsterBoundary, 'aggroKiteStrategy') 
		
	} else if(character.ctype === 'mage') {
		
		mageMain();
		
		function on_cm(name, data) {
			const partyNameList = partyList;
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
	} else if(character.ctype === 'warrior') {
		warriorMain();
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
			await priestLoop();
		}
	}

	async function mageMain() {
		nonCombat.handleMagiportRequest(partyList);
		if( 
			get_player(priestName)&&
			withinBoundary2D(character, monsterBoundary) 
		) {
			character.combatState = 'active';
		} else if (character.rip) {
			character.combatState = 'rip';
		} else {
			character.combatState = 'inactive';
		}
		while(true) {
			await mageLoop();
		}
	}

	async function warriorMain() {
		if( 
			get_player(priestName) &&
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
		let currentIntervals = [];

		switch(currentState) {
			case 'active':
				currentIntervals = [
					setInterval( () => {
						if(character.combatState !== currentState) return;
						if(character.rip) {
							if(character.rip) character.combatState = 'rip'
							return;
						}
						const priest = get_player(priestName);
						if(!priest || (priest && priest.rip)) nonCombat.retreatToSafety();
					}, 333 ),
					setInterval( () => { 
						if(character.combatState !== currentState) return;
						combat.mage() 
					}, 100 ),
					setInterval( () => { 
						if(character.combatState !== currentState) return;
						manouver(nodes, monsterBoundary, 'followLeaderStrategy') 
					}, 333 )
				]
				break;
			case 'ready':
				currentIntervals = [
					setInterval( () => {
						combat.misc();
					}, 500 ),
					setInterval( () => {
						if(get_player(priestName)) character.combatState = 'active';
					}, 1000)
				]
				break;
			case 'inactive':
				currentIntervals = [
					setInterval( () => {
						combat.misc();
					}, 500 )
				];
				await nonCombat.teleportToSpot()
				character.combatState = 'ready';
				break;
			case 'rip':
				nonCombat.handleDeath();
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
		let currentIntervals = [];

		switch(currentState) {
			case 'ready':
				character.combatState = 'active';
				break;
			case 'active':
				currentIntervals = [ 
					setInterval( () => {
						if(character.rip) character.combatState = 'rip'
					}, 333 ),
					setInterval( () => { 
						combat.priest(monsterBoundary) 
					}, 100 ),
					setInterval( () => { 
						manouver(nodes, monsterBoundary, 'aggroKiteStrategy') 
					}, 333 )
				]
				break;
			case 'inactive':
				currentIntervals = [
					setInterval( () => {
						combat.misc();
					}, 500 )
				]
				while(character.combatState === 'inactive') {
					nonCombat.requestMagiport(mageName);
					await new Promise(r=>setTimeout(r, 10000));
				}
				break;
			case 'rip':
				nonCombat.handleDeath();
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
		let currentIntervals = [];

		switch(currentState) {
			case 'ready':
				currentIntervals = [
					setInterval( () => {
						combat.misc();
					}, 500 ),
					setInterval( () => {
						if(get_player(priestName))character.combatState = 'active';
					}, 1000)
				]
				break;
			case 'active':
				currentIntervals = [
					setInterval( () => {
						if(character.combatState !== currentState) return;
						if(character.rip) {
							if(character.rip) character.combatState = 'rip'
							return;
						}
						const priest = get_player(priestName);
						if(!priest || (priest && priest.rip)) nonCombat.retreatToSafety();
					}, 333), 
					setInterval( () => { 
						combat.warrior();
					}, 100), 
					setInterval( () => { 
						combat.warriorMove();
					}, 250)
				];
				break;
			case 'inactive':
				currentIntervals = [
					setInterval( () => {
						combat.misc();
					}, 500 ),
				]
				while(character.combatState === 'inactive') {
					nonCombat.requestMagiport(mageName);
					await new Promise(r=>setTimeout(r, 10000));
				}
				break;
			case 'rip':
				nonCombat.handleDeath();
		}

		while(character.combatState === currentState) {
			await new Promise(r=>setTimeout(r, 1000));
		}

		for(const interval of currentIntervals) {
			clearInterval(interval);
		}

	}

};
