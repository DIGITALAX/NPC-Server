import { ServerEngine, GameEngine, PhysicsEngine, GameWorld } from "lance-gg";
import * as http from "http";
import * as socketIo from "socket.io";
import RandomWalkerNPC from "./classes/RandomWalkerNPC.js";

class NPCStudioEngine extends ServerEngine {
  private io: socketIo.Server;
  private globalNPC!: RandomWalkerNPC;

  constructor(
    io: socketIo.Server,
    gameEngine: GameEngine<PhysicsEngine>,
    inputOptions: {}
  ) {
    super(io, gameEngine, inputOptions);
    this.io = io;
    if (!this.gameEngine?.world) {
      this.gameEngine.world = new GameWorld();
    }
  }

  async start() {
    if (!this.globalNPC) {
      this.globalNPC = new RandomWalkerNPC(0, 0, this.io, gameEngine);
      this.gameEngine.addObjectToWorld(this.globalNPC);
    }
    super.start();
  }
  onPlayerConnected(socket: socketIo.Socket) {
    super.onPlayerConnected(socket);
  }
}

const server = http.createServer();
const io = new socketIo.Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
    credentials: true
  },
});

const gameEngine = new GameEngine({ traceLevel: 0 });
const gameServer = new NPCStudioEngine(io, gameEngine, {
  updateRate: 6,
  stepRate: 60,
  fullSyncRate: 20,
  traceLevel: 0,
});

server.listen(3001, () => {
  gameServer.start();
});
