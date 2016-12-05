RMS.LoadLibrary("rmgen");
RMS.LoadLibrary("rmgen2");

TILE_CENTERED_HEIGHT_MAP = false;

const tCity = "medit_city_pavement";
const tCityPlaza = "medit_city_pavement";
const tHill = ["temp_grass_long_b_aut", "temp_grass_plants_aut", "temp_highlands_aut"];
const tMainDirt = "temp_dirt_a";
const tCliff = "temp_cliff_a";
const tForestFloor = "temp_forestfloor_aut";
const tGrass = "temp_grass_long_b_aut";
const tGrass2 = "temp_grass_c_aut";
const tGrass3 = "temp_grass_d_aut";
const tDirt = "temp_dirt_gravel_b";
const tDirt2 = "temp_dirt_gravel_plants";
const tDirtCracks = "temp_dirt_gravel";
const tShore = "temp_dirt_gravel_b";
const tWater = "steppe_river_rocks_wet";
const tSeaDepths = "medit_sea_depths";

// gaia entities
const oBerryBush = "gaia/flora_bush_berry";
const oChicken = "gaia/fauna_chicken";
const oDeer = "gaia/fauna_deer";
const oFish = "gaia/fauna_fish";
const oSheep = "gaia/fauna_sheep";
const oGoat = "gaia/fauna_goat";
const oWolf = "gaia/fauna_wolf";
const oHawk = "gaia/fauna_hawk";
const oRabbit = "gaia/fauna_rabbit";
const oBoar = "gaia/fauna_boar";
const oBear = "gaia/fauna_bear";
const oStoneLarge = "gaia/geology_stonemine_temperate_quarry";
const oStoneSmall = "gaia/geology_stone_temperate";
const oMetalLarge = "gaia/geology_metal_temperate_slabs";
const oApple = "gaia/flora_tree_apple"
const oAcacia = "gaia/flora_tree_acacia"
const oOak = "gaia/flora_tree_oak_aut";
const oOak2 = "gaia/flora_tree_oak_aut_new";
const oOak3 = "gaia/flora_tree_oak_dead";
const oOak4 = "gaia/flora_tree_oak";
const oBeech = "gaia/flora_tree_euro_beech_aut"
const oBeech2 = "gaia/flora_tree_euro_beech"

// decorative props
const aBush1 = "actor|props/flora/bush_tempe_sm.xml";
const aBush2 = "actor|props/flora/bush_tempe_me.xml";
const aBush3 = "actor|props/flora/bush_tempe_la.xml";
const aBush4 = "actor|props/flora/bush_tempe_me.xml";
const aBushes = [aBush1, aBush2, aBush3, aBush4];
const aDecorativeRock = "actor|geology/stone_granite_med.xml";
const aFallenAplles = "actor|props/flora/fallen_apples.xml";
const aFerns = "actor|props/flora/ferns.xml";

// terrain + entity (for painting)
const pForest = [tForestFloor, tForestFloor + TERRAIN_SEPARATOR + oOak, tForestFloor + TERRAIN_SEPARATOR + oOak2, tForestFloor + TERRAIN_SEPARATOR + oOak3, tForestFloor + TERRAIN_SEPARATOR + oOak4, tForestFloor + TERRAIN_SEPARATOR + oBeech, tForestFloor + TERRAIN_SEPARATOR + oBeech2, tForestFloor + TERRAIN_SEPARATOR + oAcacia, tForestFloor];

const BUILDING_ANGlE = -PI/4;

log("Initializing map...");

InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();
const mapArea = mapSize*mapSize;

// create tile classes

var clPlayer = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clSettlement = createTileClass();
var clGrass = createTileClass();
var clHill = createTileClass();
var clIsland = createTileClass();

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; i++)
{
	playerIDs.push(i+1);
}
playerIDs = primeSortPlayers(sortPlayers(playerIDs));

// place players

var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerAngle = new Array(numPlayers);
var playerPos = new Array(numPlayers);
var iop = 0;
for (var i = 0; i < numPlayers; i++)
{
	iop = i - 1;
	if (!(numPlayers%2)){
		playerPos[i] = ((iop + abs(iop%2))/2 + 1) / ((numPlayers / 2) + 1);
	}
	else
	{
		if (iop%2)
		{
			playerPos[i] = ((iop + abs(iop%2))/2 + 1) / (((numPlayers + 1) / 2) + 1);
		}
		else
		{
			playerPos[i] = ((iop)/2 + 1) / ((((numPlayers - 1)) / 2) + 1);
		}
	}
	playerZ[i] = playerPos[i];
	playerX[i] = 0.2 + 0.6*(i%2);
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
	var ix = floor(fx);
	var iz = floor(fz);
	addToClass(ix, iz, clPlayer);

	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tCityPlaza, tCity], [1]);
	createArea(placer, painter, null);

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
	createObjectGroup(group, 0, avoidClasses(clWater, 6));

	var hillSize = PI * radius * radius;

	// create starting trees
	var num = 2;
	var tAngle = randFloat(-PI/3, 4*PI/3);
	var tDist = randFloat(11, 13);
	var tX = round(fx + tDist * cos(tAngle));
	var tZ = round(fz + tDist * sin(tAngle));
	group = new SimpleGroup(
		[new SimpleObject(oOak, num, num, 0,5)],
		false, clBaseResource, tX, tZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2, clWater, 4));

	// create grass tufts
	var num = hillSize / 250;
	for (var j = 0; j < num; j++)
	{
		var gAngle = randFloat(0, TWO_PI);
		var gDist = radius - (5 + randInt(7));
		var gX = round(fx + gDist * cos(gAngle));
		var gZ = round(fz + gDist * sin(gAngle));
		group = new SimpleGroup(
			[new SimpleObject(aBush1, 2,5, 0,1, -PI/8,PI/8)],
			false, clBaseResource, gX, gZ
		);
		createObjectGroup(group, 0);
	}
}

RMS.SetProgress(30);

const WATER_WIDTH = 0.3;

log("Creating the river");
var theta = randFloat(0, 0.8);
var theta2 = randFloat(0, 1.2);
var seed = randFloat(3,5);
var seed2 = randFloat(2,6);
for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
		var x = ix / (mapSize + 1.0);
		var z = iz / (mapSize + 1.0);

		// add the rough shape of the water
		var km = 20/scaleByMapSize(35, 160);
		var cu = km*rndRiver(theta+z*0.5*(mapSize/64),seed);
		var cu2 = km*rndRiver(theta2+z*0.5*(mapSize/64),seed2);

		var fadeDist = 0.05;

		if ((x > cu + 0.5 - WATER_WIDTH/2) && (x < cu2 + 0.5 + WATER_WIDTH/2))
		{
			var h;
			if (x < (cu + 0.5 + fadeDist - WATER_WIDTH/2))
			{
				h = 2 - 5.0 * (1 - ((cu + 0.5 + fadeDist - WATER_WIDTH/2) - x)/fadeDist);
			}
			else if (x > (cu2 + 0.5 - fadeDist + WATER_WIDTH/2))
			{
				h = 2 - 5.0 * (1 - (x - (cu2 + 0.5 - fadeDist + WATER_WIDTH/2))/fadeDist);
			}
			else
			{
				h = -3.0;
			}

			setHeight(ix, iz, h);
			if (h < 0.7){
				addToClass(ix, iz, clWater);
			}
		}
	}
}

//paint the shores
paintTerrainBasedOnHeight(-20, 1, 0, tWater);
paintTerrainBasedOnHeight(1, 2, 0, tShore);

RMS.SetProgress(40);
// create bumps
createBumps(avoidClasses(clWater, 2, clPlayer, 20));

// create forests
createForests(
 [tForestFloor, tForestFloor, tForestFloor, pForest, pForest],
 avoidClasses(clPlayer, 20, clForest, 17, clWater, 2, clBaseResource, 3),
 clForest
);

RMS.SetProgress(50);

// create hills
if (randInt(1,2) == 1)
	createHills([tGrass, tCliff, tHill], avoidClasses(clPlayer, 20, clForest, 1, clHill, 1, clWater, 2), clHill, scaleByMapSize(3, 15));
else
	createMountains(tCliff, avoidClasses(clPlayer, 10, clForest, 1, clHill, 15, clWater, 3), clHill, scaleByMapSize(3, 15));

// create grass patches
log("Creating grass patches...");
createLayeredPatches(
 [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)],
 [[tGrass,tGrass2],[tGrass2,tGrass3], [tGrass3,tGrass]],
 [1,1],
 avoidClasses(clForest, 0, clGrass, 2, clPlayer, 10, clWater, 2, clDirt, 2, clHill, 1)
);

RMS.SetProgress(55);

RMS.SetProgress(60);

// create islands
log("Creating islands...");
placer = new ChainPlacer(1, floor(scaleByMapSize(4, 6)), floor(scaleByMapSize(50, 80)), 0.5);
var terrainPainter = new LayeredPainter(
	[tWater, tShore, tHill],		// terrains
	[2 ,1]								// widths
);
var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 6, 4);
createAreas(
	placer,
	[terrainPainter, elevationPainter, paintClass(clIsland)],
	[avoidClasses(clForest, 1, clIsland, 35), stayClasses (clWater, 6)],
	scaleByMapSize(1, 4) * numPlayers
);

//paint the seabed
paintTerrainBasedOnHeight(-20, -3, 3, tSeaDepths);

log("Creating island stone mines...");
// create island stone quarries
createMines(
 [
  [new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)],
  [new SimpleObject(oStoneSmall, 2,5, 1,3)]
 ],
 stayClasses(clIsland, 4)
)

log("Creating island metal mines...");
// create island metal quarries
createMines(
 [
  [new SimpleObject(oMetalLarge, 1,1, 0,4)]
 ],
 stayClasses(clIsland, 4),
 clMetal
)

log("Creating stone mines...");
// create stone quarries
createMines(
 [
  [new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)],
  [new SimpleObject(oStoneSmall, 2,5, 1,3)]
 ],
 avoidClasses(clForest, 1, clPlayer, 20, clRock, 10, clWater, 1, clHill, 1)
)

log("Creating metal mines...");
// create large metal quarries
createMines(
 [
  [new SimpleObject(oMetalLarge, 1,1, 0,4)]
 ],
 avoidClasses(clForest, 1, clPlayer, 20, clMetal, 10, clRock, 5, clWater, 1, clHill, 1),
 clMetal
)

RMS.SetProgress(65);

// create decoration
createDecoration
(
 [[new SimpleObject(aDecorativeRock, 1,3, 0,1)],
  [new SimpleObject(aBush2, 1,2, 0,1), new SimpleObject(aBush1, 1,3, 0,2), new SimpleObject(aBush4, 1,2, 0,1), new SimpleObject(aBush3, 1,3, 0,2)]
 ],
 [
  scaleByMapSize(16, 262),
  scaleByMapSize(40, 360)
 ],
 avoidClasses(clWater, 2, clForest, 0, clPlayer, 0, clHill, 1)
);

RMS.SetProgress(70);

// create fish
createFood
(
 [
  [new SimpleObject(oFish, 2,3, 0,2)]
 ],
 [
  3*scaleByMapSize(5,20)
 ],
 [avoidClasses(clIsland, 2, clFood, 10), stayClasses(clWater, 5)]
);

// create animals
createFood
(
 [
  [new SimpleObject(oSheep, 5,7, 0,4)],
  [new SimpleObject(oGoat, 5,7, 0,4)],
  [new SimpleObject(oWolf, 4,7, 0,4)],
  [new SimpleObject(oBoar, 1,1, 0,4)],
  [new SimpleObject(oBear, 1,1, 0,4)],
  [new SimpleObject(oRabbit, 5,8, 0,4)],
  [new SimpleObject(oHawk, 1,1, 0,4)],
  [new SimpleObject(oDeer, 2,3, 0,2)]
 ],
 [
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20)
 ],
 avoidClasses(clIsland, 2, clFood, 10, clWater, 5, clPlayer, 8)
);

// create animals
createFood
(
 [
  [new SimpleObject(oSheep, 5,7, 0,4)],
  [new SimpleObject(oGoat, 5,7, 0,4)],
  [new SimpleObject(oRabbit, 5,8, 0,4)],
  [new SimpleObject(oDeer, 2,3, 0,2)]
 ],
 [
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20)
 ],
 [avoidClasses(clIsland, 2, clFood, 10, clWater, 5, clPlayer, 8), stayClasses(clIsland, 4)]
);

// create fruits
createFood
(
 [
  [new SimpleObject(oApple, 5,7, 0,4)],
  [new SimpleObject(oBerryBush, 5,7, 0,4)]
 ],
 [
  3*scaleByMapSize(5,20),
  3*scaleByMapSize(5,20)
 ],
 avoidClasses(clWater, 3, clForest, 0, clPlayer, 20, clHill, 1, clFood, 10, clWater, 4)
);

RMS.SetProgress(90);

// create straggler trees
var types = [oOak, oOak2, oOak3, oOak4, oBeech, oBeech2, oAcacia];	// some variation
createStragglerTrees(types, avoidClasses(clForest, 0, clWater, 2, clPlayer, 8, clMetal, 1, clHill, 1));

log("Creating straggler island trees...");
g_numStragglerTrees *= 10;
createStragglerTrees(types, stayClasses(clIsland, 4));

// Set environment
setSkySet("cumulus");
setSunColor(0.866667, 0.776471, 0.486275);
setWaterColor(0, 0.685961, 1);
setWaterTint(0.501961, 1, 1);
setWaterWaviness(1.0);
setWaterType("ocean");
setWaterMurkiness(1);

setFogFactor(0.3);
setFogThickness(0.25);

setPPEffect("hdr");
setPPContrast(0.62);
setPPSaturation(0.51);
setPPBloom(0.12);

// Export map data
 ExportMap();
