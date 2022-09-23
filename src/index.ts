import 'dotenv/config'
import client, {Connection, Channel, ConsumeMessage} from 'amqplib'
import SendMessageService from './services/SendMessageService'

const queue = 'mail_from_g2'

async function consumeFromQueue() {
    const host = process.env.RABBITMQ_HOST
    const user = process.env.RABBITMQ_USER
    const passsword = process.env.RABBITMQ_PASSWORD
    const connection: Connection = await client.connect(`amqp://${user}:${passsword}@${host}`)
    const channel: Channel = await connection.createChannel()
    await channel.assertQueue(queue)
    await channel.prefetch(1)
    await channel.consume(queue, async (message: ConsumeMessage | null) => {
        if (message) {
          const messageJson = JSON.parse(message.content.toString())
          console.log(`Consumer: received a new email \n ${messageJson.id}`)
            
          const result = await send(message.content.toString())
          await new Promise(resolve => setTimeout(resolve, 100))
          if (result) { 
            channel.ack(message)
            console.log('liberando mensagem \n\n')
          }
        }
    })
}

consumeFromQueue()

async function send(json: string): Promise<boolean> {
    const data = JSON.parse(json)
    const sendMessage = new SendMessageService();
    const result =  await sendMessage.run(data.fromName, data.from, data.to, data.subject, data.html)
    return result
}

console.log('started consumer')
