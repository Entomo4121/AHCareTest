
import{test, expect, Locator} from "@playwright/test";
 
 test("Verify Page Title and Login to adeahub web with Nurse Creds", async({page})=>
     {
     await page.goto("https://show.adeahub.co/provider/auth/login");
     let title:string = await page.title();
     console.log("Title is :" ,title)

     await page.getByText("Sign in to AdeaHub").click();
   
     await page.locator("//input[@id='username']").fill("nurse2@adeahub.co");   
     console.log("Username is Entered");

     await page.locator("//input[@id='password']").fill("Entomo@123");   
     console.log("Password is Entered");

     await page.getByRole("button", { name: "Sign In" }).click();
     console.log("Clicked on Sign In Button");

     await page.getByAltText("AdeaHub").isVisible();
     console.log("AdeaHub Logo is Visible");
     
     console.log("Login to AdeaHub Web with Nurse Creds is Successful");
 })
