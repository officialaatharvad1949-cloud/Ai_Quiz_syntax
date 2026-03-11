const API_KEY = "";
const p = console.log;
// data : flow 

const UserProfile={
    save(name){
        //1*: first we create the storageKey
        const storageKey = 'quiz_user_' + name.toLowerCase();// it will differentiate the vedant between Atharva. data will be stored according to the different user 
        const data = localStorage.getItem(storageKey);// we get the data from the key storageKey
        const existingProfile= data? JSON.parse(data):null;// if it isn't available then create it and pass it by null 

        const Profile={
            username: name,
            highscore: existingProfile ? existingProfile.highscore: 0,
            totalgame: existingProfile ? existingProfile.totalgame: 0,
            joinedDate: existingProfile ? existingProfile.joinedDate: new Date().toLocaleDateString()
        };
        // saving profile in their unique id or drawer
        localStorage.setItem(storageKey,JSON.stringify(Profile));

        localStorage.setItem('currentActivePlayer',name.toLowerCase()); /// will be used in update stat later , cause they don't whom stat are being updated 
        // just a plain name later called in updatestat
        return Profile;


    },
    get(){
        const active_player=localStorage.getItem('currentActivePlayer');// like who is currently logged in 
        if(!active_player)return null;

        const storageKey='quiz_user_' +active_player;

        
        
        const data=localStorage.getItem(storageKey);      
        return data ? JSON.parse(data):null;

        
    },
    updatestats(newScore){

        const activePlayer = localStorage.getItem('currentActivePlayer');
        if (!activePlayer) return;// no one is playing ig

        

        const storageKey='quiz_user_' + activePlayer;
        const data=localStorage.getItem(storageKey);
        const profile=data? JSON.parse(data):null;// if no profile is available then return null 
        
        if(profile){
            profile.totalgame+=1;
            if(newScore>profile.highscore){
                profile.highscore=newScore;
            }
            localStorage.setItem(storageKey,JSON.stringify(profile));// saving their progress in their id 
        }
    }
}
document.getElementById('login-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('username-input').value.trim();

    if (nameInput === "") {
        alert("Please enter a name to continue!");
        return;
    }

    // 1. Save the profile
    const user = UserProfile.save(nameInput);
    // for stats display 
    document.getElementById('stat-name').innerText = user.username;
    document.getElementById('stat-games').innerText = user.totalgame ||0 ;
    document.getElementById('stat-high').innerText = user.highscore || 0;
    document.getElementById('stat-last').innerText = user.joinedDate || "Today";

    // this is for hiding the login page and showing the quiz page only 

    document.getElementById('login-container').classList.add('hide');
    document.getElementById('stats-box').classList.remove('hide');
    // document.getElementById('stats-box').classList.add('hide');
    // document.getElementById('quiz-page').classList.remove('hide');

    console.log(`Profile created for: ${user.username}`);

});
document.getElementById('start-quiz-btn').addEventListener('click',()=>{
    document.getElementById('stats-box').classList.add('hide');
    document.getElementById('game-setting').classList.remove('hide');

});
document.getElementById('generate-quiz-btn').addEventListener('click',()=>{
    document.getElementById('game-setting').classList.add('hide');
    document.getElementById('quiz-page').classList.remove('hide');
})



// for testing we gotta create the object like gemini given api response 

// const data = {
//     structure: [
//         {
//             "question": "What is 2 + 2?",
//             "options": ["3", "2", "5", "22"],
//             "answer": 1, // Points to "4"
//             "explanation": "Basic arithmetic, and because you're looking sharp today, you definitely knew that."
//         },
//         {
//             "question": "Which planet is known as the Red Planet?",
//             "options": ["Venus", "Mars", "Jupiter", "Saturn"],
//             "answer": 1, // Points to "Mars"
//             "explanation": "Mars appears red due to iron oxide (rust) on its surface."
//         },
//         {
//             "question": "What does 'HTML' stand for?",
//             "options": [
//                 "Hyper Text Markup Language", 
//                 "High Tech Modern Language", 
//                 "Hyperlink and Text Management", 
//                 "Home Tool Markup Language"
//             ],
//             "answer": 0, // Points to "Hyper Text Markup Language"
//             "explanation": "It's the standard markup language for creating web pages."
//         }
//     ]
// };


async function quizebot(topic, amount,level) { 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    const requestBody = {
        contents: [{
            parts: [{
                text: `Generate a ${level} level quiz on the topic of "${topic}" with exactly ${amount} MCQs.

Requirements:
1. The questions must be appropriate for a ${level} difficulty. 
   - Easy: Basic facts and common knowledge.
   - Medium: Conceptual understanding and some detail.
   - Hard: Advanced theories, obscure facts, and complex analysis.

2. Return ONLY a raw JSON array of objects. Do not include markdown code blocks, backticks, or any introductory text.

3. Structure:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "answer": index (0-3),
    "explanation": "string"
  }
]`
            }]
        }],
        generationConfig: { responseMimeType: "application/json" }// removes the unnecessary response from gemini 
    };

    try {
        const Api_response = await fetch(url, {// fetching to gemini
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!Api_response.ok) {// here it is checking the data inside the Api_response is usable or not 
            console.error("GOOGLE API ERROR:", Api_response);
            alert("Google API Error! Check the console.");
            return null; // Return null safely
        }
        const full_Api_response = await Api_response.json(); 

      
        
        // const full_Api_response = await Api_response.json();// gemini=>full_api_response
        // alway's read once from json or from api .else it will throw error like body has already had been consumed 
       

       // safety fail check :if the response is not there it mean ,something is wrong with API
       

        const aiRawText = full_Api_response.candidates[0].content.parts[0].text;// pin pointing the location of question inside the full_api_response
        if (aiRawText.includes("```")) {
    // Note: Ensure rawData is actually the 'response' variable here
        aiRawText = aiRawText.replace(/```json|```/g, "").trim();
        }
        const quizArray = JSON.parse(aiRawText);// converst the data to the usable form 

        // gemini=>full_api_response=>aiText(in string form)=>quizArray(useable format)=>
        return quizArray;// will return the raw data of questions , options and asnwers 

    } catch (error) {
        console.error("Fetch completely failed:", error);
        return null;
    }
}

 // gemini=>full_api_response=>aiText(in string form)=>quiz_Array(useable format)=>rawdata=>QuizManager(rawdata)=>this.questions=>
    //=>fresh_quesion=>fresh_question.answer 0r fresh_question.question 0r fresh_question.options(optionText,index)
async function fetchWithBackoff(url, options, retries = 5, delay = 1000) {// to deal with the frequent backoff's too much 
  try {
    const response = await fetch(url, options);

    if (response.status === 429) {
      if (retries > 0) {
        console.warn(`Rate limited. Retrying in ${delay}ms...`);
        
        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry: Double the delay (exponential) and subtract one retry attempt
        return fetchWithBackoff(url, options, retries - 1, delay * 2);
      } else {
        throw new Error("Max retries reached. Please wait a few minutes.");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
}


class QuizManager {
    constructor(rawdata) {
        this.user=UserProfile;
        this.questions = rawdata;
        this.currentIndex = 0;
        this.score = 0;
        this.timerinterval=null;
        this.container2=document.getElementById('quiz-result');
    }
 timer(seconds){

        const timeDisplay=document.getElementById('time-left');

        if (timeDisplay) {
        timeDisplay.style.color = "red";
        p("Connection Success: Found the timer element!");
    } else {
        console.error("Connection Failed: Could not find 'time-left' in HTML.");
        return; // Stop the function so it doesn't crash
    }

        let timesleft=seconds;
        timeDisplay.innerText=timesleft;
        this.timeInterval=setInterval(()=>{
            timesleft--;
            timeDisplay.innerText=timesleft;
            if(timesleft<=0){
                this.stoptimer();
                 this.showScore();
            this.user.updatestats(this.score);
                
            }
        },1000)
    }
    stoptimer(){
        clearInterval(this.timeInterval);
        console.log('timer stop at zero ')

    }

    selectAnswer(e) {
        const fresh_question = this.questions[this.currentIndex]; 
        if (!fresh_question) return;

        // const comment_box=document.getElementById('quiz-result');

        const selectedanswer = parseInt(e.target.dataset.index);
        const correctIndex = fresh_question.answer;

        document.body.classList.remove('correct','wrong');

        if (correctIndex === selectedanswer) {
            this.score++;
            document.body.classList.add('correct');
            this.container2.innerHTML = `<strong>✅ Correct!</strong><br>${fresh_question.explanation}`;
            
        } else {
            document.body.classList.add('wrong');
            this.container2.innerHTML = `<strong>❌ Incorrect.</strong><br>${fresh_question.explanation}`;
        }
        this.container2.style.display='block';
        document.getElementById('next-btn').classList.remove('hide');
        this.disableButtons();// to avoid the double click 
    }

    button(optionText, index) {
        const button = document.createElement('button');
        button.innerText = optionText;
        button.classList.add('btn');
        button.dataset.index = index;
        button.addEventListener('click', (e) => this.selectAnswer(e));
        return button;
    }

    nextquestion() {
        this.currentIndex++; 
    }

    show_question() {
        if (this.currentIndex >= this.questions.length) {
            this.showScore();
            this.user.updatestats(this.score);
            this.stoptimer();
            return;
        }

        const question_container = document.getElementById('question');
        const button_container = document.querySelector('.btn-grid');
        const fresh_question = this.questions[this.currentIndex];

        question_container.innerText = fresh_question.question;
        button_container.innerHTML = ""; 

        fresh_question.options.forEach((optionText, index) => {
            const btn = this.button(optionText, index);
            button_container.appendChild(btn);
        });
    }

    showScore() {
        const question_container = document.getElementById('question');
        const button_container = document.getElementById('btn-grid');
        question_container.innerText = `Quiz Finished! Your score: ${this.score}/${this.questions.length}`;
        button_container.innerHTML = `<button class="btn" onclick="location.reload()">Restart Quiz</button>`;
    }
    disableButtons(){
        const buttons = document.querySelectorAll('#btn-grid button');
        buttons.forEach(btn => {
        btn.disabled = true;btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.8'; 
    });

    }
}



document.getElementById('generate-quiz-btn').addEventListener('click',async()=>{
    const topic=document.getElementById('topic-input').value||'General Knowledge';
    const amount=document.getElementById('quantity-input').value;
    const level=document.getElementById('difficulty-input').value;

    T=1;
    p(level);
    switch(level){
        case 'easy':
            T=8;// 8 sec for easy question 
            break;
        case 'medium':
            T=12;// 12 sec for medium level question
            break;
        case 'hard':
            T=18;//18 sec for hard level question
            break;
        default:
            T=10;// 10 sec for any other scenario
            break;
    }


    const btn = document.getElementById('generate-quiz-btn');
    time=T*amount;
    const loader=document.getElementById('quiz-loader');

    
     btn.classList.add('hide');
     loader.classList.remove('hide');
   
    // now calling the gemini
    try{
        const generated_question= await quizebot(topic,amount,level);
        
        if(generated_question&&generated_question.length>0){
            document.getElementById('game-setting').classList.add('hide');// remove that page 
            document.getElementById('quiz-page').classList.remove('hide');// unhide quiz page


            start_game(generated_question,time);
            p(`Started ${level} quiz on ${topic}`);
        }else {
            alert("The AI had trouble generating that specific quiz. Try a simpler topic!");
        }


    }catch(err){
        console.error("Quiz start Error",err);
        alert("Connection has lost please try again");


    }finally {
        btn.innerText = "Generate Quiz ✨";
        btn.disabled = false;
    }
    

   


})

function start_game(data,time){
    if(!data){
        p("Stopping the game because data is empty");
        return 0;
    }

    const myQuiz=new QuizManager(data);// feeding the data to the quiz manager
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');

     document.getElementById('start-btn').addEventListener('click', () => {// for the start button 
        document.querySelector('.controls').classList.add('hide');
        document.getElementById('question').classList.remove('hide');
        myQuiz.timer(time);
        myQuiz.show_question();
    });

    document.getElementById('next-btn').addEventListener('click', () => {// for the next button 
        document.body.classList.remove('correct', 'wrong'); 
        document.getElementById('next-btn').classList.add('hide'); 
        myQuiz.nextquestion(); 
        myQuiz.show_question(); 
    });



}
     




