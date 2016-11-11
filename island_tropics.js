RMS.LoadLibrary("rmgen");

// terrain textures
const tOceanDepths = "tropic_ocean_depths";
const tOceanRockDeep = "medit_sea_coral_deep";
const tOceanRockShallow = "medit_rocks_wet";
const tOceanCoral = "tropic_ocean_coral";
const tBeachWet = "tropic_beach_wet";
const tBeachDry = "tropic_beach_dry";
const tBeachGrass = "medit_rocks_grass";
const tBeach = ["medit_rocks_grass","tropic_beach_dry_plants", "tropic_dirt_a_plants"]
const tBeachBlend = ["tropic_grass_c", "tropic_dirt_b_plants"];
const tBeachCliff = "tropics_cliff_a";
const tCity = "tropic_citytile_a";
const tGrass = ["tropic_grass_c", "tropic_grass_plants", "tropic_dirt_b_plants"];
const tGrassLush = ["tropic_plants", "tropic_plants_b"];
const tGrassPlants = "tropic_grass_plants";
const tCliffShrubs = ["tropic_cliff_a_plants", "tropic_cliff_grass","tropic_cliff_b"]
const tDirt = "tropic_dirt_a";
const tDirtGrass = "tropic_dirt_b_plants";
const tDirtCliff = "tropic_cliff_a";
const tGrassCliff = "tropic_cliff_grass";
const tCliff = ["tropic_cliff_a", "tropic_cliff_a_plants", "tropic_cliff_grass"];
const tForestFloor = "tropic_forestfloor_a";

// gaia entities
const oTree1 = "gaia/flora_tree_palm_tropic";
const oBerryBush = "gaia/flora_bush_berry";
const oTree2 = "gaia/flora_tree_palm_tropical";
const oTree3 = "gaia/flora_tree_toona";
const oChicken = "gaia/fauna_chicken";
const oDeer = "gaia/fauna_deer";
const oBoar = "gaia/fauna_boar";
const oFish = "gaia/fauna_fish";
const oWhale = "gaia/fauna_whale_humpback";
const oStoneLarge = "gaia/geology_stonemine_tropic_quarry";
const oStoneSmall = "gaia/geology_stone_tropic_a";
const oMetalLarge = "gaia/geology_metal_tropic_slabs";

// decorative props
const aBush1 = "actor|props/flora/bush_tropic_a.xml";
const aBush2 = "actor|props/flora/bush_tropic_b.xml";
const aFerns = "actor|props/flora/bush_ferns.xml";
const aGrass = "actor|props/flora/grass_soft_large_tall.xml";
const aGrassDry = "actor|props/flora/grass_soft_dry_large_tall.xml";
const aRockLarge = "actor|geology/stone_granite_large.xml";
const aRockMed = "actor|geology/stone_granite_med.xml";
const aRockSmall = "actor|geology/stone_granite_small.xml";


// terrain + entity (for painting)
const pForest1 = [tForestFloor+TERRAIN_SEPARATOR+oTree1, tGrass];
const pForest2 = [tForestFloor+TERRAIN_SEPARATOR+oTree2, tGrass];
const pForest3 = [tForestFloor+TERRAIN_SEPARATOR+oTree3, tGrass];
const pForest4 = [tForestFloor, tForestFloor + TERRAIN_SEPARATOR + oTree1, tGrass, tForestFloor + TERRAIN_SEPARATOR + oTree2, tGrass, tForestFloor + TERRAIN_SEPARATOR + oTree3, tGrass];

const BUILDING_ANGlE = -PI/4;

// initialize map

log("Initializing map...");

InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();

// create tile classes

var clCoral = createTileClass();
var clPlayer = createTileClass();
var clIsland = createTileClass();
var clCity = createTileClass();
var clDirt = createTileClass();
var clHill = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; i++)
{
	playerIDs.push(i+1);
}
playerIDs = sortPlayers(playerIDs);

//array holding starting islands based on number of players
var startingPlaces=[[0],[0,3],[0,2,4],[0,1,3,4],[0,1,2,3,4],[0,1,2,3,4,5]];

//figure out how many spoke islands
var numIslands =6;
if(numPlayers<6){
    numIslands=6;
}else{
    numIslands=numPlayers;
}

//figure out coordinates of spoke islands
var islandX = new Array(numIslands);
var islandZ = new Array(numIslands);
var islandAngle = new Array(numIslands);
//holds all land areas
var areas = [];

var startAngle = randFloat() * 2 * PI;
for (var i=0; i < numIslands; i++)
{
	islandAngle[i] = startAngle + i*2*PI/numIslands;
	islandX[i] = 0.5 + 0.39*cos(islandAngle[i]);
	islandZ[i] = 0.5 + 0.39*sin(islandAngle[i]);
}


for(var i=0;i<numIslands;i++){
	var radius = scaleByMapSize(15,40);
	var coral=scaleByMapSize(1,5);
	var wet = 3;
	var dry = 1;
	var gbeach = 2;
	var elevation = 3;
	
	// get the x and z in tiles
	var fx = fractionToTiles(islandX[i]);
	var fz = fractionToTiles(islandZ[i]);
	var ix = round(fx);
	var iz = round(fz);
	
	var islandSize = PI*radius*radius;
	var islandBottom=PI*(radius+coral)*(radius+coral);
	
	//create base
	var placer = new ClumpPlacer(islandBottom, .7, .1, 10, ix, iz);
	var terrainPainter = new LayeredPainter(
        [tOceanRockDeep, tOceanCoral],
        [5]
	);
	createArea(placer, [terrainPainter, paintClass(clCoral)],avoidClasses(clCoral,0));
}


//create spoke islands
//put down base resources and animals but do not populate
for (var i=0; i < numIslands; i++)
{
	log("Creating base Island " + (i + 1) + "...");
	
	var radius = scaleByMapSize(15,40);
	var coral=scaleByMapSize(2,5);
	var wet = 3;
	var dry = 1;
	var gbeach = 2;
	var elevation = 3;
	
	// get the x and z in tiles
	var fx = fractionToTiles(islandX[i]);
	var fz = fractionToTiles(islandZ[i]);
	var ix = round(fx);
	var iz = round(fz);
	
	var islandSize = PI*radius*radius;
	var islandBottom=PI*(radius+coral)*(radius+coral);
	
	// create island
	var placer = new ClumpPlacer(islandSize, .7, .1, 10, ix, iz);
	var terrainPainter = new LayeredPainter(
        [tOceanCoral,tBeachWet, tBeachDry, tBeach, tBeachBlend, tGrass],
        [1,wet,dry,1,gbeach]
	);
	var elevationPainter = new SmoothElevationPainter(
	    ELEVATION_SET,
	    elevation,
	    5
    );
    var temp = createArea(placer, [terrainPainter, paintClass(clPlayer), elevationPainter],avoidClasses(clPlayer,0));
    
    areas.push(temp);

	// create animals
    var group;
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		group = new SimpleGroup(
			[new SimpleObject(oChicken, 5,5, 0,2)],
			true, clBaseResource, aX, aZ
		);
		createObjectGroup(group, 0);
	}
	
	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 10;
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
	// create starting trees
	var num = 2;
	var tAngle = randFloat(-PI/3, 4*PI/3);
	var tDist = randFloat(12, 13);
	var tX = round(fx + tDist * cos(tAngle));
	var tZ = round(fz + tDist * sin(tAngle));
	group = new SimpleGroup(
		[new SimpleObject(oTree1, num, num, 0,3)],
		false, clBaseResource, tX, tZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2));
}


//Populate the islands with the players
log("Populating islands ...");

//nPlayer is the player we are on i is the island we are on
var nPlayer=0;
for(var i=0;i<numIslands;i++)
{
if((numPlayers>=6)||(i==startingPlaces[numPlayers-1][nPlayer])){

	var id = playerIDs[nPlayer];

	// get the x and z in tiles
	var fx = fractionToTiles(islandX[i]);
	var fz = fractionToTiles(islandZ[i]);
	var ix = round(fx);
	var iz = round(fz);

    //create city patch
    var cityRadius = 6;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tGrass, tCity], [1]);
	createArea(placer, [painter,paintClass(clCity)], null);

	// create starting units
	placeCivDefaultEntities(fx, fz, id, BUILDING_ANGlE, {'iberWall' : 'towers'});

    nPlayer++;
}
}


RMS.SetProgress(15);


// get the x and z in tiles

var nCenter=floor(scaleByMapSize(1,4))
var startAngle = randFloat() * 2 * PI;
for (var i=0; i < nCenter; i++)
{
	var fx=.5;
	var fz=.5;
	if(nCenter==1){
	    fx=.5;
	    fz=.5;
	}else{
	    var isangle = startAngle + i*2*PI/nCenter+randFloat(-PI/8,PI/8);
	    var dRadius = randFloat(.1,.16);
	    fx = 0.5 + dRadius*cos(isangle);
	    fz = 0.5 + dRadius*sin(isangle);
	}
    var ix = round(fractionToTiles(fx));
    var iz = round(fractionToTiles(fz));

    var radius = scaleByMapSize(15,30);
    var coral= 2;
    var wet = 3;
    var dry = 1;
    var gbeach = 2;
    var elevation = 3;

    var islandSize = PI*radius*radius;
    var islandBottom=PI*(radius+coral)*(radius+coral);

    //create base
    var placer = new ClumpPlacer(islandBottom, .7, .1, 10, ix, iz);
    var terrainPainter = new LayeredPainter(
        [tOceanRockDeep, tOceanCoral],
        [5]
    );
    createArea(placer, [terrainPainter, paintClass(clCoral)],avoidClasses(clCoral,0,clPlayer,0));

    // create island
    var placer = new ClumpPlacer(islandSize, .7, .1, 10, ix, iz);
    var terrainPainter = new LayeredPainter(
        [tOceanCoral,tBeachWet, tBeachDry, tBeach, tBeachBlend, tGrass],
        [1,wet,dry,1,gbeach]
    );
    var elevationPainter = new SmoothElevationPainter(
        ELEVATION_SET,
        elevation,
        5
    );
    var temp = createArea(placer, [terrainPainter, paintClass(clIsland), elevationPainter],avoidClasses(clPlayer,0));

    areas.push(temp);
}    
RMS.SetProgress(30);

// create bumps
log("Creating bumps...");
placer = new ClumpPlacer(scaleByMapSize(20, 60), 0.3, 0.06, 1);
painter = new SmoothElevationPainter(ELEVATION_MODIFY, 2, 3);
createAreasInAreas(
	placer,
	painter, 
	avoidClasses(clCity, 0),
	scaleByMapSize(25, 75),15,
	areas
);


RMS.SetProgress(40);
//find all water
for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
	if(getHeight(ix,iz)<0){
	    addToClass(ix,iz,clWater);
	}
	}
}

// create forests
log("Creating forests...");
var types = [
	[[tForestFloor, tGrass, pForest1], [tForestFloor, pForest1]],
	[[tForestFloor, tGrass, pForest2], [tForestFloor, pForest2]],
	[[tForestFloor, tGrass, pForest3], [tForestFloor, pForest3]],
	[[tForestFloor, tGrass, pForest4], [tForestFloor, pForest4]]
];	// some variation
var size = 5; //size
var num = scaleByMapSize(10, 64); //number
for (var i = 0; i < types.length; ++i)
{
	placer = new ClumpPlacer(6+randInt(12), 0.1, 0.1, 1);
	painter = new LayeredPainter(
		types[i],		// terrains
		[2]											// widths
		);
	createAreasInAreas(
		placer,
		[painter, paintClass(clForest)], 
		avoidClasses(clCity, 1, clWater, 3, clForest, 3, clHill, 1),
		num, 20, areas
	);
}

RMS.SetProgress(60);

log("Creating stone mines...");
// create large stone quarries
group = new SimpleGroup([new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)], true, clRock);
createObjectGroupsByAreas(group, 0,
	[avoidClasses(clWater, 1, clForest, 1, clHill, 1, clPlayer, 5, clRock, 1)],
	scaleByMapSize(4,16), 200, areas
);

// create small stone quarries
group = new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock);
createObjectGroupsByAreas(group, 0,
	[avoidClasses(clWater, 1, clForest, 1, clHill, 1, clPlayer, 5, clRock, 2)],
	scaleByMapSize(4,16), 200, areas
);
RMS.SetProgress(70);

log("Creating metal mines...");
// create large metal quarries
group = new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal);
createObjectGroupsByAreas(group, 0,
	[avoidClasses(clWater, 1, clForest, 1, clHill, 1, clPlayer, 5, clMetal, 2, clRock, 1)],
	scaleByMapSize(4,16), 200, areas
);

RMS.SetProgress(80);



//create shrub patches
log("Creating shrub patches...");
var sizes = [scaleByMapSize(2, 32), scaleByMapSize(3, 48), scaleByMapSize(5, 80)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5);
	painter = new LayeredPainter([tBeachBlend,tGrassPlants],[1]);
	createAreasInAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clWater, 3, clHill, 0, clDirt, 6, clCity, 0),
		scaleByMapSize(4, 16), 20, areas
	);
}

//create grass patches
log("Creating grass patches...");
var sizes = [scaleByMapSize(2, 32), scaleByMapSize(3, 48), scaleByMapSize(5, 80)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5);
	painter = new LayeredPainter([tGrassLush],[]);
	createAreasInAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clWater, 3, clHill, 0, clDirt, 6, clCity, 0),
		scaleByMapSize(4, 16), 20, areas
	);
}

RMS.SetProgress(90);

log("Creating straggler trees...");
// create straggler trees
var trees = [oTree1, oTree2];
for (var t in trees)
{
	group = new SimpleGroup([new SimpleObject(trees[t], 1,1, 0,1)], true, clForest);
	createObjectGroupsByAreas(group, 0,
		avoidClasses(clWater, 2, clForest, 2, clCity, 3, clBaseResource, 1, clRock, 1, clMetal, 1, clPlayer, 1, clHill, 1),
		scaleByMapSize(2, 38), 50, areas
	);
}



log("Creating rocks...");
// create rocks
group = new SimpleGroup(
	[new SimpleObject(aRockSmall, 0,3, 0,2), new SimpleObject(aRockMed, 0,2, 0,2), 
	new SimpleObject(aRockLarge, 0,1, 0,2)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clCity, 0),
	scaleByMapSize(30, 180), 50
);

// create deer
log("Creating deer...");
group = new SimpleGroup(
	[new SimpleObject(oDeer, 5,7, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 5, clForest, 1, clHill, 1, clCity, 10, clMetal, 2, clRock, 2, clFood, 8),
	3 * numPlayers, 50
);

RMS.SetProgress(95);

log("Creating berry bushes...");
// create berry bushes
group = new SimpleGroup([new SimpleObject(oBerryBush, 5,7, 0,3)], true, clFood);
createObjectGroups(group, 0,
	avoidClasses(clWater, 2, clForest, 1, clHill, 1, clCity, 10, clMetal, 2, clRock, 2, clFood, 8),
	1.5 * numPlayers, 100
);

log("Creating Fish...");
// create Fish
group = new SimpleGroup([new SimpleObject(oFish, 1,1, 0,3)], true, clFood);
createObjectGroups(group, 0,
	[stayClasses(clWater,1),avoidClasses(clFood, 8)],
	scaleByMapSize(40,200), 100
);

log("Creating Whales...");
// create Whales
group = new SimpleGroup([new SimpleObject(oWhale, 1,1, 0,3)], true, clFood);
createObjectGroups(group, 0,
	[stayClasses(clWater,1),avoidClasses(clFood, 8, clPlayer,4,clIsland,4)],
	scaleByMapSize(10,40), 100
);

// Adjust environment
setSkySet("sunny");
setWaterColor(0.2,0.294,0.49);
setWaterTint(0.208, 0.659, 0.925);
setWaterMurkiness(0.72);
setWaterWaviness(3.0);
setWaterType("ocean");

// Export map data
ExportMap();
