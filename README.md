<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Authentication

I once read about how large systems like Netflix approach authentication with JSON Web Tokens, and one idea stuck with me:

Don’t make the system remember more than it has to.

So when I built the login system for Taskloom, I didn’t go fully stateless—and that decision mattered.

**Here’s the approach I used:**

User logs in.
Server issues two tokens:

* A short-lived access token
* A long-lived refresh token

Every request carries the access token.
The server verifies the signature and moves on—no database lookup needed.

But here’s where it gets interesting.

Instead of trusting refresh tokens blindly, I made them **stateful**:

* Each refresh token has a unique `jti`
* Tokens are hashed and stored in the database
* Every login creates a session tied to device and IP
* On refresh, the old token is invalidated and replaced

**Why not go fully stateless?**

Because stateless breaks down when you need control.

* You can’t revoke a stolen token
* You can’t track sessions across devices
* You can’t detect misuse

So I split the responsibility:

* Access tokens → stateless, fast, scalable
* Refresh tokens → stateful, controlled, secure

**Trade-off?**
A bit more complexity and a few database lookups—but only where it matters.

**What I learned**

The best systems don’t blindly avoid state.
They’re deliberate about *where* they keep it.

Stateless where you need speed.
Stateful where you need control.

That balance is where systems start to scale quietly.

i used Ai to help me get the entire and clear concept of the entire project and generate me some Schema for my database that is a better start than i blank Vs studio code page

async createConversation(
  userId: string,
  dto: CreateConversationDto,
) {
  // 1. Save the conversation
  const conversation = await this.prisma.conversation.create({
    data: {
      content: dto.content,
      personId: dto.personId,
      source: dto.source,
    },
  });

  // 2. Reset the default relationship reminder
  await this.reminderService.syncDefaultReminder(
    userId,
    dto.personId,
  );

  // 3. (Future) Analyze with AI
  // const analysis = await this.aiService.analyzeConversation(
  //   dto.personId,
  //   dto.content,
  // );

  // 4. (Future) Update AI Memory
  // await this.aiMemoryService.update(
  //   dto.personId,
  //   analysis.memory,
  // );

  // 5. (Future) Create AI reminders
  // await this.reminderService.createAiReminders(
  //   dto.personId,
  //   conversation.id,
  //   analysis.actions,
  // );

  return conversation;
}



You are an AI Relationship Manager.

Your responsibility is to maintain long-term relationship memory.

You will receive:

1. Contact Information
2. Existing AI Memory
3. Latest Conversation

Your responsibilities are:

- Preserve previous memory whenever it is still accurate.
- Update only information that has changed.
- Merge new information into the existing memory.
- Never invent facts.
- Ignore small talk.
- Focus only on information that is valuable in future conversations.
- Detect promises made during the conversation.
- Decide whether a follow-up is required.
- Suggest the next best action for maintaining the relationship.
- If no changes are necessary, keep the existing memory unchanged.

Return ONLY valid JSON.

{
  "whoIsThisPerson": "",
  "relationshipSummary": "",
  "currentGoal": "",
  "lastPromise": "",
  "nextAction": "",
  "followUpRequired": true,
  "replyRequired": false,
  "confidence": 0.95
}


You are an AI Conversation Assistant.

Analyze ONLY the latest conversation.

Do not maintain long-term memory.

Do not update relationship information.

Your responsibilities are:

- Summarize the conversation.
- Determine whether a reply is needed.
- Draft a natural reply if appropriate.
- Decide whether a follow-up is required.
- Recommend the best follow-up time based on the conversation.
- Never invent information.

Return ONLY valid JSON.

{
  "summary": "",
  "reply": {
    "required": true,
    "message": ""
  },
  "followUp": {
    "required": true,
    "reason": "",
    "suggestedTime": ""
  }
}

model AiMemory {
  id                  String   @id @default(cuid())
  personId            String   @unique

  whoIsThisPerson     String?  @db.Text
  relationshipSummary String?  @db.Text
  currentGoal         String?  @db.Text
  lastPromise         String?  @db.Text
  nextAction          String?  @db.Text

  confidence          Float?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  person Person @relation(fields: [personId], references: [id])
}


let go like this model AiMemory {
  id                  String   @id @default(cuid())
  personId            String   @unique

  whoIsThisPerson     String?  @db.Text
  relationshipSummary String?  @db.Text
  currentGoal         String?  @db.Text
  lastPromise         String?  @db.Text
  nextAction          String?  @db.Text

  confidence          Float?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  person Person @relation(fields: [personId], references: [id])
} now update the prompt to to send if  "followUpRequired": true,
  "replyRequired": false, but one change i want is if the after doing all this You are an AI Relationship Manager.

Your responsibility is to maintain long-term relationship memory.

You will receive:

1. Contact Information
2. Existing AI Memory
3. Latest Conversation

Your responsibilities are:

- Preserve previous memory whenever it is still accurate.
- Update only information that has changed.
- Merge new information into the existing memory.
- Never invent facts.
- Ignore small talk.
- Focus only on information that is valuable in future conversations.
- Detect promises made during the conversation.
- Decide whether a follow-up is required.
- Suggest the next best action for maintaining the relationship.
- If no changes are necessary, keep the existing memory unchanged.

Return ONLY valid JSON.

{
  "whoIsThisPerson": "",
  "relationshipSummary": "",
  "currentGoal": "",
  "lastPromise": "",
  "nextAction": "", 
  } 
  can also generate a reply so so user can best get reply from the Ai memory that may include updated conversations

  <!-- https://web.facebook.com/watch?v=2707297966320155 -->