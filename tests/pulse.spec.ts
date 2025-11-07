import { test } from '@playwright/test'
import { injectAxe , checkA11y } from 'axe-playwright'
import { AccessibilityCheck } from './accessibilitycheck.spec'

test.describe('Playwright Accessibility Test', () => {

    const ts = new AccessibilityCheck();


    test(' Test Server ' , async ({page}) => {


        await page.waitForTimeout(5000);
        await page.goto('https://techqa.btspulse.com/wizer/Wizer/')

        await page.waitForTimeout(10000);


        try {

            await ts.checkAccessibility(page); 

        }

        catch(error)
        {


            console.log('Accessibility violation has been detected ' , error)

            

        }
        finally{
                
            await page.waitForTimeout(2000);
        }

        //await ts.checkAccessibility(page); 

        await page.waitForTimeout(5000);

        await page.waitForTimeout(5000);
        await page.locator('xpath=//input[@placeholder="Enter your User Name"]').fill('Rohith.Kunnumakara@bts.com')
        await page.waitForTimeout(5000);

        await page.waitForTimeout(5000);
        await page.locator('xpath=//input[@placeholder="Enter your Password"]').fill('bts@12345')
        await page.waitForTimeout(5000);

        await page.locator('xpath=//button[@id="login"]').click();
        await page.waitForTimeout(10000);

        try {

            await ts.checkAccessibility(page); 

        }

        catch(error)
        {


            console.log('Accessibility violation has been detected ' , error)


        }
        finally{
                
            await page.waitForTimeout(2000);
        }

        //await ts.checkAccessibility(page);

        await page.waitForTimeout(5000);
        await page.locator('xpath=//div[@class="appSelect greySelectbox contentTable"]').click();
        await page.waitForTimeout(10000);

        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(5000);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(5000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);

        // await page.waitForTimeout(5000);
        // await page.locator('xpath=//select[@id="participation"]').click();
        // await page.waitForTimeout(10000);

        // await page.keyboard.press('ArrowDown');
        // await page.waitForTimeout(5000);
        // await page.keyboard.press('ArrowDown');
        // await page.waitForTimeout(5000);
        // await page.keyboard.press('Enter');
        // await page.waitForTimeout(5000);

        await page.locator('xpath=//input[@id="Submit1"]').click();
        await page.waitForTimeout(10000);

        try {

            await ts.checkAccessibility(page); 

        }

        catch(error)
        {


            console.log('Accessibility violation has been detected ' , error)


        }
        finally{
                
            await page.waitForTimeout(2000);
        }

        //await ts.checkAccessibility(page);

        await page.waitForTimeout(10000);
        await page.locator('xpath=//li[@id="menuUserAdminstration"]').click();
        await page.waitForTimeout(10000);

        try {

            await ts.checkAccessibility(page); 

        }

        catch(error)
        {


            console.log('Accessibility violation has been detected ' , error)


        }
        finally{
                
            await page.waitForTimeout(2000);
        }

        //await ts.checkAccessibility(page);

        await page.waitForTimeout(10000);
        await page.locator('xpath=//li[@id="menuAuthoring"]').click();
        await page.waitForTimeout(10000);

        try {

            await ts.checkAccessibility(page); 

        }

        catch(error)
        {


            console.log('Accessibility violation has been detected ' , error)

        }
        finally{
                
            await page.waitForTimeout(2000);
        }

        //await ts.checkAccessibility(page);

        await page.waitForTimeout(10000);

    

    })


})

