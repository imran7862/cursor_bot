import { GoogleGenAI, Type } from "@google/genai";
import {exec} from "child_process";
import util from "util";
import os from "os";
import 'dotenv/config';
import readlineSync from 'readline-sync';
const platform = os.platform(); // which os platform we are using currenlty provide to LLM for command 
const execute = util.promisify(exec); // with the help of this execute we can run command provided by LLM in our Machinen
// Configure the client
const ai = new GoogleGenAI({});    // api key here we can put 
// Step 1 : Need to make tool so this tool execute command becasue executing command only we can create folder and files like mkdir calculator, touch calculator, echo for write paste code into thsese files 
//tool
 async function executeCommand({command})
 {
    try{
        // whatever error comes during execution of command these handle by the stderr (standard errors)
        // stdout means success of execution of this commnads
        const {stdout,stderr} = await execute(command);
        if(stderr){
            return `Error: ${stderr}`
        }
        return `success:${stdout}`
    }
    //whatever spelling mistae like error handle by this catch block 
    catch(err){
        return `Error:${err}`
    }
 }

 // step 2 : the tools actual what's doing we need to provide this information to our LLM
 const commandExecuter =
 {
    name:"executeCommand", // tool name/ function name
    description:"It takes any shell/terminal command and execute it. It will help us to create, read, write, update, delete any folder and file",
    parameters:
    {
        type:Type.OBJECT,
        properties:{
            command:{
                type:Type.STRING,
                description:"it is the terminal/shell command. Ex: mkdir calculator, touch calculator/index.js etc"
            }
        },
        required:['command']
    }
 }

 // Step 3 : Make LLM Model Agent 
const History = [];

async function buildWebsite() {

    
    while(true){

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: History,
        config: { 
         systemInstruction:` You are a website Builder, which will create the frontend part of the website using terminal/shell Command.
         You will give shell/terminal command one by one and our tool will execute it.

         Give the command according to the Operarting system we are using.
         My Current user Operating system is: ${platform}.

         Kindly use best practice for commands, it should handle multine write also efficiently.

         Your Job
         1: Analyse the user query
         2: Take the neccessary action after analysing the query by giving proper shell.command according to the user operating system.

         Step By Step By Guide

         1: First you have to create the folder for the website which we have to create, ex: mkdir calculator
         2: Give shell/terminal command to create html file , ex: touch calculator/index.html
         3: Give shell/terminal command to create CSS file 
         4: Give shell/terminal command to create Javascript file 
         5: Give shell/terminal command to write on html file 
         6: Give shell/terminal command to write on css file 
         7: Give shell/terminal command to write on javascript file
         8: fix the error if they are persent at any step by writing, update or deleting
         `
         ,

         tools: [
            {
                functionDeclarations:[commandExecuter]
            }
         ]
        },
    });


    if(result.functionCalls&&result.functionCalls.length>0){

        const functionCall = result.functionCalls[0];

        const { name, args } = functionCall;

        const toolResponse = await executeCommand(args);


        const functionResponsePart = {
            name: functionCall.name,
            response: {
                result: toolResponse,
            },
        };
    // Send the function response back to the model.
    History.push({
      role: "model",
      parts: [
        {
          functionCall: functionCall,
        },
      ],
    });

    History.push({
      role: "user",
      parts: [
        {
          functionResponse: functionResponsePart,
        },
      ],

    })
    }
    else{
        console.log(result.text);
        History.push({
            role:"model",
            parts:[{text:result.text}]
        });
        break;
    }

    }
}
// step : 4 input from user 
 while(true){

    const question = readlineSync.question("Ask me anything -->  ");
    
    if(question=='exit'){
        break;
    }
    
    History.push({
        role:'user',
        parts:[{text:question}]
    });
   
    await buildWebsite();

}
