module.exports = createGrid;

function createGrid(nodes) {
	// nodes: {x: Number, y: Number, w: String}

	const posGrid = []; // record cell positions
	const grid = [];	// record cell type

	const whereToInsertX = (node, array /* as row */ ) => {
		for(let i = 0; i < array.length; i++) {
			if(node.x < array[i][0] /* row's nth cell's x coor */ ) {
				return i;
			}
		}
		return array.length;
	}

	const whereToInsertY = (node, array /* as grid */ ) => {
		for(let i = 0; i < array.length; i++) {
			if(node.y < array[i][0][1] /* grid's nth row's first cell's y coor */) {
				return i;
			}
		}
		return array.length;
	}

	const displaceArray = (firstToDisplace, array) => {
		if(firstToDisplace>= array.length) return;
		for(let i = array.length - 1; i >= firstToDisplace; i--) {
			array[i+1] = array[i];
			array[i] = undefined;
		}
		return true;
	}

	nodes.forEach( (node, i) => {
		
		// if there's nothing in posGrid, initialize posGrid and grid
		if(!posGrid.length) {
			posGrid.push([[node.x, node.y]]);
			grid.push([node.w]);
			return;
		}

		// look for the row with the same y-level as current node
		let yIndex;
		for(let i = 0; i < posGrid.length; i++) {
			if(node.y !== posGrid[i][0][1] /* row's first cell's y coor */ ) continue;
			yIndex = i;
			break;
		}

		// if a row with the same y-level as the node doesn't exist, create new row at the appropriate index
		if(typeof yIndex === 'undefined') { 	
			yIndex = whereToInsertY(node, posGrid);
			displaceArray(yIndex, posGrid);
			displaceArray(yIndex, grid);
			posGrid[yIndex] = [[node.x, node.y]];
			grid[yIndex] = [node.w];
			return;
		}
		
		const xIndex = whereToInsertX(node, posGrid[yIndex]);
		displaceArray(xIndex, posGrid[yIndex]);
		displaceArray(xIndex, grid[yIndex]);
		posGrid[yIndex][xIndex] = [node.x, node.y];
		grid[yIndex][xIndex] = node.w;

	} )
	
	return grid;

}
