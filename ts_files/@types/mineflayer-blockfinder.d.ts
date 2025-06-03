declare module 'mineflayer-blockfinder' {
  import { Bot } from 'mineflayer';

  function blockFinderPlugin(bot: Bot): void;

  export = blockFinderPlugin;
}