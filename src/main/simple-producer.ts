import { Rabbit, RabbitListener } from "../infra";
import { Channel } from "amqplib";

export class SimpleProducer implements RabbitListener {
  private _channel?: Channel;
  private _rabbit?: Rabbit;

  constructor(rabbit: Rabbit, private readonly exchange: string) {
    rabbit.register(this);
  }

  private async getChannel(): Promise<Channel> {
    if (!this._channel) {
      this._channel = await this._rabbit?.createChannel();
    }
    return this._channel!;
  }

  async onConnect(rabbit: Rabbit): Promise<void> {
    console.log("[SimpleProducer] onConnect");
    this._rabbit = rabbit;
  }

  async produce(message: string, routingKey = ""): Promise<boolean> {
    const channel = await this.getChannel();
    console.log(`[SimpleProducer] produce ${message}`);
    return channel.publish(this.exchange, routingKey, Buffer.from(message));
  }
}
