import { Vec3 } from 'vec3'
import { goals, Movements } from 'mineflayer-pathfinder'
import { mineBlocks } from './mineBlock'
import {Bot} from 'mineflayer'
const { GoalNear } = goals
import { placeBlock } from './placeblock'
import { sendRequest} from '../chat'
import { generatePrompt, handleResponse  } from '../plugins/handling_prompt'
import { MemoryManager } from '../plugins/memoryManager';

export const smeltItem = async (bot: Bot, itemName: string, num = 1, movements: Movements) => {
  try {
    const foods = [
      'beef',
      'chicken',
      'cod',
      'mutton',
      'porkchop',
      'rabbit',
      'salmon',
      'tropical_fish',
    ]
    if (!itemName.includes('raw') && !foods.includes(itemName)) {
      let prompt = 'Cannot smelt ${itemName}, must be a "raw" item, like "raw_iron".';
      let response = await sendRequest(
        prompt,
        true
      );

await handleResponse(bot, movements, response, sendRequest, prompt);
      return `Cannot smelt ${itemName}, must be a "raw" item, like "raw_iron".`;
       
    }
    bot.chat(`Przetapiam ${num} ${itemName}...`)
    let placedFurnace = false
    let furnaceBlock: any = undefined
    const furnaceRange = 32
    furnaceBlock = bot.findBlock({
      matching: block => block.name === 'furnace',
      maxDistance: furnaceRange,
    })
    if (!furnaceBlock) {
      await placeBlock(bot, 'furnace')
      furnaceBlock = bot.findBlock({
          matching: block => block.name === 'furnace',
          maxDistance: furnaceRange,
        })
        
      
    }
    if (!furnaceBlock) {
      return `There is no furnace nearby and you have no furnace.`;
       
    }
    if (bot.entity.position.distanceTo(furnaceBlock.position) > 4) {
      await bot.pathfinder.goto(
        new GoalNear(
          furnaceBlock.position.x,
          furnaceBlock.position.y,
          furnaceBlock.position.z,
          1
        )
      )
    }
    await bot.lookAt(furnaceBlock.position)

    console.log('smelting...')
    console.log('furnace: ', furnaceBlock)
    const furnace = await bot.openFurnace(furnaceBlock)

    console.log('opened furnace...')
    let input_item = furnace.inputItem()
    console.log(input_item)

    if (input_item && input_item.name !== itemName && input_item.count > 0) {
      if (placedFurnace) await mineBlocks(bot, 'furnace', 1,movements)
      return `The furnace is currently smelting ${input_item.name}.`;
       
    }
    let inv_counts = bot.inventory.items().reduce((acc: { [key: string]: number }, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.count
      return acc
    }, {})
    if (!inv_counts[itemName] || inv_counts[itemName] < num) {
      if (placedFurnace) await mineBlocks(bot, 'furnace', 1, movements)
      return `You do not have enough ${itemName} to smelt.`;
    }

    if (!furnace.fuelItem()) {
      let fuel = bot.inventory
        .items()
        .find(item => item.name === 'coal' || item.name === 'charcoal')
      let put_fuel = Math.ceil(num / 8)
      if (!fuel || fuel.count < put_fuel) {
        if (placedFurnace) await mineBlocks(bot, 'furnace', 1, movements)
        return  `You do not have enough coal or charcoal to smelt ${num} ${itemName}, you need ${put_fuel} coal or charcoal`;
      }
      await furnace.putFuel(fuel.type, null, put_fuel)
      
    }
    console.log(`putting ${num} ${itemName} into furnace...`)
    await furnace.putInput(bot.registry.itemsByName[itemName].id, null, num)
    console.log(`put ${num} ${itemName} into furnace...`)

    let total = 0
    let collected_last = true
    let smelted_item: any = null
    await new Promise(resolve => setTimeout(resolve, 200))
    while (total < num) {
      await new Promise(resolve => setTimeout(resolve, 10000))
      console.log('checking...')
      let collected = false
      if (furnace.outputItem()) {
        smelted_item = await furnace.takeOutput()
        if (smelted_item) {
          total += smelted_item.count
          collected = true
        }
      }
      if (!collected && !collected_last) {
        break
      }
      collected_last = collected
    }

    if (placedFurnace) {
      await mineBlocks(bot, 'furnace', 1, movements)
    }
    if (total === 0) {
      return `Failed to smelt ${itemName}.`;
    }
    if (total < num) {
      return `Only smelted ${total} ${smelted_item.name}.`;
    }
    let prompt = `Successfully smelted ${itemName}, got ${total} ${smelted_item.name}.`;
    let response = await sendRequest(
      prompt,
      true
    );

await handleResponse(bot, movements, response, sendRequest, prompt);
    return `Successfully smelted ${itemName}, got ${total} ${smelted_item.name}.`;
  } catch (error) {
    console.error('Błąd podczas przetapiania przedmiotu:', error)
    bot.chat('Wystąpił błąd podczas przetapiania przedmiotu.')

    return 'Wystąpił błąd podczas przetapiania przedmiotu.'
  }
}
