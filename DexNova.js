const axios = require('axios');
const readline = require('readline');

//DexNova by Dexter Sitwell, Deccatron

const API_TOKEN = 'Replace with your Hugging Face API token...';

// The API URL for Llama 3.2-1B model
const API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct";

// Conversation history for better context in responses
let conversationHistory = [];

// Function to query the Hugging Face API with retry mechanism
async function queryLlama(prompt, retryCount = 3) {
    try {
        const response = await axios.post(
            API_URL,
            {
                inputs: prompt,
                options: { wait_for_model: true },
                parameters: {
                    max_new_tokens: 100,          // Adjust token count based on the interaction
                    repetition_penalty: 1.2       // Slightly penalize repetitive phrases for creativity
                }
            },
            {
                headers: { Authorization: `Bearer ${API_TOKEN}` }
            }
        );
        const botResponse = response.data[0].generated_text.trim();
        conversationHistory.push({ user: prompt, bot: botResponse });
        console.log(`Bot: ${botResponse}\n`);
    } catch (error) {
        if (retryCount > 0) {
            console.log(`Error occurred: ${error.response?.status}. Retrying... (${3 - retryCount + 1}/3)`);
            return queryLlama(prompt, retryCount - 1);
        } else {
            console.error("Failed to query Llama 3.2-1B after 3 attempts:", error.response?.status, error.response?.statusText);
        }
    }
}

// Set up readline to allow user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to handle user interaction
function askQuestion() {
    rl.question('Ask your question (or type "exit" to leave): ', (userInput) => {
        if (userInput.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            rl.close();
            return;
        }

        // Add the user's input to the conversation history
        const prompt = createPrompt(userInput);

        // Query the API with the user's input
        queryLlama(prompt).then(() => {
            askQuestion(); // Prompt the user for the next question
        });
    });
}

// Function to create a prompt by using conversation history
function createPrompt(userInput) {
    let prompt = "You are a helpful AI bot. Continue this conversation:\n";
    conversationHistory.forEach(exchange => {
        prompt += `User: ${exchange.user}\nBot: ${exchange.bot}\n`;
    });
    prompt += `User: ${userInput}\nBot:`;
    return prompt;
}

// Start the bot interaction
console.log(' ')
console.log("Hey there im DexNova ask me anything!");
console.log(' ')
askQuestion();
