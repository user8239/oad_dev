RMS.LoadLibrary("rmgen");


const tGrass = ["tropic_grass_c", "tropic_grass_c", "tropic_grass_c", "tropic_grass_c", "tropic_grass_plants", "tropic_plants", "tropic_plants_b"];
const tGrassA = "tropic_plants_c";
const tGrassB = "tropic_plants_c";
const tGrassC = "tropic_grass_c";
const tForestFloor = "tropic_grass_plants";
const tCliff = ["tropic_cliff_a", "tropic_cliff_a", "tropic_cliff_a", "tropic_cliff_a_plants"];
const tPlants = "tropic_plants";
const tRoad = "tropic_citytile_a";
const tRoadWild = "tropic_citytile_plants";
const tShoreBlend = "tropic_beach_dry_plants";
const tShore = "tropic_beach_dry";
const tWater = "tropic_beach_wet";

const oTree = "gaia/flora_tree_toona";
const oPalm1 = "gaia/flora_tree_palm_tropic";
const oPalm2 = "gaia/flora_tree_palm_tropical";
const oStoneLarge = "gaia/geology_stonemine_tropic_quarry";
const oStoneSmall = "gaia/geology_stone_tropic_a";
const oMetalLarge = "gaia/geology_metal_tropic_slabs";
const oFish = "gaia/fauna_fish";
const oDeer = "gaia/fauna_deer";
const oTiger = "gaia/fauna_tiger";
const oBoar = "gaia/fauna_boar";
const oPeacock = "gaia/fauna_peacock";
const oBush = "gaia/flora_bush_berry";

const aRockLarge = "actor|geology/stone_granite_large.xml";
const aRockMedium = "actor|geology/stone_granite_med.xml";
const aBush1 = "actor|props/flora/plant_tropic_a.xml";
const aBush2 = "actor|props/flora/plant_lg.xml";
const aBush3 = "actor|props/flora/plant_tropic_large.xml";

const pForestD = [tForestFloor + TERRAIN_SEPARATOR + oTree, tForestFloor];
const pForestP1 = [tForestFloor + TERRAIN_SEPARATOR + oPalm1, tForestFloor];
const pForestP2 = [tForestFloor + TERRAIN_SEPARATOR + oPalm2, tForestFloor];

log("Initializing map...");

InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();

var clPlayer = createTileClass();
var clHill = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clMountains = createTileClass();

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
	playerX[i] = 0.425 + 0.2*(i%2)
	playerZ[i] = playerPos[i];
}

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");
	
	var radius = scaleByMapSize(15, 25);
	
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
	placeCivDefaultEntities(fx, fz, id,  { 'iberWall': 'towers' });
	
		// create animals
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oPeacock, 5, 5, 0, 2)],
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
		[new SimpleObject(oBush, 5, 5, 0, 3)],
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
		[new SimpleObject(oMetalLarge, 1, 1, 0, 0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);
	
	// create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneLarge, 1, 1, 0, 2)],
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
		[new SimpleObject(oTree, num, num, 0, 3)],
		false, clBaseResource, tX, tZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource, 2));
	
}

RMS.SetProgress(15);

var fadedistance = 8;

for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
		if (ix < 1 * mapSize)
		{
			if (ix > 0.31 * mapSize - fadedistance)
			{
				setHeight(ix, iz, 3 - 8 * (1 * mapSize - ix) / fadedistance);
				if (ix, iz, 3 - 8 * (1 * mapSize - ix) / fadedistance < 0.5)
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

log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15, 120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.6, 0.11)*mapSize), floor(randFloat(0, 1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tGrass, tGrass],
		[2]
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}
log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15, 120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.23, 0.28)*mapSize), floor(randFloat(0, 1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tGrass, tGrass],
		[2]
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}
log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15, 120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.39, 0.45)*mapSize), floor(randFloat(0, 1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tGrass, tGrass],
		[2]
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15, 120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.59, 0.64)*mapSize), floor(randFloat(0, 1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tGrass, tGrass],
		[2]
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(15, 120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 9)), floor(scaleByMapSize(16, 45)), 1, floor(randFloat(0.74, 0.80)*mapSize), floor(randFloat(0, 1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tGrass, tGrass],
		[2]
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 3);
	createArea(
		placer,
		[terrainPainter, elevationPainter, unPaintClass(clWater)], 
		null
	);
}
log("Creating terrain...");
for (var i = 0; i < scaleByMapSize(20, 120); i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 6)), floor(scaleByMapSize(16, 30)), 1, floor(randFloat(0.91, 0.96)*mapSize), floor(randFloat(0, 1)*mapSize));
	var terrainPainter = new LayeredPainter(
		[tGrass, tGrass],
		[2]
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

log("Creating hills...");
placer = new ChainPlacer(1, floor(scaleByMapSize(4, 6)), floor(scaleByMapSize(16, 40)), 0.1);
var terrainPainter = new LayeredPainter(
	[tCliff, tGrass],
	[3]
);
var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 25, 3);
createAreas(
	placer,
	[terrainPainter, elevationPainter, paintClass(clHill)], 
	[avoidClasses(clPlayer, 20, clHill, 5, clWater, 2, clBaseResource, 2), stayClasses(clMountains, 0)],
	scaleByMapSize(5, 40) * numPlayers
);

log("Creating forests...");
var MIN_TREES = 1000;
var MAX_TREES = 4000;
var P_FOREST = 0.7;

var totalTrees = scaleByMapSize(MIN_TREES, MAX_TREES);
var numForest = totalTrees * P_FOREST;
var numStragglers = totalTrees * (1.0 - P_FOREST);

var types = [
	[[tGrass, tGrass, tGrass, tGrass, pForestD], [tGrass, tGrass, tGrass, pForestD]],
	[[tGrass, tGrass, tGrass, tGrass, pForestP1], [tGrass, tGrass, tGrass, pForestP1]],
	[[tGrass, tGrass, tGrass, tGrass, pForestP2], [tGrass, tGrass, tGrass, pForestP2]]
];


var size = numForest / (scaleByMapSize(3,6) * numPlayers);

var num = floor(size / types.length);
for (var i = 0; i < types.length; ++i)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(3, 5)), numForest / (num * floor(scaleByMapSize(2, 4))), 0.5);
	painter = new LayeredPainter(
		types[i],
		[2]
		);
	createAreas(
		placer,
		[painter, paintClass(clForest)], 
		avoidClasses(clPlayer, 20, clForest, 10, clHill, 0, clWater, 8),
		num
	);
}

RMS.SetProgress(60);

log("Creating grass patches...");
var sizes = [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(3, 5)), sizes[i], 0.5);
	painter = new LayeredPainter(
		[tGrassC,tGrassA,tGrassB],
		[2,1]
	);
	createAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clWater, 8, clForest, 0, clHill, 0, clPlayer, 12, clDirt, 16),
		scaleByMapSize(20, 80)
	);
}
var sizes = [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(3, 5)), sizes[i], 0.5);
	painter = new LayeredPainter(
		[tPlants,tPlants],
		[1]
	);
	createAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clWater, 8, clForest, 0, clHill, 0, clPlayer, 12, clDirt, 16),
		scaleByMapSize(20, 80)
	);
}

log("Creating stone mines...");
	group = new SimpleGroup([new SimpleObject(oStoneSmall, 0, 2, 0, 4), new SimpleObject(oStoneLarge, 1, 1, 0, 4)], true, clRock);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 3, clForest, 1, clPlayer, 20, clRock, 10, clHill, 1),
		scaleByMapSize(4, 16), 100
);

	group = new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 2, clForest, 1, clPlayer, 20, clRock, 10, clHill, 1),
		scaleByMapSize(4, 16), 100
);

log("Creating metal mines...");
		group = new SimpleGroup([new SimpleObject(oMetalLarge, 1, 1, 0, 4)], true, clMetal);
		createObjectGroups(group, 0,
			avoidClasses(clWater, 2, clForest, 1, clPlayer, 20, clMetal, 10, clRock, 5, clHill, 1),
			scaleByMapSize(4, 16), 100
);

log("Creating small decorative rocks...");
	group = new SimpleGroup(
		[new SimpleObject(aRockMedium, 1, 3, 0, 1)],
		true
);
	createObjectGroups(
		group, 0,
		avoidClasses(clWater, 0, clForest, 0, clPlayer, 0, clHill, 0),
		3*scaleByMapSize(16, 262), 50
);


log("Creating large decorative rocks...");
	group = new SimpleGroup(
		[new SimpleObject(aRockLarge, 1, 2, 0, 1), new SimpleObject(aRockMedium, 1, 3, 0, 2)],
		true
);
	createObjectGroups(
		group, 0,
		avoidClasses(clWater, 0, clForest, 0, clPlayer, 0, clHill, 0),
		3*scaleByMapSize(8, 131), 50
);

log("Creating small grass tufts...");
	group = new SimpleGroup(
		[new SimpleObject(aBush1, 1, 2, 0, 1, -PI/8, PI/8)]
);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 2, clHill, 2, clPlayer, 2, clDirt, 0),
		8 * scaleByMapSize(13, 200)
);

RMS.SetProgress(70);

log("Creating large grass tufts...");
	group = new SimpleGroup(
		[new SimpleObject(aBush2, 2, 4, 0, 1.8, -PI/8, PI/8), new SimpleObject(aBush1, 3, 6, 1.2, 2.5, -PI/8, PI/8)]
);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 3, clHill, 2, clPlayer, 2, clDirt, 1, clForest, 0),
		8 * scaleByMapSize(13, 200)
);

RMS.SetProgress(85);

log("Creating bushes...");
	group = new SimpleGroup(
		[new SimpleObject(aBush3, 1, 2, 0, 2), new SimpleObject(aBush2, 2, 4, 0, 2)]
);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 1, clHill, 1, clPlayer, 1, clDirt, 1),
		8 * scaleByMapSize(13, 200), 50
);

log("Creating deer...");
	group = new SimpleGroup(
		[new SimpleObject(oDeer, 5, 7, 0, 4)],
		true, clFood
);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 3, clForest, 0, clPlayer, 10, clHill, 1, clFood, 20),
		3 * numPlayers, 50
);

log("Creating boar...");
	group = new SimpleGroup(
		[new SimpleObject(oBoar, 2, 4, 0, 4)],
		true, clFood
);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 3, clForest, 0, clPlayer, 10, clHill, 1, clFood, 20),
		3 * numPlayers, 50
);

log("Creating tigers...");
	group = new SimpleGroup(
		[new SimpleObject(oTiger, 1, 1, 0, 4)],
		true, clFood
);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 3, clForest, 0, clPlayer, 10, clHill, 1, clFood, 20),
		3 * numPlayers, 50
);
RMS.SetProgress(95);

log("Creating berry bush...");
	group = new SimpleGroup(
		[new SimpleObject(oBush, 5, 7, 0, 4)],
		true, clFood
);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 6, clForest, 0, clPlayer, 20, clHill, 1, clFood, 10),
		randInt(1, 4) * numPlayers + 2, 50
);

log("Creating fish...");
	group = new SimpleGroup(
		[new SimpleObject(oFish, 2, 3, 0, 2)],
		true, clFood
);
	createObjectGroups(group, 0,
		[avoidClasses(clFood, 20), stayClasses(clWater, 6)],
		25 * numPlayers, 60
);

log("Creating straggler trees...");
	var types = [oTree, oPalm1, oPalm2];
	var num = floor(numStragglers / types.length);
	for (var i = 0; i < types.length; ++i)
	{
		group = new SimpleGroup(
		[new SimpleObject(types[i], 1, 1, 0, 3)],
		true, clForest
	);
	createObjectGroups(group, 0,
		avoidClasses(clWater, 5, clForest, 1, clHill, 1, clPlayer, 12, clMetal, 1, clRock, 1),
		num
	);
	}

setSunColor(0.6, 0.6, 0.6);	
setSunElevation(PI/ 3);

setWaterColor(0.524, 0.734, 0.839);
setWaterTint(0.369, 0.765, 0.745);
setWaterWaviness(1.0);
setWaterType("ocean");
setWaterMurkiness(0.35);

setFogFactor(0.4);
setFogThickness(0.2);

setPPEffect("hdr");
setPPContrast(0.7);
setPPSaturation(0.65);
setPPBloom(0.6);

setSkySet("cirrus");
ExportMap();
