import { format } from 'date-fns';
import Mail from '../../lib/Mail';

class NewDeliverymanMail {
  get key() {
    return 'NewDeliverymanMail';
  }

  async handle({ data }) {
    const { deliveryman } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `Welcome to FastFeet!`,
      template: 'newDeliveryman',
      context: {
        created_at: format(new Date(), "MMMM do 'at' h:mma"),
        deliveryman: deliveryman.name,
        deliveryman_id: deliveryman.id,
      },
    });
  }
}

export default new NewDeliverymanMail();
