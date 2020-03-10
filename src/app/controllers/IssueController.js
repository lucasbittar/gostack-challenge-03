import { format, parseISO } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import OrderIssue from '../models/OrderIssue';
import Recipient from '../models/Recipient';

import Mail from '../../lib/Mail';

class IssueController {
  async delete(req, res) {
    const { id } = req.params;
    const issue = await OrderIssue.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'product',
            'canceled_at',
            'deliveryman_id',
            'recipient_id',
          ],
        },
      ],
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue.order.canceled_at) {
      return res
        .status(401)
        .json({ error: 'This order has already been canceled' });
    }

    const recipient = await Recipient.findByPk(issue.order.recipient_id);
    const deliveryman = await Deliveryman.findByPk(issue.order.deliveryman_id);

    await issue.order.update({ canceled_at: new Date() });
    await issue.update({ canceled_at: new Date() });

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

    return res.json({
      message: `Order with ID ${issue.order.id} was successfully canceled`,
    });
  }
}

export default new IssueController();
