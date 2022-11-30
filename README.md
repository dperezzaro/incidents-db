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

```
docker-compose run -v $(pwd)/data:/home/data -w /home/data mongo mongoimport --host=mongo --db=incidents --collection=incidents --file=incidents.json --jsonArray
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

## Request examples
Things to consider:
- All results are paginated, format:
```
{
  total(number): total number of documents that match the criteria
  data(Array<Object>): documents
  next(string|null): query string that will fetch the next set of results
}
```
- By default the page limit is 20 documents
- All dates in a document are unix timestamps
- Not all documents contain the same fields

Get newest report date
```
curl "localhost:3000?limit=1&order=date|-1"
```

Get oldest report date
```
curl "localhost:3000?limit=1&order=date|1"
```

Get reports by matching field
```
curl "localhost:3000?platform=Bitcoin"
```

Get reports by several matching fields, check that you can use regexes to match values as well
```
curl "localhost:3000?platform=Bitcoin&major_method=/compromised/i"
```

Get reports by field comparison
```
curl "localhost:3000?loss=gt|10000"
curl "localhost:3000?date=lt|1338508800"
```

Get reports by field comparison range
```
curl "localhost:3000?loss=between|100000,200000"
curl "localhost:3000?date=between|1338508800,1343779200"
```

Get reports that contain a specific field
```
curl "localhost:3000?category=exists|true"
```

You can filter which fields to be returned
```
curl "localhost:3000?fields=_id,platform,currency,loss"
```

And you can combine all of the above
```
curl "localhost:3000?platform=Bitcoin&major_method=/compromised/i&loss=gt|200000&fields=major_method,loss"
```
