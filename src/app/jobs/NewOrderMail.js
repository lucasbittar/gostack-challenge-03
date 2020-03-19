import { format } from 'date-fns';
import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const { deliveryman, order, recipient } = data;

    let fullAddress = '';

    if (recipient.address_2) {
      fullAddress = `${recipient.address}, ${recipient.number} - ${recipient.address_2}`;
    } else {
      fullAddress = `${recipient.address}, ${recipient.number}`;
    }

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `There's a new order waiting for you!`,
      template: 'newOrder',
      context: {
        created_at: format(new Date(order.createdAt), "MMMM do 'at' hh:mma"),
        deliveryman: deliveryman.name,
        product: order.product,
        recipient_name: recipient.name,
        recipient_address: fullAddress,
        recipient_city: recipient.city,
        recipient_state: recipient.state,
        recipient_zip_code: recipient.zip_code,
      },
    });
  }
}

export default new NewOrderMail();
