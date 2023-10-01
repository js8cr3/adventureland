module.exports = load_drawPathfinding();

async function load_drawPathfinding() {

	const [
		{ symbolA, symbolB, symbolC, symbolD, destSymbol },
		{ transformGridPathToCoor }
	] = await Promise.all([
		require_code('utils'),
		require_code('settings')
	]);

	return drawPathfinding;

}

function drawPathfinding(pathfindGrid, path) {

	// draw grid 
	
	if(pathfindGrid) {

		const cellList = []
		const symbolList = []
		for(let i = 0; i < pathfindGrid.length; i++) {
			for(let j = 0; j < pathfindGrid[i].length; j++) {
				cellList.push([j, i]);
				symbolList.push(pathfindGrid[i][j]);
			}
		}

		const coorList = transformGridPathToCoor(cellList, monsterBoundary, gridUnit)
		const drawGrid = [];
		coorList.forEach( (coor, i) => {
			drawGrid.push({x: coor[0], y: coor[1], symbol: symbolList[i]});
		} );
		drawGrid.forEach( node => {

			let nodeColor;
			switch(node.symbol) {
				case symbolA: 
					nodeColor = 0x00ff00;
					break;
				case symbolB:
					nodeColor = 0xcccc00;
					break;
				case symbolC:
					nodeColor = 0xff8800;
					break;
				case symbolD:
					nodeColor = 0xff0000;
					break;
				case destSymbol:
					nodeColor = 0xff00ff;
				default: nodeColor = 0x010000;
			}
			draw_circle(node.x, node.y, 1, 12, nodeColor);

		} )

	}

	// draw path
	
	if(!path) return;

	const deep = structuredClone(path);
	deep[-1] = [character.x, character.y];

	for(let i = 0; i < deep.length; i++) {
		draw_circle(...deep[i], 1, 2, 0xffaaaa);
		draw_line(...deep[i-1], ...deep[i], 2, 0xffaaaa);
	}

}
