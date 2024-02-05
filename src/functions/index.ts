/*import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { GetStudentInfo, capitalizeFirstLetter } from "./models/Student"

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/getStudent', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const studentInfo = await GetStudentInfo(username, password);

    if (studentInfo) {
        if(studentInfo.FirstName === null){
            res.status(400).json({ error: 'Incorrect Credentials or student not found.' });
        }else{
            res.status(200).json(studentInfo);
        }
    } else {
      res.status(404).json({ error: 'Student information not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    app(req, context.res as any); // Use 'as any' due to type mismatch

    context.done();
};

export default httpTrigger;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
*/


import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { GetStudentInfo } from "./models/Student"
import { Student } from "./types/myType";

export async function getStudent(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as { username: string; password: string };
        const { username, password } = body;
        const studentInfo : Student= await GetStudentInfo(username, password);

        if(studentInfo.FirstName === null){
           return {
            status: 400,
            jsonBody: { error: 'Incorrect User Or Password or user not found' },
          };
        }

        return {
            status: 200,
            jsonBody: studentInfo,
        };
    } catch (error) {
        // Handle parsing or other errors
        context.log(`Error processing request: ${error}`);
        return {
            status: 500,
            jsonBody: { error: 'Internal Server Error' },
        };
    }
}

app.http('getStudent', {
    route: "getStudent",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: getStudent
});