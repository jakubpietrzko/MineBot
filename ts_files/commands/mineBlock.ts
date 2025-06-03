import { goals, Movements } from 'mineflayer-pathfinder'
import { Vec3 } from 'vec3'
import { type Bot } from 'mineflayer'
import { collectNearbyItems } from './collectNearbyItems'
const { GoalNear } = goals
import { sendRequest} from '../chat'
import { generatePrompt, handleResponse  } from '../plugins/handling_prompt'
import { MemoryManager } from '../plugins/memoryManager';

export const mineBlocks = async (bot: Bot, blockType: string, num = 1, movements: Movements) => {
  try {
    
      // Pobierz identyfikatory bloków zawierających 'blockType'
    const incl = Object.values(bot.registry.blocksByName)
        .filter(block => block.name.includes(blockType))
        .map(block => block.id);
    
    const blocks = bot.findBlocks({
        matching: incl,
        maxDistance: 100,
        count: num + 10
      }) || [];
   

    let collected = 0
    let prevBlockPos: Vec3 | null = null
    for (const blockPos of blocks) {
      if (collected >= num) break

      await bot.pathfinder.goto(new GoalNear(blockPos.x, blockPos.y, blockPos.z, 2))

      const block = bot.blockAt(blockPos)

      if (block && bot.canDigBlock(block)) {
        // Jeśli blok wymaga narzędzia do wykopania
        if (block.harvestTools) {
          let hasTool = false

          for (const toolId in block.harvestTools) {
            const tool = bot.inventory
              .items()
              .find(item => item.type === parseInt(toolId))

            if (tool) {
              await bot.equip(tool, 'hand')
              hasTool = true
              break
            }
          }

          if (!hasTool) {
            return
          }
        } else {
          await bot.unequip('hand') // Odłóż cokolwiek w ręce, jeśli nie potrzeba narzędzia
        }

        // Wykopywanie bloku
        await bot.dig(block)
        collected++

        // Jeśli minęliśmy większą odległość, zbieraj przedmioty z pobliskich bloków
        if (prevBlockPos && blockPos.distanceTo(prevBlockPos) >= 4) {
          await collectNearbyItems(bot)
        }

        prevBlockPos = blockPos
      }
    }

    // Zbieranie przedmiotów z pobliskich bloków po zakończeniu kopania
    await collectNearbyItems(bot)
    bot.chat(`Wykopałem ${collected} bloków typu ${blockType}.`);
    let prompt= 'Wykopałem ${collected} bloków typu ${blockType}.';
    let response = await sendRequest(
      prompt,
      true
    );

    await handleResponse(bot, movements, response, sendRequest, prompt);
    return 
  } catch (error) {
    console.error('Błąd podczas wykopywania bloku:', error)
    const message = 'Wystąpił błąd podczas wykopywania bloku. moze nie moge tego wydobyc nie majac odpowiedniego narzedzia?'
    let prompt= message;
    let response = await sendRequest(
      prompt,
      true
    );

    await handleResponse(bot, movements, response, sendRequest, prompt);
    bot.chat(message)
    return message
  }
}

export const mineBlocksByCoordinates = async (bot: Bot, coordinates: Vec3[], num = 1, movements: Movements) => {
  try {
    let collected = 0
    let prevBlockPos: Vec3 | null = null

    for (const blockPos of coordinates) {
      if (collected >= num) break

      // Udaj się do określonych współrzędnych
      await bot.pathfinder.goto(new GoalNear(blockPos.x, blockPos.y, blockPos.z, 2))

      const block = bot.blockAt(blockPos)

      if (block && bot.canDigBlock(block)) {
        // Jeśli blok wymaga narzędzia do wykopania
        if (block.harvestTools) {
          let hasTool = false

          for (const toolId in block.harvestTools) {
            const tool = bot.inventory
              .items()
              .find(item => item.type === parseInt(toolId))

            if (tool) {
              await bot.equip(tool, 'hand')
              hasTool = true
              break
            }
          }

          if (!hasTool) {
            return
          }
        } else {
          await bot.unequip('hand') // Odłóż cokolwiek w ręce, jeśli nie potrzeba narzędzia
        }

        // Wykopywanie bloku
        await bot.dig(block)
        collected++

        // Jeśli minęliśmy większą odległość, zbieraj przedmioty z pobliskich bloków
        if (prevBlockPos && blockPos.distanceTo(prevBlockPos) >= 4) {
          await collectNearbyItems(bot)
        }

        prevBlockPos = blockPos
      }
    }

    // Zbieranie przedmiotów z pobliskich bloków po zakończeniu kopania
    await collectNearbyItems(bot)
    bot.chat(`Wykopałem ${collected} bloków.`);
    let prompt = `Wykopałem ${collected} bloków.`;
    let response = await sendRequest(prompt, true);

    await handleResponse(bot, movements, response, sendRequest, prompt);
    return
  } catch (error) {
    console.error('Błąd podczas wykopywania bloku:', error)
    const message = 'Wystąpił błąd podczas wykopywania bloku. Może nie mogę tego wydobyć nie mając odpowiedniego narzędzia?'
    let prompt = message;
    let response = await sendRequest(prompt, true);

    await handleResponse(bot, movements, response, sendRequest, prompt);
    bot.chat(message)
    return message
  }
}