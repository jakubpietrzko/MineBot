
import { Movements } from 'mineflayer-pathfinder';
import { Bot } from 'mineflayer';
import { goToPosition } from './goToPosition';
import { Vec3 } from 'vec3';
export async function findAndLookAtBlock(
    bot: Bot,
    movements: Movements,
    blockName: string
  ): Promise<Vec3 | null> {
    const block = bot.findBlock({
      matching: bot.registry.blocksByName[blockName].id,
      maxDistance: 32,
    });
  
    if (block) {
      goToPosition(bot, movements, block.position.x, block.position.y, block.position.z);
      await bot.lookAt(block.position.offset(0.5, 0.5, 0.5));
      return block.position;
    } else {
      return null;
    }
  }
  