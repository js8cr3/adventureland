module.exports = load_manouver();

async function load_manouver() {

	const [
		{ followLeaderStrategy, aggroKiteStrategy },
		{ randomNum, createGrid, transformGridPathToCoor, translatePositionToGridCoor, markObstacles, consoleDisplayGrid, markCorners },
		{ gridUnit, obstacleSymbol, obstacleList, symbolB },
		transformNodes,
		drawPathfinding
	] = await Promise.all( [ 
		require_code('manouverStrategies'),
		require_code('utils'),
		require_code('settings'),
		require_code('transformNodes'),
		require_code('drawPathfinding')
	] );

	return manouver;

	function manouver(nodes, boundary, strategyType) {

		let drawEnabled;
		if(character.name === 'Stool') drawEnabled = true;

		// strategyType: 'aggroKiteStrategy', 'followLeaderStrategy'
		if( strategyType !== 'aggroKiteStrategy' && strategyType !== 'followLeaderStrategy' ) throw new Error('No valid strategy given');
		if(!nodes) throw new Error('No nodes given');
		if(!boundary) throw new Error('No boundary given');

		// possible values:
			// 'outside boundary'
			// 'move towards target'
			// 'no path'
			// 'arrived'
			
		clear_drawings();
		
		const currentNodes = transformNodes(nodes, boundary);
		const pathfindGrid = createGrid(currentNodes);
		markCorners(pathfindGrid, symbolB, 2);
		markObstacles(pathfindGrid, obstacleSymbol, obstacleList);
		// consoleDisplayGrid(pathfindGrid);

		// pathfinding
		
		const start = translatePositionToGridCoor(
			[character.x, character.y], boundary, gridUnit
		);
		if(!start) {
			move((boundary[0]+boundary[2])/2, (boundary[1]+boundary[3])/2)
			return 'outside boundary';
		}

		let gridPath;
		if(strategyType === 'aggroKiteStrategy') {
			gridPath = aggroKiteStrategy(pathfindGrid, start, character.range * 0.9)
		} else if (strategyType === 'followLeaderStrategy') {
			gridPath = followLeaderStrategy(pathfindGrid, start, boundary, gridUnit)
		}
		 
		if(drawEnabled) drawPathfinding(pathfindGrid, null, boundary);
		
		if(gridPath === 'stuck in obstacle') {
			move(character.x + randomNum(-30, 30), character.y + randomNum(-30, 30));
			return gridPath;
		}
		if(gridPath === 'outside attack range') {
			const targetedMonster = get_targeted_monster();
			move(targetedMonster.x, targetedMonster.y);
			return gridPath;
		}
		if(gridPath === 'no path') return 'no path';
		if(gridPath === 'target to follow does not exist') return gridPath;
		if(gridPath === 'arrived') return 'arrived';
		const pathToDestination = transformGridPathToCoor(gridPath, boundary, gridUnit);

		const moveByPath = async () => {
			for(const point of pathToDestination) {
				const moveData = await move(point[0], point[1]);
				if(!moveData.reason) break;
				if(moveData.reason && moveData.reason !== 'stopped') break;
			}
		}

		moveByPath();
		if(drawEnabled) drawPathfinding(null, pathToDestination, boundary);

	}

}



