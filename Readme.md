# Base RESTful Service

This project implements an extremely basic RESTful CRUD service using Node, Express, and Mongoose.  Its intent is to demonstrate some standardized approaches to handling requests and responses.

- Follows basic REST philosophies such as
  - Endpoints versioned in the URL path
  - Uses HTTP verbs to signify actions
  - Endpoints are resource-based, pluralized, and hierarchical
  - Responses include metadata to provide information for possible next steps
- Collections are paged by default, and also support filtering and sorting
- Requests and responses adhere to the [JSON:API specification](https://jsonapi.org/)


## <a name="usage"></a>Usage
- Clone this repository
- Start a MongoDB instance through one of the following methods:
  - Download your own community server from [Mongo](https://www.mongodb.com/)
  - Create a cloud-based instance through [mlab](https://mlab.com/) or [Atlas](https://www.mongodb.com/cloud/atlas)
- Pass the database URL to the service through one of the following methods:
  - Create a .env file in the root of the project containing the line
    - DATABASE_URL=&lt;url&gt;
  - Set the environment property DATABASE_URL to &lt;url&gt; through other means
- Use *npm start* or *npm run watch* to start the service


## <a name="testing"></a>Testing
A [Postman](https://www.getpostman.com/) collection is provided [here](base-restful-service.postman_collection.json) for exploring the API and running manual tests.


## <a name="api"></a>API
The following endpoints are currently implemented.

Method | Path | Description
--- | --- | ---
POST | /api/v1/resources | Create a new resource
GET | /api/v1/resources | List existing resources
GET | /api/v1/resources/:id | Get a specific existing resource
PUT | /api/v1/resources/:id | Replace a specific existing resource
PATCH | /api/v1/resources/:id | Update a specific existing resource
DELETE | /api/v1/resources/:id | Deete a specific existing resource

Versioning is accomplished by placing handlers in the *routes* directory.  I tend toward the approach of one path and version per file.  This allows the addition of future versions to be added without disturbing the existing versions.  To remove an older version, the files simply get removed.  This makes path and version management dead simple.


## <a name="creation"></a>Create/Replace/Modify Responses
Upon creating a new document, replacing or modifying an existing document, the resultant document is not returned as part of the response.  This is to avoid using unnecessary bandwidth if the resultant document is not needed.  Instead, the *Location* header is used to return the location of the affected document so that a subsequent request can be made for it if desired.

    Status: 201
    Location: http://.../resources/1


## <a name="data"></a>Data Responses
When returning data as part of a response, the HTTP status will reflect a 200 status code, and return a [JSON:API-compliant data body](https://jsonapi.org/format/#fetching-resources-responses):

    {
      "links: {
        "self": "http://...", 
        "about": "http://.../api.md"
      },
      "data": [
        { item 1 }, 
        { item 2 }, 
        ...
      ],
      "meta": {
        "count": 10, 
        "limit": 10,
        "page": 1, 
        "pages": 10,
      }
    }


## <a name="errors"></a>Error Responses
Upon an error, the HTTP status will reflect a 4xx or 5xx status code, as well as a [JSON:API-compliant error body](https://jsonapi.org/format/#errors):

    {
      "errors": [{
        "code": 400, 
        "message": "what went wrong?", 
        "detail": {
          "optional": "structured data such as error stacktrace"
        }
      }]
    }

## Changelog

|Version|Description|
|---|---|
|1.0.0|Initial Release|
|1.0.1|Security refresh of package-lock|
