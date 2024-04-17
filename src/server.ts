import { ServerEngine, GameEngine, PhysicsEngine } from "lance-gg";
import * as http from "http";
import * as socketIo from "socket.io";
import RandomWalkerNPC from "./classes/RandomWalkerNPC";

class NPCStudioEngine extends ServerEngine {
  private io: socketIo.Server;
  private globalNPC: RandomWalkerNPC;

  constructor(
    io: socketIo.Server,
    gameEngine: GameEngine<PhysicsEngine>,
    inputOptions: {}
  ) {
    super(io, gameEngine, inputOptions);
    this.io = io;
    this.globalNPC = new RandomWalkerNPC(0, 0, this.io);
    this.gameEngine.addObjectToWorld(this.globalNPC);
  }

  start() {
    super.start();
  }
}

const server = http.createServer();
const io = new socketIo.Server(server);
const gameEngine = new GameEngine({ traceLevel: 0 });
const gameServer = new NPCStudioEngine(io, gameEngine, {
  updateRate: 6,
  stepRate: 60,
  fullSyncRate: 20,
  traceLevel: 0,
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
  gameServer.start();
});
