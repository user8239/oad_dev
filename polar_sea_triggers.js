/**
 * This unit will be spawned
 */
var attackerTemplate = "gaia/fauna_wolf_snow";
attackerTemplate = "gaia/fauna_elephant_north_african";

/**
 * Number of attackers per wave
 */
var waveSize = 1;

/**
 * Minutes between each wave
 */
var waveTime = 2;

Trigger.prototype.MoveToTriggerPoint = function(triggerPoint, owner)
{
	let position;
	for (let target of this.GetTriggerPoints("A"))
		if (owner == undefined || TriggerHelper.GetOwner(target) == owner)
		{
			position = Engine.QueryInterface(target, IID_Position).GetPosition();
			break;
		}

	if (!position)
	{
		warn("Could not find suitable trigger point!");
		return;
	}

	ProcessCommand(0, {
		"type": "attack-walk",
		"entities": attackers[ent],
		"queued": true,
		"targetClasses": { "attack": ["Unit"] }
	});
}

Trigger.prototype.SpawnAndAttack = function()
{
	let attackers = TriggerHelper.SpawnUnitsFromTriggerPoints("A", attackerTemplate, waveSize, 0);

	for (let triggerPoint in attackers)
	{
		// Move to a random trigger point
		//this.MoveToTriggerPoint(attackers, "A", undefined)

		// Move to the player base
		//this.MoveToTriggerPoint(attackers, "B", TriggerHelper.GetOwner(+attackers[triggerPoint]))
	}

	this.DoAfterDelay(waveTime * 60 * 1000, "SpawnAndAttack", {});
};

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	//cmpTrigger.SpawnAndAttack();
}