We are creating a bot that verifies desinformative posts from Twitter using Generative Models. I'm coding the server side.

Use `uv` for version control.

Use `.env` for environment variables.

At the server, we will receive a tweet text. The bot should send the text with a prompt to ChatGPT, which will analyze the content and generate a report if one doesn't already exists (search on the list for similar posts). The report will contain useful information whether this is informative, if it's a Fake News or a post without proofs. Save this content in a list of Structs, which will be used to feed a frontend. Code this on a `server/server.py`. 
