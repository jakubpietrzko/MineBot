import { Bot } from 'mineflayer';
import { Movements, goals } from 'mineflayer-pathfinder';

export function goToPosition(bot: Bot, movements: Movements, x: number, y: number, z: number) {
  bot.pathfinder.setMovements(movements);
  const goal = new goals.GoalBlock(x, y, z);
  bot.pathfinder.setGoal(goal);
  //bot.chat(`Idę na współrzędne: (${x}, ${y}, ${z})`);
}
