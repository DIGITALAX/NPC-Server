export default class GameTimer {
  private ticks: number;
  timeAccumulated: number; 
  private tasks: { executeOnMs: number; callback: () => void }[];

  constructor() {
    this.ticks = 0;
    this.timeAccumulated = 0;
    this.tasks = [];
  }

  tick(deltaTime: number) {
    this.ticks++;
    this.timeAccumulated += deltaTime;
    this.updateTasks();
  }

  setTimeout(callback: () => void, delayMs: number) {
    const executeOnMs = this.timeAccumulated + delayMs;
    this.tasks.push({ executeOnMs, callback });
  }

  private updateTasks() {
    const readyTasks = this.tasks.filter(
      (task) => task.executeOnMs <= this.timeAccumulated
    );
    readyTasks.forEach((task) => task.callback());
    this.tasks = this.tasks.filter(
      (task) => task.executeOnMs > this.timeAccumulated
    );
  }
}
