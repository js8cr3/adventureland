module.exports = {
	getMonstersByType,
	getAggressiveMonster,
	getMonsterBoundary,
	getNearestMonsterInsideBoundary
}

function getMonsterBoundary(monsterType, map, skip) {
	let skipCount = 0;
    for(const monster of G.maps[map].monsters) {
        if(monster.type !== monsterType) continue;
		if(skip && skipCount < skip) {
			skipCount++;
			continue;
		}
        return structuredClone(monster.boundary);
    }
}

function getAggressiveMonster(playerNameList, excludeIDList) {
	// get any monster that is targetting anyone in playerNameList
	entityLoop: for(const id in parent.entities) {
		const entity = parent.entities[id];
		if(entity.type !== 'monster') continue;
		if(!entity.target) continue;
		for(const ID of excludeIDList) {
			// if monster is in list, skip
			if(entity.id === ID) continue entityLoop;
		}
		for(const name of playerNameList) {
			if(entity.target === name) return entity;
		}
	}
}

function getMonstersByType(type) {
	const array = []; 
	for(const id in parent.entities) {
		const entity = parent.entities[id];
		if(entity.type !== 'monster') continue;
		if(entity.mtype !== type) continue;
		array.push(entity)
	}   
	return array;
}

function getNearestMonsterInsideBoundary(boundary) {
	
	if(!boundary) throw new Error('No boundary given');

	let current;
	let distance = 999999;
	for(const id in parent.entities) {
	
		const entity = parent.entities[id];
		if(entity.type !== 'monster') continue;
		if( 
			entity.x < boundary[0] ||
			entity.x > boundary[2] ||
			entity.y < boundary[1] ||
			entity.y > boundary[3]
		) continue;
		const cDistance = Math.sqrt( Math.pow( (entity.x - character.x), 2 ) + Math.pow( (entity.y - character.y), 2 ) );
		if(cDistance > distance) continue;
		current = entity;
		distance = cDistance;
	}   
	
	return current;
	
}
