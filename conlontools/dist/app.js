"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mailinator_inbox_1 = require("mailinator-inbox");
const app = (0, express_1.default)();
const port = 3000;
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    //Access the inbox of johnny@mailinator.com
    const inbox = new mailinator_inbox_1.Inbox("thao.origin.0007");
    //Load emails
    yield inbox.refresh();
    //Get the header ( from, subject, ...) of the first email
    const firstEmailHeader = inbox.emailHeaders[0];
    console.log(firstEmailHeader);
    //Retrieve the whole email, including body
    const firstEmail = yield inbox.getEmail(firstEmailHeader.id);
    console.log(firstEmail);
    //Wait for new emails from ana@gmail.com
    const futureEmails = yield inbox.waitForEmailsFrom("accounts@axieinfinity.com", 30000);
    //Iterate over the headers of the new emails from ana
    futureEmails.forEach((emailInfo) => __awaiter(void 0, void 0, void 0, function* () {
        const email = yield inbox.getEmail(emailInfo.id);
        console.log("From axs:", email.subject, email.textBody);
    }));
}));
//# sourceMappingURL=app.js.map