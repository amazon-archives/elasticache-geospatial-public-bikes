# elasticache-geospatial-public-bikes mobile app

public-bikes is a sample project that utilizes the [AWS Serverless Application Model (SAM)](https://aws.amazon.com/about-aws/whats-new/2016/11/introducing-the-aws-serverless-application-model/) in conjunction with Amazon ElastiCache to find nearby public bike stations.

For more details on this project, please visit the accompanying blog post at XXX.

## Our Mobile App

The mobile app for this project was built using [React Native](https://facebook.github.io/react-native/) and is intended to be a simple demonstration of a frontend for the public-bikes API.

![Sample Screenshot of public-bikes mobile app]
(sample_screen.png)

## Getting Started

The public-bikes mobile app is a simple example of how the backend services can be used in a real-life application.  To run this application:

1. Install [React Native](https://facebook.github.io/react-native/docs/getting-started.html) for your preferred platform and mobile device.
2. If not already installed, install Xcode and/or Android Studio.
3. Copy the file `.env.sample` in `app/PublicBikesApp` to `.env`.
4. Open the `.env` file in your favorite text editor and modify so that the value of `BIKE_SERVICE_ENDPOINT` contains the API Gateway endpoint (API_GATEWAY_ENDPOINT) you created when deploying the backend server.
5. Run the app using [React Native in a device simulator](https://facebook.github.io/react-native/docs/running-on-simulator-ios.html).
6. We recommend using the "Find Stations (Test)" button as coordinates for downtown Chicago are already included.

