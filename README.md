<h1 align="center">
  <img alt="Fastfeet" title="Fastfeet" src="https://github.com/Rocketseat/bootcamp-gostack-desafio-02/raw/master/.github/logo.png" width="300px" />
</h1>

<h3 align="center">
  GoStack Challenge 02: FastFeet - Inital Development
</h3>

### Challenge

Create the first step for fake logistics company app called FastFeet with the following goals:

- User authentication using JWT
- Create a single user with admin capabilities to add/edit recipients
- Recipients management

### Instructions ###
```
yarn install && yarn dev
```
Once yarn is running, all of the requests should point to: http://localhost:33333/.

### Description ###
First step for the development of a fake logistics company app called FastFeet.

Tools and technologies used on this project:

- Javascript ES6
- Node.JS
- Express
- Sucrase + Nodemon
- Sequelize
- PostgreSQL

### Routes ###
#### Sessions ####
| Method | Path | Params | Body | Description |
| ------ | ------ | ------ | ------ | ------ |
| POST | /sessions | - | { email: String, password: String } | Create a session token |

#### Users ####
| Method | Path | Params | Body | Description |
| ------ | ------ | ------ | ------ | ------ |
| POST | /users | - | { name: String, email: String, password: String } | Create a user |
| PUT | /users/:id | id | { name: String, email: String, password: String } | Edit a user |

#### Recipients ####
| Method | Path | Params | Body | Description |
| ------ | ------ | ------ | ------ | ------ |
| POST | /recipients | - | [recipient_object] | Create a recipient |
| GET | /recipients | - | - | Fetch recipients |
| PUT | /recipients/:id | id | [recipient_object] | Edit recipient |

```json
  recipient_object = {
    "name": String,
    "address": String,
    "number": Number,
    "address_2": String,
    "city": String,
    "state": String,
    "zip_code": String
  }
```

### Tips ###
I highly recommend using [Insomnia](https://insomnia.rest/) app to play around with the requests in a simple and straight-forward UI.

Thanks for checking this project out! Cheers!

