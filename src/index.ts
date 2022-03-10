import { Rabbit } from "./infra";
import { SimpleConsumer } from "./main/simple-consumer";
import { SimpleProducer } from "./main/simple-producer";

const main = async () => {
  const rabbit = new Rabbit("amqp://admin:admin@rabbitmq:5672");
  const producer = new SimpleProducer(rabbit, "principal");
  await rabbit.connect();
  console.time("msg");
  console.log(`[Main] carregando mensagens`);
  for (let index = 0; index < 100000; index++) {
    const message = JSON.stringify({
      name: `Thiago ${index + 1}`,
      lastName: `Turim ${index + 1}`,
    });
    await producer.produce(message);
    await producer.produce(message, "retry");
  }
  console.log(`[Main] finalizou mensagens`);
  console.timeEnd("msg");
  const consumer = new SimpleConsumer(rabbit, "principal.work");
  setTimeout(() => {
    consumer.init();
  }, 3000);

  /*  setTimeout(() => {
    consumer2.init();
  }, 3000);*/
};
main();
