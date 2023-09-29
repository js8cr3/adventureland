const adventurelandUtils = require_code('adventurelandUtils');
const getNearestMonsterInsideBoundary = adventurelandUtils.getNearestMonsterInsideBoundary;
const getAggro = adventurelandUtils.getAggro;

module.exports = { misc, mage, priest, warrior, warriorMove };


function misc() {
    if(!is_on_cooldown('use_hp')) {
        if (character.mp<character.max_mp*0.8) {use('use_mp')} else if(character.hp < character.max_hp * 0.8) {use('use_hp')}
    }   
    loot();
	const target = get_targeted_monster();
	
    if(
		character.slots.orb && 
		character.slots.orb.name === 'jacko' && 
		can_use('scare')
	) {
		let useScare = false;
		if(character.targets >= 2) useScare = true;
		if(!target && character.targets >= 1) {
			log('scarenotarget');
			useScare = true;
		}
		if(target?.target && target.target !== character.name && character.targets >= 1) {
			log(target.target)
			useScare = true;
		}
		if(useScare) use_skill('scare');
	}
}

function priest(boundary) {

	misc();
	
	var target= get_targeted_monster();
	if(!target)
	{
		target=getNearestMonsterInsideBoundary(boundary);
		if(target) change_target(target);
		else
		{return}
	}
	
	if(!is_in_range(target))
	{
		if(!target.target) change_target();
		if(target.target && target.target !== character.name) change_target();
		return
	}
	if(character.hp < character.max_hp * 0.6) {
		heal(character);
		return;
	}
	if (!can_attack(target)) return;

	if(
		target.target &&
		target.target !== character.name && 
		can_use('absorb')
	) use_skill('absorb', target.target)
	if(character.mp > 700 && can_use('curse')) use_skill('curse', target)
	attack(target);

}

function mage() {

	misc();	

	var target= get_targeted_monster();
	const priest = get_player('Stool');
	if(!priest) return;
	if(!target)
	{
		target = get_entity(priest.target)
		if(target) change_target(target);
		if(!target) return;
	}
	
	if(!is_in_range(target)) return;
	if(can_attack(target)) attack(target);
		
}

function warrior() {

	misc();

	var target = get_targeted_monster();
	const priest = get_player('Stool');
	if(!priest) return;

	const tauntStrategy = () => {
		if(!can_use('taunt')) return;
		if(priest.targets <= 1) return;
		const excludeList = [];
		if(target) excludeList.push(target.id)
		const aggro = getAggro([priest.name], excludeList);
		if(aggro && can_use('taunt')) use_skill('taunt', aggro);
	}

	tauntStrategy();
	
	if(!target)
	{
		target= get_entity(priest.target)
		if(target) change_target(target);
		if(!target) return;
	}
	
	if(!is_in_range(target)) return;
	if(can_attack(target)) attack(target);
		
}

function warriorMove() {

	var target = get_targeted_monster();
	if(!target) {
		const priest = get_player('Stool');
		if(!priest) return;
		move(priest.x, priest.y)
		return;
	}
		
	if(distance(character, target) > character.range * 0.2) {
		const pathClear = can_move_to(target.x, target.y);
		if(!pathClear) {
			if(!character.isSmartmoving) {
				character.isSmartmoving = true;
				smart_move({x:target.x, y: target.y})
				.then( () => character.isSmartmoving = false )
				.catch( () => character.isSmartmoving = false )
			} else {
				return;
			}
		} else {
			move( 
				character.x+(target.x-character.x)/2, 
				character.y+(target.y-character.y)/2
			);
		}
	};
		
}

