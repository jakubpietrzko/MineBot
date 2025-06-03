import { createBot, Bot } from "mineflayer";
import { pathfinder, Movements } from "mineflayer-pathfinder";
import mcDataLoader from "minecraft-data";
import { loadPlugins } from "./plugins";
import * as prismarineViewer from "prismarine-viewer";
import { defendSelf } from "./commands/def";
const bot = createBot({
	host: "your.own.server", // Zastąp adresem swojego serwera
	port: 12345, // Zastąp portem swojego serwera
	username: "Bot1",
	version: "1.20.1",
});

const mcData = mcDataLoader(bot.version);
const movements = new Movements(bot);

loadPlugins(bot, movements);
let first = true;
bot.once("spawn", () => {
	if (first) {
		prismarineViewer.mineflayer(bot, { port: 3200, firstPerson: true });
		first = false;
	}
	console.log(`${bot.username} dołączył do serwera`);
	bot.chat("Cześć! Jestem botem Minecrafta!");

	//obrona
	setInterval(() => {
		// Pobierz wszystkie encje w pobliżu bota
		const entities = bot.entities;

		// Iteruj po wszystkich encjach
		for (const entityId in entities) {
			const entity = entities[entityId];

			// Sprawdzamy, czy to jest mob lub wrogi mob
			if (entity.type === "mob" || entity.type === "hostile") {
				// Obliczamy odległość między botem a encją
				const distance = bot.entity.position.distanceTo(entity.position);

				// Sprawdzamy, czy odległość jest mniejsza niż 10 bloków
				const maxDistance = 5;
				if (distance < maxDistance) {
					bot.chat(
						`Wrogi mob znajduje się w odległości mniejszej niż ${maxDistance} bloków!`
					);
					// Możesz wywołać funkcję obrony lub wykonać inne akcje
					defendSelf(bot);
				}
			}
		}
	}, 1000);
});

bot.on("error", (err: Error) => {
	console.log(`Błąd: ${err.message}`);
});
