import { expect, Locator, Page } from '@playwright/test';
import { injectAxe , checkA11y } from 'axe-playwright'



export class Scenario {

    async Scenario_Login(page : Page) {



        

        await checkA11y(page , undefined , {

            detailedReport : true, 
            detailedReportOptions: { html: true },

            axeOptions : {

                runOnly : { 

                    type : 'tag',
                    values : ['wcag2a' , 'wcag2aa'],
                }
            }

        
            

        })

        await page.waitForTimeout(2000);
        await page.locator('xpath=//input[@name="Email"]').fill('test_cu2@neom.com')
        await page.waitForTimeout(2000);
        await page.locator('xpath=//input[@name="Password"]').fill('ABab22$')
        await page.waitForTimeout(2000);
        await page.locator('xpath=//button[@name="Login"]').click()
        await page.waitForTimeout(2000);

    }





}

