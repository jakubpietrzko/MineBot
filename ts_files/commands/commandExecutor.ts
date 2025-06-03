import { Bot } from 'mineflayer';
import { Movements } from 'mineflayer-pathfinder';
import { goToPosition } from './goToPosition';
import { attackEntityByName } from './attackNearestEntity';
import { mineBlocks } from './mineBlock';
import { collectNearbyItems } from './collectNearbyItems';
import { craftRecipe } from './altcraft';
import { smeltItem } from './smelt';
import { sleep } from '../../utils/sleep';
import { sleepInBed } from './gotosleep';
import { placeBlock } from './placeblock';
import { handleResponse } from '../plugins/handling_prompt'
import { sendRequest } from '../chat';
export async function executeCommand(bot: Bot, movements: Movements, message: string) {
  const args = message.split(' ');
  console.log(args);
  switch (args[0].toLowerCase()) {
    case 'goto':
      if (args.length === 4) {
        const x = parseFloat(args[1]);
        const y = parseFloat(args[2]);
        const z = parseFloat(args[3]);
        await goToPosition(bot, movements, x, y, z);
      } else {
        bot.chat('Użycie: goto <x> <y> <z>');
      }
      break;
    case 'attack':
      const goal = args[1];
      const cnt = parseInt(args[2], 10);
      await attackEntityByName(bot, goal, cnt);
      break;
    case 'sleep':
      await sleepInBed(bot);
      break;
    case 'craft':
      const item = args[1];
      const quantity = parseInt(args[2], 10);
      await craftRecipe(bot, item, quantity, movements);
      break;
    case 'smelt':
      if (args.length === 3) {
        const itemName = args[1];
        const quantity = parseInt(args[2], 10);
        await smeltItem(bot, itemName, quantity, movements);
      } else {
        bot.chat('ai podało złe argumetny do komendy smelt');
        await sendRequest('podales złe argumetny do komendy smelt, mialy byc item_name i liczba ', true);
        await handleResponse(bot, movements, 'podales złe argumetny do komendy smelt, mialy byc item_name i liczba' , sendRequest, 'podales złe argumetny do komendy smelt, mialy byc item_name i liczba' );
        
      }
      break;
    case 'mine':
      if (args.length === 3) {
        const blockName = args[1];
        const quantity = parseInt(args[2], 10);
        await mineBlocks(bot, blockName, quantity,movements);
      } else {
        bot.chat('ai podało złe argumetny do komendy mine');
        await sendRequest('podałes złe argumetny do komendy mine, mialy byc item_name i liczba', true);
        await handleResponse(bot, movements, 'podałes złe argumetny do komendy mine, mialy byc item_name i liczba', sendRequest, 'podałes złe argumetny do komendy mine, mialy byc item_name i liczba');
      }
      break;
    case 'collect':
      await collectNearbyItems(bot);
      break;
    case 'place': 
      await placeBlock(bot, args[1]);
      break;
    default:
      bot.chat(args.join(' '));
      break;
  }
}
