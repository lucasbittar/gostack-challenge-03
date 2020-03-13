import * as Yup from 'yup';
import { Op } from 'sequelize';
import { format, parseISO } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

class DeliverymanOrdersController {
  async show(req, res) {
    const { deliveryman_id } = req.params;

    const deliveryman = await Deliveryman.findOne({
      where: {
        id: deliveryman_id,
      },
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Invalid deliveryman_id' });
    }

    const { page = 1, status } = req.query;
    const pageLimit = 10;
    const filter = {
      where: {
        deliveryman_id,
        canceled_at: null,
      },
    };

    if (status === 'pending') {
      filter.where = {
        ...filter.where,
        end_date: null,
      };
    }

    if (status === 'delivered') {
      filter.where = {
        ...filter.where,
        end_date: {
          [Op.not]: null,
        },
      };
    }

    const ordersParams = {
      limit: pageLimit,
      order: [['start_date', 'ASC']],
      offset: (page - 1) * pageLimit,
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
    };

    const orders = await Order.findAndCountAll({
      ...ordersParams,
      ...filter,
    });
    return res.json(orders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { deliveryman_id, order_id } = req.params;
    const { start_date, end_date, signature_id } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    const order = await Order.findOne({ where: { id: order_id } });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Invalid deliveryman_id' });
    }

    if (!order) {
      return res.status(400).json({ error: 'Invalid order_id' });
    }

    /*
     * Verifications when end_date is passed in
     */
    if (end_date) {
      /* Check if order has already been picked ended */
      const alreadyEnded = order.end_date;
      if (alreadyEnded) {
        return res.status(401).json({
          error:
            'Order has already been ended. You can no longer update its end date',
        });
      }

      /*
       * Quick check for signature when closing an order
       */
      const hasSignature = signature_id;
      if (!hasSignature) {
        return res
          .status(401)
          .json({ error: 'Signature is required on closing orders' });
      }
    }

    /*
     * Verifications when start_date is passed in
     */
    if (start_date) {
      /* Check if order has already been picked up */
      const alreadyPickedUp = order.start_date;
      if (alreadyPickedUp) {
        return res.status(401).json({
          error:
            'Order has already been picked up. You can no longer update its start date',
        });
      }

      /*
       * Pickups only between 8am and 6pm
       * We can also use the same statement to say the day hasn't started yet
       * meaning we can reset the num_pickup as well
       */
      const startDateTime = format(parseISO(start_date), 'H');

      if (startDateTime > 18 || startDateTime < 8) {
        /* Reset pickup counter */
        await deliveryman.update({ num_pickup: 0 });

        return res
          .status(401)
          .json({ error: 'You can only pickup an order between 8am and 6pm' });
      }

      /*
       * Max of 5 pickups per day
       */
      const pickupCounter = deliveryman.num_pickup;

      if (pickupCounter >= 5) {
        return res
          .status(400)
          .json({ error: 'Number of pickups exceeded (5 per day)' });
      }

      /*
       * Increments number of pickups
       */
      await deliveryman.increment('num_pickup');
    }

    await order.update(req.body);

    return res.json(order);
  }
}

export default new DeliverymanOrdersController();
