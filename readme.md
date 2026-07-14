// for register user use api end point
post req http://localhost:5000/api/auth/register
body json data

```json
{
  "name": "Ramjan",
  "email": "technician@gmail.com",
  "password": "technician@gmail.com",
  "role": "TECHNICIAN",
  "phone": "01812097488",
  "avatar": "https://yourphoto.com"
}
```

// login user

post req http://localhost:5000/api/auth/login

body json data

```json
{ "email": "ramjan@gmail.com", "password": "ramjan@gmail.com" }
```

for get user data
req method get http://localhost:5000/api/auth/me
must be login no require headers body data required cookie accesstoken

// for get the all service

API Example
Search
GET /api/services?searchTerm=repair
Category filter
GET /api/services?categoryId=clx123
Technician services
GET /api/services?technicianId=tech123
Price range
GET /api/services?minPrice=100&maxPrice=500
Pagination
GET /api/services?page=2&limit=20
Sorting
GET /api/services?sortBy=price&sortOrder=asc

Request Body Example

POST /api/services

{
"technicianId":"cmx123456",
"categoryId":"cmx789123",
"title":"AC Repair Service",
"description":"Complete AC servicing and repair",
"price":500,
"estimatedHours":3
}

technician data get

GET /api/technicians

Search:

GET /api/technicians?searchTerm=rahim

Location:

GET /api/technicians?location=Dhaka

Minimum rating:

GET /api/technicians?minRating=4

Hourly rate range:

GET /api/technicians?minRate=300&maxRate=1000

Available technicians:

GET /api/technicians?isAvailable=true

Sorting:

GET /api/technicians?sortBy=averageRating&sortOrder=desc

Combined:

GET /api/technicians?location=Dhaka&minRating=4&minRate=500&maxRate=1000&page=1&limit=10&sortBy=averageRating&sortOrder=desc

get technician data by id
http://localhost:5000/api/technicians/4021c1f1-f2d8-4629-b006-0110697c82e1


for get the all cetegories

GET http://localhost:5000/api/categories

