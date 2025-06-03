
export class MemoryManager {
    private static instance: MemoryManager;
    private memory: { sender: string; question: string; answer: string }[] = [];
    private maxMemorySize = 4;
  
    private constructor() {}
  
    public static getInstance(): MemoryManager {
      if (!MemoryManager.instance) {
        MemoryManager.instance = new MemoryManager();
      }
      return MemoryManager.instance;
    }
  
    public addToMemory(sender: string, question: string, answer: string) {
      this.memory.push({ sender, question, answer });
      if (this.memory.length > this.maxMemorySize) {
        this.memory.shift();
      }
    }
  
    public getMemory() {
      return this.memory;
    }
  }
  
  export default MemoryManager;
  