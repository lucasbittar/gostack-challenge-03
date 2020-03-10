import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  /*
   * Create a single recipient
   * All fields are required except "address_2"
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      number: Yup.number().required(),
      address_2: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const recipient = await Recipient.create(req.body);
    const {
      id,
      name,
      address,
      number,
      address_2,
      city,
      state,
      zip_code,
    } = recipient;
    return res.json({
      id,
      name,
      address,
      number,
      address_2,
      city,
      state,
      zip_code,
    });
  }

  /*
   * Update a single recipient by ID
   * All fields are required except "address_2
   */
  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      number: Yup.number().required(),
      address_2: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    try {
      const updatedRecipient = await recipient.update(req.body);
      return res.json(updatedRecipient);
    } catch (err) {
      return res.status(400).json({ error: `Something went wrong - ${err}` });
    }
  }

  /*
   * Fetch all recipients from DB
   */
  async index(req, res) {
    const { page = 1, search } = req.query;
    const pageLimit = 10;

    const recipientsParams = {
      limit: pageLimit,
      order: [['id', 'DESC']],
      offset: (page - 1) * pageLimit,
    };

    if (search) {
      const foundrecipientsByQuery = await Recipient.findAndCountAll({
        ...recipientsParams,
        where: {
          name: {
            [Op.iRegexp]: `(${search}+)`,
          },
        },
      });
      return res.json(foundrecipientsByQuery);
    }

    const recipients = await Recipient.findAndCountAll(recipientsParams);
    return res.json(recipients);
    // return res.json(await Recipient.findAndCountAll());
  }

  /*
   * Fetch a specific recipient from DB
   */
  async show(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id, {
      attributes: [
        'name',
        'address',
        'number',
        'address_2',
        'city',
        'state',
        'zip_code',
      ],
    });
    if (!recipient) {
      return res.status(401).json({ error: 'Recipient not found.' });
    }

    return res.json(recipient);
  }

  /*
   * Delete a specific recipient from DB
   */
  async delete(req, res) {
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    await recipient.destroy();

    return res.json({
      message: `Recipient with ID ${id} was sucessfully removed`,
    });
  }
}

export default new RecipientController();
