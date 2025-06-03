import { goals } from 'mineflayer-pathfinder'
const { GoalNear } = goals

import { Bot } from 'mineflayer'

export const defendSelf = async (bot: Bot, range = 9) => {
    let attacked = false
    let enemy = bot.nearestEntity(entity =>
      (entity.type === 'mob' || entity.type === 'hostile') &&
      bot.entity.position.distanceTo(entity.position) < range &&
      entity.name !== 'Armor Stand'
    );
    if (enemy) {
      bot.chat('Znalazłem przeciwnika! ' + enemy.displayName);
    }
    while (enemy) {
      if (bot.entity.position.distanceTo(enemy.position) > 3) {
        try {
          await bot.pathfinder.goto(
            new GoalNear(enemy.position.x, enemy.position.y, enemy.position.z, 2)
          )
        } catch (err) {
          console.error('Błąd podczas podchodzenia do przeciwnika:', err)
        }
      }
      try {
        await bot.attack(enemy)
        attacked = true
      } catch (err) {
        console.error('Błąd podczas atakowania przeciwnika:', err)
      }
      await new Promise(resolve => setTimeout(resolve, 500))
      enemy = bot.nearestEntity(
        entity =>
          entity.type === 'mob' &&
          bot.entity.position.distanceTo(entity.position) < range &&
          entity.name !== 'Armor Stand'
      )
    }
  
  return attacked
}
