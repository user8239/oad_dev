RMS.LoadLibrary("rmgen");


{
	setFogThickness(0.56);
	setFogFactor(0.6);

	setPPEffect("hdr");
	setPPSaturation(0.48);
	setPPContrast(0.53);
	setPPBloom(0.12);

	var tPrimary = ["polar_ice_snow"];
	var tForestFloor = "polar_grass_snow";
	var tCliff = ["polar_cliff_a", "polar_cliff_b", "polar_cliff_snow"];
	var tSecondary = "polar_tundra";
	var tHalfSnow = ["polar_grass_snow", "ice_dirt"];
	var tSnowLimited = ["polar_snow_rocks", "polar_ice"];
	var tDirt = "ice_dirt";
	var tRoad = "polar_ice_b";
	var tRoadWild = "polar_tundra_snow";
	var tShore = "polar_snow_a";
	var tWater = "polar_ice_c";
	var tHill = "polar_snow_rocks";

	// gaia entities
	var oBush = "gaia/flora_bush_badlands";
	var oBerryBush = "gaia/flora_bush_berry";
	var oChicken = "gaia/fauna_chicken";
	var oWolf = "gaia/fauna_wolf_snow";
	var oWhaleFin = "gaia/fauna_whale_fin";
	var oWhaleHumpback = "gaia/fauna_whale_humpback";
	var oFish = "gaia/fauna_fish";
	var oStoneLarge = "gaia/geology_stonemine_alpine_quarry";
	var oStoneSmall = "gaia/geology_stone_alpine_a";
	var oMetalLarge = "gaia/geology_metal_alpine_slabs";
	const oWood = "gaia/special_treasure_wood";
	
	// decorative props
	var aRockLarge = "actor|geology/stone_granite_med.xml";
	var aRockMedium = "actor|geology/stone_granite_med.xml";
	var aIceberg = "actor|props/special/eyecandy/iceberg.xml";
}

//other constants
const pForest = [tForestFloor + TERRAIN_SEPARATOR + oBush, tForestFloor];
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
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clSettlement = createTileClass();

//cover the ground with the primary terrain chosen in the beginning
for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
		var x = ix / (mapSize + 1.0);
		var z = iz / (mapSize + 1.0);
			placeTerrain(ix, iz, tPrimary);
	}
}

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
	placeCivDefaultEntities(fx, fz, id, BUILDING_ANGlE);
	
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
		[new SimpleObject(oBerryBush, 5,5, 0,3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);
	
	// create metal mine
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
	var mDist = 12;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
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

	// create wood
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 13;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oWood, 14,14, 0,3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);
};	

RMS.SetProgress(20);

// create hills
	createHills([tPrimary, tCliff, tHill], avoidClasses(clPlayer, 20, clForest, 20, clHill, 35, clWater, 2), clHill, scaleByMapSize(1, 240));

RMS.SetProgress(30);

var lakeAreas = [];
var playerConstraint = new AvoidTileClassConstraint(clPlayer, 20);
var waterConstraint = new AvoidTileClassConstraint(clWater, 8);

for (var x = 0; x < mapSize; ++x)
	for (var z = 0; z < mapSize; ++z)
		if (playerConstraint.allows(x, z) && waterConstraint.allows(x, z))
			lakeAreas.push([x, z]);

var chosenPoint;
var lakeAreaLen;

// create lakes
log("Creating lakes...");

var numLakes = scaleByMapSize(10, 16)
for (var i = 0; i < numLakes; ++i)
{
	lakeAreaLen = lakeAreas.length;
	if (!lakeAreaLen)
		break;
	
	chosenPoint = lakeAreas[randInt(lakeAreaLen)];

	placer = new ChainPlacer(1, floor(scaleByMapSize(4, 8)), floor(scaleByMapSize(40, 180)), 0.7, chosenPoint[0], chosenPoint[1]);
	var terrainPainter = new LayeredPainter(
		[tShore, tWater, tWater],		// terrains
		[1, 3]								// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, -5, 5);
	var newLake = createAreas(
		placer,
		[terrainPainter, elevationPainter, paintClass(clWater)], 
		avoidClasses(clPlayer, 20),
		1, 1
	);

	if (newLake && newLake.length)
	{
		var n = 0;
		for (var j = 0; j < lakeAreaLen; ++j)
		{
			var x = lakeAreas[j][0], z = lakeAreas[j][1];
			if (playerConstraint.allows(x, z) && waterConstraint.allows(x, z))
				lakeAreas[n++] = lakeAreas[j];
		}
		lakeAreas.length = n;
	}
	
}

RMS.SetProgress(45);

paintTerrainBasedOnHeight(3, floor(scaleByMapSize(20, 40)), 0, tCliff);
paintTerrainBasedOnHeight(floor(scaleByMapSize(20, 40)), 100, 3, tSnowLimited);

// create bumps
createBumps(avoidClasses(clWater, 2, clPlayer, 20));

// create forests
createForests(
 [tSecondary, tForestFloor, tForestFloor, pForest, pForest],
 avoidClasses(clPlayer, 20, clForest, 22, clHill, 20, clWater, 2), 
 clForest,
 1.0
);

RMS.SetProgress(60);

// create dirt patches
log("Creating dirt patches...");
createLayeredPatches(
 [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)],
 [[tDirt,tHalfSnow], [tHalfSnow,tSnowLimited]],
 [2],
 avoidClasses(clWater, 3, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 12)
);

// create shrubs
log("Creating shrubs...");
createPatches(
 [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
 tSecondary,
 avoidClasses(clWater, 3, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 12)
);

RMS.SetProgress(65);

log("Creating stone mines...");
// create stone quarries
createMines(
 [
  [new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)],
  [new SimpleObject(oStoneSmall, 2,5, 1,3)]
 ],
 avoidClasses(clWater, 3, clForest, 1, clPlayer, 20, clRock, 18, clHill, 1)
)

log("Creating metal mines...");
// create large metal quarries
createMines(
 [
  [new SimpleObject(oMetalLarge, 1,1, 0,4)]
 ],
 avoidClasses(clWater, 3, clForest, 1, clPlayer, 20, clMetal, 18, clRock, 5, clHill, 1),
 clMetal
)

RMS.SetProgress(70);

// create land decoration
createDecoration
(
 [[new SimpleObject(aRockMedium, 1,3, 0,1)], 
  [new SimpleObject(aRockLarge, 1,2, 0,1), new SimpleObject(aRockMedium, 1,3, 0,1)]
 ],
 [
  scaleByMapSize(16, 262),
  scaleByMapSize(8, 131),
 ],
 avoidClasses(clWater, 0, clForest, 0, clPlayer, 0, clHill, 0)
);

// create water decoration
createDecoration
(
 [[new SimpleObject(aIceberg, 1,2, 0,1)]
 ],
 [
  scaleByMapSize(8, 131)
 ],
 stayClasses(clWater, 6)
);


RMS.SetProgress(75);

// create animals
createFood
(
 [
  [new SimpleObject(oWolf, 5,7, 0,4)],
  [new SimpleObject(oWhaleFin, 1,2, 0,1)],
  [new SimpleObject(oWhaleHumpback, 1,2, 0,1)]
 ], 
 [
  3 * numPlayers,
  3 * numPlayers
 ],
 [avoidClasses(clFood, 20), stayClasses(clWater, 6)]
);

// create fruits
createFood
(
 [
  [new SimpleObject(oBerryBush, 5,7, 0,4)]
 ], 
 [
  randInt(1, 4) * numPlayers + 2
 ],
 avoidClasses(clWater, 3, clForest, 0, clPlayer, 20, clHill, 1, clFood, 10)
);

// create fish
createFood
(
 [
  [new SimpleObject(oFish, 2,3, 0,2)]
 ], 
 [
  15 * numPlayers
 ],
 [avoidClasses(clFood, 20), stayClasses(clWater, 6)]
);

RMS.SetProgress(85);

// create straggler trees
var types = [oBush];
createStragglerTrees(types, avoidClasses(clWater, 5, clForest, 3, clHill, 1, clPlayer, 12, clMetal, 1, clRock, 1));

var random_var = randInt(1,5)

if (random_var==1)
	setSkySet("cirrus");
else if (random_var ==2)
	setSkySet("cumulus");
else if (random_var ==3)
	setSkySet("sunny");
else if (random_var ==4)
	setSkySet("overcast");
else if (random_var ==3)
	setSkySet("rain");


setSunRotation(randFloat(0, TWO_PI));
setSunElevation(randFloat(PI/ 4, PI / 2));
setWaterColor(0.0, 0.047, 0.286);				// dark majestic blue
setWaterTint(0.462, 0.756, 0.866);				// light blue
setWaterMurkiness(0.92);
setWaterWaviness(1.0);
setWaterType("clap");

// Export map data
ExportMap();
