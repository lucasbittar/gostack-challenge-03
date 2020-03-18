import * as Yup from 'yup';
import { Op } from 'sequelize';
import { format, parseISO } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Order from '../models/Order';
import OrderIssue from '../models/OrderIssue';
import Recipient from '../models/Recipient';

import Mail from '../../lib/Mail';

class OrderController {
  async index(req, res) {
    const { page = 1, q, withIssues } = req.query;
    const pageLimit = 10;

    const ordersParams = {
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      limit: pageLimit,
      order: [['id', 'DESC']],
      offset: (page - 1) * pageLimit,
      include: [
        {
          model: OrderIssue,
          as: 'issues',
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'address',
            'number',
            'address_2',
            'zip_code',
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
    };

    if (q) {
      const foundOrdersByQuery = await Order.findAndCountAll({
        ...ordersParams,
        where: {
          product: {
            [Op.iRegexp]: `(${q}+)`,
          },
        },
      });
      return res.json(foundOrdersByQuery);
    }

    if (withIssues) {
      const ordersWithIssues = await Order.findAndCountAll({
        ...ordersParams,
        include: [
          {
            model: File,
            as: 'signature',
            attributes: ['id', 'path', 'url'],
          },
          {
            model: Recipient,
            as: 'recipient',
            attributes: [
              'name',
              'address',
              'number',
              'address_2',
              'zip_code',
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
          {
            model: OrderIssue,
            as: 'issues',
            where: {
              id: {
                [Op.not]: null,
              },
            },
          },
        ],
      });
      return res.json(ordersWithIssues);
    }

    const orders = await Order.findAndCountAll(ordersParams);
    return res.json(orders);
  }

  async show(req, res) {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
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
            'zip_code',
          ],
        },
      ],
    });

    if (!order) {
      return res.status(401).json({ error: 'Order not found.' });
    }

    return res.json(order);
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
