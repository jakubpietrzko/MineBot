import { plugin as pvp } from "mineflayer-pvp";
import { createBot, Bot } from "mineflayer";
import { Console } from "console";

export async function attackEntityByName(bot: Bot, targetName: string, cnt: number=1) {
    // Sprawdź, czy cel jest graczem
    const targetPlayer = bot.players[targetName];
    if (targetPlayer) {
        const targetEntity = targetPlayer.entity;
        if (targetEntity) {
            // Ustaw wzrok bota na celu
            await bot.lookAt(targetEntity.position.offset(0, targetEntity.height, 0));
            // Rozpocznij atak na cel
            
            bot.pvp.attack(targetEntity);
            bot.chat(`Atakuję gracza ${targetName}`);
            return;
        }
    }
    const mobEntities = Object.values(bot.entities).filter(entity =>
        ["animal", "hostile", "ambient","water_creature",	"passive", "player"].includes(entity.type)
      );
      
      mobEntities.forEach(mob => {
        if (mob.name === targetName) {
            bot.lookAt(mob.position.offset(0, mob.height, 0));
            bot.pvp.attack(mob);
            cnt-=1;
            if(cnt<=0)
            {
                return;
            }
        }
      });
    
 


}
