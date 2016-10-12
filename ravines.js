RMS.LoadLibrary("rmgen");
RMS.LoadLibrary("rmgen2");

InitMap();

randomizeBiome();
initMapSettings();
initTileClasses();

resetTerrain(g_Terrains.mainTerrain, g_TileClasses.land, 2);
RMS.SetProgress(10);

var pos = randomStartingPositionPattern();
addBases(pos.setup, pos.distance, pos.separation);
RMS.SetProgress(20);

addElements([
	{
		"func": addBluffs,
		"avoid": [
			g_TileClasses.bluff, 5,
			g_TileClasses.hill, 5,
			g_TileClasses.player, 9
		],
		"sizes": ["small", "normal", "big"],
		"mixes": ["same"],
		"amounts": ["tons"]
	},
	{
		"func": addLakes,
		"avoid": [
			g_TileClasses.bluff, 4,
			g_TileClasses.hill, 2,
			g_TileClasses.player, 20,
			g_TileClasses.water, 25
		],
		"sizes": g_AllSizes,
		"mixes": g_AllMixes,
		"amounts": g_AllAmounts
	},
	{
		"func": addHills,
		"avoid": [
			g_TileClasses.bluff, 5,
			g_TileClasses.hill, 15,
			g_TileClasses.player, 20
		],
		"stay": [g_TileClasses.bluff, 5],
		"sizes": ["normal", "big"],
		"mixes": ["normal"],
		"amounts": ["tons"]
	},
	{
		"func": addStragglerTrees,
		"avoid": [
			g_TileClasses.berries, 5,
			g_TileClasses.bluff, 5,
			g_TileClasses.forest, 7,
			g_TileClasses.metal, 2,
			g_TileClasses.mountain, 1,
			g_TileClasses.plateau, 2,
			g_TileClasses.player, 12,
			g_TileClasses.rock, 2,
			g_TileClasses.water, 5
		],
		"sizes": g_AllSizes,
		"mixes": g_AllMixes,
		"amounts": g_AllAmounts
	}
]);
RMS.SetProgress(30);

addElements([
	{
		"func": addLayeredPatches,
		"avoid": [
			g_TileClasses.bluff, 2,
			g_TileClasses.dirt, 5,
			g_TileClasses.forest, 2,
			g_TileClasses.mountain, 2,
			g_TileClasses.player, 12,
			g_TileClasses.water, 3
		],
		"sizes": ["normal"],
		"mixes": ["normal"],
		"amounts": ["normal"]
	},
	{
		"func": addDecoration,
		"avoid": [
			g_TileClasses.bluff, 2,
			g_TileClasses.forest, 2,
			g_TileClasses.mountain, 2,
			g_TileClasses.player, 12,
			g_TileClasses.water, 3
		],
		"sizes": ["normal"],
		"mixes": ["normal"],
		"amounts": ["normal"]
	}
]);
RMS.SetProgress(50);

addElements(shuffleArray([
	{
		"func": addMetal,
		"avoid": [
			g_TileClasses.berries, 5,
			g_TileClasses.forest, 3,
			g_TileClasses.mountain, 2,
			g_TileClasses.player, 30,
			g_TileClasses.rock, 10,
			g_TileClasses.metal, 20,
			g_TileClasses.water, 3
		],
		"stay": [g_TileClasses.bluff, 5],
		"sizes": ["normal"],
		"mixes": ["same"],
		"amounts": ["tons"]
	},
	{
		"func": addStone,
		"avoid": [
			g_TileClasses.berries, 5,
			g_TileClasses.forest, 3,
			g_TileClasses.mountain, 2,
			g_TileClasses.player, 30,
			g_TileClasses.rock, 20,
			g_TileClasses.metal, 10,
			g_TileClasses.water, 3
		],
		"stay": [g_TileClasses.bluff, 5],
		"sizes": ["normal"],
		"mixes": ["same"],
		"amounts": ["tons"]
	},
	// Forests on bluffs
	{
		"func": addForests,
		"avoid": [
			g_TileClasses.forest, 6,
			g_TileClasses.metal, 3,
			g_TileClasses.mountain, 5,
			g_TileClasses.player, 20,
			g_TileClasses.rock, 3,
			g_TileClasses.water, 2
		],
		"stay": [g_TileClasses.bluff, 5],
		"sizes": ["big"],
		"mixes": ["normal"],
		"amounts": ["tons"]
	},
	// Forests on mainland
	{
		"func": addForests,
		"avoid": [
			g_TileClasses.bluff, 10,
			g_TileClasses.forest, 10,
			g_TileClasses.metal, 3,
			g_TileClasses.mountain, 5,
			g_TileClasses.player, 20,
			g_TileClasses.rock, 3,
			g_TileClasses.water, 2
		],
		"sizes": ["small"],
		"mixes": ["same"],
		"amounts": ["normal"]
	}
]));
RMS.SetProgress(70);

addElements(shuffleArray([
	{
		"func": addBerries,
		"avoid": [
			g_TileClasses.bluff, 5,
			g_TileClasses.forest, 5,
			g_TileClasses.metal, 10,
			g_TileClasses.mountain, 2,
			g_TileClasses.player, 20,
			g_TileClasses.rock, 10,
			g_TileClasses.water, 3
		],
		"sizes": ["normal"],
		"mixes": ["same"],
		"amounts": ["few"]
	},
	{
		"func": addAnimals,
		"avoid": [
			g_TileClasses.bluff, 5,
			g_TileClasses.forest, 2,
			g_TileClasses.metal, 2,
			g_TileClasses.mountain, 1,
			g_TileClasses.player, 12,
			g_TileClasses.rock, 2,
			g_TileClasses.water, 3
		],
		"sizes": ["small"],
		"mixes": ["similar"],
		"amounts": ["normal", "many"]
	},
	{
		"func": addStragglerTrees,
		"avoid": [
			g_TileClasses.berries, 5,
			g_TileClasses.bluff, 5,
			g_TileClasses.forest, 7,
			g_TileClasses.metal, 2,
			g_TileClasses.mountain, 1,
			g_TileClasses.player, 12,
			g_TileClasses.rock, 2,
			g_TileClasses.water, 5
		],
		"sizes": ["tiny"],
		"mixes": ["same"],
		"amounts": ["many"]
	}
]));
RMS.SetProgress(90);

ExportMap();
