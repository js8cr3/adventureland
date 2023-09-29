const settings = require_code('settings');
const utils = require_code('utils');
const fill = require_code('fill');
const bfs = require_code('bfsGrid');

const symbolA = settings.symbolA;
const symbolB = settings.symbolB;
const symbolC = settings.symbolC;
const symbolD = settings.symbolD;
const pathSymbol = settings.pathSymbol;
const wallSymbol = settings.wallSymbol;
const destSymbol = settings.destSymbol;
const obstacleSymbol = settings.obstacleSymbol;

const randomNum = utils.randomNum;
const withinRange = utils.withinRange;
const translatePositionToGridCoor = utils.translatePositionToGridCoor;

const closestCellToTarget = utils.closestCellToTarget;

module.exports = followLeaderStrategy;

function followLeaderStrategy(grid, start, boundary, gridUnit) {

	// possible values:
		// 'startType error'
		// bfs()
		// 'stuck in obstacle'

	let deep = structuredClone(grid);
	const startType = deep[start[1]][start[0]]
	
	// if stuck, move in random direction
	
	if(startType === obstacleSymbol) {
		return 'stuck in obstacle';
	}

	// transform grid to be suitable for bfs function

	const transformGrid = () => {

		const symbolTransformList = {};
		symbolTransformList[symbolA] = null;
		symbolTransformList[symbolB] = null;
		symbolTransformList[symbolC] = null;
		symbolTransformList[symbolD] = null;

		switch(startType) {
			case symbolA:
				symbolTransformList[symbolA] = pathSymbol;
				symbolTransformList[symbolB] = pathSymbol;
				symbolTransformList[symbolC] = wallSymbol;
				symbolTransformList[symbolD] = wallSymbol;
				break;
			case symbolB:
				symbolTransformList[symbolA] = pathSymbol;
				symbolTransformList[symbolB] = pathSymbol;
				symbolTransformList[symbolC] = wallSymbol;
				symbolTransformList[symbolD] = wallSymbol;
				break;
			case symbolC:
				symbolTransformList[symbolA] = destSymbol;
				symbolTransformList[symbolB] = destSymbol;
				symbolTransformList[symbolC] = pathSymbol;
				symbolTransformList[symbolD] = wallSymbol;
				break;
			case symbolD:
				symbolTransformList[symbolA] = destSymbol;
				symbolTransformList[symbolB] = destSymbol;
				symbolTransformList[symbolC] = destSymbol;
				symbolTransformList[symbolD] = pathSymbol;
		};
			
		const transformCell = (row, cell, cellIndexInRow) => {
			for(const symbolToChange in symbolTransformList) {
				if(cell === symbolToChange) {
					row[cellIndexInRow] = symbolTransformList[symbolToChange]
					break;
				}
			}
		}

		for(const row of deep) {
			for(let i = 0; i < row.length; i++) {
				transformCell(row, row[i], i);
			}
		}

	}

	// pathfinding

	const pathfinding = () => {

		transformGrid();

		const setDestinationToTarget = () => {
			const follow = get_player('Stool');
			if(!follow) {
				return 'target to follow does not exist';
			}
			const targetCoor = translatePositionToGridCoor([follow.x, follow.y], boundary, gridUnit);
			const currentArea = fill(deep, start, pathSymbol);
			const endCoor = closestCellToTarget(deep, currentArea, targetCoor)
			deep[endCoor[1]][endCoor[0]] = wallSymbol;
			for(const cell of currentArea) {
				if( Math.abs( endCoor[0] - cell[0] ) > 1 ) continue;
				if( Math.abs( endCoor[1] - cell[1] ) > 1 ) continue;
				deep[cell[1]][cell[0]] = destSymbol;
			}
		}

		if(startType === symbolB || startType === symbolA) {
			setDestinationToTarget();
		}

		let pathToDestination = bfs(deep, start);
		if(pathToDestination === 'no path') return 'no path';
		//utils.consoleDisplayGrid(deep);

		return pathToDestination;

	};

	return pathfinding();

}
