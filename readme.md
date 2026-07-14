// for register user use api end point
post req http://localhost:5000/api/auth/register
body json data

```json
{
  "name": "Ramjan",
  "email": "ramjan@gmail.com",
  "password": "ramjan@gmail.com",
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