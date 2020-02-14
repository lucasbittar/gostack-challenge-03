import * as Yup from 'yup';
import { format, parseISO } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

import Mail from '../../lib/Mail';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll({
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'address',
            'number',
            'address_2',
            'city',
            'state',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const recipient = await Recipient.findByPk(req.body.recipient_id);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient not found.' });
    }

    const deliveryman = await Deliveryman.findByPk(req.body.deliveryman_id);

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found.' });
    }

    const order = await Order.create(req.body);

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `There's a new order waiting for you!`,
      template: 'newOrder',
      context: {
        created_at: format(order.createdAt, "MMMM do 'at' hh:mma"),
        deliveryman: deliveryman.name,
        product: order.product,
        recipient_name: recipient.name,
        recipient_address: `${recipient.address}, ${recipient.number}${
          recipient.address_2 ? ` – ${recipient.address_2}` : null
        }`,
        recipient_city: recipient.city,
        recipient_state: recipient.state,
        recipient_zip_code: recipient.zip_code,
      },
    });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(401).json({ error: 'Order not found.' });
    }

    if (order.canceled_at) {
      return res
        .status(401)
        .json({ error: `Order canceled at - ${order.canceled_at}.` });
    }

    const { deliveryman_id, recipient_id, start_date } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient not found.' });
    }

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found.' });
    }

    const { product, canceled_at } = await order.update(req.body);

    return res.json({ product, canceled_at });
  }

  async delete(req, res) {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.destroy();

    return res.json({
      message: `Order with ID ${id} was sucessfully removed`,
    });
  }
}

export default new OrderController();
