export default class GameTimer {
  ticks: number;
  tasks: { executeOnTick: number; callback: () => void }[];
  constructor() {
    this.ticks = 0;
    this.tasks = [];
  }

  tick() {
    this.ticks++;
    this.updateTasks();
  }

  setTimeout(callback: () => void, delayMs: number) {
    const delayTicks = Math.ceil(delayMs / this.getTickDuration());
    const executeOnTick = this.ticks + delayTicks;
    this.tasks.push({ executeOnTick, callback });
  }

 private updateTasks() {
    const readyTasks = this.tasks.filter(
      (task) => task.executeOnTick <= this.ticks
    );
    readyTasks.forEach((task) => task.callback());
    this.tasks = this.tasks.filter((task) => task.executeOnTick > this.ticks);
  }

  private getTickDuration() {
    return 16.67;
  }
}
