import 'dotenv/config'
import client, {Connection, Channel, ConsumeMessage} from 'amqplib'
import SendMessageService from './services/SendMessageService'
import axios from 'axios'

const queue = 'mail_from_g2'

async function consumeFromQueue() {
    const host = process.env.RABBITMQ_HOST
    const user = process.env.RABBITMQ_USER
    const passsword = process.env.RABBITMQ_PASSWORD
    const vhost = process.env.RABBITMQ_VHOST
    const connection: Connection = await client.connect(`amqp://${user}:${passsword}@${host}/${vhost}`)
    const channel: Channel = await connection.createChannel()
    await channel.assertQueue(queue)
    await channel.prefetch(1)
    await channel.consume(queue, async (message: ConsumeMessage | null) => {
        if (message) {
          const messageJson = JSON.parse(message.content.toString())
          console.log(`Consumer: received a new email \n ${messageJson.id}`)
            
          const result = await send(message.content.toString())
          await new Promise(resolve => setTimeout(resolve, 1000))
          channel.ack(message)
          console.log('liberando mensagem \n\n')
        }
    })
}

consumeFromQueue()

async function send(json: string): Promise<boolean> {
    const data = JSON.parse(json)
     await new Promise(resolve => setTimeout(resolve, 3000))
    const sendMessage = new SendMessageService();
    const result =  await sendMessage.run(data.fromName, data.from, data.to, data.subject, data.html)

    await updateEmailStatus(data.id, result.status, result.data )
    
    return result.status
}

async function updateEmailStatus(emailId: number, isSuccess: boolean, returnResponse: string): Promise<void> {
  try {
    const baseUrl = process.env.G2_BASE_URL
    console.log('start update status')
    const url = `http://${baseUrl}/pub/email/updateEmailStatus/${emailId}`
      const config = {
        headers: {
          g2authorization:  process.env.G2_AUTHORIZATION
        }
      }
    const data = {
      emailStatus: isSuccess ? 'success' : 'error',
      returnResponse: returnResponse
     }
    const res = await axios.put(url, data, config)
    console.log('data updated', res.data) 
  } catch (error) {
    console.log(error.message)
  } 
}

console.log('started consumer email')
