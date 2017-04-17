RMS.LoadLibrary("rmgen");

const tGrass = ["savanna_grass_a_wetseason", "savanna_grass_b_wetseason", "savanna_mud_a"];
const tForestFloor = "savanna_forestfloor_a";
const tGrassA = "savanna_shrubs_a_wetseason";
const tGrassB = "savanna_shrubs_a";
const tCliff = "savanna_cliff_a";
const tHill = "savanna_grass_a_wetseason";
const tMud = "savanna_mud_a";
const tShoreBlend = "savanna_grass_b_wetseason";
const tShore = "savanna_riparian_wet";
const tWater = "savanna_mud_a";
const tCityTile = "savanna_tile_a";

// gaia entities
const oBush = "gaia/flora_bush_temperate";
const oBaobab = "gaia/flora_tree_baobab";
const oToona = "gaia/flora_tree_toona";
const oBerryBush = "gaia/flora_bush_berry";
const oGazelle = "gaia/fauna_gazelle";
const oZebra = "gaia/fauna_zebra";
const oWildebeest = "gaia/fauna_wildebeest";
const oLion = "gaia/fauna_lion";
const oRhino = "gaia/fauna_rhino";
const oCrocodile = "gaia/fauna_crocodile";
const oElephant = "gaia/fauna_elephant_north_african";
const oElephantInfant = "gaia/fauna_elephant_african_infant";
const oLioness = "gaia/fauna_lioness";
const oFish = "gaia/fauna_fish";
const oRabbit = "gaia/fauna_rabbit";
const oStoneLarge = "gaia/geology_stonemine_temperate_quarry";
const oStoneSmall = "gaia/geology_stone_savanna_small";
const oMetalLarge = "gaia/geology_metal_savanna_slabs";

// decorative props
const aGrass = "actor|props/flora/grass_field_lush_tall.xml";
const aGrass2 = "actor|props/flora/grass_field_flowering_tall.xml";
const aGrass3 = "actor|props/flora/grass_tropic_field_tall.xml";
const aGrassShort = "actor|props/flora/grass_soft_large.xml";
const aRockLarge = "actor|geology/stone_granite_med.xml";
const aRockMedium = "actor|geology/stone_granite_med.xml";
const aReeds = "actor|props/flora/reeds_pond_lush_a.xml";
const aReeds2 = "actor|props/flora/reeds_pond_lush_b.xml";
const aLillies = "actor|props/flora/water_lillies.xml";
const aBushMedium = "actor|props/flora/bush_tropic_b.xml";
const aBushSmall = "actor|props/flora/bush_tropic_a.xml";
const aShrub = "actor|props/flora/shrub_tropic_plant_flower.xml";
const aFlower = "actor|props/flora/flower_bright.xml";
const aPalm = "actor|props/flora/shrub_fanpalm.xml";

log("Initializing map...");

InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();
const mapArea = mapSize*mapSize;

// create tile classes

var clPlayer = createTileClass();
var clHill = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clForest = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clSettlement = createTileClass();
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
	var painter = new LayeredPainter([tCityTile, tCityTile], [1]);
	createArea(placer, painter, null);

	// create starting units
	placeCivDefaultEntities(fx, fz, id);

	placeDefaultChicken(fx, fz, clBaseResource);

	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	var group = new SimpleGroup(
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
	var mDist = radius - 4;
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
	// create starting trees
	var num = floor(hillSize / 100);
	var tAngle = randFloat(-PI/3, 4*PI/3);
	var tDist = 12;
	var tX = round(fx + tDist * cos(tAngle));
	var tZ = round(fz + tDist * sin(tAngle));
	group = new SimpleGroup(
		[new SimpleObject(oBaobab, num, num, 0,5)],
		false, clBaseResource, tX, tZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2));

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

// create bumps
log("Creating bumps...");
placer = new ClumpPlacer(scaleByMapSize(20, 50), 0.6, 0.1, 1);
painter = new SmoothElevationPainter(ELEVATION_MODIFY, 2, 2);
createAreas(
	placer,
	painter,
	avoidClasses(clPlayer, 13),
	scaleByMapSize(300, 800)
);

// create hills
log("Creating hills...");
placer = new ChainPlacer(1, floor(scaleByMapSize(4, 6)), floor(scaleByMapSize(16, 40)), 0.5);
var terrainPainter = new LayeredPainter(
	[tCliff, tHill],		// terrains
	[2]								// widths
);
var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, 15, 2);
createAreas(
	placer,
	[terrainPainter, elevationPainter, paintClass(clHill)],
	avoidClasses(clPlayer, 20, clHill, 15, clWater, 0),
	scaleByMapSize(1, 4) * numPlayers * 3
);

// create marshes
log("Creating marshes...");
for (var i = 0; i < 7; i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(6, 12)), floor(scaleByMapSize(15, 60)), 0.8);
	var terrainPainter = new LayeredPainter(
		[tShoreBlend, tShore, tWater],		// terrains
		[1,1]							// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, -2, 3);
	var waterAreas = createAreas(
		placer,
		[terrainPainter, elevationPainter, paintClass(clWater)],
		avoidClasses(clPlayer, 20, clWater, round(scaleByMapSize(7,16)*randFloat(0.8,1.35))),
		scaleByMapSize(4,20)
	);
}


// create reeds
log("Creating reeds...");
group = new SimpleGroup(
	[new SimpleObject(aReeds, 30,60, 0,4), new SimpleObject(aReeds2, 30,60, 0,4), new SimpleObject(aLillies, 20,40, 0,4)], true
);
createObjectGroups(group, 0,
	stayClasses(clWater, 1),
	scaleByMapSize(400,2000), 100
);
waterAreas = [];

RMS.SetProgress(40);

// create bumps
log("Creating bumps...");
placer = new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1);
painter = new SmoothElevationPainter(ELEVATION_MODIFY, 1, 2);
createAreas(
	placer,
	painter,
	stayClasses(clWater, 2),
	scaleByMapSize(50, 100)
);


// calculate desired number of trees for map (based on size)
const MIN_TREES = 200;
const MAX_TREES = 800;
const P_FOREST = 0.7;

var totalTrees = scaleByMapSize(MIN_TREES, MAX_TREES);
var numStragglers = totalTrees * (1.0 - P_FOREST);


RMS.SetProgress(50);

// create mud patches
log("Creating mud patches...");
var sizes = [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(3, 5)), sizes[i], 1);
	painter = new LayeredPainter(
		[tGrassA, tGrassB, tMud], 		// terrains
		[1,1]															// widths
	);
	createAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clWater, 1, clHill, 0, clDirt, 5, clPlayer, 8),
		scaleByMapSize(15, 45)
	);
}


log("Creating stone mines...");
// create large stone quarries
group = new SimpleGroup([new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)], true, clRock);
createObjectGroups(group, 0,
	[avoidClasses(clWater, 0, clPlayer, 20, clRock, 10, clHill, 1)],
	scaleByMapSize(4,16), 100
);

// create small stone quarries
group = new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock);
createObjectGroups(group, 0,
	[avoidClasses(clWater, 0, clPlayer, 20, clRock, 10, clHill, 1)],
	scaleByMapSize(4,16), 100
);

log("Creating metal mines...");
// create large metal quarries
group = new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal);
createObjectGroups(group, 0,
	[avoidClasses(clWater, 0, clPlayer, 20, clMetal, 10, clRock, 5, clHill, 1)],
	scaleByMapSize(4,16), 100
);

RMS.SetProgress(60);

//create decorative rocks

log("Creating small decorative rocks...");
group = new SimpleGroup(
	[new SimpleObject(aRockMedium, 1,3, 0,1)],
	true
);
createObjectGroups(
	group, 0,
	avoidClasses(clPlayer, 1),
	scaleByMapSize(16, 262), 50
);

RMS.SetProgress(65);

log("Creating large decorative rocks...");
group = new SimpleGroup(
	[new SimpleObject(aRockLarge, 1,2, 0,1), new SimpleObject(aRockMedium, 1,3, 0,2)],
	true
);
createObjectGroups(
	group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 0, clHill, 0),
	scaleByMapSize(8, 131), 50
);

RMS.SetProgress(70);


// create wildlife
log("Creating lions...");
group = new SimpleGroup(
	[new SimpleObject(oLion, 0,1, 0,4), new SimpleObject(oLioness, 2,3, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 20, clFood, 11, clHill, 1),
	scaleByMapSize(4,12), 50
);


log("Creating zebras...");
group = new SimpleGroup(
	[new SimpleObject(oZebra, 4,6, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 20, clHill, 1, clFood, 13),
	3 * numPlayers, 50
);

log("Creating wildebeest...");
group = new SimpleGroup(
	[new SimpleObject(oWildebeest, 2,4, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 20, clHill, 1, clFood, 13),
	3 * numPlayers, 50
);

log("Creating crocodiles...");
group = new SimpleGroup(
	[new SimpleObject(oCrocodile, 2,3, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	[avoidClasses(clForest, 0, clPlayer, 20, clHill, 1, clFood, 13), stayClasses(clWater, 3)],
	3 * numPlayers, 50
);

log("Creating gazelles...");
group = new SimpleGroup(
	[new SimpleObject(oGazelle, 4,6, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 20, clHill, 1, clFood, 13),
	3 * numPlayers, 50
);

RMS.SetProgress(75);


log("Creating rabbits...");
group = new SimpleGroup(
	[new SimpleObject(oRabbit, 6,8, 0,2)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 20, clHill, 1, clFood, 13),
	6 * numPlayers, 50
);

log("Creating rhinoceroces...");
group = new SimpleGroup(
	[new SimpleObject(oRhino, 1,1, 0,2)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 20, clHill, 1, clFood, 13),
	3 * numPlayers, 50
);

log("Creating elephants...");
group = new SimpleGroup(
	[new SimpleObject(oElephant, 2,4, 0,4)],
	[new SimpleObject(oElephantInfant, 1,1, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 20, clHill, 1, clFood, 13),
	3 * numPlayers, 50
);


log("Creating berry bush...");
group = new SimpleGroup(
	[new SimpleObject(oBerryBush, 5,7, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 3, clForest, 0, clPlayer, 20, clHill, 1, clFood, 10),
	randInt(1, 4) * numPlayers + 2, 50
);

RMS.SetProgress(80);


log("Creating straggler trees...");
var types = [oToona, oBaobab, oBush];	// some variation
var num = floor(numStragglers / types.length);
for (var i = 0; i < types.length; ++i)
{
	group = new SimpleGroup(
		[new SimpleObject(types[i], 1,3, 0,3)],
		true, clForest
	);
	createObjectGroups(group, 0,
		avoidClasses(clForest, 1, clWater, 1, clHill, 1, clPlayer, 13, clMetal, 1, clRock, 1),
		num
	);
}

RMS.SetProgress(85);

//create small grass tufts
log("Creating small grass tufts...");
group = new SimpleGroup(
	[new SimpleObject(aGrassShort, 1,2, 0,1, -PI/8,PI/8)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 2, clPlayer, 13, clDirt, 0),
	scaleByMapSize(13, 200)
);

RMS.SetProgress(90);

// create large grass tufts
log("Creating large grass tufts...");
group = new SimpleGroup(
	[new SimpleObject(aGrass, 2,4, 0,1.8, -PI/8,PI/8), new SimpleObject(aGrassShort, 3,6, 1.2,2.5, -PI/8,PI/8)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 3, clPlayer, 13, clDirt, 1, clForest, 0),
	scaleByMapSize(13, 200)
);

RMS.SetProgress(95);


log("Creating bushes...");
group = new SimpleGroup(
	[new SimpleObject(aBushMedium, 1,2, 0,2), new SimpleObject(aBushSmall, 2,4, 0,2)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 13, clDirt, 1),
	scaleByMapSize(13, 200), 50
);

log("Creating flowering shrubs...");
group = new SimpleGroup(
	[new SimpleObject(aShrub, 1,1, 0,2)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clPlayer, 13, clDirt, 1),
	scaleByMapSize(13, 200), 50
);

log("Creating decorative palms...");
group = new SimpleGroup(
	[new SimpleObject(aPalm, 1,3, 0,2)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 2, clPlayer, 12, clDirt, 1),
	scaleByMapSize(13, 200), 50
);


log("Creating shrubs,flowers and other decorations...");
group = new SimpleGroup(
	[new SimpleObject(aFlower, 0,6, 0,2), new SimpleObject(aGrass3, 2,5, 0,2)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clHill, 1, clPlayer, 13, clDirt, 1),
	scaleByMapSize(13, 200), 50
);

// Set environment
setSkySet("cirrus");
setWaterColor(0.753,0.635,0.345);				// muddy brown
setWaterTint(0.161,0.514,0.635);				// clear blue for blueness
setWaterMurkiness(0.8);
setWaterWaviness(1.0);
setWaterType("clap");

setFogThickness(0.25);
setFogFactor(0.6);

setPPEffect("hdr");
setPPSaturation(0.44);
setPPBloom(0.3);

ExportMap();
