# Endpoints

Below is a list of endpoints that will be used throughout this application.

Commonly all api endpoints have the potential to return a string message as part of the data object.

## Authentication

### POST /login

#### Request
- username: string;
- password: string;

#### Response

##### 403

Returned if login fails for any reason.

##### 200
- token: string;

### POST /register

#### Request
- username: string;
- password: string;

#### Response

##### 403

Returned if registration fails for any reason.

##### 200

Returned if registration is successful.

## Profile

### GET /team

Get current team information for profile.

### GET /team/[id]

Get profile information for a team.

### PUT /team/settings

Update a teams settings.

### PUT /team/generation

Update the generation of the current team.

### PUT /team/[id]/generation

Update the generation of a team.

### POST /team/pokemon

Adds a pokemon to the team

#### Request
- id: number;
- name?: string;
- level?: number;

### DELETE /team/pokemon

Removes a pokemon from the team

#### Request
- id: number;
- name?: string;
- level?: number;

## Pokemon

### GET /pokemon

Returns all pokemon for the current teams generation.

#### Response
- data (Array)
    - id: number;
    - name: string;
    - image: string;

### GET /pokemon/[id]

Returns data about a pokemon with id.

#### Response
- data
    - id: number;
    - name: string;

### GET /pokemon/[id]/training

Returns ev training information about a pokemon with id.
