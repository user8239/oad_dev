RMS.LoadLibrary("rmgen");

const tGrass = ["cliff volcanic light", "ocean_rock_a", "ocean_rock_b"];
const tGrass1 = "cliff volcanic light";
const tGrass2 = "ocean_rock_a";
const tGrass3 = "temp_grass_plants";
const tCliff = ["cliff volcanic coarse", "cave_walls"];
const tRoad = "road1";
const tRoadWild = "road1";
const tLava = "LavaHard";
const tForestFloor1 = "temp_forestfloor_a";
const tForestFloor2 = "temp_grass";
const tGrassPatchBlend = "temp_grass_long_b";
const tGrassPatch = ["temp_grass_d", "temp_grass_clovers"];

// gaia entities
const oChicken = "gaia/fauna_chicken";
const oTree = "gaia/flora_tree_dead";
const oTree2 = "gaia/flora_tree_euro_beech";
const oTree3 = "gaia/flora_tree_oak";
const oTree4 = "gaia/flora_tree_oak_dead";
const oBush = "gaia/flora_bush_temperate";
const oFruitBush = "gaia/flora_bush_berry";
const oRabbit = "gaia/fauna_rabbit";
const oDeer = "gaia/fauna_deer";
const oBear = "gaia/fauna_bear";
const oStoneLarge = "gaia/geology_stonemine_temperate_quarry";
const oStoneSmall = "gaia/geology_stone_temperate";
const oMetalLarge = "gaia/geology_metal_temperate_slabs";

// decorative props
const aRockLarge = "actor|geology/stone_granite_med.xml";
const aRockMedium = "actor|geology/stone_granite_med.xml";
const aBushMedium = "actor|props/flora/bush_tempe_me.xml";
const aBushSmall = "actor|props/flora/bush_tempe_sm.xml";
const aGrass = "actor|props/flora/grass_soft_large_tall.xml";
const aGrassShort = "actor|props/flora/grass_soft_large.xml";

const pForestD = [tForestFloor1 + TERRAIN_SEPARATOR + oTree, tForestFloor2 + TERRAIN_SEPARATOR + oTree2,  tForestFloor1];
const pForestP = [tForestFloor1 + TERRAIN_SEPARATOR + oTree3, tForestFloor2 + TERRAIN_SEPARATOR + oTree4, tForestFloor1];
const pForestM = [tForestFloor1 + TERRAIN_SEPARATOR + oTree, tForestFloor2 + TERRAIN_SEPARATOR + oTree2,  tForestFloor2 + TERRAIN_SEPARATOR + oTree3, tForestFloor1 + TERRAIN_SEPARATOR + oTree4, tForestFloor1];

const BUILDING_ANGlE = -PI/4;

log("Initializing map...");
InitMap();

var numPlayers = getNumPlayers();
var mapSize = getMapSize();
var mapArea = mapSize*mapSize;

// create tile classes
var clPlayer = createTileClass();
var clHill = createTileClass();
var clFood = createTileClass();
var clHill2 = createTileClass();
var clHill3 = createTileClass();
var clHill4 = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clBaseResource = createTileClass();

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; i++)
	playerIDs.push(i+1);
playerIDs = sortPlayers(playerIDs);

// place players
var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerAngle = new Array(numPlayers);

var startAngle = randFloat(0, TWO_PI);
for (var i = 0; i < numPlayers; i++)
{
	playerAngle[i] = startAngle + i*TWO_PI/numPlayers;
	playerX[i] = 0.5 + 0.35*cos(playerAngle[i]);
	playerZ[i] = 0.5 + 0.35*sin(playerAngle[i]);
}

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");

	var radius = scaleByMapSize(15,25);

	// get the x and z in tiles
	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = round(fx);
	var iz = round(fz);
	addToClass(ix, iz, clPlayer);
	addToClass(ix+5, iz, clPlayer);
	addToClass(ix, iz+5, clPlayer);
	addToClass(ix-5, iz, clPlayer);
	addToClass(ix, iz-5, clPlayer);

	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tRoadWild, tRoad], [1]);
	createArea(placer, painter, null);

	// create starting units
	placeCivDefaultEntities(fx, fz, id, BUILDING_ANGlE);

	// create metal mine
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
		mAngle = randFloat(0, TWO_PI);

	var mDist = 12;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	var group = new SimpleGroup(
		[new SimpleObject(oMetalLarge, 1,1, 0,0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneLarge, 1,1, 0,2)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// create animals
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oChicken, 1,1, 0,2)],
			true, clBaseResource, aX, aZ
		);
		createObjectGroup(group, 0);
	}

	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oFruitBush, 2,2, 0,3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);

	// create starting trees
	var hillSize = PI * radius * radius;
	var num = floor(hillSize / 60);
	var tries = 10;
	for (var x = 0; x < tries; ++x)
	{
		var tAngle = randFloat(-PI/3, 4*PI/3);
		var tDist = randFloat(12, 13);
		var tX = round(fx + tDist * cos(tAngle));
		var tZ = round(fz + tDist * sin(tAngle));
		group = new SimpleGroup(
			[new SimpleObject(oTree2, num, num, 0, 3)],
			false, clBaseResource, tX, tZ
		);
		if (createObjectGroup(group, 0, avoidClasses(clBaseResource, 2)))
			break;
	}
	// create grass tufts
	var num = hillSize / 250;
	for (var j = 0; j < num; j++)
	{
		var gAngle = randFloat(0, TWO_PI);
		var gDist = radius - (5 + randInt(7));
		var gX = round(fx + gDist * cos(gAngle));
		var gZ = round(fz + gDist * sin(gAngle));
		group = new SimpleGroup(
			[new SimpleObject(aGrassShort, 2,5, 0,1, -PI/8,PI/8)],
			false, clBaseResource, gX, gZ
		);
		createObjectGroup(group, 0);
	}
}

RMS.SetProgress(15);

log("Creating volcano");
var fx = fractionToTiles(0.5);
var fz = fractionToTiles(0.5);
var ix = round(fx);
var iz = round(fz);
var div = scaleByMapSize(1,8);
var placer = new ClumpPlacer(mapArea * 0.067 / div, 0.7, 0.05, 100, ix, iz);
var terrainPainter = new LayeredPainter(
	[tCliff, tCliff],		// terrains
	[3]								// widths
);
var elevationPainter = new SmoothElevationPainter(
	ELEVATION_SET,			// type
	15,				// elevation
	3				// blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill)], null);

var placer = new ClumpPlacer(mapArea * 0.05 / div, 0.7, 0.05, 100, ix, iz);
var terrainPainter = new LayeredPainter(
	[tCliff, tCliff],		// terrains
	[3]								// widths
);
var elevationPainter = new SmoothElevationPainter(
	ELEVATION_SET,			// type
	25,				// elevation
	3				// blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill2)], stayClasses(clHill, 1));

var placer = new ClumpPlacer(mapArea * 0.02 / div, 0.7, 0.05, 100, ix, iz);
var terrainPainter = new LayeredPainter(
	[tCliff, tCliff],		// terrains
	[3]								// widths
);
var elevationPainter = new SmoothElevationPainter(
	ELEVATION_SET,			// type
	45,				// elevation
	3				// blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill3)], stayClasses(clHill2, 1));

var placer = new ClumpPlacer(mapArea * 0.011 / div, 0.7, 0.05, 100, ix, iz);
var terrainPainter = new LayeredPainter(
	[tCliff, tCliff],		// terrains
	[3]								// widths
);
var elevationPainter = new SmoothElevationPainter(
	ELEVATION_SET,			// type
	62,				// elevation
	3				// blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill4)], stayClasses(clHill3, 1));

var placer = new ClumpPlacer(mapArea * 0.003 / div, 0.7, 0.05, 100, ix, iz);
var terrainPainter = new LayeredPainter(
	[tCliff, tCliff, tCliff, tCliff],		// terrains
	[1, 1, 1]								// widths
);
var elevationPainter = new SmoothElevationPainter(
	ELEVATION_SET,			// type
	42,				// elevation
	1				// blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill4)], stayClasses(clHill4, 1));

var num = floor(mapArea * 0.03 / 15 / div);
var tX = round(fx);
var tZ = round(fz);


RMS.SetProgress(45);

log("Creating hills...");
placer = new ClumpPlacer(scaleByMapSize(20, 150), 0.2, 0.1, 1);
terrainPainter = new LayeredPainter(
	[tCliff, tGrass],		// terrains
	[2]								// widths
);
elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 18, 2);
createAreas(
	placer,
	[terrainPainter, elevationPainter, paintClass(clHill)],
	avoidClasses(clPlayer, 12, clHill, 15, clWater, 2, clBaseResource, 2),
	scaleByMapSize(2, 8) * numPlayers
);


// calculate desired number of trees for map (based on size)
var MIN_TREES = 300;
var MAX_TREES = 1350;
var P_FOREST = 0.7;

var totalTrees = scaleByMapSize(MIN_TREES, MAX_TREES);
var numForest = totalTrees * P_FOREST;
var numStragglers = totalTrees * (1.0 - P_FOREST);

log("Creating forests...");
var types = [
	[[tGrass2, tGrass1, pForestD], [tGrass2, pForestD]],
	[[tGrass2, tGrass1, pForestM], [tGrass2, pForestM]],
	[[tGrass2, tGrass1, pForestP], [tGrass2, pForestP]]
];	// some variation

var size = numForest / (scaleByMapSize(2,8) * numPlayers);

var num = floor(size / types.length);
for (var i = 0; i < types.length; ++i)
{
	placer = new ClumpPlacer(numForest / num, 0.1, 0.1, 1);
	painter = new LayeredPainter(
		types[i],		// terrains
		[2]											// widths
		);
	createAreas(
		placer,
		[painter, paintClass(clForest)],
		avoidClasses(clPlayer, 12, clForest, 10, clHill, 0, clWater, 2),
		num
	);
}

RMS.SetProgress(70);

log("Creating dirt patches...");
var sizes = [scaleByMapSize(3, 48), scaleByMapSize(5, 84), scaleByMapSize(8, 128)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5);
	painter = new LayeredPainter(
		[tGrass1,tGrass2], 		// terrains
		[1]															// widths
	);
	createAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clWater, 3, clForest, 0, clHill, 0, clPlayer, 12),
		scaleByMapSize(20, 80)
	);
}
var sizes = [scaleByMapSize(3, 48), scaleByMapSize(5, 84), scaleByMapSize(8, 128)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5);
	painter = new LayeredPainter(
		[tGrass2,tGrass2], 		// terrains
		[1]															// widths
	);
	createAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clWater, 3, clForest, 0, clHill, 0, clPlayer, 12),
		scaleByMapSize(20, 80)
	);
}
var sizes = [scaleByMapSize(3, 48), scaleByMapSize(5, 84), scaleByMapSize(8, 128)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5);
	painter = new LayeredPainter(
		[tGrass3,tGrass3], 		// terrains
		[1]															// widths
	);
	createAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clWater, 3, clForest, 0, clHill, 0, clPlayer, 12),
		scaleByMapSize(20, 80)
	);
}

// create grass patches
log("Creating grass patches...");
createLayeredPatches(
 [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
 [tGrassPatchBlend, tGrassPatch],
 [1],
 avoidClasses(clWater, 1, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 0)
);

log("Creating stone mines...");
group = new SimpleGroup([new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)], true, clRock);
createObjectGroups(group, 0,
	avoidClasses(clWater, 3, clForest, 1, clPlayer, 10, clRock, 10, clHill, 1),
	scaleByMapSize(4,16), 100
);

// create small stone quarries
group = new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock);
createObjectGroups(group, 0,
	avoidClasses(clWater, 3, clForest, 1, clPlayer, 10, clRock, 10, clHill, 1),
	scaleByMapSize(4,16), 100
);

log("Creating metal mines...");
group = new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal);
createObjectGroups(group, 0,
	avoidClasses(clWater, 3, clForest, 1, clPlayer, 10, clMetal, 10, clRock, 5, clHill, 1),
	scaleByMapSize(4,16), 100
);

RMS.SetProgress(90);

//create decoration
createDecoration
(
 [[new SimpleObject(aRockMedium, 1,3, 0,1)],
  [new SimpleObject(aRockLarge, 1,2, 0,1), new SimpleObject(aRockMedium, 1,3, 0,2)],
  [new SimpleObject(aGrassShort, 1,2, 0,1, -PI/8,PI/8)],
  [new SimpleObject(aGrass, 2,4, 0,1.8, -PI/8,PI/8), new SimpleObject(aGrassShort, 3,6, 1.2,2.5, -PI/8,PI/8)],
  [new SimpleObject(aBushMedium, 1,2, 0,2), new SimpleObject(aBushSmall, 2,4, 0,2)]
 ],
 [
  scaleByMapSize(16, 262),
  scaleByMapSize(8, 131),
  scaleByMapSize(13, 200),
  scaleByMapSize(13, 200),
  scaleByMapSize(13, 200)
 ],
 avoidClasses(clWater, 0, clForest, 0, clPlayer, 0, clHill, 0)
);

// create animals
createFood
(
 [
  [new SimpleObject(oRabbit, 5,7, 0,4)],
  [new SimpleObject(oDeer, 2,3, 0,2)]
 ],
 [
  3 * numPlayers,
  3 * numPlayers
 ],
 [avoidClasses(clForest, 0, clPlayer, 20, clHill, 1, clFood, 20)]
);

// create other animals
createFood
(
  [new SimpleObject(oBear, 1,1, 0,2)],
 [
  3 * numPlayers
 ],
 [avoidClasses(clForest, 0, clPlayer, 20, clHill, 1, clFood, 20), stayClasses(clForest, 2)]
);
// create fruits
createFood
(
 [
  [new SimpleObject(oFruitBush, 1,2, 0,4)]
 ],
 [
  3 * numPlayers
 ],
 avoidClasses(clForest, 0, clPlayer, 20, clHill, 1, clFood, 10)
);
RMS.SetProgress(95);

// create straggler trees and bushes
log("Creating straggler trees and bushes...");
var types = [oTree, oTree2, oTree3, oTree4, oBush];	// some variation
var num = floor(numStragglers / types.length);
for (var i = 0; i < types.length; ++i)
{
	group = new SimpleGroup(
		[new SimpleObject(types[i], 1,1, 0,3)],
		true, clForest
	);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 5, clForest, 1, clHill, 1, clPlayer, 12, clMetal, 1, clRock, 1),
		num
	);
}

// create straggler bushes on hills
log("Creating straggler bushes...");
var types = [oBush];	// some variation
var num = floor(numStragglers / types.length);
for (var i = 0; i < types.length; ++i)
{
	group = new SimpleGroup(
		[new SimpleObject(types[i], 1,3, 0,3)],
		true, clForest
	);
	createObjectGroups(group, 0,
		[avoidClasses(clForest, 1, clPlayer, 12, clMetal, 1, clRock, 1), stayClasses(clHill, 3)],
		num
	);
}
ExportMap();
