# ft_transcendence

A web application for playing online multiplayer pong games.
Logging in with your 42 School account is required.

The application is implemented as a SPA (Single Page Application).
Built with Ruby on Rails framework, deployed via Docker.

Front-end: Javascript (usage of [Backbone.js](https://backbonejs.org/)), HTML, CSS.
Back-end: Ruby, SQL (through PostgreSQL database)

## Context

This project was done as part of 42's Software Engineer program, as a team of 5 members.

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

