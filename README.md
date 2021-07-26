# ft_transcendence

A web application for playing online multiplayer pong games.
Logging in with your 42 School account is required.

The application is implemented as a SPA (Single Page Application).
Built with Ruby on Rails framework, deployed via Docker.

- Front-end: Javascript (usage of [Backbone.js](https://backbonejs.org/)), HTML, CSS.
- Back-end: Ruby, SQL (through PostgreSQL database)

## Context

This project was done as part of 42's Software Engineer program, as a team of 5 members. Project was passed the 20th July 2021.

## Usage

### Launch the project

1) Launch Docker

2) Launch the project with the following command inside the repository

```bash
docker-compose up --build
```

When the project is launched, the website can be accessed localhost (via http://localhost).

### Features

The web application features:
- A login page that enables the user to connect with its 42 Lyon School account.
- An online pong game for logged-in users to play pong against each other: playing the game can either be done through normal matchmaking or friend's challenges
- A friend list to add or remove connected friends. Options implemented include removing your friend from the list, spectating their match, sending them direct messages, challenging them to a game.
- A chat which enables users to create chat public/private chat rooms and much more.
- A guild panel: a page to list all the guilds on the website. Each guild can be displayed with their significant figures, their members, their owner. The page is customized for guild owners to accept/refuse user invitations to join the guild.
- A user ranking panel: a page to represent to current users ranking.

### Some screenshots

<img width="1440" alt="Screenshot 2021-07-17 at 11 32 34" src="https://user-images.githubusercontent.com/49372605/127016084-0816ec89-6e6e-41a0-947e-df76cd7890b5.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 32 42" src="https://user-images.githubusercontent.com/49372605/127016097-ac6cb46e-86e9-4dd4-a73d-9bcfd94e4a0b.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 33 02" src="https://user-images.githubusercontent.com/49372605/127016108-293f8f1b-60f7-4db6-89e2-2169f9e1d0ee.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 33 08" src="https://user-images.githubusercontent.com/49372605/127016113-bb6fa7a4-2043-43f5-9aaa-d244073e8f0d.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 35 07" src="https://user-images.githubusercontent.com/49372605/127016119-dcbc98d0-5366-4267-a5ac-746bfa1b2828.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 35 21" src="https://user-images.githubusercontent.com/49372605/127016122-60127194-a016-4720-a0c2-3d98fb67f402.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 35 58" src="https://user-images.githubusercontent.com/49372605/127016124-1f83d865-e91f-40e3-8610-3da787c09128.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 36 02" src="https://user-images.githubusercontent.com/49372605/127016127-e098bb2e-6704-41a6-a3b6-b5fce61ceac5.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 36 13" src="https://user-images.githubusercontent.com/49372605/127016128-18d219ec-97aa-48ec-a23b-7b9d9f9b74e9.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 36 36" src="https://user-images.githubusercontent.com/49372605/127016130-108350d6-74a1-4d3d-9aae-f5e59f6f1dd1.png">
<img width="1440" alt="Screenshot 2021-07-17 at 11 38 54" src="https://user-images.githubusercontent.com/49372605/127016134-9783f612-f55c-492b-885c-71041f0690de.png">

