# TypeScript Node.js | Express | Drizzle ORM

## Run Application

Run in dev mode (Docker + Drizzle + Nodemon)
```shell
npm run dev
```

Compile and Run in prod mode
```shell
npm run docker:up
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
    "username": "alephium",
    "id": "1234567890",
    "type": "product"
}'
```
</details>

<details>

<summary>Twitter cron job</summary>

```shell
bun run test:cron
```

</details>

<summary>Twitter api call</summary>

```shell
bun run test:twitter
```

</details>