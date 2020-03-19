import { format } from 'date-fns';
import Mail from '../../lib/Mail';

class CanceledOrderMail {
  get key() {
    return 'CanceledOrderMail';
  }

  async handle({ data }) {
    const { deliveryman, issue, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `An order has been canceled!`,
      template: 'canceledOrder',
      context: {
        canceled_at: format(new Date(), "MMMM do 'at' h:mma"),
        deliveryman: deliveryman.name,
        product: issue.order.product,
        recipient_name: recipient.name,
      },
    });
  }
}

export default new CanceledOrderMail();
