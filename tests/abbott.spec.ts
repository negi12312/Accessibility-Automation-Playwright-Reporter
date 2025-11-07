import { test } from '@playwright/test'
import { injectAxe , checkA11y } from 'axe-playwright'
import { AccessibilityCheck } from './accessibilitycheck.spec'

test.describe('Playwright Accessibility Test', () => {

    const ts = new AccessibilityCheck();


    test(' Test Server ' , async ({page}) => {

        // ----------------- Checks for the login page ----------------- // 

        await page.waitForTimeout(5000);
        await page.goto('https://chevrontest.btsmomenta.com/#/auth/login')

        await ts.checkAccessibility(page); 
         
        // await injectAxe(page)

        

        // await checkA11y(page , undefined , {

        //     detailedReport : true, 
        //     detailedReportOptions: { html: true },

        //     axeOptions : {

        //         runOnly : { 

        //             type : 'tag',
        //             values : ['wcag2a' , 'wcag2aa'],
        //         }
        //     }

            

        // })

        // --------------- Checks for the Preferred Language ----------------- //

        await page.waitForTimeout(5000);
        await page.locator('xpath=//input[@name="Email"]').fill('freshuser1@chevron.com')
        await page.waitForTimeout(5000);

        // await page.locator('xpath=//button[@aria-label="next"]').click();
        // await page.waitForTimeout(10000);



        await page.locator('xpath=//input[@name="Password"]').fill('ABab12$')
        await page.waitForTimeout(5000);

        await page.locator('xpath=//button[@aria-label="Login"]').click();
        await page.waitForTimeout(10000);
       
        await ts.checkAccessibility(page); 

        // await injectAxe(page)

        

        // await checkA11y(page , undefined , {

        //     detailedReport : true, 
        //     detailedReportOptions: { html: true },

        //     axeOptions : {

        //         runOnly : { 

        //             type : 'tag',
        //             values : ['wcag2a' , 'wcag2aa'],
        //         }
        //     }

            

        // })
        
        await page.waitForTimeout(5000);

        //await page.locator('xpath=//a[@class="mat-list-item mat-focus-indicator plugin-sidenav__items focus-menu-list myJourney ng-star-inserted"]').click();
        //await page.waitForTimeout(10000);


        // ------------- Stage Page Check ----------------- //

        await page.locator('xpath=(//*[@class="mat-list-item-content"])[2]').click();
        await page.waitForTimeout(10000);

        await ts.checkAccessibility(page); 

        // await checkA11y(page , undefined , {

        //     detailedReport : true, 
        //     detailedReportOptions: { html: true },

        //     axeOptions : {

        //         runOnly : { 

        //             type : 'tag',
        //             values : ['wcag2a' , 'wcag2aa'],
        //         }
        //     }

            

        // })

        await page.waitForTimeout(5000);

        // ------------- 1st Activity Check ----------------- // 

        await page.locator('xpath=(//button[@name="Start ENUS"])[1]').click();
        await page.waitForTimeout(10000);

        await page.locator('xpath=(//button[@name="start enus"])[1]').click();
        await page.waitForTimeout(10000);

        await ts.checkAccessibility(page); 


        // await checkA11y(page , undefined , {

        //     detailedReport : true, 
        //     detailedReportOptions: { html: true },

        //     axeOptions : {

        //         runOnly : { 

        //             type : 'tag',
        //             values : ['wcag2a' , 'wcag2aa'],
        //         }
        //     }

            

        // })

        await page.waitForTimeout(5000);

        await page.locator('xpath=(//button[@aria-label="Next activity"])[1]').click();
        await page.waitForTimeout(10000);

        await ts.checkAccessibility(page); 

        // // ------------- 2nd Activity Check ----------------- // 

        // await checkA11y(page , undefined , {

        //     detailedReport : true, 
        //     detailedReportOptions: { html: true },

        //     axeOptions : {

        //         runOnly : { 

        //             type : 'tag',
        //             values : ['wcag2a' , 'wcag2aa'],
        //         }
        //     }

            

        // })

        await page.waitForTimeout(5000); 

        await page.locator('xpath=(//label[@class="mat-radio-label"])[1]').click();
        await page.waitForTimeout(10000);

        await page.locator('xpath=//button[@aria-label="Submit Answer"]').click();
        await page.waitForTimeout(10000);



        await page.locator('xpath=(//button[@aria-label="Next activity"])[1]').click();
        await page.waitForTimeout(10000);

        await ts.checkAccessibility(page); 

        // ------------- 3rd Activity Check ----------------- //

        // await checkA11y(page , undefined , {

        //     detailedReport : true, 
        //     detailedReportOptions: { html: true },

        //     axeOptions : {

        //         runOnly : { 

        //             type : 'tag',
        //             values : ['wcag2a' , 'wcag2aa'],
        //         }
        //     }

            

        // })

        await page.waitForTimeout(5000); 

        await page.locator('xpath=//div[@class="mat-select-trigger ng-tns-c174-25"]').click();
        await page.waitForTimeout(10000);

        await ts.checkAccessibility(page); 

        // await checkA11y(page , undefined , {

        //     detailedReport : true, 
        //     detailedReportOptions: { html: true },

        //     axeOptions : {

        //         runOnly : { 

        //             type : 'tag',
        //             values : ['wcag2a' , 'wcag2aa'],
        //         }
        //     }

            

        // })

        await page.waitForTimeout(5000); 

        await page.locator('xpath=//mat-option[@aria-label="Option 1"]').click();
        await page.waitForTimeout(10000);

        await page.keyboard.press('Escape');
        await page.waitForTimeout(5000);

        await page.locator('xpath=(//button[@aria-label="Next page"])[1]').click();
        await page.waitForTimeout(10000);

        // ------------- Congratulations Page Check ----------------- //

















    })

    






              });