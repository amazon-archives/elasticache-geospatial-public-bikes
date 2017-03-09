# elasticache-geospatial-public-bikes

public-bikes is a sample project that utilizes the [AWS Serverless Application Model (SAM)](https://aws.amazon.com/about-aws/whats-new/2016/11/introducing-the-aws-serverless-application-model/) in conjunction with Amazon ElastiCache to find nearby public bike stations.

For more details on this project, please visit the accompanying [blog post](https://aws.amazon.com/blogs/database/amazon-elasticache-utilizing-redis-geospatial-capabilities/).

## Getting Started

To get started, clone this repository locally:

```
$ git clone https://github.com/awslabs/elasticache-geospatial-public-bikes.git
```

The repository contains [CloudFormation](https://aws.amazon.com/cloudformation/) templates and source code to deploy and run a complete sample application.


### Prerequisites

To run the public-bikes sample application, you will need to:

1. Select an AWS Region into which you will deploy services. Be sure that all required services (AWS Lambda, Amazon API Gateway, Amazon ElastiCache, Amazon DynamoDB) are available in the Region you select.
2. Confirm your [installation of the latest AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) (at least version 1.11.21).
3. Confirm the [AWS CLI is properly configured](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-quick-configuration) with credentials that have administrator access to your AWS account.
4. [Install Node.js and NPM](https://docs.npmjs.com/getting-started/installing-node).

## Setting Up the Environment

Before deploying the sample, install several dependencies using NPM:

```
$ cd public-bikes/server
$ cd api
$ npm install
$ cd ../stream
$ npm install
$ cd ..
```

## Deploy AWS Resources

The deployment of our AWS resources has been broken into two CloudFormation templates.  The first of which contains network resources, including VPC, Subnets, and Gateways.  While not strictly necessary in this example, utilizing VPC is intended to help secure our deployment.

1. Deploy the network stack (network.yaml) via the AWS CLI:

    ```
    $ aws cloudformation deploy --template network.yaml --stack-name public-bikes-network
    ```

2. Create a new S3 bucket from which to deploy our source code (ensure that the bucket is created in the same AWS Region as your network and services will be deployed):

    ```
    $ aws s3 mb s3://<MY_BUCKET_NAME>
    ```
3. Using the SAM, package your source code and serverless stack:

    ```
    $ aws cloudformation package --template-file app-sam.yaml --s3-bucket <MY_BUCKET_NAME> --output-template-file app-sam-output.yaml
    ```
4. Once packaging is complete, deploy the stack (note: this step may require 10-15 minutes as ElastiCache is deployed):

    ```
    $ aws cloudformation deploy --template-file app-sam-output.yaml --stack-name public-bikes-dev --capabilities CAPABILITY_IAM
    ```
5. After your stack has been created, the sample API has been deployed and you can retrieve the domain of the API (going forward, we will refer to it as API_DOMAIN):

    ```
    $ aws cloudformation describe-stacks --stack-name public-bikes-dev --query 'Stacks[0].Outputs[?OutputKey==`ApiDomain`].OutputValue'
    ```

## Data Preparation

For our sample application, we have included a special API endpoint that retrieves sample data (for Chicago's Divvy bike share) and loads it to DynamoDB.  To load the data to your environment:

```
$ curl https://<API_DOMAIN>/Prod/stations/setup
```

## Testing Our Service

Now that we have deployed all of our AWS resources and loaded a small set of sample data, we can test our service by passing a latitude and longitude in downtown Chicago:

```
$ curl –L 'https://<API_DOMAIN>/Prod/stations?latitude=41.8802596&longitude=-87.6346818'
```

The resulting response will contain the 10 closest Divvy bike locations to the passed coordinates, including the distance (in miles) and coordinates of the station:

```
[{
    "name": "Wacker Dr & Washington St-Chicago",
    "distance": "0.2484 mi",
    "coordinates": {
        "latitude": 41.88327238502640881,
        "longitude": -87.63731449842453003
    }
}, {
    "name": "State St & Harrison St-Chicago",
    "distance": "0.5589 mi",
    "coordinates": {
        "latitude": 41.87405360416989453,
        "longitude": -87.62771755456924438
    }
...
]
```

## Cleaning Up

Finally, we will clean up the AWS environment using CloudFormation:

```
$ aws cloudformation delete-stack --stack-name public-bikes-dev

$ aws cloudformation delete-stack --stack-name public-bikes-network
```


## Authors

* **Josh Kahn** - *Initial work*
