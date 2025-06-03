
import fs from 'fs';
import { sendRequest } from '../chat'; // Zakładam, że sendRequest jest w tym pliku
import { executeCommand } from '../commands/commandExecutor'; // Zakładam, że executeCommand jest w tym pliku
import { Bot } from 'mineflayer';
import { Movements } from 'mineflayer-pathfinder';
import { MemoryManager } from './memoryManager'; // Import klasy MemoryManager
import { guide_b, guide_d, gpt, set_gpt, set_guide } from './config';

function getPositionInfo(bot: Bot) {
  const botPosition = bot.entity.position;
  let positionInfo = `Bot is at (${botPosition.x.toFixed(2)}, ${botPosition.y.toFixed(2)}, ${botPosition.z.toFixed(2)}).`;

  // Gracze
  for (const [username, player] of Object.entries(bot.players)) {
    if (player.entity) {
      const playerPosition = player.entity.position;
      positionInfo += `Player ${username} is at (${playerPosition.x.toFixed(2)}, ${playerPosition.y.toFixed(2)}, ${playerPosition.z.toFixed(2)}).`;
    } else {
      positionInfo += `Player ${username} is not visible.`;
    }
  }
  return positionInfo;
}


// Funkcja do generowania promptu
export function generatePrompt(bot: Bot, username: string, message: string, movements: Movements, gpt: boolean, additionalPrompt: string, memory: any[], mobs: string, inventoryString: string) {
    const positionInfo = getPositionInfo(bot);
    let fullPrompt = '';
  
    if (!gpt) {
      const memoryContext = memory
        .map((entry) => `User: ${entry.question} Bot: ${entry.answer}`)
        .join('\n');
      fullPrompt = `${additionalPrompt}\n\n${positionInfo} mobs:${mobs} ekwipunek:${inventoryString} \n${memoryContext}\nUser: ${message}`;
    } else {
      fullPrompt = `${positionInfo} User: ${message} ekwipunek:${inventoryString}`;
    }
  
    console.log(`Generated Prompt:\n${fullPrompt}`);
    return fullPrompt;
  }
  
  // Funkcja do obsługi odpowiedzi
  export async function handleResponse(bot: Bot, movements: Movements, response: string, sendRequest: Function, fullPrompt: string) {
    const memoryManager = MemoryManager.getInstance();
  
    while (guide_b) {
      if (response.startsWith("done"))
      {
        set_guide(false,"");
        break;
      }
        await executeCommand(bot, movements, response);
  
  
        const items = bot.inventory.items();
        let inventoryString = items.length === 0
          ? 'empty'
          : items.map(item => `${item.displayName} (ilość: ${item.count})`).join(', ');
  
        fullPrompt = 'inventory: '+ inventoryString+` do next step in guide`+ 'your guide: '+guide_d;
  
        // Dodaj prompt do pamięci
        memoryManager.addToMemory('guide', 'do next step in guide', response);
  
        // Wyślij kolejne zapytanie do API
        response = await sendRequest(fullPrompt, true);
      
    }
  
    // Wykonaj ostatnie polecenie
    if (response) {
      await executeCommand(bot, movements, response);
  
      // Zapisz ostatnią odpowiedź do pamięci
      memoryManager.addToMemory('Bot', fullPrompt, response);
    }
  }
  