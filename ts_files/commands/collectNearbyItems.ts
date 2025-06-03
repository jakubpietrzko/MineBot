import { Bot } from 'mineflayer';
import { pathfinder, Movements, goals } from "mineflayer-pathfinder";
export async function collectNearbyItems(bot: Bot) {
    const items = Object.values(bot.entities).filter(
        (entity) => entity.name === "item"
    );
    for (const item of items) {
        bot.pathfinder.setGoal(
            new goals.GoalBlock(item.position.x, item.position.y, item.position.z)
        );
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Poczekaj chwilę, by zebrać
    }
    bot.chat("Zebrałem przedmioty w pobliżu.");
}