import { connect, Connection, Channel } from "amqplib";

export class Rabbit {
  private _listeners: RabbitListener[] = [];
  private _connection?: Connection;
  private _uri: string;

  constructor(uri: string) {
    this._uri = uri;
  }

  register(listener: RabbitListener) {
    this._listeners.push(listener);
  }

  async createChannel(): Promise<Channel | undefined> {
    return this._connection?.createChannel();
  }

  async connect() {
    try {
      console.log(`[Rabbit] trying connection Rabbit ${this._uri}`);
      this._connection = await connect(this._uri);
      console.log(`Rabbit] connected Rabbit ${this._uri}`);
      const channel = await this._connection.createChannel();
      await channel.assertExchange("principal", "direct", { durable: true });
      await channel.assertQueue("principal.work");
      await channel.assertQueue("principal.retry", {
        durable: true,
        deadLetterExchange: "principal",
        deadLetterRoutingKey: "",
        messageTtl: 5000,
      });
      await channel.bindQueue("principal.work", "principal", "");
      await channel.bindQueue("principal.retry", "principal", "retry");
      channel.close();

      this._connection.on("close", () => this.connect());
      this._listeners.forEach(async (listener) => listener.onConnect(this));
    } catch (error) {
      console.error(`[Rabbit] error connection Rabbit ${this._uri}`);
      setTimeout(() => this.connect(), 5000);
    }
  }
}

export interface RabbitListener {
  onConnect(rabbit: Rabbit): void;
}
