# TypeScript Node.js | Express | Drizzle ORM

## Run Application

Run in dev mode (Docker + Drizzle + Nodemon)
```shell
docker-compose up -d
```
```shell
npm run dev
```

Compile and Run in prod mode
```shell
docker-compose up -d
```
```shell
npm run build && npm run start
```



## Test application

<details>
    <summary>Create Account</summary>

```shell
curl --location 'http://localhost:8080/accounts' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "mike@mail.com",
    "firstName": "Mike",
    "lastName": "Brown"
}'
```
</details>

<details>
    <summary>Get All Accounts</summary>

```shell
curl --location 'http://localhost:8080/accounts'
```
</details>

<details>
    <summary>Get Account By Id</summary>

```shell
curl --location 'http://localhost:8080/accounts/1'
```
</details>