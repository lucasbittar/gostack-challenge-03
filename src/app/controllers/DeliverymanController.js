import * as Yup from 'yup';
import { Op } from 'sequelize';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import NewDeliverymanMail from '../jobs/NewDeliverymanMail';
import Queue from '../../lib/Queue';

class DeliverymanController {
  async index(req, res) {
    const { page = 1, q } = req.query;
    const pageLimit = 10;

    const deliverymenParams = {
      limit: pageLimit,
      order: [['id', 'DESC']],
      offset: (page - 1) * pageLimit,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    };

    if (q) {
      const foundDeliverymenByQuery = await Deliveryman.findAndCountAll({
        ...deliverymenParams,
        where: {
          name: {
            [Op.iRegexp]: `(${q}+)`,
          },
        },
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });
      return res.json(foundDeliverymenByQuery);
    }

    const deliverymen = await Deliveryman.findAndCountAll(deliverymenParams);
    return res.json(deliverymen);
  }

  async show(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id, {
      attributes: ['name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found.' });
    }

    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }
    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const { id, name, email, avatar_id } = await Deliveryman.create(req.body);

    const deliveryman = { id, name, email };

    await Queue.add(NewDeliverymanMail.key, {
      deliveryman,
    });

    return res.json({ id, name, email, avatar_id });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { email } = req.body;
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({ where: { email } });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman already exists' });
      }
    }

    const { name, avatar_id } = await deliveryman.update(req.body);
    return res.json({ id, name, email, avatar_id });
  }

  async delete(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }
    await deliveryman.destroy();

    return res.json({
      message: `Deliveryman with ID ${id} was sucessfully removed`,
    });
  }
}

export default new DeliverymanController();
