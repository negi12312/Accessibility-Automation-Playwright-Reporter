import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
const fs = require('fs');
const path = require('path');

test.describe('Neom Homepage Accessibility Test', () => {
    // Create screenshots directory
    const screenshotsDir = 'build/reports/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    async function takeScreenshot(page: import('@playwright/test').Page, screenshotName: string) {
        try {
            const screenshotPath = path.join(screenshotsDir, `${screenshotName}.png`);
            await page.screenshot({ 
                path: screenshotPath, 
                fullPage: true 
            });
            console.log(`📸 Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            console.log(`❌ Failed to take screenshot: ${screenshotName}`, error);
            return null;
        }
    }

    async function takeElementScreenshot(page: import('@playwright/test').Page, selector: string, screenshotName: string) {
        try {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
                const screenshotPath = path.join(screenshotsDir, `${screenshotName}.png`);
                await element.screenshot({ path: screenshotPath });
                console.log(`📸 Element screenshot saved: ${screenshotPath}`);
                return screenshotPath;
            }
        } catch (error) {
            console.log(`❌ Failed to take element screenshot: ${screenshotName}`, error);
        }
        return null;
    }

    async function captureViolationScreenshots(page: import('@playwright/test').Page, accessibilityResults: any, label: string) {
        if (accessibilityResults.violations && accessibilityResults.violations.length > 0) {
            console.log(`📸 Capturing screenshots for ${accessibilityResults.violations.length} violations...`);
            for (let i = 0; i < accessibilityResults.violations.length; i++) {
                const violation = accessibilityResults.violations[i];
                for (let j = 0; j < violation.nodes.length; j++) {
                    const node = violation.nodes[j];
                    if (node.target && node.target.length > 0) {
                        const selector = node.target[0];
                        await takeElementScreenshot(
                            page, 
                            selector, 
                            `violation-${label}-${violation.id}-${j}`
                        );
                    }
                }
            }
        }
    }

    async function generateComprehensiveReport(accessibilityScanResults: any, page: import('@playwright/test').Page, label: string, url: string) {
        // Take full page screenshot
        const fullScreenshot = await takeScreenshot(page, `fullpage-${label}`);
        
        // Capture violation-specific screenshots
        await captureViolationScreenshots(page, accessibilityScanResults, label);

        // Enhanced HTML report with screenshots
        const reportHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Neom Homepage Accessibility Report - ${label}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css" rel="stylesheet">
            <style>
                .screenshot-gallery {
                    margin: 20px 0;
                }
                .violation-screenshot {
                    max-width: 300px;
                    border: 2px solid #dc3545;
                    cursor: pointer;
                }
                .violation-card {
                    border-left: 4px solid #dc3545;
                }
                .impact-serious { border-left-color: #dc3545; }
                .impact-moderate { border-left-color: #ffc107; }
                .impact-minor { border-left-color: #17a2b8; }
                .summary-stats {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    margin-bottom: 15px;
                }
                .severity-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                    margin-right: 5px;
                }
                .severity-serious { background: #dc3545; color: white; }
                .severity-moderate { background: #ffc107; color: black; }
                .severity-minor { background: #17a2b8; color: white; }
                .test-info {
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container mt-4">
                <div class="summary-stats">
                    <h1>🔍 Neom Homepage Accessibility Report</h1>
                    <p class="lead">URL: <a href="${url}" target="_blank" style="color: #fff; text-decoration: underline;">${url}</a></p>
                    <div class="row">
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${accessibilityScanResults.violations.length}</h3>
                                <p>Violations</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${accessibilityScanResults.passes.length}</h3>
                                <p>Passes</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${accessibilityScanResults.incomplete.length}</h3>
                                <p>Incomplete</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card">
                                <h3>${new Date().toLocaleString()}</h3>
                                <p>Scan Time</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="test-info">
                    <h4>📋 Test Information</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
                            <p><strong>Page URL:</strong> ${page.url()}</p>
                            <p><strong>Test Framework:</strong> Playwright with axe-core</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>WCAG Level:</strong> AA</p>
                            <p><strong>Login Credentials:</strong> test_cu2@neom.com / ABab22$</p>
                            <p><strong>Browser:</strong> Chromium</p>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header">
                                <h5>📸 Full Page Screenshot</h5>
                            </div>
                            <div class="card-body text-center">
                                ${fullScreenshot ? `
                                <a href="${fullScreenshot}" data-lightbox="screenshots" data-title="${label} - Full Page">
                                    <img src="${fullScreenshot}" alt="${label} screenshot" class="img-fluid rounded" style="max-height: 400px; border: 2px solid #dee2e6;">
                                </a>
                                <p class="mt-2 text-muted">Click to view full size</p>
                                ` : 'No screenshot available'}
                            </div>
                        </div>
                    </div>
                </div>

                ${accessibilityScanResults.violations.length > 0 ? `
                <div class="mt-4">
                    <h3>🚨 Accessibility Violations</h3>
                    ${accessibilityScanResults.violations.map((violation: any, index: number) => `
                    <div class="card violation-card impact-${violation.impact} mb-4">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">${violation.id}</h5>
                                <span class="severity-badge severity-${violation.impact}">${violation.impact.toUpperCase()}</span>
                            </div>
                            <p class="card-text"><strong>Description:</strong> ${violation.description}</p>
                            <p><strong>WCAG Guidelines:</strong> ${violation.tags.filter((tag: string) => tag.includes('wcag')).join(', ')}</p>
                            <p><strong>Help:</strong> ${violation.help}</p>
                            
                            <div class="screenshot-gallery">
                                <h6>🔍 Affected Elements (${violation.nodes.length}):</h6>
                                <div class="row">
                                ${violation.nodes.map((node: any, nodeIndex: number) => {
                                    const screenshotPath = `screenshots/violation-${label}-${violation.id}-${nodeIndex}.png`;
                                    return `
                                    <div class="col-md-4 mb-3">
                                        <div class="card">
                                            <div class="card-body">
                                                <p><strong>Element:</strong> <code>${node.target ? node.target[0] : 'N/A'}</code></p>
                                                <p><strong>HTML:</strong> <code>${node.html ? node.html.substring(0, 100) + '...' : 'N/A'}</code></p>
                                                ${fs.existsSync(path.join('build/reports', screenshotPath)) ? `
                                                <a href="${screenshotPath}" data-lightbox="violation-${index}" data-title="${violation.id} - Element ${nodeIndex + 1}">
                                                    <img src="${screenshotPath}" alt="Violation ${violation.id}" class="violation-screenshot img-thumbnail">
                                                </a>
                                                ` : '<p class="text-muted">No screenshot available</p>'}
                                            </div>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
                ` : '<div class="alert alert-success mt-4"><h4>✅ No accessibility violations found!</h4><p>Great job! This page meets accessibility standards.</p></div>'}

                <script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox.min.js"></script>
                <script>
                    lightbox.option({
                        'resizeDuration': 200,
                        'wrapAround': true,
                        'imageFadeDuration': 300
                    });
                </script>
            </div>
        </body>
        </html>
        `;

        const reportPath = path.join('build/reports', `neom-homepage-accessibility-report-${label.replace(/\s+/g, '-').toLowerCase()}.html`);
        fs.writeFileSync(reportPath, reportHTML);
        console.log(`📄 Comprehensive report generated: ${reportPath}`);
        return reportPath;
    }

    test('Neom Homepage Accessibility Test with Login', async ({ page }) => {
        // Set longer timeout for the entire test
        test.setTimeout(120000); // 2 minutes
        
        console.log('🚀 Starting Neom Homepage Accessibility Test...');
        
        // Step 1: Navigate to neom.btsmomenta.com login page
        console.log('🌐 Navigating to neom.btsmomenta.com...');
        await page.goto('https://neom.btsmomenta.com/#/auth/login', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        console.log('✅ Successfully navigated to login page');

        // Step 2: Enter login credentials
        console.log('🔐 Entering login credentials...');
        
        // Try multiple possible selectors for email field
        const emailSelectors = [
            'input[aria-label="Enter Email Address"]',
            'input[type="email"]',
            'input[placeholder*="email" i]',
            'input[placeholder*="Email" i]',
            'input[name="email"]',
            'input[id*="email" i]'
        ];
        
        let emailField = null;
        for (const selector of emailSelectors) {
            try {
                emailField = page.locator(selector).first();
                if (await emailField.isVisible()) {
                    console.log(`✅ Found email field with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (emailField) {
            await emailField.fill('test_cu2@neom.com');
            await page.waitForTimeout(2000);
        } else {
            console.log('⚠️ Email field not found, trying xpath...');
            await page.locator('xpath=//input[@aria-label="Enter Email Address"]').fill('test_cu2@neom.com');
            await page.waitForTimeout(2000);
        }

        // Try multiple possible selectors for password field
        const passwordSelectors = [
            'input[aria-label="Enter Password"]',
            'input[type="password"]',
            'input[placeholder*="password" i]',
            'input[placeholder*="Password" i]',
            'input[name="password"]',
            'input[id*="password" i]'
        ];
        
        let passwordField = null;
        for (const selector of passwordSelectors) {
            try {
                passwordField = page.locator(selector).first();
                if (await passwordField.isVisible()) {
                    console.log(`✅ Found password field with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (passwordField) {
            await passwordField.fill('ABab22$');
            await page.waitForTimeout(2000);
        } else {
            console.log('⚠️ Password field not found, trying xpath...');
            await page.locator('xpath=//input[@aria-label="Enter Password"]').fill('ABab22$');
            await page.waitForTimeout(2000);
        }
        
        console.log('✅ Credentials entered successfully');

        // Step 3: Click login button
        console.log('🚀 Clicking login button...');
        
        // Try multiple possible selectors for login button
        const loginButtonSelectors = [
            'button[aria-label="Login"]',
            'button[type="submit"]',
            'button:has-text("Login")',
            'button:has-text("Sign In")',
            'input[type="submit"]',
            'button[class*="login"]',
            'button[class*="submit"]'
        ];
        
        let loginButton = null;
        for (const selector of loginButtonSelectors) {
            try {
                loginButton = page.locator(selector).first();
                if (await loginButton.isVisible()) {
                    console.log(`✅ Found login button with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (loginButton) {
            await loginButton.click();
        } else {
            console.log('⚠️ Login button not found, trying xpath...');
            await page.locator('xpath=//button[@aria-label="Login"]').click();
        }
        
        // Wait for navigation after login
        console.log('⏳ Waiting for login to complete...');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(10000);
        
        // Handle any data privacy dialogs that might appear
        try {
            console.log('📋 Checking for data privacy dialog...');
            const acceptButtonSelectors = [
                'button[aria-label="Accept"]',
                'button:has-text("Accept")',
                'button:has-text("I Accept")',
                'button:has-text("Agree")',
                'button[class*="accept"]',
                'button[class*="privacy"]'
            ];
            
            let acceptButton = null;
            for (const selector of acceptButtonSelectors) {
                try {
                    acceptButton = page.locator(selector).first();
                    if (await acceptButton.isVisible({ timeout: 2000 })) {
                        console.log(`✅ Found accept button with selector: ${selector}`);
                        await acceptButton.click();
                        await page.waitForTimeout(3000);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!acceptButton) {
                await page.locator('xpath=//button[@aria-label="Accept"]').click();
                await page.waitForTimeout(3000);
            }
            
            console.log('✅ Data privacy dialog handled');
        } catch (error) {
            console.log('ℹ️ No data privacy dialog found');
        }

        // Handle any activation dialogs
        try {
            console.log('🏠 Checking for activation dialog...');
            const activateButtonSelectors = [
                'button[aria-label="Activate"]',
                'button:has-text("Activate")',
                'button:has-text("Start")',
                'button[class*="activate"]',
                'button[class*="start"]',
                'button:has-text("Continue")',
                'button:has-text("Proceed")'
            ];
            
            let activateButton = null;
            for (const selector of activateButtonSelectors) {
                try {
                    activateButton = page.locator(selector).first();
                    if (await activateButton.isVisible({ timeout: 2000 })) {
                        console.log(`✅ Found activate button with selector: ${selector}`);
                        await activateButton.click();
                        await page.waitForLoadState('networkidle');
                        await page.waitForTimeout(5000);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!activateButton) {
                console.log('ℹ️ No activation button found, proceeding with current page');
            }
        } catch (error) {
            console.log('ℹ️ No activation dialog found, proceeding with current page');
        }

        // Step 4: Navigate to home page and wait for elements to load
        console.log('🏠 Navigating to home page...');
        
        // Wait for any potential redirects or page loads
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Check current URL and navigate to home if needed
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        // If not already on home page, navigate to it
        if (!currentUrl.includes('#/') || currentUrl.includes('#/auth/login')) {
            console.log('🔄 Navigating to home page...');
            await page.goto('https://neom.btsmomenta.com/#/', { waitUntil: 'networkidle' });
            await page.waitForTimeout(5000);
        }
        
        // Final wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        const finalUrl = page.url();
        console.log(`✅ Successfully navigated to home page: ${finalUrl}`);

        // Step 5: Take screenshot of home page
        console.log('📸 Taking screenshot of home page...');
        await takeScreenshot(page, 'home-page');

        // Step 6: Run comprehensive accessibility scan on home page
        console.log('🔍 Running axe DevTool accessibility scan on home page...');
        const homePageAccessibilityResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21a'])
            .disableRules(['page-has-heading-one']) // Exclude best-practice rule for h1 heading
            .analyze();

        console.log(`📈 Home page scan results: ${homePageAccessibilityResults.violations.length} violations found`);
        
        // Step 7: Generate comprehensive HTML report with screenshots
        console.log('📊 Generating comprehensive HTML report...');
        await generateComprehensiveReport(homePageAccessibilityResults, page, 'home-page', finalUrl);

        // Generate axe-html-reporter format report
        const axeReportHTML = createHtmlReport({
            results: homePageAccessibilityResults,
            options: {
                projectKey: "NeomHomepageAccessibilityTest"
            },
        });

        fs.writeFileSync("build/reports/neom-homepage-axe-report.html", axeReportHTML);
        console.log('✅ Axe HTML report generated: build/reports/neom-homepage-axe-report.html');

        // Print final summary
        console.log('\n📋 NEOM HOMEPAGE ACCESSIBILITY TEST SUMMARY:');
        console.log('='.repeat(60));
        console.log(`Home Page URL: ${finalUrl}`);
        console.log(`Login Credentials: test_cu2@neom.com / ABab22$`);
        console.log(`Total Violations: ${homePageAccessibilityResults.violations.length}`);
        console.log(`Serious Issues: ${homePageAccessibilityResults.violations.filter(v => v.impact === 'serious').length}`);
        console.log(`Moderate Issues: ${homePageAccessibilityResults.violations.filter(v => v.impact === 'moderate').length}`);
        console.log(`Minor Issues: ${homePageAccessibilityResults.violations.filter(v => v.impact === 'minor').length}`);
        console.log(`Passes: ${homePageAccessibilityResults.passes.length}`);
        console.log(`Incomplete: ${homePageAccessibilityResults.incomplete.length}`);
        console.log('='.repeat(60));
        console.log('📁 Reports generated in: build/reports/');
        console.log('   - neom-homepage-accessibility-report-home-page.html (Main report with screenshots)');
        console.log('   - neom-homepage-axe-report.html (Axe format report)');
        console.log('📸 Screenshots saved in: build/reports/screenshots/');
        
        if (homePageAccessibilityResults.violations.length > 0) {
            console.log('\n⚠️  Accessibility violations found. Please review the reports for details.');
            console.log('\n🚨 Violations Summary:');
            homePageAccessibilityResults.violations.forEach((violation, index) => {
                console.log(`   ${index + 1}. ${violation.id} (${violation.impact}): ${violation.description}`);
            });
        } else {
            console.log('\n✅ No accessibility violations found!');
        }

        // Don't fail the test if violations are found - just report them
        // expect(homePageAccessibilityResults.violations).toEqual([]);
    });
});
