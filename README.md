# Wayfarer

A NodeJS Web Application for sharing, rating and reviewing tourist destinations. Backend- Node,Express

## Live Demo

To see the app in action, go to [https://limitless-spire-25440.herokuapp.com/](https://limitless-spire-25440.herokuapp.com/)

## Features

- Authentication:

  - User login with username and password

  - Admin sign-up with admin code

- Authorization:

  - One cannot manage posts and view user profile without being authenticated

  - One cannot edit or delete posts and comments created by other users

  - Admin can manage all posts and comments

- Manage campground posts with basic functionalities:

  - Create, edit and delete posts and comments

  - Upload photos

  - Search existing campgrounds(in development)

- Manage user account with basic functionalities.

- Flash messages responding to users' interaction with the app

- Responsive web design

### Custom Enhancements

- Improve image load time on the landing page using Cloudinary

## Getting Started

> This app contains API secrets and passwords that have been hidden deliberately, so the app cannot be run with its features on your local machine. However, feel free to clone this repository if necessary.

### Clone or download this repository

```sh
git clone https://github.com/rheasharma13/Wayfarer.git
```

### Install dependencies

```sh
npm install
```

or

```sh
yarn install
```

## Built with

### Front-end

- [ejs](http://ejs.co/)
- [Bootstrap](https://getbootstrap.com/docs/3.3/)

### Back-end

- [express](https://expressjs.com/)
- [mongoDB](https://www.mongodb.com/)
- [mongoose](http://mongoosejs.com/)
- [async](http://caolan.github.io/async/)
- [passport](http://www.passportjs.org/)
- [passport-local](https://github.com/jaredhanson/passport-local#passport-local)
- [express-session](https://github.com/expressjs/session#express-session)
- [method-override](https://github.com/expressjs/method-override#method-override)
- [nodemailer](https://nodemailer.com/about/)
- [moment](https://momentjs.com/)
- [cloudinary](https://cloudinary.com/)
- [connect-flash](https://github.com/jaredhanson/connect-flash#connect-flash)

### Platforms

- [Cloudinary](https://cloudinary.com/)
- [Heroku](https://www.heroku.com/)

## Getting Started with Full Stack Web Development

- Learn HTML,CSS and Javascript on [MDN](https://developer.mozilla.org/en-US/docs/Web)
- Learn NodeJS at [NodeJS](https://nodejs.org/en/docs/)
