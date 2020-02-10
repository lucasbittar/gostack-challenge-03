import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import File from '../app/models/File';
import Recipient from '../app/models/Recipient';
import User from '../app/models/User';

/*
 * Always make sure to populate models array when another table is created
 */
const models = [File, Recipient, User];

class Database {
  constructor() {
    this.init();
  }

  init() {
    console.log('Initializing app...');
    /* Just making sure the database is properly connected */
    const connect = async () => {
      console.log(`Connecting to DB -> ${databaseConfig.database}...`);
      return (this.connection = new Sequelize(databaseConfig));
    };
    connect()
      .then(() => {
        console.log(`${databaseConfig.database} connected!`);
        models.map(model => model.init(this.connection));
      })
      .catch(e => {
        console.log('Something went wrong: ', e.message);
      });
  }
}

export default new Database();
