# Build-an-Asset 🎩⛄🔒

Welcome to the Build-an-Asset project! This is your go-to spot for building custom snowmen and customizing lockers in the virtual world. Developed with Node.js and React, this project lets you create, customize, and place your very own snowman or locker within the game.

Currently, we are using this project to build Snowmen and customize Lockers!

## Features 🌟

### In-world Interactivity

- **Clickable Assets**: Look for the "Build-a-Snowman" or "Customize-a-Locker" signs in the world. One click and you're in the workshop.
- **iFrame Integration**: A seamless iFrame pops up to give you the ultimate building or customizing experience.

### Build Your Snowman 🛠

- **Customizable**: Pick a hat, choose a scarf, and decide on the arm style.
- **Real-Time Preview**: As you make selections, watch your snowman come to life.

### Customize Your Locker 🔒

- **Individual Configuration**: Each locker can be customized individually. Access the customization via a unique URL pattern.
- **Dynamic States**: Lockers have two states: Claimed and Unclaimed. Customize and see your changes reflected in the world.

### Drop Your Asset in the World ⛄🔒

- **Instant Placement**: Hit "Add Snowman" or "Save Locker", and voilà, your creation is part of the world.
- **Admin Panel**: For game admins, manage all assets and gather analytics.

## Tech Stack 🛠️

- **Backend**: Node.js
- **Frontend**: React
- **Storage**: Snowmen images are stored in an S3 bucket.

## Getting Started 🚀

### Production Mode

1. Install dependencies

   ```
   npm install
   ```

2. Start the server
   ```
   npm start
   ```

### Development Mode

1. Start Server

   ```
   npm start
   ```

2. Start Client

   ```
   cd client && npm start
   ```

3. Visit `http://localhost:3001/snowman` and start building your snowman!

4. Visit `http://localhost:3001/locker` and start customizing your locker!
