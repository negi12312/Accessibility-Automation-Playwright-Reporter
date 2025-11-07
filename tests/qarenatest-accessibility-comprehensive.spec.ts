import { test, expect } from '@playwright/test';
import { QarenatestAccessibilitySteps } from '../pageObjects/QarenatestAccessibilitySteps.page';

test.describe('Qarenatest.btsmomenta.com Comprehensive Accessibility Test Suite', () => {
    let accessibilitySteps: QarenatestAccessibilitySteps;
    const allResults: any[] = [];
    const allViolations: any[] = [];

    test.beforeEach(async ({ page }) => {
        accessibilitySteps = new QarenatestAccessibilitySteps(page);
    });

    test('Complete Accessibility Scan and Report Generation', async ({ page }) => {
        const testSteps = [
            { 
                name: 'home-page', 
                url: 'https://qarenatest.btsmomenta.com/',
                description: 'Main homepage',
                navigateFunction: () => accessibilitySteps.navigateToHomepage()
            },
            { 
                name: 'login-page', 
                url: 'https://qarenatest.btsmomenta.com/#/auth/login',
                description: 'Login page',
                navigateFunction: () => accessibilitySteps.navigateToLoginPage()
            },
            { 
                name: 'register-page', 
                url: 'https://qarenatest.btsmomenta.com/#/auth/register',
                description: 'Registration page',
                navigateFunction: () => accessibilitySteps.navigateToRegisterPage()
            },
            { 
                name: 'forgot-password', 
                url: 'https://qarenatest.btsmomenta.com/#/auth/forgot-password',
                description: 'Forgot password page',
                navigateFunction: () => accessibilitySteps.navigateToForgotPasswordPage()
            }
        ];

        // Execute each test step with comprehensive accessibility checking
        for (const step of testSteps) {
            console.log(`\n🔍 Scanning: ${step.description} (${step.url})`);
            
            try {
                // Step: Navigate to the page
                await step.navigateFunction();
                
                // Step: Take full page screenshot
                await accessibilitySteps.takeFullPageScreenshot(step.name);
                
                // Step: Run basic accessibility check
                await accessibilitySteps.runBasicAccessibilityCheck();
                
                // Step: Run comprehensive accessibility scan
                const accessibilityScanResults = await accessibilitySteps.runComprehensiveAccessibilityScan();
                
                // Store results
                allResults.push({
                    step: step.name,
                    url: step.url,
                    description: step.description,
                    results: accessibilityScanResults
                });
                
                allViolations.push(...accessibilityScanResults.violations.map(v => ({
                    ...v,
                    page: step.name,
                    url: step.url
                })));

                // Step: Generate detailed HTML report for this page
                await accessibilitySteps.generateDetailedHtmlReport(
                    accessibilityScanResults, 
                    step.name, 
                    step.url
                );
                
                console.log(`✅ Completed: ${step.name} - ${accessibilityScanResults.violations.length} violations found`);
                
            } catch (error) {
                console.log(`❌ Error scanning ${step.name}:`, error);
            }
        }

        // Step: Generate comprehensive final report
        console.log('\n📊 Generating comprehensive final report...');
        await accessibilitySteps.generateComprehensiveFinalReport(allResults, allViolations);

        // Step: Generate axe-html-reporter format report
        const allPasses = allResults.flatMap(r => r.results.passes);
        const allIncomplete = allResults.flatMap(r => r.results.incomplete);
        await accessibilitySteps.generateAxeHtmlReport(allViolations, allPasses, allIncomplete);

        // Step: Verify reports were generated
        await accessibilitySteps.verifyReportsGenerated();

        // Step: Print accessibility summary
        await accessibilitySteps.printAccessibilitySummary(allResults, allViolations);

        // Assertions
        expect(allResults.length).toBeGreaterThan(0);
        console.log(`\n🎯 Test completed successfully with ${allResults.length} pages scanned`);
    });

    test('Individual Page Accessibility Tests', async ({ page }) => {
        // Test individual page navigation and accessibility
        const pages = [
            { name: 'homepage', navigate: () => accessibilitySteps.navigateToHomepage() },
            { name: 'login', navigate: () => accessibilitySteps.navigateToLoginPage() },
            { name: 'register', navigate: () => accessibilitySteps.navigateToRegisterPage() },
            { name: 'forgot-password', navigate: () => accessibilitySteps.navigateToForgotPasswordPage() }
        ];

        for (const pageTest of pages) {
            console.log(`\n🔍 Testing ${pageTest.name} page accessibility...`);
            
            // Navigate to page
            await pageTest.navigate();
            
            // Take screenshot
            await accessibilitySteps.takeFullPageScreenshot(`individual-${pageTest.name}`);
            
            // Run accessibility scan
            const results = await accessibilitySteps.runComprehensiveAccessibilityScan();
            
            // Verify page loaded successfully
            expect(results).toBeDefined();
            expect(results.violations).toBeDefined();
            expect(results.passes).toBeDefined();
            
            console.log(`✅ ${pageTest.name} page: ${results.violations.length} violations, ${results.passes.length} passes`);
        }
    });

    test('Accessibility Report Validation', async ({ page }) => {
        // Navigate to homepage for report validation
        await accessibilitySteps.navigateToHomepage();
        
        // Run comprehensive scan
        const results = await accessibilitySteps.runComprehensiveAccessibilityScan();
        
        // Generate report
        const reportPath = await accessibilitySteps.generateDetailedHtmlReport(
            results, 
            'validation-test', 
            'https://qarenatest.btsmomenta.com/'
        );
        
        // Verify report was created
        expect(reportPath).toBeDefined();
        console.log(`✅ Report validation completed: ${reportPath}`);
    });
});
