# Build-an-Asset 🎩⛄🔒

## Introduction / Summary

Welcome to Build-an-Asset, your virtual playground for crafting unique snowmen and customizing lockers in a vibrant digital world. Leveraging Node.js and React, this project offers an immersive experience, allowing users to express their creativity and interact within a shared space. Dive into a world where your custom snowmen and lockers add a personal touch to the digital landscape.

## Key Features

- **In-World Interactivity**: Engage with clickable assets to start your creation process through a seamless iFrame integration (drawer).
- **Snowman Customization**: Choose from various hats, scarves, and arm styles to design your snowman with a real-time preview feature.
- **Locker Customization**: Personalize lockers with individual configurations and dynamic states (Claimed/Unclaimed), accessible via unique URLs.

## Canvas Elements & Interactions

Users can interact with "Build-a-Snowman" or "Customize-a-Locker" signs within the game world, triggering an iFrame that guides them through the customization process.

## Drawer Content

The drawer presents customization options, allowing for the creation and personalization of assets which are then instantaneously placed in the world.

## Admin Features

An admin panel enables the management of assets, offering controls for game resets.

## Themes Description

Themes such as "Build a Snowman" and "Decorate a Locker" provide seasonal and thematic contexts for user creations, enriching the virtual environment.

## Data Objects

Snowmen are hosted inside the app and locker images are stored in an S3 bucket. The Locker App can identify the owners through the world dataObject, with profileId as keys, and locker id (droppedAsset id) as the value.

## Developer Sections

### Getting Started

Refer to the `.env-example` file to configure your environment variables correctly.

#### Production Mode

1. Install dependencies: `npm install`
2. Start the server: `npm start`

#### Development Mode

1. Start the server: `npm start`
2. In a new terminal, navigate to the client directory: `cd client && npm start`
3. Access `http://localhost:3001/snowman` or `http://localhost:3001/locker` to begin customization.

### .env Variables

Ensure all required environment variables are set as outlined in the `.env-example` file.

### API Keys

Find the `INTERACTIVE_KEY`, and `INTERACTIVE_SECRET` in the admin settings in https://topia.io.

### Helpful Links

- View it in action: [https://topia.io/snowman-prod](https://topia.io/snowman-prod)
- View it in action: [https://topia.io/locker-app-production](https://topia.io/locker-app-production)
- How to play guide in Notion: [[https://www.notion.so/topiaio/Build-an-Asset-64518134dae840958b1bdd7982c3c423](https://www.notion.so/topiaio/Build-an-Asset-64518134dae840958b1bdd7982c3c423)]
