
import fs from 'fs';
import { sendRequest } from '../chat';
import { executeCommand } from '../commands/commandExecutor';
import { Bot } from 'mineflayer';
import { Movements } from 'mineflayer-pathfinder';
import { scanArea } from '../commands/scan';
import { generatePrompt, handleResponse } from './handling_prompt';
import { MemoryManager } from './memoryManager'; // Import klasy MemoryManager
import {gpt, set_gpt} from './config'
import { has_guide } from './guides';
import { rebuildStructure } from '../commands/build';
import { analyzeScannedBlocks } from './block_summary'
export function registerChatCommands(bot: Bot, movements: Movements) {
  const additionalPrompt = fs.readFileSync('prompt.txt', 'utf8');
  const memoryManager = MemoryManager.getInstance(); // Globalny MemoryManager z limitem 10 elementów

  bot.on('chat', async (username: string, message: string) => {
    if (username === bot.username) return;
    if(message.includes('/')) return;
    if(!message.endsWith('build'))
      {
    await scanArea(bot, { x: 100, y: 80, z: 100 }, 0, './scanned_blocks.json');
    const blockSummary = analyzeScannedBlocks('./scanned_blocks.json').sort((a, b) => b.count - a.count);
    console.log(blockSummary);
 
  }
    if(message.endsWith('build'))
    {
        
        await rebuildStructure(bot, movements,'./scanned_blocks.json');
    }
    if (!message.trim().toLowerCase().endsWith('!')) return;

    if (message.trim().toLowerCase().endsWith('change llm!')) {
      set_gpt(!gpt);
      bot.chat("Switching LLM model...");
      return;
    }

    const mobEntities = Object.values(bot.entities).filter(entity =>
      ["animal", "hostile", "ambient", "water_creature", "passive", "player"].includes(entity.type)
    );
    let mobs = mobEntities.map(mob => `Mob: ${mob.name}, Typ: ${mob.type}, Pozycja: ${mob.position}`).join(' ');

    const items = bot.inventory.items();
    let inventoryString = items.length === 0
      ? 'empty'
      : items.map(item => `${item.displayName} (ilość: ${item.count})`).join(', ');

    const fullPrompt = generatePrompt(bot, username, message, movements, gpt, additionalPrompt, memoryManager.getMemory(), mobs, inventoryString);
    await has_guide(bot, message, movements);
    let response = await sendRequest(fullPrompt, gpt);
    if(!gpt)
    {
      if(response.startsWith("think"))
      {
        response = await sendRequest(fullPrompt, !gpt);
      }
    }
    console.log(`LLM response: ${response}`);

    memoryManager.addToMemory(username, message, response); // Dodanie do globalnej pamięci

    await handleResponse(bot, movements, response, sendRequest, fullPrompt);
  });
}
