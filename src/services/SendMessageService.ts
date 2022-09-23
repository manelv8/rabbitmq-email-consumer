import SES from 'aws-sdk/clients/ses'

class SendMessageService {
  private client: SES

  constructor() {
    this.client = new SES({
      region: 'us-east-1'
    })
  }

  async run(fromName: string, fromAddress: string, toAddress: string, subject: string, html: string ): Promise<boolean> {
    const result = await this.client
    .sendEmail({
      Source: `${fromName} <${fromAddress}>`,
      Destination: {
        ToAddresses: [toAddress]
      },
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html
          }
        }
      }
    }).promise().then(
        (data) => {
          console.log(data);
          return true
      }).catch(
        (err) => {
          console.error(err, err.stack);
          return false
      })
      return result
      }
}

export default SendMessageService