RMS.LoadLibrary("rmgen");

//random terrain textures
var random_terrain = randomizeBiome();

const tMainTerrain = rBiomeT1();
const tForestFloor1 = rBiomeT2();
const tForestFloor2 = rBiomeT3();
const tCliff = rBiomeT4();
const tTier1Terrain = rBiomeT5();
const tTier2Terrain = rBiomeT6();
const tTier3Terrain = rBiomeT7();
const tHill = rBiomeT8();
const tDirt = rBiomeT9();
const tRoad = rBiomeT10();
const tRoadWild = rBiomeT11();
const tTier4Terrain = rBiomeT12();
const tShoreBlend = rBiomeT13();
const tShore = rBiomeT14();
const tWater = rBiomeT15();

// gaia entities
const oTree1 = rBiomeE1();
const oTree2 = rBiomeE2();
const oTree3 = rBiomeE3();
const oTree4 = rBiomeE4();
const oTree5 = rBiomeE5();
const oFruitBush = rBiomeE6();
const oChicken = rBiomeE7();
const oMainHuntableAnimal = rBiomeE8();
const oFish = rBiomeE9();
const oSecondaryHuntableAnimal = rBiomeE10();
const oStoneLarge = rBiomeE11();
const oStoneSmall = rBiomeE12();
const oMetalLarge = rBiomeE13();
const oShark = "gaia/fauna_shark";
const oWhale = "gaia/fauna_whale_fin";
const oShipwreck = "other/special_treasure_shipwreck";
const oShipwreck2 = "other/special_treasure_shipwreck_ram_bow";
const oShipDebris = "other/special_treasure_shipwreck_debris";
const oHut = "other/celt_hut";

// decorative props
const aGrass = rBiomeA1();
const aGrassShort = rBiomeA2();
const aReeds = rBiomeA3();
const aLillies = rBiomeA4();
const aRockLarge = rBiomeA5();
const aRockMedium = rBiomeA6();
const aBushMedium = rBiomeA7();
const aBushSmall = rBiomeA8();
const aSkeleton = "actor|props/special/eyecandy/skeleton.xml";

const pForest1 = [tForestFloor2 + TERRAIN_SEPARATOR + oTree1, tForestFloor2 + TERRAIN_SEPARATOR + oTree2, tForestFloor2];
const pForest2 = [tForestFloor1 + TERRAIN_SEPARATOR + oTree4, tForestFloor1 + TERRAIN_SEPARATOR + oTree5, tForestFloor1];
const BUILDING_ANGlE = -PI/4;
// initialize map

log("Initializing map...");

InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();
const mapArea = mapSize*mapSize;

// create tile classes

var clPlayer = createTileClass();
var clHill = createTileClass();
var clHill2 = createTileClass();
var clHill3 = createTileClass();
var clHill4 = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clSettlement = createTileClass();
var clMountains = createTileClass();
var clLand = createTileClass();

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; i++)
{
	playerIDs.push(i+1);
}
playerIDs = sortPlayers(playerIDs);

// place players

var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerPos = new Array(numPlayers);

for (var i = 0; i < numPlayers; i++)
{
	playerPos[i] = (i + 1) / (numPlayers + 1);
	playerX[i] = 0.41 + 0.2*(i%2)
	playerZ[i] = playerPos[i];
}

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");
	
	// some constants
	var radius = scaleByMapSize(15,25);
	var cliffRadius = 2;
	var elevation = 20;
	
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
	placeCivDefaultEntities(fx, fz, id, { 'iberWall': 'towers' });
	
	// create animals
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oChicken, 5,5, 0,2)],
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
		[new SimpleObject(oFruitBush, 5,5, 0,3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);
	
	// create metal mine
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
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
	var hillSize = PI * radius * radius;

	// create starting trees
	var num = floor(hillSize / 60);
	var tAngle = randFloat(-PI/3, 4*PI/3);
	var tDist = randFloat(12, 13);
	var tX = round(fx + tDist * cos(tAngle));
	var tZ = round(fz + tDist * sin(tAngle));
	group = new SimpleGroup(
		[new SimpleObject(oTree1, num, num, 0,3)],
		false, clBaseResource, tX, tZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource, 2, clWater, 3));
	
}

RMS.SetProgress(15);

// create sea
var fadedistance = 8;

for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
		if (ix < 1 * mapSize)
		{
			if (ix > 0.31 * mapSize - fadedistance)
			{
				setHeight(ix, iz, 1 - 4 * (1 * mapSize - ix) / fadedistance);
				if (ix, iz, 1 - 4 * (1 * mapSize - ix) / fadedistance < 0.5)
					addToClass(ix, iz, clWater);
			}
			else
			{
				setHeight(ix, iz, -5);
				addToClass(ix, iz, clWater);
			}
		}
		else if (ix > 0.69 * mapSize)
		{
			addToClass(ix, iz, clMountains)
		}
	}
}


// create terrain(using method of false shore)

log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15,120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.18,0.29)*mapSize), floor(randFloat(0,1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tMainTerrain, tMainTerrain],		// terrains
		[2]								// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}

log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15,120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.38,0.42)*mapSize), floor(randFloat(0,1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tMainTerrain, tMainTerrain],		// terrains
		[2]								// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}

log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15,120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.42,0.44)*mapSize), floor(randFloat(0,1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tMainTerrain, tMainTerrain],		// terrains
		[2]								// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}

log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15,120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.57,0.6)*mapSize), floor(randFloat(0,1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tMainTerrain, tMainTerrain],		// terrains
		[2]								// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}

log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15,120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.6,0.65)*mapSize), floor(randFloat(0,1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tMainTerrain, tMainTerrain],		// terrains
		[2]								// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}

log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15,120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.76,0.81)*mapSize), floor(randFloat(0,1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tMainTerrain, tMainTerrain],		// terrains
		[2]								// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}

log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(20,120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 6)), floor(scaleByMapSize(16, 30)), 1, floor(randFloat(0.86,0.97)*mapSize), floor(randFloat(0,1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tMainTerrain, tMainTerrain],		// terrains
		[2]								// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}

paintTerrainBasedOnHeight(-6, 1, 1, tWater);
paintTerrainBasedOnHeight(1, 2.8, 1, tShoreBlend);
paintTerrainBasedOnHeight(0, 1, 1, tShore);
paintTileClassBasedOnHeight(-6, 0.5, 1, clWater)

RMS.SetProgress(45);

// create hills
log("Creating hills...");
placer = new ChainPlacer(1, floor(scaleByMapSize(4, 6)), floor(scaleByMapSize(16, 30)), 0.1);
var terrainPainter = new LayeredPainter(
	[tCliff, tMainTerrain],		// terrains
	[3]								// widths
);
var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 25, 3);
createAreas(
	placer,
	[terrainPainter, elevationPainter, paintClass(clHill)], 
	avoidClasses(clPlayer, 14, clHill, 20, clWater, 2, clBaseResource, 2),
	scaleByMapSize(5, 40) * numPlayers
);


// calculate desired number of trees for map (based on size)

var MIN_TREES = 800;
var MAX_TREES = 2000;
var P_FOREST = 0.7;

var totalTrees = scaleByMapSize(MIN_TREES, MAX_TREES);
var numForest = totalTrees * P_FOREST;
var numStragglers = totalTrees * (1.0 - P_FOREST);

// create forests
createForests(
 [tMainTerrain, tForestFloor1, tForestFloor2, pForest1, pForest2],
 [avoidClasses(clPlayer, 14, clForest, 15, clWater, 3), stayClasses(clLand, 2)],
 clForest,
 1.0,
 random_terrain
);

RMS.SetProgress(70);

// create grass patches
log("Creating grass patches...");
createPatches(
 [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
 tTier4Terrain
);

log("Creating stone mines...");
// create stone quarries
createMines(
 [
  [new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)],
  [new SimpleObject(oStoneSmall, 2,5, 1,3)]
 ],
 [avoidClasses(clForest, 1, clPlayer, 20, clMetal, 10, clRock, 5, clHill, 1, clWater, 5), stayClasses( clLand, 4)]
);

log("Creating metal mines...");
// create large metal quarries
createMines(
 [
  [new SimpleObject(oMetalLarge, 1,1, 0,4)]
 ],
 [avoidClasses(clForest, 1, clPlayer, 20, clMetal, 10, clRock, 5, clHill, 1, clWater, 5), stayClasses( clLand, 4)],
 clMetal
);


// create decoration
var planetm = 1;

if (random_terrain == g_BiomeTropic)
	planetm = 8;

createDecoration
(
 [[new SimpleObject(aSkeleton, 1,2, 0,1)],
  [new SimpleObject(aRockMedium, 1,3, 0,1)], 
  [new SimpleObject(aRockLarge, 1,2, 0,1), new SimpleObject(aRockMedium, 1,3, 0,2)],
  [new SimpleObject(aGrassShort, 1,2, 0,1, -PI/8,PI/8)],
  [new SimpleObject(aGrass, 2,4, 0,1.8, -PI/8,PI/8), new SimpleObject(aGrassShort, 3,6, 1.2,2.5, -PI/8,PI/8)],
  [new SimpleObject(aBushMedium, 1,2, 0,2), new SimpleObject(aBushSmall, 2,4, 0,2)]
 ],
 [
  scaleByMapSize(16, 262),
  scaleByMapSize(16, 262),
  scaleByMapSize(8, 131),
  planetm * scaleByMapSize(13, 200),
  planetm * scaleByMapSize(13, 200),
  planetm * scaleByMapSize(13, 200)
 ],
 avoidClasses(clForest, 1, clPlayer, 20, clMetal, 10, clRock, 5, clHill, 1, clWater, 5)
);


RMS.SetProgress(80);

// create animals
createFood
(
 [
  [new SimpleObject(oMainHuntableAnimal, 5,7, 0,4)],
  [new SimpleObject(oSecondaryHuntableAnimal, 2,3, 0,2)]
 ], 
 [
  3 * numPlayers,
  3 * numPlayers
 ],
 [avoidClasses(clPlayer, 20, clMetal, 2, clRock, 2, clWater, 5), stayClasses(clLand, 4)]
);

RMS.SetProgress(75);

// create fruits
createFood
(
 [
  [new SimpleObject(oFruitBush, 5,7, 0,4)]
 ], 
 [
  3 * numPlayers
 ],
 [avoidClasses(clForest, 0, clPlayer, 20, clHill, 1, clFood, 10, clWater, 5),  stayClasses(clLand, 4)]
);

// create fish
log("Creating fish...");
group = new SimpleGroup(
	[new SimpleObject(oFish, 2,3, 0,2)],
	true, clFood
);
createObjectGroups(group, 0,
	[stayClasses(clWater, 2), avoidClasses(clForest, 1, clPlayer, 4, clHill, 1, clFood, 20)],
	25 * numPlayers, 60
);

log("Creating Whales...");
// create Whales
group = new SimpleGroup([new SimpleObject(oWhale, 1,1, 0,3)], true, clFood);
createObjectGroups(group, 0,
	[stayClasses(clWater, 1), avoidClasses(clFood, 8, clPlayer, 4)],
	scaleByMapSize(10,40), 100
);

log("Creating Sharks...");
// create Sharks
group = new SimpleGroup([new SimpleObject(oShark, 1,1, 0,3)], true, clFood);
createObjectGroups(group, 0,
	[stayClasses(clWater, 1), avoidClasses(clFood, 4, clPlayer, 4)],
	scaleByMapSize(10,40), 100
);

log("Creating shipwrecks...");
// create shipwreck
group = new SimpleGroup([new SimpleObject(oShipwreck, 1,1, 0,3)], true, clFood);
createObjectGroups(group, 0,
	[stayClasses(clWater,1), avoidClasses(clFood, 8)],
	scaleByMapSize(6,16), 100
);

log("Creating shipwrecks...");
// create shipwreck
group = new SimpleGroup([new SimpleObject(oShipwreck2, 1,1, 0,3)], true, clFood);
createObjectGroups(group, 0,
	[stayClasses(clWater,1), avoidClasses(clFood, 8)],
	scaleByMapSize(6,16), 100
);

log("Creating shipwreck debris...");
// create shipwreck debris
group = new SimpleGroup([new SimpleObject(oShipDebris, 1,2, 0,4)], true, clFood);
createObjectGroups(group, 0,
	[stayClasses(clWater,1), avoidClasses(clFood, 8)],
	scaleByMapSize(10,20), 100
);

log("Creating gaia huts...");
// create huts
group = new SimpleGroup([new SimpleObject(oHut, 1,1, 0,4)], true, clFood);
createObjectGroups(group, 0,
	[avoidClasses(clFood, 6, clWater, 4, clPlayer, 16), stayClasses(clLand, 4)],
	scaleByMapSize(10,20), 100
);

RMS.SetProgress(85);

// create straggler trees
var types = [oTree1, oTree2, oTree3, oTree4];	// some variation
createStragglerTrees(types);
[avoidClasses(clForest, 3, clFood, 10, clWater, 5), stayClasses(clLand, 4)],

// Export map data

ExportMap();
