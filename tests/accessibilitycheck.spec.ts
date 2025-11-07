import { injectAxe , checkA11y } from 'axe-playwright'



export class AccessibilityCheck 

{
    async checkAccessibility(page : any)
    {
        
         await injectAxe(page)
        
                
        
                await checkA11y(page , undefined , {
                    detailedReport: true,
                    detailedReportOptions: { html: true },

                    axeOptions: {
                        iframes: true,

                        runOnly: {
                            type: 'tag',
                            values: ['wcag2a', 'wcag2aa'],
                        },

                        rules: {
                            'color-contrast': { enabled: false },
                        }
                    },
                    verbose: true
                })


}
}