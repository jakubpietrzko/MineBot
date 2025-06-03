import { Bot } from 'mineflayer';
import { Movements, goals } from 'mineflayer-pathfinder';
import { goToPosition } from './goToPosition';
import minecraftData from 'minecraft-data';
const mc_version = '1.20.1';
import prismarine_items from 'prismarine-item';
import { Vec3 } from 'vec3';
import { placeBlock } from './placeblock';
import { sendRequest} from '../chat'
import { generatePrompt, handleResponse  } from '../plugins/handling_prompt';
import { MemoryManager } from '../plugins/memoryManager';

const mcdata = minecraftData(mc_version);
const Item = prismarine_items(mc_version);


export const getRecipe = async (
  bot: Bot,
  itemName: string, movements: Movements
): Promise<string> => {
  if (itemName.endsWith('plank')) itemName += 's'
  if (!bot.registry.itemsByName[itemName]) {
    let  prompt = `Item ${itemName} not found.`+ "sprawdz jak nazywa sie w minecrafcie, bo podales zla nazwe, sprawdz w internecie";
    
    
   let response = await sendRequest(
            prompt,
            true
          );

    await handleResponse(bot, movements, response, sendRequest, prompt);
    return `Item ${itemName} not found.`
  }
  let recipes = bot.recipesAll(
    bot.registry.itemsByName[itemName].id,
    null,
    false
  )

  const extractRecipe = () =>
    recipes[0].delta
      .filter(item => new Item(item.id, item.count).name !== itemName)
      .map(item => `${new Item(item.id, item.count).name}*${Math.abs(item.count)}`)
      .join(', ')
      .replace(/,([^,]*)$/, '.')

  if (recipes.length !== 0){
    bot.chat(`Recipe for ${itemName} is: ${extractRecipe()}. It doesn't require crafting table.`);

    return `Recipe for ${itemName} is: ${extractRecipe()}. It doesn't require crafting table.`;
  }
  // get recipes that require a crafting table
  recipes = bot.recipesAll(bot.registry.itemsByName[itemName].id, null, true)

  if (!recipes || recipes.length === 0)
  {
    bot.chat(`No recipe found for ${itemName}.`);
    return  `No recipe found for ${itemName}.`
  }
  bot.chat(`Recipe for ${itemName} is: ${extractRecipe()}. It requires crafting table.`);

  return `Recipe for ${itemName} is: ${extractRecipe()}. It requires crafting table.`;
   
}


import { type Block } from 'prismarine-block'

const { GoalNear } = goals

export const craftRecipe = async (bot: Bot, itemName: string, num = 1, movements: Movements) => {
   // Sprawdzenie, czy przedmiot istnieje w rejestrze
   const itemData = bot.registry.itemsByName[itemName];
   if (!itemData) {
     // Jeśli przedmiot nie istnieje, AI dostaje komunikat
     const prompt = `Item ${itemName} not found. Sprawdź, jak nazywa się ten przedmiot w Minecraft i upewnij się, że podałeś poprawną nazwę.`;
     let response = await sendRequest(prompt, true);
     await handleResponse(bot, movements, response, sendRequest, prompt);
     bot.chat(`Item ${itemName} not found.`);
     return `Item ${itemName} not found.`;
   }
  let craftingTable: Block | undefined

  if (itemName.endsWith('plank')) itemName += 's'


  // get recipes that don't require a crafting table
  let recipes = bot.recipesFor(
    bot.registry.itemsByName[itemName].id,
    null,
    num,
    null
  )

  if (!recipes || recipes.length === 0) {
    const craftingTableRange = 32

    recipes = bot.recipesFor(
      bot.registry.itemsByName[itemName].id,
      null,
      num,
      true
    )
    if (!recipes || recipes.length === 0) {
      //print what bot is missing
      const allRecipies = bot.recipesAll(
        bot.registry.itemsByName[itemName].id,
        null,
        true
      )

      let missingItems = ''

      allRecipies[0].delta.forEach(ingredient => {
        const name = new Item(ingredient.id,ingredient.count).name
        const count = ingredient.count

        if (name === itemName) return

        missingItems += `${name}*${count * -1} , `
      })
      let prompt = `You do not have enough resources to craft ${itemName}. Missing: ${missingItems}`;
      let response = await sendRequest(
        prompt,
        true
            );
     
      await handleResponse(bot, movements, response, sendRequest, prompt);
            bot.chat(`You do not have enough resources to craft ${itemName}. Missing: ${missingItems}`);
            return  `You do not have enough resources to craft ${itemName}. Missing: ${missingItems}`
              
      
    }
    await placeBlock(bot, 'crafting_table');
    
    craftingTable =
      bot.findBlock({
        matching: block => block.name === 'crafting_table',
        maxDistance: craftingTableRange,
      }) || undefined

    if (!craftingTable)
    {
      bot.chat(`It requires a crafting table to craft ${itemName}`);
      return `It requires a crafting table to craft ${itemName}`
    }
    await bot.pathfinder.goto(
      new GoalNear(
        craftingTable.position.x,
        craftingTable.position.y,
        craftingTable.position.z,
        2
      )
    )
  }

  num = Math.floor(num / recipes[0].result.count)

  await bot.craft(recipes[0], num, craftingTable)

  let craftedItemCount = 0

  bot.inventory.items().forEach(item => {
    if (item.name === itemName) {
      craftedItemCount += item.count
    }
  })
  bot.chat(`Successfully crafted ${itemName}, you now have ${craftedItemCount} ${itemName}.`);
  return `Successfully crafted ${itemName}, you now have ${craftedItemCount} ${itemName}.`
}
