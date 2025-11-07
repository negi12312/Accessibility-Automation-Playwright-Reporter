import { test } from '@playwright/test'
import { injectAxe , checkA11y } from 'axe-playwright'

test.describe('Playwright Accessibility Test', () => {


    test('check 1' , async ({page}) => {

        //await page.goto('https://www.washington.edu/accesscomputing/AU/before.html')
        await page.goto('https://discover.btsmomenta.com/#/auth/login')
        await injectAxe(page)

        

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
    })
              });