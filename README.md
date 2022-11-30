# incidents-db
Assignment to demonstrate how to fetch / query the new [Web3rekt Data API](https://www.web3rekt.com/post/web3rekt-adds-data-api).

## Requirements
- Loop over all the items of this [db](https://www.web3rekt.com/post/web3rekt-adds-data-api) through their API and store them in our own mongodb instance. (If you hit some API rate limits, it's ok we just store a shorter time range).  
- Have a polling function that updates our database when new items are added to the 3rd party db  
- Create a wrapper API querying the data of our own db, exposing an endpoint returning hack events, but also that lets us filter by platform, major_method, and filter by ranges of loss and date

## Quick start
There is a docker compose file included at the root level that contains the following services:
- incidents (wrapper API), exposed via port 3000
- web3rekt-poller (polling function)
- mongo (mongodb instance), exposed via port 27017

To run simply do:

```
docker-compose up
```

## Loading sample documents
There are 2 possible methods of storing an initial sample of incidents in the mongo db prior to starting the api / poller services. Alternatively the poller service will fetch them all as well if none are present.

#### 1. Import sample database
This repo contains a sample of all incidents from 2011-06-01 till 2022-11-29, it can be imported directly into mongo

First start the mongo service:

```
docker-compose up -d mongo
```

Then import the documents:

```
mongoimport --db=incidents --collection=incidents --file=data/incidents.json
```

#### 2. Use load script
By default will fetch all incidents from 2011-06-01 until today

```
docker-compose run web3rekt-poller npm run load
```

Optionally you can pass a start and/or end date

```
docker-compose run web3rekt-poller npm run load -- 2011-06-01 2012-01-01
```
