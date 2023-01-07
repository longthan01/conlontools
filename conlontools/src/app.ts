import express from "express";
import fetch from "node-fetch";
import { Inbox } from "mailinator-inbox";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  //Access the inbox of johnny@mailinator.com
  const inbox = new Inbox("thao.origin.0007");

  //Load emails
  await inbox.refresh();

  //Get the header ( from, subject, ...) of the first email
  const firstEmailHeader = inbox.emailHeaders[0];
  console.log(firstEmailHeader);
  //Retrieve the whole email, including body
  const firstEmail = await inbox.getEmail(firstEmailHeader.id);
  console.log(firstEmail);
  //Wait for new emails from ana@gmail.com
  const futureEmails = await inbox.waitForEmailsFrom(
    "accounts@axieinfinity.com",
    30000
  );

  //Iterate over the headers of the new emails from ana
  futureEmails.forEach(async (emailInfo) => {
    const email = await inbox.getEmail(emailInfo.id);

    console.log("From axs:", email.subject, email.textBody);
  });
});
