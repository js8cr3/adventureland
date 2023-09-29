const createGrid = require_code('createGrid');
const followLeaderStrategy = require_code('followLeaderStrategy');
const aggroKiteStrategy = require_code('aggroKiteStrategy');
const utils = require_code('utils');
const settings = require_code('settings');
const adventurelandUtils = require_code('adventurelandUtils');
const transformNodes = require_code('transformNodes');
const drawPathfinding = require_code('drawPathfinding');

const gridUnit = settings.gridUnit;
const obstacleSymbol = settings.obstacleSymbol;
const obstacleList = settings.obstacleList;
const symbolB = settings.symbolB;

const transformGridPathToCoor = utils.transformGridPathToCoor;
const translatePositionToGridCoor = utils.translatePositionToGridCoor;
const markObstacles = utils.markObstacles;
const consoleDisplayGrid = utils.consoleDisplayGrid;
const markCorners = utils.markCorners;

module.exports = manouver;

function manouver(nodes, boundary, strategyType) {

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
	 
//	if(character.password === 'draw') drawPathfinding(pathfindGrid);
	
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
//	drawPathfinding(null, pathToDestination);

}

