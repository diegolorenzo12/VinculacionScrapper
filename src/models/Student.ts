const puppeteer = require("puppeteer-extra")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")
import { Browser } from "puppeteer"
import { Student } from "../types/myType"

puppeteer.use(StealthPlugin());

const {executablePath} = require("puppeteer");

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const GetStudentInfo = async (username:string, password:string) => {
    const browser: Browser = await puppeteer.launch({headless: true, executablePath: executablePath()})
    const page = await browser.newPage()

    let FirstName: string| null = null;
    let LastNameP: string| null = null;
    let LastNameM: string| null = null;
    let Email: string | null = null;
    let Cel: number | null = null;
    let Mayor: String| null = null;


    //LOGIN
    const LoginUrl = "https://micampus.mxl.cetys.mx/portal/authsec/portal/default/default?loginheight=0"
    await page.goto(LoginUrl)
    //console.log('Navigated to portal cetys login');
    
    const usernameInputSelector = 'input[name="j_username"]';
    await page.waitForSelector(usernameInputSelector);
    await page.type(usernameInputSelector, username);
    //console.log('Username Typed');

    const passwordInputSelector = 'input[name="j_password"]';
    await page.waitForSelector(passwordInputSelector);
    await page.type(passwordInputSelector, password);
    //console.log('Password Typed');

    const loginButtonSelector = '.login-button';
    await page.click(loginButtonSelector);

    //HANDLE LOGIN ERROR
    const errorMessageSelector = '.error-message';
    const isErrorMessageVisible = await page.waitForSelector(errorMessageSelector, { visible: true, timeout: 3000 })
    .then(() => true)
    .catch(() => false);
    if (isErrorMessageVisible) {
        //console.error('Authentication failed. Incorrect username or password.');
        // Handle the error (e.g., take a screenshot, throw an error, etc.)
    } else {
        //LOGIN SUCCESFULL
        //console.log('Authentication successful. Navigating to the next page.');
    
        await page.goto("https://micampus.mxl.cetys.mx/portal/authsec/portal/default/Academico/Plan+de+estudios")        

        //Extract Program 
        const ProgramHandle = await page.$('#regionB > div > table > tbody > tr:nth-child(2) > td.portlet-body > div > div > table:nth-child(2) > tbody > tr:nth-child(2) > td:nth-child(1) > font');

        if (ProgramHandle) {
            // Element found, you can interact with it or extract information
            const textContent = await page.evaluate(element => element.textContent, ProgramHandle);
            if(textContent && textContent !== null){
                Mayor = textContent.replace('Programa: ', '').trim();;
                //console.log('Estudias:', Mayor);
            }else{
                //console.log('Programa not found');
            }
        } else {
            //console.error('Element not found.');
        }

        //Extract Name
        const NameElementHandle = await page.$('#regionB > div > table > tbody > tr:nth-child(2) > td.portlet-body > div > div > table:nth-child(3) > tbody > tr > td:nth-child(4) > font');

        if (NameElementHandle) {
            const firstElementText = await page.evaluate(element => element.textContent, NameElementHandle);
            if(firstElementText && firstElementText !== null){
                const ExtractedFullName = firstElementText;
                console.log('ExtractedFullName:', ExtractedFullName);
                const ArrayFullName = ExtractedFullName.split(',');
                LastNameP = capitalizeFirstLetter(ArrayFullName[0].split(' ')[0].trim());
                LastNameM = capitalizeFirstLetter(ArrayFullName[0].split(' ')[1].trim());
                FirstName = capitalizeFirstLetter(ArrayFullName[1].trim());

                //console.log("lastname P:", LastNameP);
                //console.log("lastname M:", LastNameM);
                //console.log("FirstName:", FirstName);

            }else{
                //console.log('Name not found');
            }
        } else {
            //console.error('First element not found.');
        }

        //Navigate to Datos Generales
        await page.goto("https://micampus.mxl.cetys.mx/portal/authsec/portal/default/Academico/Datos+generales")

        //EXTRACT EMAIL
        const emailElementHandle = await page.$("#center > div > table > tbody > tr:nth-child(2) > td.portlet-body > div > table:nth-child(3) > tbody > tr:nth-child(6) > td:nth-child(2) > font")
        if (emailElementHandle) {
            // Element found, you can interact with it or extract information
            const textContent = await page.evaluate(element => element.textContent, emailElementHandle);
            if(textContent && textContent !== null){
                Email = textContent.replace('Correo Institucional:', '').trim().toLowerCase();
                //console.log('Tu correo es:', Email);
            }else{
                //console.log('email not found');
            }
        } else {
            //console.error('Element not found.');
        }

        //EXTRACT CELPHONE
        const CelElementHandle = await page.$("#center > div > table > tbody > tr:nth-child(2) > td.portlet-body > div > table:nth-child(3) > tbody > tr:nth-child(5) > td:nth-child(2) > font")
        if (CelElementHandle) {
            // Element found, you can interact with it or extract information
            const textContent = await page.evaluate(element => element.textContent, CelElementHandle);
            if(textContent && textContent !== null){
                Cel = parseInt(textContent.replace('Teléfono Celular:', '').trim(), 10);
                //console.log('Tu telefono es:', Cel);
            }else{
                //console.log('telefono not found');
            }
        } else {
            //console.error('Element not found.');
        }
    }
    await browser.close();

    const studentInfo: Student = {
        FirstName: FirstName,
        LastNameP: LastNameP,
        LastNameM: LastNameM,
        Email: Email,
        Cel: Cel,
        Mayor: Mayor,
    }
    //console.log(studentInfo);
    return studentInfo;
}

//const studentInfo: Student =  GetStudentInfo(username, password);
