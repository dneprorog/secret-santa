## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run dev

# watch
$ npm run start

# production build
$ npm run build
```

## API

```bash
# Add participant
$ POST http://localhost:3000/participants
$ Content-Type: application/json
{
  "firstName": "FirstName 01",
  "lastName": "LastName 01",
  "wishlist": "[\"gift1\", \"gift2\"]"
}


# Get Participants
$ GET http://localhost:3000/participants
$ Content-Type: application/json


# Get participant by id.
$ GET http://localhost:3000/participants/1
$ Content-Type: application/json


# Delete Participant by id.
$ DELETE http://localhost:3000/participants/1
$ Content-Type: application/json


# Shuffle
$ POST http://localhost:3000/shuffle
$ Content-Type: application/json


# Santa get information (first_name, last_name, wishlist) about his recipient by ID.
$ GET http://localhost:3000/santas/2
$ Content-Type: application/json
```


