const quizData = require('./quizData.json');
Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)];
};
const ordin = require('number-to-words');
/* HELPER FUNCTIONS */
const speechConsCorrect = ['Booya', 'All righty', 'Bam', 'Bazinga', 'Bingo', 'Boom', 'Bravo', 'Cha Ching', 'Cheers', 'Dynomite', 'Hip hip hooray', 'Hurrah', 'Hurray', 'Huzzah', 'Oh dear.  Just kidding.  Hurray', 'Kaboom', 'Kaching', 'Oh snap', 'Phew', 'Righto', 'Way to go', 'Well done', 'Whee', 'Woo hoo', 'Yay', 'Wowza', 'Yowsa'];
const speechConsWrong = ['Argh', 'Aw man', 'Blarg', 'Blast', 'Boo', 'Bummer', 'Darn', "D'oh", 'Dun dun dun', 'Eek', 'Honk', 'Le sigh', 'Mamma mia', 'Oh boy', 'Oh dear', 'Oof', 'Ouch', 'Ruh roh', 'Shucks', 'Uh oh', 'Wah wah', 'Whoops a daisy', 'Yikes'];

function askQuestion(handlerInput) {
  console.log("I am in askQuestion()");

  //GET SESSION ATTRIBUTES
  const attributes = handlerInput.attributesManager.getSessionAttributes();

  //GENERATING THE RANDOM QUESTION FROM DATA
  console.log(attributes.indexPosition);
  const random = attributes.randomIndexArray[attributes.indexPosition];
  console.log(random);
  const item = quizData[random];
  console.log(item);

  //SET QUESTION DATA TO ATTRIBUTES
  attributes.selectedItemIndex = random;
  attributes.quizItem = item;
  attributes.counter += 1;
  attributes.indexPosition += 1;

  //SAVE ATTRIBUTES
  handlerInput.attributesManager.setSessionAttributes(attributes);

  const question = getQuestion(attributes.counter, item);
  return question;
}

// Builds an array of random numbers the length of the quizData array to be
// used as an index for actually retrieving questions, without storing the 
// whole 80kb in memory.
function generateRandomIndex() {
  let array = generateRandomArray(quizData.length);
  return array;
}

// Generates a random array.... The name describes it well.
// Except it doesn't. This creates arrays with repeats. Needs fixing.
// TODO
function generateRandomArray(arrayLength) {
  let array = [...Array(arrayLength).keys()];
  let shuffledArray = shuffle(array);
  return shuffledArray;
}

function shuffle(arr) {
  var newArr = [];
  while (arr.length) {
    var randomIndex =
      Math.floor(Math.random() * arr.length),
      element = arr.splice(randomIndex, 1);
    newArr.push(element[0]);
  }
  return newArr;
}

function getQuestion(counter, item) {
  console.log('Im in getQuestion()');
  return `Here is your ${ordin.toWordsOrdinal(counter)} headline: ${item.headline}`;
}

function getRandom(min, max) {
  return Math.floor((Math.random() * ((max - min) + 1)) + min);
}

function compareSlots(slots, item) {
  console.log('Im in compareSlots()');
  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      if (slots[slot].name.toString().toLowerCase() === item.category.toString().toLowerCase()) {
        return true;
      }
    }
  }
  return false;
}

function getSpeechCon(type) {
  console.log('Im in getSpeechCon()');
  if (type) return `<say-as interpret-as='interjection'>${speechConsCorrect[getRandom(0, speechConsCorrect.length - 1)]}! </say-as><break strength='strong'/>`;
  return `<say-as interpret-as='interjection'>${speechConsWrong[getRandom(0, speechConsWrong.length - 1)]} </say-as><break strength='strong'/>`;
}

function getAnswer(item) {
  console.log('Im in getAnswer()');
  let isRealHeadline = getIfHeadlineIsTrueFalse(item.category);
  return `That one is a ${isRealHeadline.toString()} headline!`;
}

function getIfHeadlineIsTrueFalse(category) {
  console.log('Im in getIfHeadlineIsTrueFalse()');
  if (category.toString().toLowerCase() === "theonion") {
    return false;
  }
  return true;
}

function getCurrentScore(score, counter) {
  console.log('Im in getCurrentScore()');
  return `Your current score is ${score} out of ${counter} rounds. `;
}





function getFinalScore(score, counter) {
  return `Your final score is ${score} out of ${counter}. `;
}














function getItem(slots) {
  const propertyArray = Object.getOwnPropertyNames(quizData[0]);
  let slotValue;

  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      slotValue = slots[slot].value;
      for (const property in propertyArray) {
        if (Object.prototype.hasOwnProperty.call(propertyArray, property)) {
          const item = QuizData.data.filter(x => x[propertyArray[property]]
            .toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
          if (item.length > 0) {
            return item[0];
          }
        }
      }
    }
  }
  return slotValue;
}




function getTextDescription(item) {
  let text = '';

  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      text += `${formatCasing(key)}: ${item[key]}\n`;
    }
  }
  return text;
}

function getAndShuffleMultipleChoiceAnswers(currentIndex, item, property) {
  return shuffle(getMultipleChoiceAnswers(currentIndex, item, property));
}
// This function randomly chooses 3 answers 2 incorrect and 1 correct answer to
// display on the screen using the ListTemplate. It ensures that the list is unique.
function getMultipleChoiceAnswers(currentIndex, item, property) {

  // insert the correct answer first
  let answerList = [item[property]];

  // There's a possibility that we might get duplicate answers
  // 8 states were founded in 1788
  // 4 states were founded in 1889
  // 3 states were founded in 1787
  // to prevent duplicates we need avoid index collisions and take a sample of
  // 8 + 4 + 1 = 13 answers (it's not 8+4+3 because later we take the unique
  // we only need the minimum.)
  let count = 0;
  let upperBound = 12;

  let seen = new Array();
  seen[currentIndex] = 1;

  while (count < upperBound) {
    let random = getRandom(0, QuizData.data.length - 1);

    // only add if we haven't seen this index
    if (seen[random] === undefined) {
      answerList.push(QuizData.data[random][property]);
      count++;
    }
  }

  // remove duplicates from the list.
  answerList = answerList.filter((v, i, a) => a.indexOf(v) === i)
  // take the first three items from the list.
  answerList = answerList.slice(0, 3);
  return answerList;
}



module.exports = {
  askQuestion: askQuestion,
  generateRandomIndex: generateRandomIndex,
  getAndShuffleMultipleChoiceAnswers: getAndShuffleMultipleChoiceAnswers,
  getItem: getItem,
  getTextDescription: getTextDescription,
  getSpeechCon: getSpeechCon,
  getAnswer: getAnswer,
  getQuestion: getQuestion,
  getFinalScore: getFinalScore,
  compareSlots: compareSlots,
  getCurrentScore: getCurrentScore,
};