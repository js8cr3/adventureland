module.exports = load_aggroKiteStrategy();

async function load_aggroKiteStrategy() {

	const [
		{ symbolA, symbolB, symbolC, symbolD, pathSymbol, wallSymbol, destSymbol, obstacleSymbol },
		{ randomNum, withinRange, closestCellToCenter }, 
		fill,
		bfsGrid
	] = await Promise.all([
		require_code('settings'),
		require_code('utils'),
		require_code('fill'),
		require_code('bfsGrid')
	]);

	return aggroKiteStrategy;

	function aggroKiteStrategy(grid, start, range) {

		// possible values:
			// 'startType error'
			// bfsGrid()
			// 'outside attack range'
			// 'stuck in obstacle'

		let deep = structuredClone(grid);
		const startType = deep[start[1]][start[0]]
		
		// if stuck, return
		
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
					symbolTransformList[symbolB] = wallSymbol;
					symbolTransformList[symbolC] = wallSymbol;
					symbolTransformList[symbolD] = wallSymbol;
					break;
				case symbolB:
					symbolTransformList[symbolA] = destSymbol;
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
			const setCenterOfCurrentArea = () => {
				const currentArea = fill(deep, start, pathSymbol);
				const endCoor = closestCellToCenter(deep, currentArea);
				deep[endCoor[1]][endCoor[0]] = destSymbol;
			}

			if(startType === symbolA) {
				setCenterOfCurrentArea();
			}

			let pathToDestination = bfsGrid(deep, start);
			if(pathToDestination === 'no path') {
				if(startType !== symbolB) return 'no path';
				deep = structuredClone(grid);
				transformGrid();
				setCenterOfCurrentArea();
				pathToDestination = bfsGrid(deep, start);
			}
			//utils.consoleDisplayGrid(deep);

			return pathToDestination;

		};

		const target = get_targeted_monster();
		if( 
			range && 
			startType === symbolA && 
			target && !withinRange(character, target, range)
		) {
			return 'outside attack range';
		} else {
			return pathfinding();
		}

	}

}


