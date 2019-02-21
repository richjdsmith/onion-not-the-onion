const Alexa = require('ask-sdk-core');
const states = {
  START: `_START`,
  QUIZ: `_QUIZ`,
};
const useCardsFlag = true;
const Builders = require('./builders.js');
const QuizData = require('./quizData.js');

/* CONSTANTS */





const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === `LaunchRequest`;
  },
  handle(handlerInput) {
    let speechText = `Welcome to Onion Not The Onion! You can ask me for a random Onion Headline or a headline that really should be in the onion, or you can ask me to start a quiz.  What would you like to do?`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const QuizHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log("Inside QuizHandler");
    console.log(JSON.stringify(request));
    return request.type === "IntentRequest" &&
      (request.intent.name === "QuizIntent" || request.intent.name === "AMAZON.StartOverIntent");
  },
  handle(handlerInput) {
    console.log("Inside QuizHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;
    attributes.state = states.QUIZ;
    attributes.counter = 0;
    attributes.quizScore = 0;

    let startQuizMessage = `OK.  I will ask you 10 questions about the United States. `;
    var question = Builders.askQuestion(handlerInput);
    var speakOutput = startQuizMessage + question;
    var repromptOutput = question;

    const item = attributes.quizItem;
    const property = attributes.quizProperty;

    if (Builders.supportsDisplay(handlerInput)) {
      const title = `Question #${attributes.counter}`;
      const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(Builders.getQuestionWithoutOrdinal(property, item)).getTextContent();
      const backgroundImage = new Alexa.ImageHelper().addImageInstance(Builders.getBackgroundImage(attributes.quizItem.Abbreviation)).getImage();
      const itemList = [];
      Builders.getAndShuffleMultipleChoiceAnswers(attributes.selectedItemIndex, item, property).forEach((x, i) => {
        itemList.push({
          "token": x,
          "textContent": new Alexa.PlainTextContentHelper().withPrimaryText(x).getTextContent(),
        });
      });
      response.addRenderTemplateDirective({
        type: 'ListTemplate1',
        token: 'Question',
        backButton: 'hidden',
        backgroundImage,
        title,
        listItems: itemList,
      });
    }

    return response.speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const DefinitionHandler = {
  canHandle(handlerInput) {
    console.log("Inside DefinitionHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state !== states.QUIZ &&
      request.type === 'IntentRequest' &&
      request.intent.name === 'AnswerIntent';
  },
  handle(handlerInput) {
    console.log("Inside DefinitionHandler - handle");
    //GRABBING ALL SLOT VALUES AND RETURNING THE MATCHING DATA OBJECT.
    const item = Builders.getItem(handlerInput.requestEnvelope.request.intent.slots);
    const response = handlerInput.responseBuilder;

    //IF THE DATA WAS FOUND
    if (item && item[Object.getOwnPropertyNames(QuizData.data[0])[0]] !== undefined) {
      if (useCardsFlag) {
        response.withStandardCard(
          Builders.getCardTitle(item),
          Builders.getTextDescription(item),
          Builders.getSmallImage(item),
          Builders.getLargeImage(item));
      }

      if (Builders.supportsDisplay(handlerInput)) {
        const image = new Alexa.ImageHelper().addImageInstance(Builders.getLargeImage(item)).getImage();
        const title = Builders.getCardTitle(item);
        const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(Builders.getTextDescription(item, "<br/>")).getTextContent();
        response.addRenderTemplateDirective({
          type: 'BodyTemplate2',
          backButton: 'visible',
          image,
          title,
          textContent: primaryText,
        });
      }
      let repromptSpeech = `Which other state or capital would you like to know about?`;
      return response.speak(Builders.getSpeechDescription(item))
        .reprompt(repromptSpeech)
        .getResponse();
    }
    //IF THE DATA WAS NOT FOUND
    else {
      return response.speak(Builders.getBadAnswer(item))
        .reprompt(Builders.getBadAnswer(item))
        .getResponse();
    }
  }
};

const QuizAnswerHandler = {
  canHandle(handlerInput) {
    console.log("Inside QuizAnswerHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === states.QUIZ &&
      request.type === 'IntentRequest' &&
      request.intent.name === 'AnswerIntent';
  },
  handle(handlerInput) {
    console.log("Inside QuizAnswerHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;

    var speakOutput = ``;
    var repromptOutput = ``;
    const item = attributes.quizItem;
    const property = attributes.quizProperty;
    const isCorrect = Builders.compareSlots(handlerInput.requestEnvelope.request.intent.slots, item[property]);

    if (isCorrect) {
      speakOutput = Builders.getSpeechCon(true);
      attributes.quizScore += 1;
      handlerInput.attributesManager.setSessionAttributes(attributes);
    } else {
      speakOutput = Builders.getSpeechCon(false);
    }

    speakOutput += Builders.getAnswer(property, item);
    var question = ``;
    //IF YOUR QUESTION COUNT IS LESS THAN 10, WE NEED TO ASK ANOTHER QUESTION.
    if (attributes.counter < 10) {
      speakOutput += Builders.getCurrentScore(attributes.quizScore, attributes.counter);
      question = Builders.askQuestion(handlerInput);
      speakOutput += question;
      repromptOutput = question;

      if (Builders.supportsDisplay(handlerInput)) {
        const title = `Question #${attributes.counter}`;
        const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(Builders.getQuestionWithoutOrdinal(attributes.quizProperty, attributes.quizItem)).getTextContent();
        const backgroundImage = new Alexa.ImageHelper().addImageInstance(Builders.getBackgroundImage(attributes.quizItem.Abbreviation)).getImage();
        const itemList = [];
        Builders.getAndShuffleMultipleChoiceAnswers(attributes.selectedItemIndex, attributes.quizItem, attributes.quizProperty).forEach((x, i) => {
          itemList.push({
            "token": x,
            "textContent": new Alexa.PlainTextContentHelper().withPrimaryText(x).getTextContent(),
          });
        });
        response.addRenderTemplateDirective({
          type: 'ListTemplate1',
          token: 'Question',
          backButton: 'hidden',
          backgroundImage,
          title,
          listItems: itemList,
        });
      }
      return response.speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    } else {
      let exitSkillMessage = `Thank you for playing the United States Quiz Game!  Let's play again soon!`;
      speakOutput += Builders.getFinalScore(attributes.quizScore, attributes.counter) + exitSkillMessage;
      if (Builders.supportsDisplay(handlerInput)) {
        const title = 'Thank you for playing';
        const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(Builders.getFinalScore(attributes.quizScore, attributes.counter)).getTextContent();
        response.addRenderTemplateDirective({
          type: 'BodyTemplate1',
          backButton: 'hidden',
          title,
          textContent: primaryText,
        });
      }
      return response.speak(speakOutput).getResponse();
    }
  },
};

const RepeatHandler = {
  canHandle(handlerInput) {
    console.log("Inside RepeatHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === states.QUIZ &&
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.RepeatHandler';
  },
  handle(handlerInput) {
    console.log("Inside RepeatHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const question = Builders.getQuestion(attributes.counter, attributes.quizproperty, attributes.quizitem);

    return handlerInput.responseBuilder
      .speak(question)
      .reprompt(question)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    console.log("Inside HelpHandler");
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.HelpHandler';
  },
  handle(handlerInput) {
    console.log("Inside HelpHandler - handle");
    let helpMessage = `I know lots of things about the United States.  You can ask me about a state or a capital, and I'll tell you what I know.  You can also test your knowledge by asking me to start a quiz.  What would you like to do?`;
    return handlerInput.responseBuilder
      .speak(helpMessage)
      .reprompt(helpMessage)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    console.log("Inside ExitHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return request.type === `IntentRequest` && (
      request.intent.name === 'AMAZON.StopIntent' ||
      request.intent.name === 'AMAZON.PauseIntent' ||
      request.intent.name === 'AMAZON.CancelIntent'
    );
  },
  handle(handlerInput) {
    let exitSkillMessage = `Thank you for playing the United States Quiz Game!  Let's play again soon!`;
    return handlerInput.responseBuilder
      .speak(exitSkillMessage)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    console.log("Inside ErrorHandler");
    return true;
  },
  handle(handlerInput, error) {
    console.log("Inside ErrorHandler - handle");
    console.log(`Error handled: ${JSON.stringify(error)}`);
    console.log(`Handler Input: ${JSON.stringify(handlerInput)}`);
    let helpMessage = `I know lots of things about the United States.  You can ask me about a state or a capital, and I'll tell you what I know.  You can also test your knowledge by asking me to start a quiz.  What would you like to do?`;
    return handlerInput.responseBuilder
      .speak(helpMessage)
      .reprompt(helpMessage)
      .getResponse();
  },
};

module.exports = {
  LaunchRequestHandler: LaunchRequestHandler,
  QuizHandler: QuizHandler,
  DefinitionHandler: DefinitionHandler,
  QuizAnswerHandler: QuizAnswerHandler,
  RepeatHandler: RepeatHandler,
  HelpHandler: HelpHandler,
  ExitHandler: ExitHandler,
  SessionEndedRequestHandler: SessionEndedRequestHandler,
  ErrorHandler: ErrorHandler
};