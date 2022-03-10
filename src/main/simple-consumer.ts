import { Rabbit, RabbitListener } from "../infra";
import { Channel, ConsumeMessage } from "amqplib";

export class SimpleConsumer implements RabbitListener {
  private _channel?: Channel;
  private _rabbit: Rabbit;

  constructor(rabbit: Rabbit, private readonly queue: string) {
    rabbit.register(this);
    this._rabbit = rabbit;
  }

  async onConnect(rabbit: Rabbit): Promise<void> {
    console.log("[SimpleConsumer] onConnect");
    this._rabbit = rabbit;
  }

  private async getChannel(): Promise<Channel> {
    if (!this._channel) {
      this._channel = await this._rabbit?.createChannel();
      this._channel?.prefetch(10);
      this._channel?.consume(this.queue, (msg) => this.onMessage(msg), {
        noAck: false,
      });
    }
    return this._channel!;
  }
  async init() {
    await this.getChannel();
  }

  onMessage(message: ConsumeMessage | null): void {
    if (!message) return;
    console.log(`[SimpleConsumer ] onMessage ${message.content.toString()}`);
    setTimeout(() => {
      this._channel?.ack(message, false);
    }, 0);
  }
}
