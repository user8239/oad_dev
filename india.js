RMS.LoadLibrary("rmgen");

const tGrass1 = "savanna_grass_a";
const tGrass2 = "savanna_grass_b";
const tGrass3 = "savanna_shrubs_a";
const tCliff = "savanna_cliff_a";
const tDirt1 = "savanna_dirt_a";
const tDirt2 = "savanna_dirt_plants_a";
const tDirt3 = "savanna_dirt_plants_cracked";
const tDirt4 = "savanna_dirt_b";
const tCityTiles = "savanna_tile_a";
const tShore = "savanna_riparian_bank";
const tWater = "savanna_riparian_wet";

// gaia entities
const oTree = "gaia/flora_tree_palm_tropic";
const oBerryBush = "gaia/flora_bush_berry";
const oChicken = "gaia/fauna_chicken";
const oRabbit = "gaia/fauna_rabbit";
const oTiger = "gaia/fauna_tiger";
const oCrocodile = "gaia/fauna_crocodile";
const oFish = "gaia/fauna_fish";
const oElephant = "gaia/fauna_elephant_asian";
const oBoar = "gaia/fauna_boar";
const oStoneSmall = "gaia/geology_stone_savanna_small";
const oMetalLarge = "gaia/geology_metal_savanna_slabs";

// decorative props
const aBush = "actor|props/flora/bush_medit_sm_dry.xml";
const aRock = "actor|geology/stone_savanna_med.xml";

const PI12 = PI / 6;

function placeStoneMineFormation(x, z)
{
	var placer = new ChainPlacer(1, 2, 2, 1, x, z, undefined, [5]);
	var painter = new TerrainPainter(tDirt4);
	createArea(placer, painter, null);
	
	var bbAngle = randFloat(0, TWO_PI);
	const bbDist = 2.5;
	
	for (var i = 0; i < 8; ++i)
	{
		var bbX = round(x + (bbDist + randFloat(0,1)) * cos(bbAngle));
		var bbZ = round(z + (bbDist + randFloat(0,1)) * sin(bbAngle));
		
		placeObject(bbX, bbZ, oStoneSmall, 0, randFloat(0, TWO_PI)); 
	
		bbAngle += PI12;
	}
}

const BUILDING_ANGlE = -PI/4;

// initialize map

log("Initializing map...");

InitMap();

var numPlayers = getNumPlayers();
var mapSize = getMapSize();
var mapArea = mapSize*mapSize;

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
	
	// create starting units
	placeCivDefaultEntities(fx, fz, id);
	
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
	var mDist = 13;
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
	placeStoneMineFormation(mX, mZ);
	addToClass(mX, mZ, clPlayer);
	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new TerrainPainter(tCityTiles);
	createArea(placer, painter, null);
	
	var hillSize = PI * radius * radius;
	// create starting trees
	var num = floor(hillSize / 300);
	var tAngle = randFloat(-PI/3, 4*PI/3);
	var tDist = randFloat(11, 13);
	var tX = round(fx + tDist * cos(tAngle));
	var tZ = round(fz + tDist * sin(tAngle));
	group = new SimpleGroup(
		[new SimpleObject(oTree, num, num, 5,12)],
		false, clBaseResource, tX, tZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2));
	
}

RMS.SetProgress(20);

// create bumps
log("Creating bumps...");
placer = new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1);
painter = new SmoothElevationPainter(ELEVATION_MODIFY, 2, 2);
createAreas(
	placer,
	painter,
	avoidClasses(clPlayer, 13),
	scaleByMapSize(300, 800)
);

// create big patches
log("Creating big patches...");
var patches = [tGrass2, tGrass3];
for (var i = 0; i < patches.length; i++)
{
	placer = new ChainPlacer(floor(scaleByMapSize(3, 6)), floor(scaleByMapSize(10, 20)), floor(scaleByMapSize(15, 60)), 1);
	painter = new TerrainPainter(patches[i]);
	createAreas(
		placer,
		painter,
		avoidClasses(clPlayer, 10),
		scaleByMapSize(5, 20)
	);
}

// create small patches
log("Creating small patches...");
var patches = [tDirt1, tDirt2, tDirt3];
var sizes = [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)];
for (var i = 0; i < sizes.length; i++)
{
	for (var j = 0; j < patches.length; ++j)
	{
		placer = new ChainPlacer(1, floor(scaleByMapSize(3, 5)), sizes[i], 1);
		painter = new TerrainPainter(patches[j]);
		createAreas(
			placer,
			painter,
			avoidClasses(clPlayer, 12),
			scaleByMapSize(4, 15)
		);
	}
}

//create the half dried-up lake
var fx = fractionToTiles(0.5);
var fz = fractionToTiles(0.5);
ix = round(fx);
iz = round(fz);

const lSize = sqrt(sqrt(sqrt(scaleByMapSize(1, 66))));

var placer = new ChainPlacer(2, floor(scaleByMapSize(2, 16)), floor(scaleByMapSize(35, 200)), 1, ix, iz, 0, [floor(mapSize * 0.008 * lSize)]);
var terrainPainter = new LayeredPainter(
	[tShore, tWater, tWater, tWater],		// terrains
	[1, 4, 2]		// widths
);
var elevationPainter = new SmoothElevationPainter(
	ELEVATION_SET,			// type
	-3,				// elevation
	4				// blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clWater)], avoidClasses(clPlayer, 20));


// create more shore jaggedness
log("Creating more shore jaggedness...");

placer = new ChainPlacer(2, floor(scaleByMapSize(4, 6)), 3, 1);
terrainPainter = new LayeredPainter(
	[tCliff, tDirt1],		// terrains
	[2]								// widths
);
elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 3, 4);
createAreas(
	placer,
	[terrainPainter, elevationPainter, unPaintClass(clWater)], 
	borderClasses(clWater, 4, 7),
	scaleByMapSize(12, 130) * 2, 150
);


paintTerrainBasedOnHeight(2.4, 3.4, 3, tGrass1);
paintTerrainBasedOnHeight(1, 2.4, 0, tShore);
paintTerrainBasedOnHeight(-8, 1, 2, tWater);
paintTileClassBasedOnHeight(-6, 0, 1, clWater)


RMS.SetProgress(55);

var playerConstraint = new AvoidTileClassConstraint(clPlayer, 30);
var minesConstraint = new AvoidTileClassConstraint(clRock, 25);
var waterConstraint = new AvoidTileClassConstraint(clWater, 10);

log("Creating stone mines...");
// create stone mines
for (var i = 0; i < scaleByMapSize(12,30); ++i)
{
	var mX = randInt(mapSize);
	var mZ = randInt(mapSize);
	if (playerConstraint.allows(mX, mZ) && minesConstraint.allows(mX, mZ) && waterConstraint.allows(mX, mZ))
	{
		placeStoneMineFormation(mX, mZ);
		addToClass(mX, mZ, clRock);
	}
}

log("Creating metal mines...");
// create large metal quarries
group = new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal);
createObjectGroups(group, 0,
	avoidClasses(clPlayer, 20, clMetal, 10, clRock, 8, clWater, 4),
	scaleByMapSize(2,8), 100
);

RMS.SetProgress(65);

// create small decorative rocks
log("Creating small decorative rocks...");
group = new SimpleGroup(
	[new SimpleObject(aRock, 1,3, 0,3)],
	true
);
createObjectGroups(
	group, 0,
	avoidClasses(clPlayer, 7, clWater, 1),
	scaleByMapSize(200, 1200), 1
);

RMS.SetProgress(70);

// create wildlife

log("Creating boars...");
group = new SimpleGroup(
	[new SimpleObject(oBoar, 1,2, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 20, clFood, 11),
	scaleByMapSize(4,12), 50
);

log("Creating tigers...");
group = new SimpleGroup(
	[new SimpleObject(oTiger, 2,2, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 20, clFood, 11),
	scaleByMapSize(4,12), 50
);

log("Creating crocodiles...");
group = new SimpleGroup(
	[new SimpleObject(oCrocodile, 2,4, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	stayClasses(clWater, 1),
	scaleByMapSize(4,12), 50
);

log("Creating elephants...");
group = new SimpleGroup(
	[new SimpleObject(oElephant, 2,4, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 20, clFood, 11),
	scaleByMapSize(4,12), 50
);

log("Creating rabbits...");
group = new SimpleGroup(
	[new SimpleObject(oRabbit, 5,6, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 20, clFood, 11),
	scaleByMapSize(4,12), 50
);

// create fish
createFood
(
 [
  [new SimpleObject(oFish, 2,3, 0,2)]
 ], 
 [
  25 * numPlayers
 ],
 [avoidClasses(clFood, 20), stayClasses(clWater, 2)]
);

// create berry bush
log("Creating berry bush...");
group = new SimpleGroup(
	[new SimpleObject(oBerryBush, 5,7, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 3, clPlayer, 20, clFood, 12, clRock, 7, clMetal, 2),
	randInt(1, 4) * numPlayers + 2, 50
);

RMS.SetProgress(85);


// create trees
log("Creating trees...");
var num = scaleByMapSize(70, 500);
group = new SimpleGroup(
	[new SimpleObject(oTree, 1,7, 0,3)],
	true, clForest
);
createObjectGroups(group, 0,
	avoidClasses(clForest, 1, clPlayer, 20, clMetal, 1, clRock, 7, clWater, 1),
	num
);


// create large grass tufts
log("Creating large grass tufts...");
group = new SimpleGroup(
	[new SimpleObject(aBush, 2,4, 0,1.8, -PI/8,PI/8)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 3, clPlayer, 2, clForest, 0),
	scaleByMapSize(100, 1200)
);

setSunColor(0.87451, 0.847059, 0.647059);
setWaterColor(0.741176, 0.592157, 0.27451);
setWaterTint(0.741176, 0.592157, 0.27451);
setWaterWaviness(2.0);
setWaterType("clap");
setWaterMurkiness(0.835938);

setUnitsAmbientColor(0.57, 0.58, 0.55);
setTerrainAmbientColor(0.447059, 0.509804, 0.54902);

setFogFactor(0.25);
setFogThickness(0.15);
setFogColor(0.847059, 0.737255, 0.482353);

setPPEffect("hdr");
setPPContrast(0.57031);
setPPBloom(0.34);

ExportMap();
