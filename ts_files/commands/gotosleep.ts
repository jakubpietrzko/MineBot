import { Bot } from 'mineflayer'
import { goals } from 'mineflayer-pathfinder'
const { GoalNear } = goals
import { placeBlock} from './placeblock'
export const sleepInBed = async (bot: Bot): Promise<string> => {
  try {
    
    let bed = bot.findBlock({
      matching: block => block.name.includes('bed'),
      maxDistance: 32,
    })
    if (!bed){
      const itemsWithBedInName = bot.inventory.items().filter((i) => i.name.includes('bed'));
      if (itemsWithBedInName.length > 0) {
        await placeBlock(bot, itemsWithBedInName[0].name)
     }
     bed = bot.findBlock({
      matching: block => block.name.includes('bed'),
      maxDistance: 32,
    })
    }

    if (!bed) {
      
      bot.chat('Nie mogę znaleźć łóżka w pobliżu.')
      return 'Nie mogę znaleźć łóżka w pobliżu.'
    }

    await bot.pathfinder.goto(
      new GoalNear(bed.position.x, bed.position.y, bed.position.z, 1)
    )
    await bot.sleep(bed)
    const message = 'Dobranoc! Idę spać.'
    bot.chat(message)
    return message
  } catch (error) {
    console.error('Błąd podczas próby spania:', error)
    bot.chat('Nie udało mi się pójść spać.')
    return 'Nie udało mi się pójść spać.'
  }
}
