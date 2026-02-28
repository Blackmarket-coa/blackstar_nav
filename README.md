<p align="center">
  <img src="assets/navigator-icon-transparent.png" width="140" height="140" />
</p>
<p align="center">
Open source order management, geolocation tracking & navigation app tailored for Blackstar drivers & agents.
</p>

<p align="center">
  <a href="https://github.com/Blackmarket-coa/Blackstar">Blackstar Repository</a>
</p>

<p align="center">
	<img src="https://github.com/user-attachments/assets/05c81b07-cd52-43e9-b0ac-91e0683ab5f9" width="220" height="416" />
	<img src="https://github.com/user-attachments/assets/cfa08ce8-bf13-4bb3-96ef-f73045ee157a" width="220" height="416" />
	<img src="https://github.com/user-attachments/assets/893b58f4-b1ce-4ff5-a78e-530a2035c84b" width="220" height="416" />
	<img src="https://github.com/user-attachments/assets/770582ef-11c3-4d25-bc68-9df72b41c452" width="220" height="416" />
</p>
<p align="center">
	<img src="https://github.com/user-attachments/assets/bfe5ca18-07c1-4188-be8e-277e5ebf7abc" width="220" height="416" />
	<img src="https://github.com/user-attachments/assets/93e3ee4a-6add-4b82-ae93-ae6f5a217400" width="220" height="416" />
	<img src="https://github.com/user-attachments/assets/f21c7514-9cfb-4c3e-bdc4-5254565c1b26" width="220" height="416" />>
</p>

## Table of Contents

- [About](#about)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
    - [Configure Environment](#configure-environment)
- [Running in Simulator](#running-in-simulator)
    - [Run the app in iOS Simulator](#run-the-app-in-ios-simulator)
    - [Run the app in Android Simulator](#run-the-app-in-android-simulator)
- [Navigation using Mapbox](#navigation-using-mapbox)
- [Documentation](#documentation)
- [Roadmap](#roadmap)

### About

Blackstar Navigator is an open source navigation and order management app for drivers and agents. This app is fully customizable and supports QR code scanning, digital signatures, photos, and routing and navigation for agents. Drivers can update activity to orders on the run as they complete jobs. The app includes fuel report and issue management, plus built-in chat with operations personnel and customers.

### Prerequisites

- [Yarn](https://yarnpkg.com/) or [NPM](https://nodejs.org/en/)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- Xcode 12+
- Android Studio

### Installation

Installation and setup is fairly quick, all you need is your API key and a few commands to get your app running in minutes. Follow the directions below to get started.

Run the commands below; first clone the project, use npm or yarn to install the dependencies, then run `npx pod-install` to install the iOS dependencies. Lastly, create a `.env` file to configure the app.

```
git clone git@github.com:Blackmarket-coa/Blackstar.git
cd Blackstar
yarn
yarn pod:install
touch .env
```

### Configure Environment

Below is the steps needed to configure the environment. The first part covers collecting your required API keys.

1.  Get your API Keys;
2.  If you don't already have an account for your backend instance, create one from your provider's console.
3.  Once you're in the Fleetbase console select the "Developers" button in the top navigation. Next, select API Keys from the menu in the Developers section, and create a new API key. Copy your secret key generated, you'll need it later.
4.  Once you have the required API keys, open your `.env` file.

In your `.env` file supply your API secret key, and additionally a Google Maps API key. Lastly, set your app/bundle identifier and an `APP_NAME` key.

Your `.env` file should look something like this once you're done.

```
# .env
APP_NAME=Blackstar Navigator
APP_IDENTIFIER=com.blackmarket.blackstar
APP_LINK_PREFIX=blackstar://
FLEETBASE_HOST=https://api.fleetbase.io
FLEETBASE_KEY=
```

### Running in Simulator

Once you have completed the installation and environment configuration, you're all set to give your app a test-drive in the simulator so you can play around.

#### Run the App in iOS Simulator

```
yarn ios
```

#### Run the App in Android Simulator

```
yarn android
```

### Documentation

See the [documentation webpage](https://fleetbase.io/docs).

If you would like to make contributions to the Fleetbase Javascript SDK documentation source, here is a [guide](https://github.com/fleetbase/fleetbase-js/blob/master/CONTRIBUTING.md) in doing so.

### Roadmap

- COMING SOON
