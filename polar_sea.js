RMS.LoadLibrary("rmgen");

setFogThickness(0.76);
setFogFactor(0.7);

setPPEffect("hdr");
setPPSaturation(0.48);
setPPContrast(0.53);
setPPBloom(0.12);

var tPrimary = ["polar_snow_a"];
var tCliff = ["polar_cliff_a", "polar_cliff_b", "polar_cliff_snow"];
var tSecondary = "polar_snow_glacial";
var tHalfSnow = ["ice_01", "ice_dirt"];
var tSnowLimited = ["polar_snow_b", "polar_ice"];
var tDirt = "ice_dirt";
var tRoad = "polar_ice_b";
var tRoadWild = "polar_ice_cracked";
var tShore = "polar_ice_snow";
var tWater = "polar_ice_c";

// gaia entities
var oBush = "gaia/flora_bush_badlands";
var oWolf = "gaia/fauna_wolf_snow";
var oMuskox = "gaia/fauna_muskox";
var oWalrus = "gaia/fauna_walrus";
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

log("Initializing map...");
InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();

// create tile classes
var clPlayer = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clWolf = createTileClass();

// Expected by rmgen1
var clForest = createTileClass();

//cover the ground with the primary terrain chosen in the beginning
for (var ix = 0; ix < mapSize; ++ix)
	for (var iz = 0; iz < mapSize; ++iz)
	{
		var x = ix / (mapSize + 1.0);
		var z = iz / (mapSize + 1.0);
		placeTerrain(ix, iz, tPrimary);
	}

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; ++i)
	playerIDs.push(i+1);
playerIDs = sortPlayers(playerIDs);

// place players
var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerAngle = new Array(numPlayers);

var startAngle = randFloat(0, TWO_PI);
for (var i = 0; i < numPlayers; ++i)
{
	playerAngle[i] = startAngle + i*TWO_PI/numPlayers;
	playerX[i] = 0.5 + 0.35*cos(playerAngle[i]);
	playerZ[i] = 0.5 + 0.35*sin(playerAngle[i]);
}

RMS.SetProgress(20);

for (var i = 0; i < numPlayers; ++i)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");

	// Get the x and z in tiles
	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = round(fx);
	var iz = round(fz);
	addToClass(ix, iz, clPlayer);
	addToClass(ix+5, iz, clPlayer);
	addToClass(ix, iz+5, clPlayer);
	addToClass(ix-5, iz, clPlayer);
	addToClass(ix, iz-5, clPlayer);

	// Create the city patch
	var cityRadius = scaleByMapSize(15,25)/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tRoadWild, tRoad], [1]);
	createArea(placer, painter, null);

	placeCivDefaultEntities(fx, fz, id);

	// Create metal mine
	var mAngle = randFloat(0, TWO_PI);
	var mDist = 12;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	var group = new SimpleGroup(
		[new SimpleObject(oMetalLarge, 1,1, 0,0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// Create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneLarge, 1,1, 0,2)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// Create wood treasure
	mAngle += PI/2;
	let bbX = round(fx + mDist * cos(mAngle));
	let bbZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oWood, 14,14, 0,3)],
		true, clBaseResource, bbX, bbZ,
		avoidClasses(clBaseResource, 4)
	);
	createObjectGroup(group, 0);

	// Remember player base used as a target for the wolves
	var ax = round(fractionToTiles(playerX[i]));
	var az = round(fractionToTiles(playerZ[i]));
	placeObject(ax, az, "special/trigger_point_B", id, PI);
};
RMS.SetProgress(30);

// Create trigger points where wolves spawn and walk to
group = new SimpleGroup([new SimpleObject("special/trigger_point_A", 1,1, 0,0)], true, clWolf);
createObjectGroups(group, 0,
	avoidClasses(clWater, 10, clFood, 2, clMetal, 5, clRock, 5, clPlayer, 20),
	scaleByMapSize(40, 140), 100
);

var lakeAreas = [];
var playerConstraint = new AvoidTileClassConstraint(clPlayer, 20);
var waterConstraint = new AvoidTileClassConstraint(clWater, 8);

for (var x = 0; x < mapSize; ++x)
	for (var z = 0; z < mapSize; ++z)
		if (playerConstraint.allows(x, z) && waterConstraint.allows(x, z))
			lakeAreas.push([x, z]);

var chosenPoint;
var lakeAreaLen;

//create the main lake
var fx = fractionToTiles(0.5);
var fz = fractionToTiles(0.5);
ix = round(fx);
iz = round(fz);

const lSize = sqrt(sqrt(sqrt(scaleByMapSize(1, 6))));

var placer = new ChainPlacer(2, floor(scaleByMapSize(5, 16)), floor(scaleByMapSize(35, 200)), 1, ix, iz, 0, [floor(mapSize * 0.17 * lSize)]);
var terrainPainter = new LayeredPainter(
	[tShore, tWater, tWater, tWater],		// terrains
	[1, 4, 2]		// widths
);
var elevationPainter = new SmoothElevationPainter(
	ELEVATION_SET,			// type
	-4,				// elevation
	4				// blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clWater)], avoidClasses(clPlayer, 20));

paintTerrainBasedOnHeight(3, floor(scaleByMapSize(20, 40)), 0, tCliff);
paintTerrainBasedOnHeight(floor(scaleByMapSize(20, 40)), 100, 3, tSnowLimited);

log("Creating lakes...");

var numLakes = scaleByMapSize(10, 16);
for (let i = 0; i < numLakes ; ++i)
{
	lakeAreaLen = lakeAreas.length;
	if (!lakeAreaLen)
		break;

	chosenPoint = lakeAreas[randInt(lakeAreaLen)];

	placer = new ChainPlacer(1, floor(scaleByMapSize(2, 4)), floor(scaleByMapSize(20, 140)), 0.7, chosenPoint[0], chosenPoint[1]);
	let terrainPainter = new LayeredPainter(
		[tShore, tWater, tWater],		// terrains
		[1, 3]								// widths
	);
	let elevationPainter = new SmoothElevationPainter(ELEVATION_SET, -5, 5);
	createAreas(
		placer,
		[terrainPainter, elevationPainter, paintClass(clWater)],
		avoidClasses(clPlayer, 20),
		1, 1
	);
}

createBumps(avoidClasses(clWater, 2, clPlayer, 20));
RMS.SetProgress(60);

log("Creating dirt patches...");
createLayeredPatches(
	[scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)],
	[[tDirt,tHalfSnow], [tHalfSnow,tSnowLimited]],
	[2],
	avoidClasses(clWater, 3, clDirt, 5, clPlayer, 12)
);

log("Creating shrubs...");
createPatches(
	[scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
	tSecondary,
	avoidClasses(clWater, 3, clDirt, 5, clPlayer, 12)
);
RMS.SetProgress(65);

log("Creating stone mines...");
createMines(
 [
  [new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)],
  [new SimpleObject(oStoneSmall, 2,5, 1,3)]
 ],
 avoidClasses(clWater, 3, clPlayer, 20, clRock, 18)
);

log("Creating metal mines...");
createMines(
	[
		[new SimpleObject(oMetalLarge, 1,1, 0,4)]
	],
		avoidClasses(clWater, 3, clPlayer, 20, clMetal, 18, clRock, 5),
		clMetal
);
RMS.SetProgress(70);

createDecoration(
	[
		[new SimpleObject(aRockMedium, 1,3, 0,1)],
		[
			new SimpleObject(aRockLarge, 1,2, 0,1),
			new SimpleObject(aRockMedium, 1,3, 0,2)
		]
	],
	[
		scaleByMapSize(16, 262),
		scaleByMapSize(8, 131),
	],
	avoidClasses(clWater, 0, clPlayer, 0)
);

createDecoration(
	[
		[new SimpleObject(aIceberg, 3,5, 0,3)]
	],
	[
		scaleByMapSize(8, 131)
	],
	stayClasses(clWater, 6)
);
RMS.SetProgress(75);

createFood(
	[
		[new SimpleObject(oWolf, 4,6, 0,4)],
		[new SimpleObject(oWalrus, 2,3, 0,2)],
		[new SimpleObject(oMuskox, 2,3, 0,2)]
	],
	[
		3 * numPlayers,
		3 * numPlayers,
		4 * numPlayers,
	],
	avoidClasses(clFood, 16, clWater, 10, clMetal 4, clRock, 4)
);

createFood(
	[
		[new SimpleObject(oWhaleFin, 1,2, 0,2)],
		[new SimpleObject(oWhaleHumpback, 1,2, 0,2)]
	],
	[
		3 * numPlayers,
		3 * numPlayers
	],
	[avoidClasses(clFood, 20), stayClasses(clWater, 6)]
);

createFood(
	[
		[new SimpleObject(oFish, 2,3, 0,2)]
	],
	[
		15 * numPlayers
	],
	[avoidClasses(clFood, 12), stayClasses(clWater, 6)]
);
RMS.SetProgress(85);

createStragglerTrees([oBush], avoidClasses(clWater, 5, clPlayer, 12, clMetal, 1, clRock, 1));

var random_var = randInt(1,5);
if (random_var == 1)
	setSkySet("cirrus");
else if (random_var == 2)
	setSkySet("cumulus");
else if (random_var == 3)
	setSkySet("sunny");
else if (random_var == 4)
	setSkySet("overcast");
else if (random_var == 5)
	setSkySet("rain");

setSunRotation(randFloat(0, TWO_PI));
setSunElevation(randFloat(PI/ 4, PI / 2));
setWaterColor(0.0, 0.047, 0.286);				// dark majestic blue
setWaterTint(0.462, 0.756, 0.866);				// light blue
setWaterMurkiness(0.92);
setWaterWaviness(1.0);
setWaterType("clap");

ExportMap();